package controllers

import (
	"strconv"

	"github.com/Dushyant25609/Pok-League/database"
	"github.com/Dushyant25609/Pok-League/models"
)

func UpdateUserStats(userID string, won bool) {
	var userStats models.UserStats
	database.DB.Where("user_id =?", userID).FirstOrCreate(&userStats)
	if won {
		userStats.BattlesWon++
	} else {
		userStats.BattlesLost++
	}
	userStats.TotalBattles = userStats.BattlesWon + userStats.BattlesLost
	database.DB.Save(&userStats)
}

func updatePostBattleStats(userID string, pokemonID uint, won bool) {
	// Convert userID string to uint for the database query
	userIDUint, _ := strconv.ParseUint(userID, 10, 32)
	var userOwnedPokemon models.OwnedPokemon
	database.DB.Where("user_id =? AND pokemon_id =?", userID, pokemonID).FirstOrCreate(&userOwnedPokemon)
	// Ensure the fields are set correctly
	userOwnedPokemon.UserID = uint(userIDUint)
	userOwnedPokemon.PokemonID = pokemonID
	if won {
		userOwnedPokemon.Wins++
	} else {
		userOwnedPokemon.Losses++
	}
	database.DB.Save(&userOwnedPokemon)

	var stats models.PokemonStats
	database.DB.Where("user_id = ? AND pokemon_id = ?", uint(userIDUint), pokemonID).FirstOrCreate(&stats)

	// Ensure the fields are set correctly
	stats.UserID = uint(userIDUint)
	stats.PokemonID = pokemonID
	stats.TotalBattles++
	if won {
		stats.BattlesWon++
	} else {
		stats.BattlesLost++
	}
	database.DB.Save(&stats)
}