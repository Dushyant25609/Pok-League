// utils/jwt.go
package utils

import (
	"os"
	"time"

	"github.com/golang-jwt/jwt/v5"
)
var Secret = os.Getenv("JWT_SECRET")
var jwtSecret = []byte(Secret)

func GenerateJWT(userID uint) (string, error) {
    claims := jwt.MapClaims{
        "user_id": userID,
        "exp":     time.Now().Add(time.Hour * 72).Unix(), // 3 day expiry
    }
    token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
    return token.SignedString(jwtSecret)
}
