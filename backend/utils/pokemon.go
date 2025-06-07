package utils

import (
	"github.com/Dushyant25609/Pok-League/models"
	"gorm.io/gorm"
)

// FillWithRandomPokemon fills the user's team with random Pokemon
func FillWithRandomPokemon(username string, roomID string, db *gorm.DB) error {
	// Get how many Pokemon the user already has
	var count int64
	if err := db.Model(&models.SelectedPokemon{}).Where("username = ? AND battle_room_id = ?", username, roomID).Count(&count).Error; err != nil {
		return err
	}

	// Calculate how many more Pokemon we need
	needed := 6 - int(count)
	if needed <= 0 {
		return nil // Team is already full
	}

	// Get random Pokemon
	var pokemons []models.Pokemon
	if err := db.Order("RANDOM()").Limit(needed).Find(&pokemons).Error; err != nil {
		return err
	}

	// Add them to the user's team
	for _, pokemon := range pokemons {
		selectedPokemon := models.SelectedPokemon{
			Username:     username,
			RoomID: roomID,
			PokemonID:    uint(pokemon.ID),
		}

		if err := db.Create(&selectedPokemon).Error; err != nil {
			return err
		}
	}

	return nil
}