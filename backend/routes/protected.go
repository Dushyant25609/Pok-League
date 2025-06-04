package routes

import (
	"github.com/Dushyant25609/Pok-League/middleware"
	"github.com/gin-gonic/gin"
)
func ProtectedRoutes(r *gin.RouterGroup) {
    protected := r.Group("/pvt")
    protected.Use(middleware.AuthMiddleware())
    {
        RoomRoutes(protected)
        PrivatePokemonRoutes(protected)
    }
}
