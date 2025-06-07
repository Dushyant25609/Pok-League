package routes

import (
	"github.com/Dushyant25609/Pok-League/controllers"
	"github.com/gin-gonic/gin"
)

func RoomRoutes(router *gin.RouterGroup) {
	r := router.Group("/room")
	r.POST("/create/:username", controllers.CreateRoom)
	r.POST("/join/:username", controllers.JoinRoom)
	r.GET("/:code/pokemon",controllers.GetAvailablePokemon)
	// other secured routes here
}
