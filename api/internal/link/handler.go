package link

import (
	"errors"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"

	"github.com/yusii/dropdat/api/internal/auth"
	"github.com/yusii/dropdat/api/internal/httpx"
)

type Handler struct {
	svc *Service
}

func NewHandler(svc *Service) *Handler { return &Handler{svc: svc} }

func (h *Handler) Mount(r chi.Router) {
	r.Get("/links", h.List)
	r.Post("/links", h.Create)
	r.Patch("/links/{id}", h.Patch)
	r.Delete("/links/{id}", h.Delete)
}

func (h *Handler) Create(w http.ResponseWriter, r *http.Request) {
	uid := auth.UserID(r.Context())
	var body CreateRequest
	if err := httpx.DecodeJSON(r, &body); err != nil {
		httpx.Error(w, http.StatusBadRequest, err.Error())
		return
	}
	l, err := h.svc.Create(r.Context(), uid, body)
	if err != nil {
		writeErr(w, err)
		return
	}
	httpx.JSON(w, http.StatusCreated, l)
}

func (h *Handler) List(w http.ResponseWriter, r *http.Request) {
	uid := auth.UserID(r.Context())
	q := r.URL.Query()
	var folderID *uuid.UUID
	if fid := q.Get("folderId"); fid != "" {
		id, err := uuid.Parse(fid)
		if err != nil {
			httpx.Error(w, http.StatusBadRequest, "invalid folderId")
			return
		}
		folderID = &id
	}
	var limit int32
	if l := q.Get("limit"); l != "" {
		if n, err := strconv.Atoi(l); err == nil {
			limit = int32(n)
		}
	}
	out, err := h.svc.List(r.Context(), uid, folderID, limit)
	if err != nil {
		httpx.Error(w, http.StatusInternalServerError, "internal error")
		return
	}
	httpx.JSON(w, http.StatusOK, out)
}

func (h *Handler) Patch(w http.ResponseWriter, r *http.Request) {
	uid := auth.UserID(r.Context())
	id, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		httpx.Error(w, http.StatusBadRequest, "invalid id")
		return
	}
	var body PatchRequest
	if err := httpx.DecodeJSON(r, &body); err != nil {
		httpx.Error(w, http.StatusBadRequest, err.Error())
		return
	}
	l, err := h.svc.Patch(r.Context(), uid, id, body)
	if err != nil {
		writeErr(w, err)
		return
	}
	httpx.JSON(w, http.StatusOK, l)
}

func (h *Handler) Delete(w http.ResponseWriter, r *http.Request) {
	uid := auth.UserID(r.Context())
	id, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		httpx.Error(w, http.StatusBadRequest, "invalid id")
		return
	}
	if err := h.svc.Delete(r.Context(), uid, id); err != nil {
		httpx.Error(w, http.StatusInternalServerError, "internal error")
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func writeErr(w http.ResponseWriter, err error) {
	switch {
	case errors.Is(err, ErrNotFound), errors.Is(err, ErrBadFolder):
		httpx.Error(w, http.StatusNotFound, err.Error())
	case errors.Is(err, ErrEmptyURL):
		httpx.Error(w, http.StatusBadRequest, err.Error())
	default:
		httpx.Error(w, http.StatusInternalServerError, "internal error")
	}
}
