package models

type Type struct {
	ID   uint   `gorm:"primaryKey"`
	Name string `gorm:"unique;not null"`
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
	ID     uint   `gorm:"primaryKey"`
	Name   string `gorm:"unique;not null"`
	Rarity string

	Types []Type  `gorm:"many2many:pokemon_types;"`
	Moves []Moves `gorm:"many2many:pokemon_moves;"`

	Stats PokemonStats `gorm:"foreignKey:PokemonID"`
	BaseStats BaseStats `gorm:"foreignKey:PokemonID"`
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
