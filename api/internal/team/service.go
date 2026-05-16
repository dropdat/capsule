// Package team owns teams, membership, and team-scoped sharing of capsules
// and folders. Sharing is a column on the existing capsule/folder rows.
package team

import (
	"context"
	"crypto/rand"
	"encoding/base32"
	"errors"
	"strings"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"

	"github.com/yusii/dropdat/api/internal/db/dbgen"
)

const (
	RoleOwner  = "owner"
	RoleAdmin  = "admin"
	RoleMember = "member"
)

var (
	ErrNotFound    = errors.New("team not found")
	ErrForbidden   = errors.New("forbidden")
	ErrInviteToken = errors.New("invalid invite link")
)

type Service struct {
	q *dbgen.Queries
}

func NewService(q *dbgen.Queries) *Service { return &Service{q: q} }

func (s *Service) Create(ctx context.Context, ownerID, name string) (*dbgen.Team, error) {
	name = strings.TrimSpace(name)
	if name == "" {
		name = "My team"
	}
	tok := newJoinToken()
	row, err := s.q.CreateTeam(ctx, dbgen.CreateTeamParams{
		ID:          uuid.New(),
		Name:        name,
		OwnerUserID: ownerID,
		JoinToken:   &tok,
	})
	if err != nil {
		return nil, err
	}
	if _, err := s.q.AddTeamMember(ctx, dbgen.AddTeamMemberParams{
		TeamID: row.ID,
		UserID: ownerID,
		Role:   RoleOwner,
	}); err != nil {
		return nil, err
	}
	return &row, nil
}

func (s *Service) Get(ctx context.Context, id uuid.UUID) (*dbgen.Team, error) {
	t, err := s.q.GetTeam(ctx, id)
	if err != nil {
		return nil, ErrNotFound
	}
	return &t, nil
}

func (s *Service) Delete(ctx context.Context, id uuid.UUID, ownerID string) error {
	return s.q.DeleteTeam(ctx, dbgen.DeleteTeamParams{ID: id, OwnerUserID: ownerID})
}

func (s *Service) Rename(ctx context.Context, id uuid.UUID, ownerID, name string) (*dbgen.Team, error) {
	name = strings.TrimSpace(name)
	if name == "" {
		return nil, errors.New("name required")
	}
	row, err := s.q.RenameTeam(ctx, dbgen.RenameTeamParams{
		ID:          id,
		OwnerUserID: ownerID,
		Name:        name,
	})
	if err != nil {
		return nil, err
	}
	return &row, nil
}

// RotateJoinToken returns a new join token; old links stop working.
func (s *Service) RotateJoinToken(ctx context.Context, id uuid.UUID, ownerID string) (string, error) {
	tok := newJoinToken()
	row, err := s.q.RotateTeamJoinToken(ctx, dbgen.RotateTeamJoinTokenParams{
		ID:          id,
		OwnerUserID: ownerID,
		JoinToken:   &tok,
	})
	if err != nil {
		return "", err
	}
	if row.JoinToken == nil {
		return tok, nil
	}
	return *row.JoinToken, nil
}

func (s *Service) SetJoinEnabled(ctx context.Context, id uuid.UUID, ownerID string, enabled bool) error {
	return s.q.SetTeamJoinEnabled(ctx, dbgen.SetTeamJoinEnabledParams{
		ID:          id,
		OwnerUserID: ownerID,
		JoinEnabled: enabled,
	})
}

func (s *Service) ListForUser(ctx context.Context, userID string) ([]dbgen.ListUserTeamsRow, error) {
	return s.q.ListUserTeams(ctx, userID)
}

func (s *Service) Members(ctx context.Context, teamID uuid.UUID) ([]dbgen.TeamMember, error) {
	return s.q.ListTeamMembers(ctx, teamID)
}

func (s *Service) MyRole(ctx context.Context, teamID uuid.UUID, userID string) (string, error) {
	m, err := s.q.GetTeamMember(ctx, dbgen.GetTeamMemberParams{
		TeamID: teamID,
		UserID: userID,
	})
	if err != nil {
		return "", ErrForbidden
	}
	return m.Role, nil
}

