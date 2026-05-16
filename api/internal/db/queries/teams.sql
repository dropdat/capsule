-- name: CreateTeam :one
INSERT INTO teams (id, name, owner_user_id, join_token)
VALUES ($1, $2, $3, $4)
RETURNING *;

-- name: GetTeam :one
SELECT * FROM teams WHERE id = $1;

-- name: GetTeamByJoinToken :one
SELECT * FROM teams WHERE join_token = $1 AND join_enabled = true;

-- name: DeleteTeam :exec
DELETE FROM teams WHERE id = $1 AND owner_user_id = $2;

-- name: RenameTeam :one
UPDATE teams SET name = $3, updated_at = now()
WHERE id = $1 AND owner_user_id = $2
RETURNING *;

-- name: RotateTeamJoinToken :one
UPDATE teams SET join_token = $3, updated_at = now()
WHERE id = $1 AND owner_user_id = $2
RETURNING *;

-- name: SetTeamJoinEnabled :exec
UPDATE teams SET join_enabled = $3, updated_at = now()
WHERE id = $1 AND owner_user_id = $2;

-- name: AddTeamMember :one
INSERT INTO team_members (team_id, user_id, role)
VALUES ($1, $2, $3)
ON CONFLICT (team_id, user_id) DO UPDATE SET role = EXCLUDED.role
RETURNING *;

-- name: RemoveTeamMember :exec
DELETE FROM team_members WHERE team_id = $1 AND user_id = $2;

-- name: SetTeamMemberRole :exec
UPDATE team_members SET role = $3 WHERE team_id = $1 AND user_id = $2;

-- name: GetTeamMember :one
SELECT * FROM team_members WHERE team_id = $1 AND user_id = $2;

-- name: ListTeamMembers :many
SELECT * FROM team_members WHERE team_id = $1 ORDER BY joined_at ASC;

-- name: ListUserTeams :many
SELECT t.*, tm.role AS my_role
FROM teams t
JOIN team_members tm ON tm.team_id = t.id
WHERE tm.user_id = $1
ORDER BY t.updated_at DESC;

-- name: ListUserTeamIDs :many
SELECT team_id FROM team_members WHERE user_id = $1;

-- name: SetCapsuleTeam :exec
UPDATE capsules SET team_id = $3, updated_at = now()
WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL;

-- name: SetFolderTeam :exec
UPDATE folders SET team_id = $3, updated_at = now()
WHERE id = $1 AND user_id = $2;

-- name: ListTeamCapsules :many
SELECT * FROM capsules
WHERE team_id = $1 AND deleted_at IS NULL
ORDER BY updated_at DESC
LIMIT $2;

-- name: ListTeamFolders :many
SELECT * FROM folders
WHERE team_id = $1
ORDER BY updated_at DESC;
