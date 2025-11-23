package pantry

import (
	"encoding/json"
	"net/http"

	"github.com/Igorlimaponce/fridgeChef/backend/middleware"
	"github.com/Igorlimaponce/fridgeChef/backend/util"
	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
)

type PantryHandler struct {
	service *PantryService
}

func NewPantryHandler(service *PantryService) *PantryHandler {
	return &PantryHandler{service: service}
}

func (h *PantryHandler) Create(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserIDFromCtx(r.Context())
	if userID == uuid.Nil {
		util.WriteError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	var req CreatePantryItemRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		util.WriteError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	item, err := h.service.Create(r.Context(), userID, req)
	if err != nil {
		util.WriteError(w, http.StatusInternalServerError, err.Error())
		return
	}

	util.WriteJSON(w, http.StatusCreated, item)
}

func (h *PantryHandler) List(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserIDFromCtx(r.Context())
	if userID == uuid.Nil {
		util.WriteError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	items, err := h.service.List(r.Context(), userID)
	if err != nil {
		util.WriteError(w, http.StatusInternalServerError, err.Error())
		return
	}

	util.WriteJSON(w, http.StatusOK, items)
}

func (h *PantryHandler) Delete(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserIDFromCtx(r.Context())
	if userID == uuid.Nil {
		util.WriteError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	idStr := chi.URLParam(r, "id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		util.WriteError(w, http.StatusBadRequest, "invalid ID")
		return
	}

	if err := h.service.Delete(r.Context(), id, userID); err != nil {
		util.WriteError(w, http.StatusInternalServerError, err.Error())
		return
	}

	util.WriteJSON(w, http.StatusOK, map[string]string{"message": "deleted"})
}
