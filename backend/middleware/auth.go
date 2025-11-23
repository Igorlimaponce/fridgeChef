package middleware

import (
	"context"
	"log"
	"net/http"

	"github.com/Igorlimaponce/fridgeChef/backend/util"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
)

type ctxKey string

var userIDCtxKey ctxKey = "userID"

func JWTAuth(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		log.Printf("JWTAuth: Processing request to %s", r.URL.Path)

		// Try to get token from Authorization header first
		authHeader := r.Header.Get("Authorization")
		var tokenString string

		if authHeader != "" && len(authHeader) > 7 && authHeader[:7] == "Bearer " {
			// Token from Authorization header
			tokenString = authHeader[7:]
			log.Printf("JWTAuth: Token found in Authorization header: %s...", tokenString[:20])
		} else {
			log.Printf("JWTAuth: No Authorization header found, trying cookie")
			// Fallback to cookie
			cookie, err := r.Cookie("jwt")
			if err != nil {
				log.Printf("JWTAuth: No cookie found: %v", err)
				util.WriteError(w, http.StatusUnauthorized, "missing auth token")
				return
			}
			tokenString = cookie.Value
			log.Printf("JWTAuth: Token found in cookie")
		}

		if tokenString == "" {
			log.Printf("JWTAuth: Token string is empty")
			util.WriteError(w, http.StatusUnauthorized, "missing auth token")
			return
		}

		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, jwt.ErrSignatureInvalid
			}
			return []byte(util.GetEnv("JWT_SECRET", "")), nil
		})

		if err != nil || !token.Valid {
			log.Printf("JWTAuth: Token validation failed: %v", err)
			util.WriteError(w, http.StatusUnauthorized, "invalid auth token")
			return
		}

		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			log.Printf("JWTAuth: Failed to parse claims")
			util.WriteError(w, http.StatusUnauthorized, "invalid token claims")
			return
		}

		userID, ok := claims["id"].(string)
		if !ok {
			log.Printf("JWTAuth: No user ID in claims")
			util.WriteError(w, http.StatusUnauthorized, "invalid user ID in token")
			return
		}

		log.Printf("JWTAuth: Token validated successfully for user: %s", userID)
		// Use the typed context key consistently
		ctx := context.WithValue(r.Context(), userIDCtxKey, userID)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

func OptionalJWTAuth(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		log.Printf("OptionalJWTAuth: Processing request to %s", r.URL.Path)

		cookie, err := r.Cookie("jwt")
		if err != nil {
			log.Printf("OptionalJWTAuth: No JWT cookie found: %v", err)
			next.ServeHTTP(w, r)
			return
		}

		if cookie.Value == "" {
			log.Printf("OptionalJWTAuth: JWT cookie is empty")
			next.ServeHTTP(w, r)
			return
		}

		log.Printf("OptionalJWTAuth: Found JWT cookie")

		token, err := jwt.Parse(cookie.Value, func(token *jwt.Token) (interface{}, error) {
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				log.Printf("OptionalJWTAuth: Invalid signing method")
				return nil, jwt.ErrSignatureInvalid
			}
			secretKey := util.GetEnv("JWT_SECRET", "")
			if secretKey == "" {
				log.Printf("OptionalJWTAuth: Secret key not found in environment")
				return nil, jwt.ErrSignatureInvalid
			}
			return []byte(secretKey), nil
		})

		if err != nil {
			log.Printf("OptionalJWTAuth: Error parsing token: %v", err)
			next.ServeHTTP(w, r)
			return
		}

		if !token.Valid {
			log.Printf("OptionalJWTAuth: Token is invalid")
			next.ServeHTTP(w, r)
			return
		}

		if claims, ok := token.Claims.(jwt.MapClaims); ok {
			log.Printf("OptionalJWTAuth: Token claims: %+v", claims)
			if userID, ok := claims["id"].(string); ok {
				log.Printf("OptionalJWTAuth: Setting user ID in context: %s", userID)
				ctx := context.WithValue(r.Context(), userIDCtxKey, userID)
				r = r.WithContext(ctx)
			} else {
				log.Printf("OptionalJWTAuth: No 'id' claim found in token")
			}
		} else {
			log.Printf("OptionalJWTAuth: Failed to parse claims")
		}

		next.ServeHTTP(w, r)
	})
}

func GetUserIDFromCtx(ctx context.Context) uuid.UUID {
	if v := ctx.Value(userIDCtxKey); v != nil {
		if id, ok := v.(uuid.UUID); ok {
			return id
		}
		if s, ok := v.(string); ok {
			u, _ := uuid.Parse(s)
			return u
		}
	}
	return uuid.Nil
}
