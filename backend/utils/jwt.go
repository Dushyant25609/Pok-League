package utils

import (
	"errors"
	"fmt"
	"os"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

func GenerateJWT(userID uint) (string, error) {
	secret := os.Getenv("JWT_SECRET")
	jwtSecret := []byte(secret)
	claims := jwt.MapClaims{
		"user_id": fmt.Sprintf("%d", userID), // store user_id as string
		"exp":     time.Now().Add(time.Hour * 72).Unix(),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(jwtSecret)
}

type JWTClaims struct {
	UserID string `json:"user_id"`
	jwt.RegisteredClaims
}

func ParseToken(tokenStr string) (*JWTClaims, error) {
	if tokenStr == "" {
		return nil, errors.New("missing token")
	}

	secret := os.Getenv("JWT_SECRET")
	jwtSecret := []byte(secret)

	if strings.HasPrefix(tokenStr, "Bearer ") {
		tokenStr = strings.TrimPrefix(tokenStr, "Bearer ")
	}

	token, err := jwt.ParseWithClaims(tokenStr, &JWTClaims{}, func(token *jwt.Token) (interface{}, error) {
		return jwtSecret, nil
	})
	if err != nil {
		return nil, fmt.Errorf("token parse error: %w", err)
	}

	if !token.Valid {
		return nil, errors.New("invalid token")
	}

	claims, ok := token.Claims.(*JWTClaims)
	if !ok {
		return nil, errors.New("could not parse claims")
	}

	return claims, nil
}
