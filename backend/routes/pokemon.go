package routes

import (
	"github.com/Dushyant25609/Pok-League/controllers"
	"github.com/gin-gonic/gin"
)

func PokemonRoutes(r *gin.Engine) {
	pokemon := r.Group(baseURL + "pokemon")
	pokemon.GET("", controllers.GetPaginatedPokemon)
}
