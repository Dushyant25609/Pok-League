package routes

import (
	"github.com/Dushyant25609/Pok-League/controllers"
	"github.com/gin-gonic/gin"
)

func RoomRoutes(router *gin.RouterGroup) {
	router.POST("/room/create", controllers.CreateRoom)
	// other secured routes here
}
