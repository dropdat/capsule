// embed-backfill walks capsules with no embedding and fills them in.
// Run after enabling pgvector / setting OPENAI_API_KEY for the first time,
// or after switching embedding model.
//
//	OPENAI_API_KEY=... DATABASE_URL=... go run ./cmd/embed-backfill
package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log/slog"
	"os"
	"os/signal"
	"strconv"
	"strings"
	"syscall"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/yusii/dropdat/api/internal/embed"
)

func main() {
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		fmt.Fprintln(os.Stderr, "DATABASE_URL not set")
		os.Exit(1)
	}

	ctx, cancel := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
	defer cancel()

	pool, err := pgxpool.New(ctx, dbURL)
	if err != nil {
		fmt.Fprintln(os.Stderr, "pool:", err)
		os.Exit(1)
	}
	defer pool.Close()

	emb := embed.NewFromEnv()
	if !emb.Enabled() {
		fmt.Fprintln(os.Stderr, "embedder disabled — set OPENAI_API_KEY")
		os.Exit(1)
	}

	batch := 50
	if v := os.Getenv("BATCH"); v != "" {
		if n, err := strconv.Atoi(v); err == nil {
			batch = n
		}
	}
	// RPM cap — voyage's free tier (no payment method) is 3 RPM. Set
	// EMBED_RPM=3 to stay under that without losing rows.
	var minInterval time.Duration
	if v := os.Getenv("EMBED_RPM"); v != "" {
		if n, err := strconv.Atoi(v); err == nil && n > 0 {
			minInterval = time.Minute / time.Duration(n)
			fmt.Printf("throttling to %d req/min (%.1fs between calls)\n", n, minInterval.Seconds())
		}
	}

	total := 0
	for {
		rows, err := pool.Query(ctx, `
			SELECT id, user_id, title, summary, tags, messages
			FROM capsules
			WHERE embedding IS NULL AND deleted_at IS NULL
			ORDER BY created_at ASC
			LIMIT $1
		`, batch)
		if err != nil {
			slog.Error("query", "err", err)
			os.Exit(1)
		}

		type row struct {
			id, userID, title, summary string
			tags                        []string
			messages                    []byte
		}
		var pending []row
		for rows.Next() {
			var r row
			if err := rows.Scan(&r.id, &r.userID, &r.title, &r.summary, &r.tags, &r.messages); err != nil {
				slog.Error("scan", "err", err)
				continue
			}
			pending = append(pending, r)
		}
		rows.Close()
		if len(pending) == 0 {
			break
		}

		for i, r := range pending {
			if minInterval > 0 && i > 0 {
				time.Sleep(minInterval)
			}
			text := buildText(r.title, r.summary, r.tags, r.messages)
			ectx, ecancel := context.WithTimeout(ctx, 30*time.Second)
			vec, err := emb.Embed(ectx, text)
			ecancel()
			if err != nil {
				slog.Warn("embed", "id", r.id, "err", err)
				continue
			}
			if _, err := pool.Exec(ctx, `
				UPDATE capsules
				SET embedding = $1::vector, embedded_at = now()
				WHERE id = $2 AND user_id = $3
			`, vectorLiteral(vec), uuid.MustParse(r.id), r.userID); err != nil {
				slog.Warn("update", "id", r.id, "err", err)
				continue
			}
			total++
			if total%10 == 0 {
				fmt.Printf("backfilled %d\n", total)
			}
		}
	}
	fmt.Printf("done. backfilled %d capsules.\n", total)
}

func buildText(title, summary string, tags []string, messagesJSON []byte) string {
	var b strings.Builder
	b.WriteString(title)
	b.WriteByte('\n')
	if summary != "" {
		b.WriteString(summary)
		b.WriteByte('\n')
	}
	if len(tags) > 0 {
		b.WriteString(strings.Join(tags, " "))
		b.WriteByte('\n')
	}
	var msgs []struct {
		Role    string `json:"role"`
		Content string `json:"content"`
	}
	if err := json.Unmarshal(messagesJSON, &msgs); err == nil {
		for _, m := range msgs {
			b.WriteString(m.Role)
			b.WriteString(": ")
			b.WriteString(m.Content)
			b.WriteByte('\n')
		}
	}
	return b.String()
}

func vectorLiteral(vec []float32) string {
	if len(vec) == 0 {
		return "[]"
	}
	var b strings.Builder
	b.Grow(len(vec) * 12)
	b.WriteByte('[')
	for i, v := range vec {
		if i > 0 {
			b.WriteByte(',')
		}
		b.WriteString(strconv.FormatFloat(float64(v), 'f', -1, 32))
	}
	b.WriteByte(']')
	return b.String()
}
