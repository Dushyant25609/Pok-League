package routes

import (
	"github.com/Dushyant25609/Pok-League/controllers"
	"github.com/gin-gonic/gin"
)

var baseURL string = "/api/"

func AuthRoutes(r *gin.RouterGroup) {
	auth := r.Group("/auth")
	auth.POST("/signup", controllers.SignUp)
	auth.POST("/login", controllers.Login)
}
