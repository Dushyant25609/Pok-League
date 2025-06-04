package controllers

import (
	"log"
	"strconv"
	"sync"

	"github.com/Dushyant25609/Pok-League/battle"
	"github.com/Dushyant25609/Pok-League/database"
	"github.com/Dushyant25609/Pok-League/models"
	"github.com/Dushyant25609/Pok-League/utils"
	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

type pendingBattle struct {
	mu      sync.Mutex
	sub1    *submission
	sub2    *submission
	conn1   *websocket.Conn
	conn2   *websocket.Conn
	started bool
}

type submission struct {
	UserID    string
	PokemonID uint
	PokeData  models.Pokemon // loaded full record (Types, Moves, BaseStats)
}

// In-memory store for pending battles: roomCode → *pendingBattle
var battlesMu sync.Mutex
var battles = make(map[string]*pendingBattle)

// BattleSocket: each client connects to `/ws/battle/:roomCode` and sends { user_id, pokemon_id }.
// Once both have sent, we run the fight and push turn updates to both connections.
func BattleSocket(c *gin.Context) {
	roomCode := c.Param("roomCode")

	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		log.Println("BattleSocket: failed to upgrade:", err)
		return
	}

	// Read this player's submission
	var req struct {
		Token     string `json:"token"`
		PokemonID uint   `json:"pokemon_id"`
	}
	if Connerr := conn.ReadJSON(&req); Connerr != nil {
		log.Println("BattleSocket JSON parse error:", Connerr)
		conn.WriteJSON(gin.H{"error": "Invalid JSON format. Please check for syntax errors like trailing commas."})
		return
	}

	user, err := utils.GetUserFromToken(req.Token)
	if err != nil {
		conn.WriteJSON(gin.H{"error": "Invalid token"})
		return
	}
	ID := strconv.FormatUint(uint64(user.ID), 10)

	// Load full Pokémon data now
	var poke models.Pokemon
	if err := database.DB.Preload("Types").
		Preload("Moves.Type").
		Preload("BaseStats").
		First(&poke, req.PokemonID).Error; err != nil {
		conn.WriteJSON(gin.H{"error": "Pokémon not found"})
		return
	}

	// Register this submission in the in-memory map
	battlesMu.Lock()
	pb, exists := battles[roomCode]
	if !exists {
		pb = &pendingBattle{}
		battles[roomCode] = pb
	}
	battlesMu.Unlock()

	pb.mu.Lock()
	if pb.started {
		// This room already started or finished the fight—reject further connections
		pb.mu.Unlock()
		conn.WriteJSON(gin.H{"error": "Battle already in progress or completed"})
		return
	}

	// Determine if this is the first or second submission
	if pb.sub1 == nil {
		pb.sub1 = &submission{
			UserID:    ID,
			PokemonID: req.PokemonID,
			PokeData:  poke,
		}
		pb.conn1 = conn
	} else if pb.sub2 == nil {
		// If the same user tries to submit twice, reject
		if pb.sub1.UserID == ID {
			pb.mu.Unlock()
			conn.WriteJSON(gin.H{"error": "You already submitted your Pokémon"})
			return
		}
		pb.sub2 = &submission{
			UserID:    ID,
			PokemonID: req.PokemonID,
			PokeData:  poke,
		}
		pb.conn2 = conn
	} else {
		// Already have two submissions
		pb.mu.Unlock()
		conn.WriteJSON(gin.H{"error": "Both Pokémon already submitted"})
		return
	}
	pb.mu.Unlock()


	// Wait until we have both submissions, then run the battle
	go func() {
		pb.mu.Lock()
		defer pb.mu.Unlock()

		if pb.sub1 == nil || pb.sub2 == nil || pb.started {
			return // not ready or already started
		}
		pb.started = true

		if pb.sub1 != nil || pb.sub2!= nil {
			if pb.sub1 != nil {
				var selectedPokemon models.SelectedPokemon
				result := database.DB.Where("room_id = ? AND user_id = ? AND pokemon_id = ?", roomCode, pb.sub1.UserID, pb.sub1.PokemonID).First(&selectedPokemon)
				if result.Error != nil || result.RowsAffected == 0 {
					pb.mu.Unlock()
					pb.conn1.WriteJSON(gin.H{"error": "You must select a Pokémon from your submitted team"})
				}
			}
			if pb.sub2 != nil {
				var selectedPokemon models.SelectedPokemon
				result := database.DB.Where("room_id = ? AND user_id = ? AND pokemon_id = ?", roomCode, pb.sub2.UserID, pb.sub2.PokemonID).First(&selectedPokemon)
				if result.Error != nil || result.RowsAffected == 0 {
					pb.mu.Unlock()
					pb.conn2.WriteJSON(gin.H{"error": "You must select a Pokémon from your submitted team"})
				}
			}
			return
		}

		p1 := &pb.sub1.PokeData
		p2 := &pb.sub2.PokeData

		// Initialize HP
		p1.CurrentHP = p1.BaseStats.HP
		p2.CurrentHP = p2.BaseStats.HP

		bestMove1 := battle.ChooseBestMove(database.DB, *p1, *p2)
		bestMove2 := battle.ChooseBestMove(database.DB, *p2, *p1)

		// Turn-by-turn loop
		for p1.CurrentHP > 0 && p2.CurrentHP > 0 {
			attacker, defender, moveUsed := func() (a, d *models.Pokemon, m *models.Moves) {
				if battle.CalculateFirstAttacker(p1.BaseStats.Speed, p2.BaseStats.Speed) == 1 {
					return p1, p2, bestMove1
				}
				return p2, p1, bestMove2
			}()

			// Recompute dodge for this turn
			attack := "dodged"
			damage := 0
			if !battle.CalculateDodge(*attacker, *defender, moveUsed) {
				dmg := battle.CalculateDamage(database.DB, *attacker, *defender, moveUsed)
				attack = "damaged"
				damage = dmg
				defender.CurrentHP -= dmg
				if defender.CurrentHP < 0 {
					defender.CurrentHP = 0
				}
			}

			// Push a turn update to **both** clients
			update := gin.H{
				"event":    "turn_update",
				"attacker": attacker.Name,
				"defender": defender.Name,
				"move":     moveUsed.Name,
				"hp1":      p1.CurrentHP,
				"attack":   attack, // or "dodged"
				"damage":   damage,
				"hp2":      p2.CurrentHP,
			}
			pb.conn1.WriteJSON(update)
			pb.conn2.WriteJSON(update)

		}

		// Determine winner
		var winnerUser, winnerPokemon string
		if p1.CurrentHP > 0 {
			winnerUser = pb.sub1.UserID
			winnerPokemon = p1.Name
		} else {
			winnerUser = pb.sub2.UserID
			winnerPokemon = p2.Name
		}

		// Update stats in DB
		updatePostBattleStats(pb.sub1.UserID, p1.ID, p1.CurrentHP > 0)
		updatePostBattleStats(pb.sub2.UserID, p2.ID, p2.CurrentHP > 0)

		// Push final result
		result := gin.H{
			"event":          "battle_result",
			"winner_user":    winnerUser,
			"winner_pokemon": winnerPokemon,
			"hp1":            p1.CurrentHP,
			"hp2":            p2.CurrentHP,
		}
		pb.conn1.WriteJSON(result)
		pb.conn2.WriteJSON(result)

		// Clean up
		pb.conn1.Close()
		pb.conn2.Close()
		battlesMu.Lock()
		delete(battles, roomCode)
		battlesMu.Unlock()
	}()

	// Keep this connection open until the battle is done (or error)
}