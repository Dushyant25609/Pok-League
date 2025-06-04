package models

import (
	"time"

	"github.com/lib/pq"
)

type BattleRoom struct {
	ID               string         `gorm:"primaryKey" json:"id"`
	HostID           string         `json:"host_id"`
	GuestID 		*string 		`json:"guest_id"`
	Code             string         `gorm:"uniqueIndex" json:"code"`
	Generations      pq.Int64Array  `gorm:"type:integer[]" json:"generations"` 
	AllowLegendaries bool           `json:"allow_legendaries"`
	AllowMythical    bool           `json:"allow_mythical"`
	BannedTypes      pq.StringArray `gorm:"type:text[]" json:"banned_types"`
	Status           string         `json:"status"`
	CreatedAt        time.Time      `json:"created_at"`
	ExpiresAt        time.Time      `json:"expires_at"`
	TeamSelectionTime     int       `json:"team_selection_time"` 
	TeamSelectionDeadline time.Time `json:"team_selection_deadline"`
	TimerExtended         bool      `json:"timer_extended"`
	
	// Define these as GORM fields that should be ignored during database operations
	// but still included in JSON responses
	HostTeam   		[]Pokemon		`gorm:"-" json:"host_team"`
    GuestTeam  		[]Pokemon		`gorm:"-" json:"guest_team"`
}

type TeamSelection struct {
	ID         string   `gorm:"primaryKey"`
	BattleRoomID string `json:"battle_room_id"`
	UserID     string   `json:"user_id"`
	PokemonIDs []int    `gorm:"type:integer[]"`
}
