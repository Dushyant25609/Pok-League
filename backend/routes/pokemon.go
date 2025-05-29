package routes

import (
	"github.com/Dushyant25609/Pok-League/controllers"
	"github.com/gin-gonic/gin"
)

func PokemonRoutes(r *gin.RouterGroup) {
	pokemon := r.Group("/pokemon")
	pokemon.GET("/", controllers.GetPaginatedPokemon)
	pokemon.GET("/gen/:generation", controllers.GetPokemonsByGeneration)
}
