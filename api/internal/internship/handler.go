package internship

import (
	"fmt"
	"io"
	"mime"
	"net/http"
	"path/filepath"
	"strings"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"

	"github.com/yusii/dropdat/api/internal/auth"
	"github.com/yusii/dropdat/api/internal/db/dbgen"
	"github.com/yusii/dropdat/api/internal/httpx"
)

const maxResumeBytes = 5 * 1024 * 1024

type IsAdmin func(userID string) bool

type Handler struct {
	q       *dbgen.Queries
	isAdmin IsAdmin
}

func NewHandler(q *dbgen.Queries, isAdmin IsAdmin) *Handler {
	return &Handler{q: q, isAdmin: isAdmin}
}

func (h *Handler) MountPublic(r chi.Router) {
	r.Post("/internship-applications", h.Apply)
}

func (h *Handler) MountAdmin(r chi.Router) {
	r.Get("/admin/internship-applications", h.guard(h.List))
	r.Get("/admin/internship-applications/{id}/resume", h.guard(h.Resume))
}

func (h *Handler) Apply(w http.ResponseWriter, r *http.Request) {
	r.Body = http.MaxBytesReader(w, r.Body, maxResumeBytes+256*1024)
	if err := r.ParseMultipartForm(maxResumeBytes + 256*1024); err != nil {
		httpx.Error(w, http.StatusRequestEntityTooLarge, "request too large (resume max 5MB)")
		return
	}

	name := strings.TrimSpace(r.FormValue("name"))
	college := strings.TrimSpace(r.FormValue("college"))
	branch := strings.TrimSpace(r.FormValue("branch"))
	cgpa := strings.TrimSpace(r.FormValue("cgpa"))
	if name == "" || college == "" || branch == "" || cgpa == "" {
		httpx.Error(w, http.StatusBadRequest, "name, college, branch, and CGPA are required")
		return
	}
	for label, value := range map[string]string{"name": name, "college": college, "branch": branch, "cgpa": cgpa} {
		if len([]rune(value)) > 200 {
			httpx.Error(w, http.StatusBadRequest, label+" is too long")
			return
		}
	}
	if r.FormValue("unpaidAcknowledged") != "true" {
		httpx.Error(w, http.StatusBadRequest, "unpaid internship acknowledgement is required")
		return
	}

	file, header, err := r.FormFile("resume")
	if err != nil {
		httpx.Error(w, http.StatusBadRequest, "resume is required")
		return
	}
	defer file.Close()
	if header.Size <= 0 || header.Size > maxResumeBytes {
		httpx.Error(w, http.StatusRequestEntityTooLarge, "resume must be between 1B and 5MB")
		return
	}
	filename := filepath.Base(strings.TrimSpace(header.Filename))
	ext := strings.ToLower(filepath.Ext(filename))
	if ext != ".pdf" && ext != ".doc" && ext != ".docx" {
		httpx.Error(w, http.StatusBadRequest, "resume must be a PDF, DOC, or DOCX file")
		return
	}
	body, err := io.ReadAll(io.LimitReader(file, maxResumeBytes+1))
	if err != nil {
		httpx.Error(w, http.StatusBadRequest, "could not read resume")
		return
	}
	if len(body) == 0 || len(body) > maxResumeBytes {
		httpx.Error(w, http.StatusRequestEntityTooLarge, "resume must be between 1B and 5MB")
		return
	}
	contentType := header.Header.Get("Content-Type")
	if contentType == "" || contentType == "application/octet-stream" {
		contentType = http.DetectContentType(body)
	}
	if parsed, _, err := mime.ParseMediaType(contentType); err == nil {
		contentType = parsed
	}

	row, err := h.q.CreateInternshipApplication(r.Context(), dbgen.CreateInternshipApplicationParams{
		Name: name, College: college, Branch: branch, Cgpa: cgpa,
		ResumeFilename: filename, ResumeContentType: contentType, ResumeBytes: body,
		UnpaidAcknowledged: true,
	})
	if err != nil {
		httpx.Error(w, http.StatusInternalServerError, "could not save application")
		return
	}
	httpx.JSON(w, http.StatusCreated, map[string]string{
		"id": row.ID.String(), "message": "Application received. We will be in touch.",
	})
}

type applicationDTO struct {
	ID                 string `json:"id"`
	Name               string `json:"name"`
	College            string `json:"college"`
	Branch             string `json:"branch"`
	CGPA               string `json:"cgpa"`
	ResumeFilename     string `json:"resumeFilename"`
	ResumeContentType  string `json:"resumeContentType"`
	ResumeSize         int64  `json:"resumeSize"`
	UnpaidAcknowledged bool   `json:"unpaidAcknowledged"`
	CreatedAt          string `json:"createdAt"`
}

func (h *Handler) List(w http.ResponseWriter, r *http.Request) {
	rows, err := h.q.ListInternshipApplications(r.Context(), 500)
	if err != nil {
		httpx.Error(w, http.StatusInternalServerError, err.Error())
		return
	}
	out := make([]applicationDTO, 0, len(rows))
	for _, row := range rows {
		out = append(out, applicationDTO{
			ID: row.ID.String(), Name: row.Name, College: row.College, Branch: row.Branch,
			CGPA: row.Cgpa, ResumeFilename: row.ResumeFilename,
			ResumeContentType: row.ResumeContentType, ResumeSize: row.ResumeSize,
			UnpaidAcknowledged: row.UnpaidAcknowledged,
			CreatedAt:          row.CreatedAt.Time.Format(time.RFC3339),
		})
	}
	httpx.JSON(w, http.StatusOK, out)
}

func (h *Handler) Resume(w http.ResponseWriter, r *http.Request) {
	id, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		httpx.Error(w, http.StatusBadRequest, "invalid application id")
		return
	}
	row, err := h.q.GetInternshipApplicationResume(r.Context(), id)
	if err != nil {
		httpx.Error(w, http.StatusNotFound, "resume not found")
		return
	}
	filename := filepath.Base(row.ResumeFilename)
	w.Header().Set("Content-Type", row.ResumeContentType)
	w.Header().Set("Content-Disposition", fmt.Sprintf(`attachment; filename="%s"`, strings.ReplaceAll(filename, `"`, "")))
	w.WriteHeader(http.StatusOK)
	_, _ = w.Write(row.ResumeBytes)
}

func (h *Handler) guard(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		uid := auth.UserID(r.Context())
		if uid == "" {
			httpx.Error(w, http.StatusUnauthorized, "auth required")
			return
		}
		if h.isAdmin == nil || !h.isAdmin(uid) {
			httpx.Error(w, http.StatusForbidden, "admin only")
			return
		}
		next(w, r)
	}
}
