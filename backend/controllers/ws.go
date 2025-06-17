package controllers

import (
	"fmt"
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
	conn1     *websocket.Conn
	username1 string
	conn2     *websocket.Conn
	username2 string
	mu        sync.Mutex
}

var (
	lobbyMu    sync.Mutex
	lobbyConns = make(map[string]*lobbyConn)
)

func LobbySocket(c *gin.Context) {
	roomCode := c.Param("roomCode")

	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	var req struct {
		Username string `json:"username"`
	}

	if err := conn.ReadJSON(&req); err != nil || req.Username == "" {
		conn.WriteJSON(gin.H{"error": "Username is required"})
		conn.Close()
		return
	}

	lobbyMu.Lock()
	lobby, exists := lobbyConns[roomCode]
	if !exists {
		lobby = &lobbyConn{}
		lobbyConns[roomCode] = lobby
	}
	lobbyMu.Unlock()

	lobby.mu.Lock()
	defer lobby.mu.Unlock()

	// Check for duplicate user (common in development reloads)
	if req.Username == lobby.username1 || req.Username == lobby.username2 {
		conn.WriteJSON(gin.H{"error": "You cannot join with the same username"})
		return
	}

	// Assign player
	if lobby.username1 == "" {
		lobby.username1 = req.Username
		lobby.conn1 = conn
	} else if lobby.username2 == "" {
		lobby.username2 = req.Username
		lobby.conn2 = conn
	} else {
		conn.WriteJSON(gin.H{"error": "Room is full"})
		return
	}

	// If both players are present, notify and close connections
	if lobby.conn1 != nil && lobby.conn2 != nil {
		msg1 := gin.H{
			"type":     "room_ready",
			"username": lobby.username1,
			"opponent": lobby.username2,
		}
		msg2 := gin.H{
			"type":     "room_ready",
			"username": lobby.username2,
			"opponent": lobby.username1,
		}

		// Notify and close
		lobby.conn1.WriteJSON(msg1)
		lobby.conn2.WriteJSON(msg2)

		lobby.conn1.Close()
		lobby.conn2.Close()

		// Cleanup
		lobbyMu.Lock()
		delete(lobbyConns, roomCode)
		lobbyMu.Unlock()

		fmt.Println("Room", roomCode, "is now ready and closed.")
	}
}
