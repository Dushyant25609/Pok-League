package routes
import (
	"github.com/gin-gonic/gin"
)
func IndexRoutes(r *gin.Engine) {
	api := r.Group("/api")
	PokemonRoutes(api)
	SocketRoutes(api)
	RoomRoutes(api)
}