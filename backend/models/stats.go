package models

type UserStats struct {
	ID           uint `gorm:"primaryKey"`
	UserID       uint `gorm:"uniqueIndex"`
	BattlesWon   int  `gorm:"default:0"`
	BattlesLost  int  `gorm:"default:0"`
	TotalBattles int  `gorm:"default:0"`
}

type PokemonStats struct {
	ID           uint `gorm:"primaryKey"`
	PokemonID    uint `gorm:"uniqueIndex"`
	BattlesWon   int  `gorm:"default:0"`
	BattlesLost  int  `gorm:"default:0"`
	TotalBattles int  `gorm:"default:0"`
}
