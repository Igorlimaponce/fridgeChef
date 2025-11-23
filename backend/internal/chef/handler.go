package chef

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/Igorlimaponce/fridgeChef/backend/util"
)

type ChefHandler struct {
	service *ChefService
}

func NewChefHandler(service *ChefService) *ChefHandler {
	return &ChefHandler{service: service}
}

func (h *ChefHandler) GenerateRecipe(w http.ResponseWriter, r *http.Request) {
	var req GenerateRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		util.WriteError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	if len(req.Ingredients) == 0 {
		util.WriteError(w, http.StatusBadRequest, "ingredients are required")
		return
	}

	resp, err := h.service.GenerateRecipe(r.Context(), req)
	if err != nil {
		log.Printf("ChefService.GenerateRecipe error: %v", err)
		util.WriteError(w, http.StatusInternalServerError, "failed to generate recipe")
		return
	}

	util.WriteJSON(w, http.StatusOK, resp)
}