// Join resolves a join token and adds the user as a member.
func (s *Service) Join(ctx context.Context, token, userID string) (*dbgen.Team, error) {
	t, err := s.q.GetTeamByJoinToken(ctx, &token)
	if err != nil {
		return nil, ErrInviteToken
	}
	if _, err := s.q.AddTeamMember(ctx, dbgen.AddTeamMemberParams{
		TeamID: t.ID,
		UserID: userID,
		Role:   RoleMember,
	}); err != nil {
		return nil, err
	}
	return &t, nil
}

func (s *Service) Promote(ctx context.Context, teamID uuid.UUID, actor, target, role string) error {
	if err := s.requireRole(ctx, teamID, actor, RoleOwner, RoleAdmin); err != nil {
		return err
	}
	if role != RoleAdmin && role != RoleMember {
		return errors.New("invalid role")
	}
	return s.q.SetTeamMemberRole(ctx, dbgen.SetTeamMemberRoleParams{
		TeamID: teamID, UserID: target, Role: role,
	})
}

func (s *Service) Remove(ctx context.Context, teamID uuid.UUID, actor, target string) error {
	if actor != target {
		if err := s.requireRole(ctx, teamID, actor, RoleOwner, RoleAdmin); err != nil {
			return err
		}
	}
	if t, err := s.q.GetTeam(ctx, teamID); err == nil && t.OwnerUserID == target {
		return errors.New("cannot remove the owner")
	}
	return s.q.RemoveTeamMember(ctx, dbgen.RemoveTeamMemberParams{
		TeamID: teamID, UserID: target,
	})
}

// ShareCapsule sets the team_id on a capsule the actor owns.
func (s *Service) ShareCapsule(ctx context.Context, capsuleID uuid.UUID, owner string, teamID *uuid.UUID) error {
	if teamID != nil {
		if _, err := s.q.GetTeamMember(ctx, dbgen.GetTeamMemberParams{TeamID: *teamID, UserID: owner}); err != nil {
			return ErrForbidden
		}
	}
	return s.q.SetCapsuleTeam(ctx, dbgen.SetCapsuleTeamParams{
		ID:     capsuleID,
		UserID: owner,
		TeamID: nullableUUID(teamID),
	})
}

func (s *Service) ShareFolder(ctx context.Context, folderID uuid.UUID, owner string, teamID *uuid.UUID) error {
	if teamID != nil {
		if _, err := s.q.GetTeamMember(ctx, dbgen.GetTeamMemberParams{TeamID: *teamID, UserID: owner}); err != nil {
			return ErrForbidden
		}
	}
	return s.q.SetFolderTeam(ctx, dbgen.SetFolderTeamParams{
		ID:     folderID,
		UserID: owner,
		TeamID: nullableUUID(teamID),
	})
}

// UserTeamIDs returns the team ids the user belongs to.
func (s *Service) UserTeamIDs(ctx context.Context, userID string) ([]uuid.UUID, error) {
	return s.q.ListUserTeamIDs(ctx, userID)
}

func (s *Service) TeamCapsules(ctx context.Context, teamID uuid.UUID) ([]dbgen.Capsule, error) {
	return s.q.ListTeamCapsules(ctx, dbgen.ListTeamCapsulesParams{
		TeamID: pgtype.UUID{Bytes: teamID, Valid: true},
		Limit:  200,
	})
}

func (s *Service) TeamFolders(ctx context.Context, teamID uuid.UUID) ([]dbgen.Folder, error) {
	return s.q.ListTeamFolders(ctx, pgtype.UUID{Bytes: teamID, Valid: true})
}

func (s *Service) requireRole(ctx context.Context, teamID uuid.UUID, userID string, roles ...string) error {
	m, err := s.q.GetTeamMember(ctx, dbgen.GetTeamMemberParams{TeamID: teamID, UserID: userID})
	if err != nil {
		return ErrForbidden
	}
	for _, r := range roles {
		if m.Role == r {
			return nil
		}
	}
	return ErrForbidden
}

func newJoinToken() string {
	b := make([]byte, 18)
	_, _ = rand.Read(b)
	return strings.ToLower(strings.TrimRight(base32.StdEncoding.EncodeToString(b), "="))
}

// nullableUUID converts a *uuid.UUID to pgtype.UUID expected by sqlc.
func nullableUUID(u *uuid.UUID) pgtype.UUID {
	if u == nil {
		return pgtype.UUID{}
	}
	return pgtype.UUID{Bytes: *u, Valid: true}
}
