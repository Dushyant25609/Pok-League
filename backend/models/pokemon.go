package models

import "gorm.io/gorm"

type Type struct {
	ID          uint   `gorm:"primaryKey"`
	Name        string `gorm:"unique;not null"`
	weaknesses  []Type `gorm:"many2many:type_weaknesses;"`
	srtrengths  []Type `gorm:"many2many:type_strengths;"`
	resistances []Type `gorm:"many2many:type_resistances;"`
}

type TypeEffectiveness struct {
	ID              uint `gorm:"primaryKey"`
	AttackingTypeID uint
	DefendingTypeID uint
	Multiplier      float64

	AttackingType Type `gorm:"foreignKey:AttackingTypeID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
	DefendingType Type `gorm:"foreignKey:DefendingTypeID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
}

type Moves struct {
	ID       uint   `gorm:"primaryKey"`
	Name     string `gorm:"unique;not null"`
	TypeID   uint
	Type     Type `gorm:"foreignKey:TypeID"`
	Power    int
	Accuracy int
}

type Pokemon struct {
	ID         uint   `gorm:"primaryKey"`
	Name       string `gorm:"unique;not null"`
	Rarity     string
	Generation uint

	Types []Type  `gorm:"many2many:pokemon_types;"`
	Moves []Moves `gorm:"many2many:pokemon_moves;"`

	Stats     PokemonStats `gorm:"foreignKey:PokemonID"`
	BaseStats BaseStats    `gorm:"foreignKey:PokemonID"`
	CurrentHP int          `gorm:"-"`
}

type BaseStats struct {
	ID             uint `gorm:"primaryKey"`
	PokemonID      uint `gorm:"uniqueIndex"`
	HP             int
	Attack         int
	Defense        int
	SpecialAttack  int
	SpecialDefense int
	Speed          int
}

type SelectedPokemon struct {
	gorm.Model
	Username  string `json:"username"`    // the player selecting
	RoomID    string `json:"room_id"`    // the battle room
	PokemonID uint   `json:"pokemon_id"` // reference to the actual Pokémon
	HP        int    `json:"hp"`
}
