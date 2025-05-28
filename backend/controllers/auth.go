package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/Dushyant25609/Pok-League/models"
	"github.com/Dushyant25609/Pok-League/utils"
	"github.com/Dushyant25609/Pok-League/database"
)

var SignupInput struct {
	Username    string `json:"username"`
	Email       string `json:"email"`
	Password    string `json:"password"`
	DisplayName string `json:"display_name,omitempty"`
	Team        int    `json:"team"`
	BuddyID     uint   `json:"buddy_id"`
}

func SignUp(c *gin.Context) {
	if err := c.ShouldBindJSON(&SignupInput); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	hashedPassword, err := utils.HashPassword(SignupInput.Password)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error hashing password"})
		return
	}

	user := models.User{
		Username:     SignupInput.Username,
		Email:        SignupInput.Email,
		PasswordHash: hashedPassword,
		DisplayName:  SignupInput.DisplayName,
		Team:         SignupInput.Team,
		BuddyID:      SignupInput.BuddyID,
	}

	// Save user to DB
	if dbErr := database.DB.Create(&user).Error; dbErr != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": dbErr.Error()})
		return
	}

	// Generate JWT
	token, err := utils.GenerateJWT(user.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error generating token"})
		return
	}

	// Save token to DB
	user.Token = token
	if err := database.DB.Save(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to store token"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Signup successful",
		"token":   token,
	})
}

var LoginInput struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

func Login(c *gin.Context) {
	if err := c.ShouldBindJSON(&LoginInput); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	var user models.User
	if err := database.DB.Where("email = ?", LoginInput.Email).First(&user).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Email not found"})
		return
	}

	if !utils.CheckPasswordHash(LoginInput.Password, user.PasswordHash) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Incorrect password"})
		return
	}

	token, err := utils.GenerateJWT(user.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}

	user.Token = token
	database.DB.Save(&user)

	c.JSON(http.StatusOK, gin.H{
		"message": "Login successful",
		"token":   token,
	})
}
