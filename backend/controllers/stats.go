package controllers

import (
	"github.com/Dushyant25609/Pok-League/database"
	"github.com/Dushyant25609/Pok-League/models"
)



func updatePostBattleStats(pokemonID uint, won bool) {
	var stats models.PokemonStats
	database.DB.Where("pokemon_id = ?", pokemonID).FirstOrCreate(&stats)

	// Ensure the fields are set correctly
	stats.PokemonID = pokemonID
	stats.TotalBattles++
	if won {
		stats.BattlesWon++
	} else {
		stats.BattlesLost++
	}
	database.DB.Save(&stats)
}