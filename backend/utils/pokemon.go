package utils

import (
	"github.com/Dushyant25609/Pok-League/database"
	"github.com/Dushyant25609/Pok-League/models"
)

func FillWithRandomPokemon(userID, roomID string, count int) {
	var pokemons []models.Pokemon
	database.DB.Raw("SELECT * FROM pokemons ORDER BY RANDOM() LIMIT ?", count).Scan(&pokemons)

	for _, p := range pokemons {
		database.DB.Create(&models.SelectedPokemon{
			UserID:    userID,
			RoomID:    roomID,
			PokemonID: p.ID,
		})
	}
} 