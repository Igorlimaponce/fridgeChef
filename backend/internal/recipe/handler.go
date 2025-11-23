package recipe

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/Igorlimaponce/fridgeChef/backend/middleware"
	"github.com/Igorlimaponce/fridgeChef/backend/util"
	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
)

type RecipeHandler struct {
	service *RecipeService
}

func NewRecipeHandler(service *RecipeService) *RecipeHandler {
	return &RecipeHandler{service: service}
}

func (h *RecipeHandler) CreateRecipe(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserIDFromCtx(r.Context())
	if userID == uuid.Nil {
		util.WriteError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	var req CreateRecipeRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		util.WriteError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	recipe, err := h.service.CreateRecipe(r.Context(), userID, req)
	if err != nil {
		util.WriteError(w, http.StatusInternalServerError, err.Error())
		return
	}

	util.WriteJSON(w, http.StatusCreated, recipe)
}

func (h *RecipeHandler) ListRecipes(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserIDFromCtx(r.Context())
	if userID == uuid.Nil {
		util.WriteError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	var filter RecipeFilter
	if val := r.URL.Query().Get("max_calories"); val != "" {
		var maxCal int
		if _, err := fmt.Sscanf(val, "%d", &maxCal); err == nil {
			filter.MaxCalories = maxCal
		}
	}
	filter.Ingredient = r.URL.Query().Get("ingredient")

	recipes, err := h.service.ListRecipes(r.Context(), userID, filter)
	if err != nil {
		util.WriteError(w, http.StatusInternalServerError, err.Error())
		return
	}

	util.WriteJSON(w, http.StatusOK, recipes)
}

func (h *RecipeHandler) DeleteRecipe(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserIDFromCtx(r.Context())
	if userID == uuid.Nil {
		util.WriteError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	idStr := chi.URLParam(r, "id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		util.WriteError(w, http.StatusBadRequest, "invalid recipe ID")
		return
	}

	if err := h.service.DeleteRecipe(r.Context(), id, userID); err != nil {
		util.WriteError(w, http.StatusInternalServerError, err.Error())
		return
	}

	util.WriteJSON(w, http.StatusOK, map[string]string{"message": "recipe deleted"})
}

func (h *RecipeHandler) ToggleShare(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserIDFromCtx(r.Context())
	if userID == uuid.Nil {
		util.WriteError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	idStr := chi.URLParam(r, "id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		util.WriteError(w, http.StatusBadRequest, "invalid recipe ID")
		return
	}

	recipe, err := h.service.ToggleShare(r.Context(), id, userID)
	if err != nil {
		util.WriteError(w, http.StatusInternalServerError, err.Error())
		return
	}

	util.WriteJSON(w, http.StatusOK, recipe)
}

func (h *RecipeHandler) GetPublicRecipe(w http.ResponseWriter, r *http.Request) {
	token := chi.URLParam(r, "token")
	if token == "" {
		util.WriteError(w, http.StatusBadRequest, "token required")
		return
	}

	recipe, err := h.service.GetPublicRecipe(r.Context(), token)
	if err != nil {
		util.WriteError(w, http.StatusInternalServerError, err.Error())
		return
	}
	if recipe == nil {
		util.WriteError(w, http.StatusNotFound, "recipe not found")
		return
	}

	util.WriteJSON(w, http.StatusOK, recipe)
}
