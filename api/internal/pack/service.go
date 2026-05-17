// Package pack implements "context packs" — user-curated bundles of capsules
// that compile down to a single markdown block they can drop into any AI.
// Related-capsules lookup also lives here since it shares the pgvector
// similarity machinery used by auto-fill.
package pack

import (
	"context"
	"errors"
	"fmt"
	"math"
	"strings"

	"github.com/google/uuid"

	"github.com/yusii/dropdat/api/internal/db/dbgen"
)

var (
	ErrNotFound      = errors.New("pack not found")
	ErrNoEmbedding   = errors.New("capsule has no embedding yet")
	ErrCapsuleAccess = errors.New("capsule does not belong to caller")
)

type Service struct {
	q *dbgen.Queries
}

func NewService(q *dbgen.Queries) *Service { return &Service{q: q} }

// ----- packs -----

func (s *Service) Create(ctx context.Context, userID, name, goal string) (*dbgen.ContextPack, error) {
	name = strings.TrimSpace(name)
	if name == "" {
		name = "Untitled pack"
	}
	row, err := s.q.CreateContextPack(ctx, dbgen.CreateContextPackParams{
		ID:     uuid.New(),
		UserID: userID,
		Name:   name,
		Goal:   strings.TrimSpace(goal),
	})
	if err != nil {
		return nil, err
	}
	return &row, nil
}

func (s *Service) Get(ctx context.Context, id uuid.UUID, userID string) (*dbgen.ContextPack, error) {
	row, err := s.q.GetContextPack(ctx, dbgen.GetContextPackParams{ID: id, UserID: userID})
	if err != nil {
		return nil, ErrNotFound
	}
	return &row, nil
}

func (s *Service) List(ctx context.Context, userID string) ([]dbgen.ContextPack, error) {
	return s.q.ListContextPacks(ctx, userID)
}

func (s *Service) Update(ctx context.Context, id uuid.UUID, userID, name, goal string) (*dbgen.ContextPack, error) {
	row, err := s.q.UpdateContextPack(ctx, dbgen.UpdateContextPackParams{
		ID: id, UserID: userID,
		Name: strings.TrimSpace(name),
		Goal: strings.TrimSpace(goal),
	})
	if err != nil {
		return nil, err
	}
	return &row, nil
}

func (s *Service) Delete(ctx context.Context, id uuid.UUID, userID string) error {
	return s.q.DeleteContextPack(ctx, dbgen.DeleteContextPackParams{ID: id, UserID: userID})
}

// ----- items -----

// AddCapsule appends a capsule to a pack (position = current size).
func (s *Service) AddCapsule(ctx context.Context, packID, capsuleID uuid.UUID, userID string) error {
	if _, err := s.Get(ctx, packID, userID); err != nil {
		return err
	}
	// Verify capsule belongs to caller.
	if _, err := s.q.GetCapsule(ctx, dbgen.GetCapsuleParams{ID: capsuleID, UserID: userID}); err != nil {
		return ErrCapsuleAccess
	}
	count, _ := s.q.CountPackItems(ctx, packID)
	return s.q.AddPackItem(ctx, dbgen.AddPackItemParams{
		PackID:    packID,
		CapsuleID: capsuleID,
		Position:  int32(count),
	})
}

func (s *Service) RemoveCapsule(ctx context.Context, packID, capsuleID uuid.UUID, userID string) error {
	if _, err := s.Get(ctx, packID, userID); err != nil {
		return err
	}
	return s.q.RemovePackItem(ctx, dbgen.RemovePackItemParams{
		PackID: packID, CapsuleID: capsuleID,
	})
}

func (s *Service) Items(ctx context.Context, packID uuid.UUID, userID string) ([]dbgen.ListPackItemsRow, error) {
	if _, err := s.Get(ctx, packID, userID); err != nil {
		return nil, err
	}
	return s.q.ListPackItems(ctx, packID)
}

// AutoFill picks the top-K capsules most similar to a seed capsule's embedding
// and adds any that aren't already in the pack.
func (s *Service) AutoFill(ctx context.Context, packID, seedID uuid.UUID, userID string, k int) (int, error) {
	if _, err := s.Get(ctx, packID, userID); err != nil {
		return 0, err
	}
	related, err := s.Related(ctx, seedID, userID, k)
	if err != nil {
		return 0, err
	}
	existing, err := s.q.ListPackItems(ctx, packID)
	if err != nil {
		return 0, err
	}
	have := make(map[uuid.UUID]struct{}, len(existing))
	for _, it := range existing {
		have[it.ID] = struct{}{}
	}
	added := 0
	pos := int32(len(existing))
	for _, r := range related {
		if _, ok := have[r.ID]; ok {
			continue
		}
		if err := s.q.AddPackItem(ctx, dbgen.AddPackItemParams{
			PackID:    packID,
			CapsuleID: r.ID,
			Position:  pos,
		}); err != nil {
			return added, err
		}
		pos++
		added++
	}
	return added, nil
}

