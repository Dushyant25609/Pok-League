package routes

import (
	"github.com/Dushyant25609/Pok-League/controllers"
	"github.com/gin-gonic/gin"
)

func SocketRoutes(router *gin.RouterGroup) {
	r := router.Group("/ws")
	r.GET("/team-selection/:code", controllers.TeamSelectionSocket)
	r.GET("/battle/:code", controllers.BattleSocket)
	// Removing duplicate route that causes conflict
	r.GET("lobby/:roomCode", controllers.LobbySocket)
	// other secured routes here
}
