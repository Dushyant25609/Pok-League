package models

import (
	"time"

	"github.com/lib/pq"
)

type BattleRoom struct {
	ID               string         `gorm:"primaryKey" json:"id"`
	HostID           string         `json:"host_id"`
	Code             string         `gorm:"uniqueIndex" json:"code"`
	Generations      pq.Int64Array  `gorm:"type:integer[]" json:"generations"`      // <-- note the type tag
	AllowLegendaries bool           `json:"allow_legendaries"`
	AllowMythical    bool           `json:"allow_mythical"`
	BannedTypes      pq.StringArray `gorm:"type:text[]" json:"banned_types"`        // <-- note the type tag
	Status           string         `json:"status"`
	CreatedAt        time.Time      `json:"created_at"`
	ExpiresAt        time.Time      `json:"expires_at"`
}
