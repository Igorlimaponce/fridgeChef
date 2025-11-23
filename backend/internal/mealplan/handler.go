package mealplan

import (
	"encoding/json"
	"net/http"

	"github.com/Igorlimaponce/fridgeChef/backend/middleware"
	"github.com/Igorlimaponce/fridgeChef/backend/util"
	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
)

type MealPlanHandler struct {
	service *MealPlanService
}

func NewMealPlanHandler(service *MealPlanService) *MealPlanHandler {
	return &MealPlanHandler{service: service}
}

func (h *MealPlanHandler) Create(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserIDFromCtx(r.Context())
	if userID == uuid.Nil {
		util.WriteError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	var req CreateMealPlanRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		util.WriteError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	mp, err := h.service.Create(r.Context(), userID, req)
	if err != nil {
		util.WriteError(w, http.StatusInternalServerError, err.Error())
		return
	}

	util.WriteJSON(w, http.StatusCreated, mp)
}

func (h *MealPlanHandler) List(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserIDFromCtx(r.Context())
	if userID == uuid.Nil {
		util.WriteError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	startDate := r.URL.Query().Get("start_date")
	endDate := r.URL.Query().Get("end_date")

	if startDate == "" || endDate == "" {
		util.WriteError(w, http.StatusBadRequest, "start_date and end_date are required")
		return
	}

	plans, err := h.service.List(r.Context(), userID, startDate, endDate)
	if err != nil {
		util.WriteError(w, http.StatusInternalServerError, err.Error())
		return
	}

	util.WriteJSON(w, http.StatusOK, plans)
}

func (h *MealPlanHandler) Delete(w http.ResponseWriter, r *http.Request) {
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
