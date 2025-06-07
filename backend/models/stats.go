package models

type PokemonStats struct {

	ID           uint `gorm:"primaryKey"`
	PokemonID    uint `gorm:"index"`
	BattlesWon   int  `gorm:"default:0"`
	BattlesLost  int  `gorm:"default:0"`
	TotalBattles int  `gorm:"default:0"`

}

