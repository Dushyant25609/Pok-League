package models

import (
	"time"
	"gorm.io/datatypes"
	"gorm.io/gorm"
)

type User struct {
	gorm.Model

	Username         string         `gorm:"unique;not null" json:"username"`
	Email            string         `gorm:"unique;not null" json:"email"`
	PasswordHash     string         `gorm:"not null" json:"-"`
	DisplayName      string         `gorm:"size:100" json:"display_name,omitempty"`
	ExperiencePoints int            `gorm:"default:0" json:"experience_points"`
	IsActive         bool           `gorm:"default:true" json:"is_active"`
	LastLogin        *time.Time     `json:"last_login,omitempty"`

	Stats            UserStats          `gorm:"foreignKey:UserID" json:"stats"`
	Team             int            `gorm:"not null" json:"team"`
	BuddyID          uint           `gorm:"not null" json:"buddy_id"`
	BuddyLevel     	 int            `gorm:"default:1" json:"buddy_level"`
	Buddy            Pokemon        `gorm:"foreignKey:BuddyID" json:"buddy"`

	UsedPokemonsJSON datatypes.JSON `gorm:"type:json" json:"used_pokemons"`

	OwnedPokemons    []OwnedPokemon `json:"owned_pokemons"`
}
