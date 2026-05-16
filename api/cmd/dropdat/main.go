package main

import (
	"context"
	"errors"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"strings"
	"syscall"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/yusii/dropdat/api/internal/apikey"
	"github.com/yusii/dropdat/api/internal/auth"
	"github.com/yusii/dropdat/api/internal/billing"
	"github.com/yusii/dropdat/api/internal/capsule"
	"github.com/yusii/dropdat/api/internal/db/dbgen"
	"github.com/yusii/dropdat/api/internal/embed"
	"github.com/yusii/dropdat/api/internal/folder"
	"github.com/yusii/dropdat/api/internal/httpx"
	"github.com/yusii/dropdat/api/internal/link"
)

func main() {
	logger := slog.New(slog.NewTextHandler(os.Stdout, &slog.HandlerOptions{Level: slog.LevelInfo}))
	slog.SetDefault(logger)

	cfg := loadConfig()

	ctx, cancel := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
	defer cancel()

	pool, err := pgxpool.New(ctx, cfg.DatabaseURL)
	if err != nil {
		slog.Error("failed to create pgx pool", "err", err)
		os.Exit(1)
	}
	defer pool.Close()

	if err := pool.Ping(ctx); err != nil {
		slog.Error("postgres ping failed", "err", err)
		os.Exit(1)
	}
	slog.Info("postgres connected")

	r := chi.NewRouter()
	r.Use(middleware.RequestID)
	r.Use(middleware.RealIP)
	r.Use(middleware.Recoverer)
	r.Use(middleware.Timeout(30 * time.Second))
	r.Use(cors.Handler(cors.Options{
		AllowOriginFunc: func(_ *http.Request, origin string) bool {
			// Always allow extension origins — extension IDs change between
			// dev installs, so whitelisting one ID is fragile.
			if strings.HasPrefix(origin, "chrome-extension://") ||
				strings.HasPrefix(origin, "moz-extension://") {
				return true
			}
			for _, o := range cfg.CORSOrigins {
				if o == origin {
					return true
				}
			}
			return false
		},
		AllowedMethods:   []string{"GET", "POST", "PATCH", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Authorization", "Content-Type"},
		AllowCredentials: false,
		MaxAge:           300,
	}))

	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		if err := pool.Ping(r.Context()); err != nil {
			httpx.Error(w, http.StatusServiceUnavailable, "db unhealthy")
			return
		}
		httpx.JSON(w, http.StatusOK, map[string]string{"status": "ok"})
	})

	verifier, err := auth.NewVerifier(ctx)
	if err != nil {
		slog.Error("failed to init auth verifier", "err", err)
		os.Exit(1)
	}

	queries := dbgen.New(pool)
	embedder := embed.NewFromEnv()
	capsuleSvc := capsule.NewService(queries, pool, embedder)

	// Tier resolution: look up subscription, fall back to basic.
	tierFor := func(ctx context.Context, userID string) string {
		sub, err := queries.GetSubscription(ctx, userID)
		if err != nil {
			return billing.TierBasic
		}
		return sub.Tier
	}
	capsuleSvc.SetLimitChecker(func(ctx context.Context, userID string) (bool, error) {
		lim := billing.TierLimits(tierFor(ctx, userID))
		if lim.CapsuleLimit < 0 {
			return true, nil
		}
		used, err := queries.CountUserCapsulesActive(ctx, userID)
		if err != nil {
			return false, err
		}
		return used < lim.CapsuleLimit, nil
	})

	capsuleHandler := capsule.NewHandler(capsuleSvc, func(ctx context.Context, userID string) bool {
		for _, s := range billing.TierLimits(tierFor(ctx, userID)).Scopes {
			if s == billing.ScopeShare {
				return true
			}
		}
		return false
	})
	apiKeySvc := apikey.NewService(queries)
	apiKeyHandler := apikey.NewHandler(apiKeySvc, func(ctx context.Context, userID string) []string {
		return billing.TierLimits(tierFor(ctx, userID)).Scopes
	})
	folderSvc := folder.NewService(queries)
	folderHandler := folder.NewHandler(folderSvc)
	linkSvc := link.NewService(queries, folderSvc)
	linkHandler := link.NewHandler(linkSvc)
	billingHandler := billing.NewHandler(queries, billing.NewDodoClient())
	verifier.SetAPIKeyVerifier(apiKeySvc)

	// Unauthenticated webhook receiver — dodo signs the body, no JWT.
	billingHandler.MountWebhook(r)

	r.Route("/api/v1", func(r chi.Router) {
		// Public share-link reads — mounted before the auth middleware so
		// they bypass JWT verification.
		capsuleHandler.MountPublic(r)

		r.Group(func(r chi.Router) {
			r.Use(verifier.Middleware)

			r.Get("/me", func(w http.ResponseWriter, r *http.Request) {
				httpx.JSON(w, http.StatusOK, map[string]string{"userId": auth.UserID(r.Context())})
			})

			capsuleHandler.Mount(r)
			apiKeyHandler.Mount(r)
			folderHandler.Mount(r)
			linkHandler.Mount(r)
			billingHandler.Mount(r)
		})
	})

	srv := &http.Server{
		Addr:              cfg.Addr,
		Handler:           r,
		ReadHeaderTimeout: 10 * time.Second,
	}

	go func() {
		slog.Info("listening", "addr", cfg.Addr)
		if err := srv.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			slog.Error("server error", "err", err)
			cancel()
		}
	}()

	<-ctx.Done()
	slog.Info("shutting down")

	shutdownCtx, shutdownCancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer shutdownCancel()
	if err := srv.Shutdown(shutdownCtx); err != nil {
		slog.Error("graceful shutdown failed", "err", err)
	}
}
