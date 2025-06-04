package controllers

import (
	"net/http"
	"strconv"
	"time"

	"github.com/Dushyant25609/Pok-League/database"
	"github.com/Dushyant25609/Pok-League/models"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/lib/pq"
	// other imports
)

type CreateRoomRequest struct {
	Generations       []int64  `json:"generations" binding:"required"`
	AllowLegendaries  bool     `json:"allow_legendaries"`
	AllowMythical     bool     `json:"allow_mythical"`
	BannedTypes       []string `json:"banned_types"`
	TeamSelectionTime int      `json:"team_selection_time" binding:"required"` // e.g., 120 (in seconds)
}

type CreateRoomResponse struct {
	RoomID string `json:"room_id"`
	Code   string `json:"code"`
	Status string `json:"status"`
}

func CreateRoom(c *gin.Context) {
	// Get the complete user object from context
	user, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized: user not found in context"})
		return
	}

	// Extract the user ID from the user object
	userObj := user.(models.User)
	userID := strconv.FormatUint(uint64(userObj.ID), 10)

	var req CreateRoomRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	room := models.BattleRoom{
		ID:                    uuid.New().String(),
		HostID:                userID,
		Code:                  generateRoomCode(),
		Generations:           pq.Int64Array(req.Generations),
		AllowLegendaries:      req.AllowLegendaries,
		AllowMythical:         req.AllowMythical,
		BannedTypes:           pq.StringArray(req.BannedTypes),
		Status:                "waiting",
		CreatedAt:             time.Now(),
		ExpiresAt:             time.Now().Add(15 * time.Minute),
		TeamSelectionTime:     req.TeamSelectionTime,
		TeamSelectionDeadline: time.Now().Add(time.Duration(req.TeamSelectionTime) * time.Second),
	}

	if err := database.DB.Create(&room).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create room"})
		return
	}

	c.JSON(http.StatusOK, CreateRoomResponse{
		RoomID: room.ID,
		Code:   room.Code,
		Status: room.Status,
	})
}

func generateRoomCode() string {
	return uuid.New().String()[:6] // Short room code, can be improved
}

type JoinRoomRequest struct {
	Code string `json:"code" binding:"required"`
}

type JoinRoomResponse struct {
	RoomID  string `json:"room_id"`
	HostID  string `json:"host_id"`
	GuestID string `json:"guest_id"`
	Status  string `json:"status"`
}

func JoinRoom(c *gin.Context) {
	// Get the complete user object from context
	user, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized: user not found in context"})
		return
	}

	// Extract the user ID from the user object
	userObj := user.(models.User)
	userID := strconv.FormatUint(uint64(userObj.ID), 10)

	var req JoinRoomRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var room models.BattleRoom
	if err := database.DB.Where("code = ?", req.Code).First(&room).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Room not found"})
		return
	}

	if room.HostID == userID {
		c.JSON(http.StatusBadRequest, gin.H{"error": "You cannot join your own room"})
		return
	}

	if room.GuestID != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Room already has a guest"})
		return
	}

	if room.ExpiresAt.Before(time.Now()) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Room expired"})
		return
	}

	room.GuestID = ptr(userID)
	room.Status = "ready" // optional, depends on your flow

	if err := database.DB.Save(&room).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to join room"})
		return
	}

	c.JSON(http.StatusOK, JoinRoomResponse{
		RoomID:  room.ID,
		HostID:  room.HostID,
		GuestID: *room.GuestID,
		Status:  room.Status,
	})
}

func ptr(s string) *string {
	return &s
}

// controllers/battle.go
type TeamSubmitRequest struct {
	RoomCode   string `json:"room_code" binding:"required"`
	PokemonIDs []int  `json:"pokemon_ids" binding:"required,len=6"`
}

func SubmitTeam(c *gin.Context) {
	// Get the complete user object from context
	user, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized: user not found in context"})
		return
	}

	// Extract the user ID from the user object
	userObj := user.(models.User)
	userID := strconv.FormatUint(uint64(userObj.ID), 10)

	var req TeamSubmitRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var room models.BattleRoom
	if err := database.DB.Where("code = ?", req.RoomCode).First(&room).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Room not found"})
		return
	}
	if time.Now().After(room.TeamSelectionDeadline) {
		c.JSON(http.StatusForbidden, gin.H{"error": "Team selection time has expired"})
		return
	}

	// Save team selection
	selection := models.TeamSelection{
		ID:           uuid.New().String(),
		BattleRoomID: room.ID,
		UserID:       userID,
		PokemonIDs:   req.PokemonIDs,
	}

	if err := database.DB.Create(&selection).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not save team"})
		return
	}

	// Check if both players have submitted
	var count int64
	database.DB.Model(&models.TeamSelection{}).
		Where("battle_room_id = ?", room.ID).
		Count(&count)

	if count == 2 {
		room.Status = "ready"
		database.DB.Save(&room)
	}

	c.JSON(http.StatusOK, gin.H{"message": "Team submitted", "status": room.Status})
}
