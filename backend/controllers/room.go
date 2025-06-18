package controllers

import (
	"net/http"
	"time"

	"github.com/Dushyant25609/Pok-League/database"
	"github.com/Dushyant25609/Pok-League/models"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/lib/pq"
	// other imports
)

type CreateRoomRequest  struct {
	Generations       []int64  `json:"generations" binding:"required"`
	AllowLegendaries  bool     `json:"allow_legendaries"`
	AllowMythical     bool     `json:"allow_mythical"`
	BannedTypes       []int64 `json:"banned_types"`
	TeamSelectionTime int      `json:"team_selection_time" binding:"required"` // e.g., 120 (in seconds)
}

type CreateRoomResponse struct {
	RoomID string `json:"room_id"`
	Code   string `json:"code"`
	Status string `json:"status"`
}

func CreateRoom(c *gin.Context) {
	// Get username from context or query parameter
	username := c.Param("username")
	if username == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Username is required"})
		return
	}

	var req CreateRoomRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	bannedTypes := pq.Int64Array(req.BannedTypes)

	room := models.BattleRoom{
		ID:                    uuid.New().String(),
		HostUsername:          username,
		Code:                  generateRoomCode(),
		Generations:           pq.Int64Array(req.Generations),
		AllowLegendaries:      req.AllowLegendaries,
		AllowMythical:         req.AllowMythical,
		BannedTypes:           bannedTypes,
		Status:                "waiting",
		CreatedAt:             time.Now(),
		ExpiresAt:             time.Now().Add(30 * time.Minute),
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
	RoomID       string `json:"room_id"`
	HostUsername string `json:"host_username"`
	GuestUsername string `json:"guest_username"`
	Status       string `json:"status"`
}

func JoinRoom(c *gin.Context) {
	// Get username from context or query parameter
	username := c.Param("username")
	if username == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Username is required"})
		return
	}

	var req JoinRoomRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Removed lobbyConns check here as it's handled by WebSocket connection

	var room models.BattleRoom
	if err := database.DB.Where("code = ?", req.Code).First(&room).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Room not found"})
		return
	}

	if room.HostUsername == username {
		c.JSON(http.StatusBadRequest, gin.H{"error": "You cannot join your own room"})
		return
	}

	if room.GuestUsername != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Room already has a guest"})
		return
	}

	// Update the room with the guest's username
	room.GuestUsername = &username
	if err := database.DB.Save(&room).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to join room"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Successfully joined room", "room_code": room.Code})
}

// controllers/battle.go
type TeamSubmitRequest struct {
	RoomCode   string `json:"room_code" binding:"required"`
	PokemonIDs []int  `json:"pokemon_ids" binding:"required,len=6"`
}