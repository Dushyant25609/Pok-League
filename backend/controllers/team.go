package controllers

import (
	"log"
	"net/http"

	"github.com/Dushyant25609/Pok-League/database"
	"github.com/Dushyant25609/Pok-League/models"
	"github.com/gin-gonic/gin"
)

func TeamSelectionSocket(c *gin.Context) {
	roomCode := c.Param("code")
	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		log.Println("Failed to upgrade:", err)
		return
	}
	RoomConnections[roomCode] = append(RoomConnections[roomCode], conn)

	var room models.BattleRoom
	if err := database.DB.First(&room, "code = ?", roomCode).Error; err != nil {
		log.Println("Room not found:", err)
		conn.WriteJSON(gin.H{"error": "Room not found"})
		return
	}

	conn.WriteJSON(gin.H{
		"event":    "start_team_selection",
		"duration": room.TeamSelectionTime,
		"deadline": room.TeamSelectionDeadline,
	})
}


func SubmitSelectedTeam(c *gin.Context) {
	// Extract the user ID from the user object
	var payload struct {
		Username   string `json:"username"`
		RoomCode   string `json:"room_code"`
		PokemonIDs []uint `json:"pokemon_ids"`
	}

	if err := c.ShouldBindJSON(&payload); err != nil {
		log.Println("SubmitSelectedTeam JSON parse error:", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid JSON format. Please check for syntax errors like trailing commas."})
		return
	}

	if len(payload.PokemonIDs) != 6 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Exactly 6 Pokémon must be selected"})
		return
	}

	
	seen := make(map[uint]bool)
	for _, id := range payload.PokemonIDs {
		if seen[id] {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Duplicate Pokémon are not allowed in the team"})
			return
		}
		seen[id] = true
	}

	var room models.BattleRoom
	if err := database.DB.First(&room, "code = ?", payload.RoomCode).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Room not found"})
		return
	}

	var pokemons []models.Pokemon
	database.DB.Preload("Types").Preload("BaseStats").Where("id IN ?", payload.PokemonIDs).Find(&pokemons)
	if len(pokemons) != 6 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid Pokémon submitted"})
		return
	}

	for _, p := range pokemons {
		if len(room.Generations) > 0 {
			match := false
			for _, g := range room.Generations {
				if uint(p.Generation) == uint(g) {
					match = true
					break
				}
			}
			if !match {
				c.JSON(http.StatusBadRequest, gin.H{"error": "One or more Pokémon are from disallowed generations"})
				return
			}
		}
		if !room.AllowLegendaries && p.Rarity == "Legendary" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Legendaries are not allowed in this room"})
			return
		}
		if !room.AllowMythical && p.Rarity == "Mythical" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Mythical Pokémon are not allowed in this room"})
			return
		}
		if len(room.BannedTypes) > 0 {
			for _, bannedType := range room.BannedTypes {
				for _, pType := range p.Types {
					if bannedType == int64(pType.ID) {
						c.JSON(http.StatusBadRequest, gin.H{"error": "One or more Pokémon have banned types"})
						return
					}
				}
			}
		}
	}

	// Save or overwrite selected team
	database.DB.Where("room_id = ? AND username = ?", payload.RoomCode, payload.Username).Delete(&models.SelectedPokemon{})
	for _, p := range pokemons {
		database.DB.Create(&models.SelectedPokemon{
			Username:  payload.Username,
			RoomID:    payload.RoomCode,
			PokemonID: p.ID,
			HP:        p.BaseStats.HP*5,
		})
	}

	// ✅ Check if both players submitted

	c.JSON(http.StatusOK, gin.H{"message": "Team submitted successfully"})
}
func RemoveLoserPokemon(pokemonID uint, username string, roomCode string) {
	result := database.DB.Where("pokemon_id = ? AND username = ? AND room_id = ?", pokemonID, username, roomCode).
		Delete(&models.SelectedPokemon{})

	if result.Error != nil {
		log.Printf("Error removing loser Pokémon: %v\n", result.Error)
		return
	}

	if result.RowsAffected == 0 {
		log.Printf("No Pokémon removed for username=%s, pokemon_id=%d, room_code=%s\n", username, pokemonID, roomCode)
	}
}