// Render produces a single markdown block: header per capsule + summary +
// full message log. Intended to be copied into any AI provider's chat box.
func (s *Service) Render(ctx context.Context, packID uuid.UUID, userID string) (string, error) {
	pack, err := s.Get(ctx, packID, userID)
	if err != nil {
		return "", err
	}
	items, err := s.q.ListPackItems(ctx, packID)
	if err != nil {
		return "", err
	}
	var b strings.Builder
	fmt.Fprintf(&b, "# %s\n", pack.Name)
	if pack.Goal != "" {
		fmt.Fprintf(&b, "\n> Goal: %s\n", pack.Goal)
	}
	fmt.Fprintf(&b, "\n_%d capsule(s) — assembled by dropdat._\n", len(items))
	for i, it := range items {
		fmt.Fprintf(&b, "\n---\n\n## %d. %s\n", i+1, it.Title)
		if it.Summary != "" {
			fmt.Fprintf(&b, "\n%s\n", it.Summary)
		}
		fmt.Fprintf(&b, "\n_Source: %s · v%d_\n", it.Source, it.Version)
		if msgs := renderMessages(it.Messages); msgs != "" {
			fmt.Fprintf(&b, "\n%s\n", msgs)
		}
	}
	return b.String(), nil
}

// ----- related -----

type RelatedCapsule struct {
	ID         uuid.UUID `json:"id"`
	Title      string    `json:"title"`
	Summary    string    `json:"summary"`
	Source     string    `json:"source"`
	Similarity float64   `json:"similarity"`
}

// Graph builds a nodes+edges graph of the user's capsule library.
// Each node is a capsule with an embedding; each edge connects a capsule to
// its top-K nearest neighbours (cosine similarity above `minSim`).
func (s *Service) Graph(ctx context.Context, userID string, nodeLimit, perNode int, minSim float64) (*GraphResponse, error) {
	if nodeLimit <= 0 || nodeLimit > 500 {
		nodeLimit = 200
	}
	if perNode <= 0 || perNode > 10 {
		perNode = 3
	}
	if minSim < 0 {
		minSim = 0
	}
	caps, err := s.q.ListUserCapsulesWithEmbedding(ctx, dbgen.ListUserCapsulesWithEmbeddingParams{
		UserID: userID,
		Limit:  int32(nodeLimit),
	})
	if err != nil {
		return nil, err
	}
	nodes := make([]GraphNode, 0, len(caps))
	for _, c := range caps {
		nodes = append(nodes, GraphNode{ID: c.ID.String(), Title: c.Title, Source: c.Source})
	}

	// Dedupe edges by ordered pair so two-way nearest-neighbour duplicates
	// collapse to a single edge.
	type pair struct{ a, b string }
	seen := make(map[pair]float64)
	for _, c := range caps {
		if c.Embedding == nil {
			continue
		}
		rows, err := s.q.ListRelatedCapsules(ctx, dbgen.ListRelatedCapsulesParams{
			UserID:  userID,
			Column2: c.Embedding,
			ID:      c.ID,
			Limit:   int32(perNode),
		})
		if err != nil {
			continue
		}
		for _, r := range rows {
			if r.Similarity < minSim {
				continue
			}
			a, b := c.ID.String(), r.ID.String()
			if a > b {
				a, b = b, a
			}
			if prev, ok := seen[pair{a, b}]; !ok || r.Similarity > prev {
				seen[pair{a, b}] = r.Similarity
			}
		}
	}
	edges := make([]GraphEdge, 0, len(seen))
	for p, w := range seen {
		edges = append(edges, GraphEdge{From: p.a, To: p.b, Weight: w})
	}
	return &GraphResponse{Nodes: nodes, Edges: edges}, nil
}

type GraphNode struct {
	ID     string `json:"id"`
	Title  string `json:"title"`
	Source string `json:"source"`
}

type GraphEdge struct {
	From   string  `json:"from"`
	To     string  `json:"to"`
	Weight float64 `json:"weight"`
}

type GraphResponse struct {
	Nodes []GraphNode `json:"nodes"`
	Edges []GraphEdge `json:"edges"`
}

