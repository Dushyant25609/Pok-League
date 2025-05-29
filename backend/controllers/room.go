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

type CreateRoomRequest struct {
    Generations      []int64    `json:"generations" binding:"required"`
    AllowLegendaries bool     `json:"allow_legendaries"`
    AllowMythical bool     `json:"allow_mythical"`
    BannedTypes      []string `json:"banned_types"`
}

type CreateRoomResponse struct {
	RoomID string `json:"room_id"`
	Code   string `json:"code"`
	Status string `json:"status"`
}

func CreateRoom(c *gin.Context) {
    userID, exists := c.Get("userID")
    if !exists {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized: user ID not found in context"})
        return
    }

    var req CreateRoomRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    room := models.BattleRoom{
		ID:               uuid.New().String(),
		HostID:           userID.(string),
		Code:             generateRoomCode(),
		Generations:      pq.Int64Array(req.Generations),
		AllowLegendaries: req.AllowLegendaries,
		AllowMythical:    req.AllowMythical,
		BannedTypes:      pq.StringArray(req.BannedTypes),
		Status:           "waiting",
		CreatedAt:        time.Now(),
		ExpiresAt:        time.Now().Add(15 * time.Minute),
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