// Package attach handles capsule attachments — file uploads stored on
// Cloudflare R2 (S3-compatible). Issues short-lived presigned URLs for
// browser-direct upload and download so binary bytes never traverse the API.
package attach

import (
	"context"
	"fmt"
	"os"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
)

// Storage wraps the R2 (S3-compatible) client + bucket name.
type Storage struct {
	Client *s3.Client
	Bucket string
}

// NewFromEnv reads R2 credentials/endpoint from env. Returns nil if not
// configured — callers should treat that as "attachments disabled".
//
// Required env:
//
//	R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET
//
// R2 endpoint follows the pattern https://<account_id>.r2.cloudflarestorage.com
func NewFromEnv(ctx context.Context) (*Storage, error) {
	bucket := os.Getenv("R2_BUCKET")
	accountID := os.Getenv("R2_ACCOUNT_ID")
	keyID := os.Getenv("R2_ACCESS_KEY_ID")
	secret := os.Getenv("R2_SECRET_ACCESS_KEY")
	if bucket == "" || accountID == "" || keyID == "" || secret == "" {
		return nil, nil
	}
	endpoint := fmt.Sprintf("https://%s.r2.cloudflarestorage.com", accountID)
	cfg, err := config.LoadDefaultConfig(
		ctx,
		config.WithRegion("auto"),
		config.WithCredentialsProvider(
			credentials.NewStaticCredentialsProvider(keyID, secret, ""),
		),
	)
	if err != nil {
		return nil, fmt.Errorf("r2 config: %w", err)
	}
	cli := s3.NewFromConfig(cfg, func(o *s3.Options) {
		o.BaseEndpoint = aws.String(endpoint)
		// R2 doesn't use virtual-host bucket addressing.
		o.UsePathStyle = true
	})
	return &Storage{Client: cli, Bucket: bucket}, nil
}

// PresignPut returns a short-lived URL the browser PUTs the file to.
func (s *Storage) PresignPut(ctx context.Context, key, contentType string, expires time.Duration) (string, error) {
	pre := s3.NewPresignClient(s.Client)
	out, err := pre.PresignPutObject(ctx, &s3.PutObjectInput{
		Bucket:      aws.String(s.Bucket),
		Key:         aws.String(key),
		ContentType: aws.String(contentType),
	}, s3.WithPresignExpires(expires))
	if err != nil {
		return "", err
	}
	return out.URL, nil
}

// PresignGet returns a short-lived URL the browser GETs the file from.
func (s *Storage) PresignGet(ctx context.Context, key string, expires time.Duration) (string, error) {
	pre := s3.NewPresignClient(s.Client)
	out, err := pre.PresignGetObject(ctx, &s3.GetObjectInput{
		Bucket: aws.String(s.Bucket),
		Key:    aws.String(key),
	}, s3.WithPresignExpires(expires))
	if err != nil {
		return "", err
	}
	return out.URL, nil
}

// Delete removes an object from R2.
func (s *Storage) Delete(ctx context.Context, key string) error {
	_, err := s.Client.DeleteObject(ctx, &s3.DeleteObjectInput{
		Bucket: aws.String(s.Bucket),
		Key:    aws.String(key),
	})
	return err
}