// PackGraph builds a graph of capsules inside one pack. Nodes are the pack's
// capsules; edges connect each capsule to its top-K nearest neighbours within
// the same pack (cosine similarity above minSim). Pairwise computed in-process
// since N is small.
func (s *Service) PackGraph(ctx context.Context, packID uuid.UUID, userID string, perNode int, minSim float64) (*GraphResponse, error) {
	if perNode <= 0 || perNode > 10 {
		perNode = 3
	}
	if minSim < 0 {
		minSim = 0
	}
	if _, err := s.Get(ctx, packID, userID); err != nil {
		return nil, err
	}
	items, err := s.q.ListPackItems(ctx, packID)
	if err != nil {
		return nil, err
	}
	nodes := make([]GraphNode, 0, len(items))
	type vecRef struct {
		id  string
		vec []float32
	}
	withEmb := make([]vecRef, 0, len(items))
	for _, it := range items {
		nodes = append(nodes, GraphNode{ID: it.ID.String(), Title: it.Title, Source: it.Source})
		if it.Embedding != nil {
			withEmb = append(withEmb, vecRef{id: it.ID.String(), vec: it.Embedding.Slice()})
		}
	}
	type pair struct{ a, b string }
	seen := make(map[pair]float64)
	for i, a := range withEmb {
		// Find top-K most similar (excluding self), then keep those above minSim.
		type cand struct {
			id  string
			sim float64
		}
		cands := make([]cand, 0, len(withEmb)-1)
		for j, b := range withEmb {
			if i == j {
				continue
			}
			s := cosine(a.vec, b.vec)
			if s < minSim {
				continue
			}
			cands = append(cands, cand{id: b.id, sim: s})
		}
		// Partial sort: simple O(n^2) for small N.
		for k := 0; k < perNode && k < len(cands); k++ {
			best := k
			for l := k + 1; l < len(cands); l++ {
				if cands[l].sim > cands[best].sim {
					best = l
				}
			}
			cands[k], cands[best] = cands[best], cands[k]
			x, y := a.id, cands[k].id
			if x > y {
				x, y = y, x
			}
			if prev, ok := seen[pair{x, y}]; !ok || cands[k].sim > prev {
				seen[pair{x, y}] = cands[k].sim
			}
		}
	}
	edges := make([]GraphEdge, 0, len(seen))
	for p, w := range seen {
		edges = append(edges, GraphEdge{From: p.a, To: p.b, Weight: w})
	}
	return &GraphResponse{Nodes: nodes, Edges: edges}, nil
}

// OverviewGraph builds a graph where nodes are the user's packs and edges
// weight the overlap (Jaccard) of shared capsules between any two packs.
func (s *Service) OverviewGraph(ctx context.Context, userID string, minOverlap float64) (*GraphResponse, error) {
	if minOverlap < 0 {
		minOverlap = 0
	}
	packs, err := s.q.ListContextPacks(ctx, userID)
	if err != nil {
		return nil, err
	}
	nodes := make([]GraphNode, 0, len(packs))
	type packSet struct {
		id  string
		ids map[uuid.UUID]struct{}
	}
	sets := make([]packSet, 0, len(packs))
	for _, p := range packs {
		items, err := s.q.ListPackItems(ctx, p.ID)
		if err != nil {
			continue
		}
		set := make(map[uuid.UUID]struct{}, len(items))
		for _, it := range items {
			set[it.ID] = struct{}{}
		}
		nodes = append(nodes, GraphNode{ID: p.ID.String(), Title: p.Name, Source: "pack"})
		sets = append(sets, packSet{id: p.ID.String(), ids: set})
	}
	edges := make([]GraphEdge, 0)
	for i := 0; i < len(sets); i++ {
		for j := i + 1; j < len(sets); j++ {
			a, b := sets[i].ids, sets[j].ids
			if len(a) == 0 || len(b) == 0 {
				continue
			}
			inter := 0
			for id := range a {
				if _, ok := b[id]; ok {
					inter++
				}
			}
			if inter == 0 {
				continue
			}
			union := len(a) + len(b) - inter
			w := float64(inter) / float64(union)
			if w < minOverlap {
				continue
			}
			edges = append(edges, GraphEdge{From: sets[i].id, To: sets[j].id, Weight: w})
		}
	}
	return &GraphResponse{Nodes: nodes, Edges: edges}, nil
}

func cosine(a, b []float32) float64 {
	if len(a) != len(b) || len(a) == 0 {
		return 0
	}
	var dot, na, nb float64
	for i := range a {
		x, y := float64(a[i]), float64(b[i])
		dot += x * y
		na += x * x
		nb += y * y
	}
	if na == 0 || nb == 0 {
		return 0
	}
	return dot / (math.Sqrt(na) * math.Sqrt(nb))
}

func (s *Service) Related(ctx context.Context, seedID uuid.UUID, userID string, limit int) ([]RelatedCapsule, error) {
	if limit <= 0 || limit > 50 {
		limit = 10
	}
	vec, err := s.q.GetCapsuleEmbedding(ctx, dbgen.GetCapsuleEmbeddingParams{
		ID: seedID, UserID: userID,
	})
	if err != nil {
		return nil, ErrNoEmbedding
	}
	rows, err := s.q.ListRelatedCapsules(ctx, dbgen.ListRelatedCapsulesParams{
		UserID:  userID,
		Column2: vec,
		ID:      seedID,
		Limit:   int32(limit),
	})
	if err != nil {
		return nil, err
	}
	out := make([]RelatedCapsule, 0, len(rows))
	for _, r := range rows {
		out = append(out, RelatedCapsule{
			ID:         r.ID,
			Title:      r.Title,
			Summary:    r.Summary,
			Source:     r.Source,
			Similarity: r.Similarity,
		})
	}
	return out, nil
}
