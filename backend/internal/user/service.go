package user

import (
	"context"
	"fmt"
	"log"
	"strings"
	"time"

	"github.com/Igorlimaponce/fridgeChef/backend/util"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
)

type JWTClaims struct {
	ID       string `json:"id"`
	Username string `json:"username"`
	jwt.RegisteredClaims
}

type UserService struct {
	userRepo *UserRepository
	timeout  time.Duration
}

func NewUserService(userRepo *UserRepository) *UserService {
	return &UserService{
		userRepo: userRepo,
		timeout:  2 * time.Second,
	}
}

func (s *UserService) CreateUser(ctx context.Context, requestCreateUser RequestCreateUser) (*ResponseLoginUser, error) {
	ctx, cancel := context.WithTimeout(ctx, s.timeout)
	defer cancel()

	log.Printf("UserService.CreateUser - Starting user creation for: %s", requestCreateUser.Email)

	if requestCreateUser.Email == "" || requestCreateUser.Username == "" || requestCreateUser.Password == "" {
		log.Printf("UserService.CreateUser - Validation failed: missing required fields")
		return nil, fmt.Errorf("username, email and password are required")
	}

	if len(requestCreateUser.Password) < 7 {
		log.Printf("UserService.CreateUser - Validation failed: password too short")
		return nil, fmt.Errorf("password must be at least 7 characters")
	}

	hashedPassword, err := util.HashPassword(requestCreateUser.Password)
	if err != nil {
		log.Printf("UserService.CreateUser - Password hashing failed: %v", err)
		return nil, fmt.Errorf("failed to process password")
	}

	u := &User{
		Username:     requestCreateUser.Username,
		Email:        requestCreateUser.Email,
		PasswordHash: &hashedPassword,
	}

	user, err := s.userRepo.CreateUser(ctx, u)
	if err != nil {
		log.Printf("UserService.CreateUser - Database error: %v", err)
		if strings.Contains(err.Error(), "duplicate") || strings.Contains(err.Error(), "unique") {
			return nil, fmt.Errorf("username or email already exists")
		}
		return nil, fmt.Errorf("failed to create user: %v", err)
	}

	log.Printf("UserService.CreateUser - User created successfully in database: %s", user.ID.String())

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, JWTClaims{
		ID:       user.ID.String(),
		Username: user.Username,
		RegisteredClaims: jwt.RegisteredClaims{
			Issuer:    user.ID.String(),
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)),
		},
	})

	secretKey := util.GetEnv("JWT_SECRET", "")
	ss, err := token.SignedString([]byte(secretKey))
	if err != nil {
		return nil, err
	}

	return &ResponseLoginUser{
		AccessToken: ss,
		Username:    user.Username,
		ID:          user.ID.String(),
	}, nil

}

func (s *UserService) GetUserByID(ctx context.Context, id uuid.UUID) (*User, error) {
	return s.userRepo.GetUserByID(ctx, id)
}

func (s *UserService) DeleteUser(ctx context.Context, id uuid.UUID) error {
	return s.userRepo.DeleteUser(ctx, id)
}

func (s *UserService) Login(ctx context.Context, requestLoginUser RequestLoginUser) (*ResponseLoginUser, error) {
	ctx, cancel := context.WithTimeout(ctx, s.timeout)
	defer cancel()

	log.Printf("UserService.Login - Starting login attempt for email: %s", requestLoginUser.Email)

	user, err := s.userRepo.GetUserByEmail(ctx, requestLoginUser.Email)
	if err != nil {
		log.Printf("UserService.Login - Database error: %v", err)
		return nil, fmt.Errorf("failed to authenticate user")
	}

	if user == nil {
		log.Printf("UserService.Login - User not found for email: %s", requestLoginUser.Email)
		return nil, fmt.Errorf("invalid email or password")
	}

	if user.PasswordHash == nil {
		log.Printf("UserService.Login - User has no password hash: %s", requestLoginUser.Email)
		return nil, fmt.Errorf("invalid user account")
	}

	err = util.CheckPassword(requestLoginUser.Password, *user.PasswordHash)
	if err != nil {
		log.Printf("UserService.Login - Password check failed for user: %s", user.ID.String())
		return nil, fmt.Errorf("invalid email or password")
	}

	log.Printf("UserService.Login - Password verified successfully for user: %s", user.ID.String())

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, JWTClaims{
		ID:       user.ID.String(),
		Username: user.Username,
		RegisteredClaims: jwt.RegisteredClaims{
			Issuer:    user.ID.String(),
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)),
		},
	})

	secretKey := util.GetEnv("JWT_SECRET", "")

	ss, err := token.SignedString([]byte(secretKey))
	if err != nil {
		log.Printf("UserService.Login - JWT signing failed for user: %s, error: %v", user.ID.String(), err)
		return nil, fmt.Errorf("failed to generate authentication token")
	}

	log.Printf("UserService.Login - Login successful for user: %s (%s)", user.ID.String(), user.Username)
	return &ResponseLoginUser{AccessToken: ss, Username: user.Username, ID: user.ID.String()}, nil
}
