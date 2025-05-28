package models

import (
	"encoding/json"
	"gorm.io/gorm"
)

type OwnedPokemon struct {
	gorm.Model

	UserID    uint
	PokemonID uint
	Nickname  string

	Wins      int
	Losses    int
	TimesUsed int

	User    User    `gorm:"foreignKey:UserID"`
	Pokemon Pokemon `gorm:"foreignKey:PokemonID"`
}


// Used to store compressed data in JSON blob
type PokemonUsageCache struct {
	ID       uint   `json:"id"`   // PokémonID
	Nickname string `json:"nickname,omitempty"`
	Wins     int    `json:"wins"`
	Losses   int    `json:"losses"`
}

func (op *OwnedPokemon) AfterSave(tx *gorm.DB) error {
	var allOwned []OwnedPokemon
	if err := tx.Where("user_id = ?", op.UserID).Find(&allOwned).Error; err != nil {
		return err
	}

	var cache []PokemonUsageCache
	for _, p := range allOwned {
		cache = append(cache, PokemonUsageCache{
			ID:       p.PokemonID,
			Nickname: p.Nickname,
			Wins:     p.Wins,
			Losses:   p.Losses,
		})
	}

	jsonData, err := json.Marshal(cache)
	if err != nil {
		return err
	}

	return tx.Model(&User{}).
		Where("id = ?", op.UserID).
		Update("used_pokemons_json", jsonData).Error
}
