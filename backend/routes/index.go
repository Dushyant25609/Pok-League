package routes
import (
	"github.com/gin-gonic/gin"
)
func IndexRoutes(r *gin.Engine) {
	AuthRoutes(r)
	PokemonRoutes(r)
}