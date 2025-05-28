package routes

import (
	"github.com/Dushyant25609/Pok-League/controllers"
	"github.com/gin-gonic/gin"
)

var baseURL string = "/api/"

func AuthRoutes(r *gin.Engine) {
	auth := r.Group(baseURL + "auth")
	auth.POST("/signup", controllers.SignUp)
}
