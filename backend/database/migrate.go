package database

import (
	"github.com/Dushyant25609/Pok-League/models"
	"gorm.io/gorm"
)

func AutoMigrateAll(db *gorm.DB) error {
	return db.AutoMigrate(
		&models.Type{},
		&models.TypeEffectiveness{},
		&models.Moves{},
		&models.Pokemon{},
		&models.PokemonStats{},
		&models.BaseStats{},
		&models.BattleRoom{},
		&models.SelectedPokemon{},
	)

}
