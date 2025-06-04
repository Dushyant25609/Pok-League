package controllers

import (
	"log"
	"net/http"
	"strconv"
	"sync"
	"github.com/Dushyant25609/Pok-League/utils"
	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool { return true },
}

var RoomConnections = make(map[string][]*websocket.Conn)

type lobbyConn struct {
	conn   *websocket.Conn
	userID string
}

var lobbyMu sync.Mutex
var lobbyConns = map[string][]lobbyConn{}

func LobbySocket(c *gin.Context) {
	roomCode := c.Param("roomCode")
	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		log.Println("LobbySocket upgrade error:", err)
		return
	}
	defer conn.Close()

	var req struct {
		Token string `json:"token"`
	}
	if Connerr := conn.ReadJSON(&req); Connerr != nil {
		log.Println("LobbySocket JSON parse error:", Connerr)
		conn.WriteJSON(gin.H{"error": "Invalid JSON format. Please check for syntax errors like trailing commas."})
		return
	}
	user, err := utils.GetUserFromToken(req.Token)
	// Remove redundant database query
	if err != nil {
		conn.WriteJSON(gin.H{"error": "Invalid token"})
		return
	}

	lobbyMu.Lock()
	lobbyConns[roomCode] = append(lobbyConns[roomCode], lobbyConn{
		conn:   conn,
		userID: strconv.FormatUint(uint64(user.ID), 10),
	})
	lobbyMu.Unlock()
	select {}
}

