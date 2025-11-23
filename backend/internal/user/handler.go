package user

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/Igorlimaponce/fridgeChef/backend/internal/filter"
	"github.com/Igorlimaponce/fridgeChef/backend/util"
	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
)

type UserHandler struct {
	userService     *UserService
	profanityFilter *filter.ProfanityFilter
}

func NewUserHandler(userService *UserService, profanityFilter *filter.ProfanityFilter) *UserHandler {
	return &UserHandler{
		userService:     userService,
		profanityFilter: filter.NewProfanityFilter(),
	}
}

func (h *UserHandler) CreateUser(w http.ResponseWriter, r *http.Request) {
	var req RequestCreateUser
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		log.Printf("CreateUser - JSON decode error: %v", err)
		util.WriteError(w, http.StatusBadRequest, "invalid JSON payload")
		return
	}

	log.Printf("CreateUser - Request received: username=%s, email=%s", req.Username, req.Email)

	// Check for profanity in username
	if h.profanityFilter.ContainsProfanity(req.Username) {
		log.Printf("CreateUser - Username blocked for inappropriate content: %s", req.Username)
		util.WriteError(w, http.StatusBadRequest, "username contains inappropriate content")
		return
	}

	user, err := h.userService.CreateUser(r.Context(), req)
	if err != nil {
		log.Printf("CreateUser - Service error: %v", err)
		util.WriteError(w, http.StatusInternalServerError, err.Error())
		return
	}

	log.Printf("CreateUser - Success: user created with ID=%s, username=%s", user.ID, user.Username)

	// Set JWT cookie
	http.SetCookie(w, &http.Cookie{
		Name:     "jwt",
		Value:    user.AccessToken,
		Path:     "/",
		MaxAge:   60 * 60 * 24,
		HttpOnly: true,
		Secure:   false,
		SameSite: http.SameSiteLaxMode,
	})

	util.WriteJSON(w, http.StatusCreated, user)
}

func (h *UserHandler) Login(w http.ResponseWriter, r *http.Request) {
	var req RequestLoginUser
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		util.WriteError(w, http.StatusBadRequest, "invalid JSON payload")
		return
	}

	user, err := h.userService.Login(r.Context(), req)
	if err != nil {
		util.WriteError(w, http.StatusUnauthorized, err.Error())
		return
	}

	// Set JWT cookie
	http.SetCookie(w, &http.Cookie{
		Name:     "jwt",
		Value:    user.AccessToken,
		Path:     "/",
		MaxAge:   60 * 60 * 24,
		HttpOnly: true,
		Secure:   false,
		SameSite: http.SameSiteLaxMode,
	})

	util.WriteJSON(w, http.StatusOK, user)
}

func (h *UserHandler) Logout(w http.ResponseWriter, r *http.Request) {
	http.SetCookie(w, &http.Cookie{
		Name:     "jwt",
		Value:    "",
		Path:     "/",
		MaxAge:   -1,
		HttpOnly: true,
		Secure:   false,
		SameSite: http.SameSiteLaxMode,
	})

	util.WriteJSON(w, http.StatusOK, map[string]string{"message": "logout successful"})
}

func (h *UserHandler) DeleteUser(w http.ResponseWriter, r *http.Request) {
	// Assuming user ID is obtained from authenticated context or URL parameter
	userID := chi.URLParam(r, "id")
	id, err := uuid.Parse(userID)
	if err != nil {
		util.WriteError(w, http.StatusBadRequest, "invalid user ID")
		return
	}

	if err := h.userService.DeleteUser(r.Context(), id); err != nil {
		util.WriteError(w, http.StatusInternalServerError, err.Error())
		return
	}

	util.WriteJSON(w, http.StatusOK, map[string]string{"message": "user deleted successfully"})
}
