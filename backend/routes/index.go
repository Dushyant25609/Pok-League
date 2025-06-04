package routes
import (
	"github.com/gin-gonic/gin"
)
func IndexRoutes(r *gin.Engine) {
	api := r.Group("/api")
	AuthRoutes(api)
	PokemonRoutes(api)
	ProtectedRoutes(api)
	SocketRoutes(api)
}