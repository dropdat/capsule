package main

import (
	"os"
	"strings"
)

type Config struct {
	Addr        string
	DatabaseURL string
	CORSOrigins []string

	ClerkPublishableKey string
	ClerkJWKSURL        string
}

func loadConfig() Config {
	return Config{
		Addr:        envOr("ADDR", ":8080"),
		DatabaseURL: envOr("DATABASE_URL", "postgres://dropdat:dropdat@localhost:5432/dropdat?sslmode=disable"),
		CORSOrigins: splitCSV(envOr("CORS_ORIGINS", "http://localhost:3000")),

		ClerkPublishableKey: os.Getenv("CLERK_PUBLISHABLE_KEY"),
		ClerkJWKSURL:        os.Getenv("CLERK_JWKS_URL"),
	}
}

func envOr(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

func splitCSV(s string) []string {
	if s == "" {
		return nil
	}
	parts := strings.Split(s, ",")
	out := make([]string, 0, len(parts))
	for _, p := range parts {
		if t := strings.TrimSpace(p); t != "" {
			out = append(out, t)
		}
	}
	return out
}
