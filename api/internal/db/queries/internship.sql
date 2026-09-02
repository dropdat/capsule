-- name: CreateInternshipApplication :one
INSERT INTO internship_applications (
  name, email, college, branch, cgpa, resume_filename, resume_content_type,
  resume_bytes, unpaid_acknowledged
)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
RETURNING id, name, email, college, branch, cgpa, resume_filename, resume_content_type,
  unpaid_acknowledged, created_at;

-- name: ListInternshipApplications :many
SELECT id, name, email, college, branch, cgpa, resume_filename, resume_content_type,
  octet_length(resume_bytes)::BIGINT AS resume_size,
  unpaid_acknowledged, created_at
FROM internship_applications
ORDER BY created_at DESC
LIMIT $1;

-- name: GetInternshipApplicationResume :one
SELECT resume_filename, resume_content_type, resume_bytes
FROM internship_applications
WHERE id = $1;
