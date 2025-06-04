package utils

import (
	"github.com/Dushyant25609/Pok-League/database"
	"github.com/Dushyant25609/Pok-League/models"
)

// GetUserFromToken retrieves a user by their token
func GetUserFromToken(token string) (models.User, error) {
	var user models.User
	result := database.DB.Where("token = ?", token).First(&user)
	return user, result.Error
}