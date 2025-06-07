package controllers

import (
	"net/http"
	"sync"
	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool { return true },
}

var RoomConnections = make(map[string][]*websocket.Conn)

type lobbyConn struct {
	conn     *websocket.Conn
	username string
}

var lobbyMu sync.Mutex
var lobbyConns = map[string][]lobbyConn{}

// LobbySocket handles websocket connections for the lobby
func LobbySocket(c *gin.Context) {
	roomCode := c.Param("roomCode")
	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer conn.Close()

	// Read initial message with token and username
	var req struct {
		Username string `json:"username"`
	}

	if err := conn.ReadJSON(&req); err != nil {
		conn.WriteJSON(gin.H{"error": "Invalid request"})
		return
	}

	// Validate token
	if req.Username == "" {
		conn.WriteJSON(gin.H{"error": "Token and username are required"})
		return
	}

	// Store connection with username
	lobbyMu.Lock()
	lobbyConns[roomCode] = append(lobbyConns[roomCode], lobbyConn{
		conn:     conn,
		username: req.Username,
	})
	lobbyMu.Unlock()
	select {}
}

