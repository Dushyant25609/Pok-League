package controllers

import (
	"fmt"
	"log"
	"math/rand"
	"sync"
	"time"

	"github.com/Dushyant25609/Pok-League/battle"
	"github.com/Dushyant25609/Pok-League/database"
	"github.com/Dushyant25609/Pok-League/models"
	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

func safeWriteJSON(mu *sync.Mutex, conn *websocket.Conn, data interface{}) {
	mu.Lock()
	defer mu.Unlock()
	conn.WriteJSON(data)
}



type pendingBattle struct {
	mu      sync.Mutex
	sub1    *submission
	sub2    *submission
	conn1   *websocket.Conn
	conn2   *websocket.Conn
	mu1     sync.Mutex  // mutex for conn1
	mu2     sync.Mutex  // mutex for conn2
	started bool
	dialog  *battle.BattleDialog
}


type submission struct {
	Username  string `json:"username"`
	PokemonID uint   `json:"pokemon_id"`
	PokeData  models.Pokemon // loaded full record (Types, Moves, BaseStats)
}

// In‐memory map: roomCode → *pendingBattle
var battlesMu sync.Mutex
var battles = make(map[string]*pendingBattle)

// BattleSocket: each client connects to /ws/battle/:roomCode and sends { username, pokemon_id }.
// Once both have sent, we run the fight and push turn updates to both connections.
func BattleSocket(c *gin.Context) {
	roomCode := c.Param("roomCode")

	// 1) Upgrade to WebSocket
	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		log.Println("BattleSocket: failed to upgrade:", err)
		return
	}
	// ✂ No defer conn.Close() here—closing will happen inside the battle goroutine.

	// 2) Read initial JSON payload
	var req struct {
		Username  string `json:"username"`
		PokemonID uint   `json:"pokemon_id"`
	}
	if jsonErr := conn.ReadJSON(&req); jsonErr != nil {
		log.Println("BattleSocket JSON parse error:", jsonErr)
		conn.WriteJSON(gin.H{
			"error": "Invalid JSON format. Please check for syntax errors like trailing commas.",
		})
		conn.Close()
		return
	}

	// 3) Load full Pokémon record (Types, Moves, BaseStats)
	var poke models.Pokemon
	if err := database.DB.
		Preload("Types").
		Preload("Moves.Type").
		Preload("BaseStats").
		First(&poke, req.PokemonID).Error; err != nil {
		conn.WriteJSON(gin.H{"error": "Pokémon not found"})
		conn.Close()
		return
	}

	// 4) Insert into battles[roomCode]
	battlesMu.Lock()
	pb, exists := battles[roomCode]
	if !exists {
		pb = &pendingBattle{}
		battles[roomCode] = pb
	}
	battlesMu.Unlock()

	pb.mu.Lock()
	if pb.started {
		// If already started, reject
		pb.mu.Unlock()
		conn.WriteJSON(gin.H{"error": "Battle already in progress or completed"})
		conn.Close()
		return
	}

	if pb.sub1 == nil {
		pb.sub1 = &submission{
			Username:  req.Username,
			PokemonID: req.PokemonID,
			PokeData:  poke,
		}
		pb.conn1 = conn
	} else if pb.sub2 == nil {
		// Prevent the same user from submitting twice
		if pb.sub1.Username == req.Username {
			pb.mu.Unlock()
			conn.WriteJSON(gin.H{"error": "You already submitted your Pokémon"})
			conn.Close()
			return
		}
		pb.sub2 = &submission{
			Username:  req.Username,
			PokemonID: req.PokemonID,
			PokeData:  poke,
		}
		pb.conn2 = conn
	} else {
		// Two submissions already exist → reject
		pb.mu.Unlock()
		conn.WriteJSON(gin.H{"error": "Both Pokémon already submitted"})
		conn.Close()
		return
	}
	pb.mu.Unlock()

	// 5) Launch(—or re‐launch) the battle logic in a goroutine
	go func() {
		defer func() {
			if r := recover(); r != nil {
				log.Println("Recovered from panic in battle goroutine:", r)
			}
		}()

		// A) Under lock, check if both players are present and not yet started.
		pb.mu.Lock()
		if pb.sub1 == nil || pb.sub2 == nil || pb.started {
			pb.mu.Unlock()
			return
		}
		pb.started = true

		sub1 := pb.sub1
		sub2 := pb.sub2
		conn1 := pb.conn1
		conn2 := pb.conn2
		pb.mu.Unlock()

		// B) Validate each user's Pokémon is actually in their submitted team.
		validate := func(username string, pid uint, wsConn *websocket.Conn) bool {
			var selected models.SelectedPokemon
			// ● Use "username = ?" because your table now stores username (not user_id).
			result := database.DB.
				Where("room_id = ? AND username = ? AND pokemon_id = ? AND deleted_at IS NULL", roomCode, username, pid).
				First(&selected)

			if result.Error != nil || result.RowsAffected == 0 {
				wsConn.WriteJSON(gin.H{"error": "You must select a Pokémon from your submitted team"})
				return false
			}
			return true
		}
		if !validate(sub1.Username, sub1.PokemonID, conn1) ||
			!validate(sub2.Username, sub2.PokemonID, conn2) {
			// Validation failed for one (or both) players, so abort.
			conn1.Close()
			conn2.Close()
			battlesMu.Lock()
			delete(battles, roomCode)
			return
		}

		// C) Initialize HP & decide best moves
		p1 := &sub1.PokeData
		p2 := &sub2.PokeData
		var selectedPoke1, selectedPoke2 models.SelectedPokemon
		database.DB.Where("room_id =? AND username =? AND pokemon_id =?", roomCode, sub1.Username, sub1.PokemonID).First(&selectedPoke1)
		database.DB.Where("room_id =? AND username =? AND pokemon_id =?", roomCode, sub2.Username, sub2.PokemonID).First(&selectedPoke2)

		p1.CurrentHP = selectedPoke1.HP
		if p1.CurrentHP == 0 {
			p1.CurrentHP = p1.BaseStats.HP * 10
		}
		p2.CurrentHP = selectedPoke2.HP
		if p2.CurrentHP == 0 {
			p2.CurrentHP = p2.BaseStats.HP * 10
		}

		if(p1.Name == p2.Name) {
			p1.Name = sub1.Username + "`s " + p1.Name
			p2.Name = sub2.Username + "`s " + p2.Name
		}

		bestMove1, effect1 := battle.ChooseBestMove(database.DB, *p1, *p2)
		bestMove2, effect2 := battle.ChooseBestMove(database.DB, *p2, *p1)

		// Create a dialog channel for the battle
		dialog := battle.NewBattleDialog()
		pb.dialog = dialog

		// Start a goroutine to forward dialog messages to both players
		go func() {
			for msg := range dialog.Messages {
				dialogUpdate := gin.H{
					"event":     "dialog_update",
					"text":      msg.Text,
					"type":      msg.Type,
					"timestamp": msg.Timestamp,
				}
				safeWriteJSON(&pb.mu1, conn1, dialogUpdate)
				safeWriteJSON(&pb.mu2, conn2, dialogUpdate)
			}
		}()
		// Send battle start message
		dialog.SendCustomMessage(fmt.Sprintf("Battle between %s and %s is about to begin!", p1.Name, p2.Name), "battle_start")
		time.Sleep(1 * time.Second)

		// D) Turn‐by‐turn battle loop
		for p1.CurrentHP > 0 && p2.CurrentHP > 0 {
			attacker, defender, moveUsed, percent, effect := func() (*models.Pokemon, *models.Pokemon, *models.Moves, float64, float64) {
				n, percent := battle.CalculateFirstAttacker(p1.BaseStats.Speed, p2.BaseStats.Speed)
				if  n == 1 {
					return p1, p2, bestMove1, percent, effect1
				}
				return p2, p1, bestMove2, percent, effect2
			}()

			attack := "dodged"
			damage := 0
			dodge, dodgeChance, dodgepercent := battle.CalculateDodge(*attacker, *defender, moveUsed)
			
			// Determine if this is a critical hit (for narration purposes)
			critical := false
			if !dodge && rand.Float64() < 0.15 { // 15% chance of critical hit
				critical = true
			}

			if !dodge {
				dmg := battle.CalculateDamage(database.DB, *attacker, *defender, moveUsed)
				damage = (dmg/5)
				attack = "damaged"
				defender.CurrentHP -= damage
				if defender.CurrentHP < 0 {
					defender.CurrentHP = 0
				}
			}

			// Narrate the battle turn
			dialog.NarrateBattleTurn(attacker, defender, moveUsed, dodge, damage, critical)

			update := gin.H{
				"event":    "turn_update",
				"attacker": attacker.Name,
				"defender": defender.Name,
				"move":     moveUsed.Name,
				"hp1":      p1.CurrentHP,
				"attack":   attack,
				"damage":   damage,
				"hp2":      p2.CurrentHP,
				"first":    percent,
				"effective": effect,
				"dodgeChance": dodgeChance,
				"dodgepercent": dodgepercent,
				"dodge": dodge,
				"critical": critical,
			}
			safeWriteJSON(&pb.mu1, conn1, update)
			safeWriteJSON(&pb.mu2, conn2, update)
			
			// Add a short delay between turns for dramatic effect
			time.Sleep(2 * time.Second)
		}

		// E) Declare winner
		
		var winnerUser, winnerPokemonName, loserUser, loserPokemonName string
		var loserPokemon, winnerPokemon uint
		var winnerHP int
		if p1.CurrentHP > 0 {
			winnerUser = sub1.Username
			winnerPokemonName = p1.Name
			winnerPokemon = p1.ID
			winnerHP = p1.CurrentHP
			loserPokemon = p2.ID
			loserUser = sub2.Username
			loserPokemonName = p2.Name
		} else {
			winnerUser = sub2.Username
			winnerPokemonName = p2.Name
			winnerPokemon = p2.ID
			winnerHP = p2.CurrentHP
			loserPokemon = p1.ID
			loserUser = sub1.Username
			loserPokemonName = p1.Name
		}
		
		// Narrate the battle end
		dialog.NarrateBattleEnd(winnerPokemonName, loserPokemonName)
		
		RemoveLoserPokemon(loserPokemon, loserUser, roomCode)
		updatePostBattleStats(p1.ID, p1.CurrentHP > 0)
		updatePostBattleStats(p2.ID, p2.CurrentHP > 0)
		UpdateHpLeft(winnerPokemon, winnerHP, winnerUser, roomCode)
		

		result := gin.H{
			"event":          "battle_result",
			"winner_user":    winnerUser,
			"winner_pokemon": winnerPokemonName,
			"hp1":            p1.CurrentHP,
			"hp2":            p2.CurrentHP,
		}
		safeWriteJSON(&pb.mu1, conn1, result)
		safeWriteJSON(&pb.mu2, conn2, result)
		
		// Wait a moment for final dialog messages to be sent
		time.Sleep(3 * time.Second)

		// F) Clean up: close dialog channel, both WebSockets, and delete room entry
		if pb.dialog != nil {
			pb.dialog.Close()
		}
		conn1.Close()
		conn2.Close()

		battlesMu.Lock()
		delete(battles, roomCode)
		battlesMu.Unlock()
	}()

	// 6) Return immediately.  The goroutine keeps each socket open until battle concludes.
	return
}

func UpdateHpLeft(pokemon_id uint, hp int, username string, roomCode string) {
	var selected models.SelectedPokemon
	result := database.DB.
		Where("room_id =? AND username =? AND pokemon_id =? AND deleted_at IS NULL", roomCode, username, pokemon_id).
		First(&selected)
	if result.Error!= nil || result.RowsAffected == 0 {
		return
	}
	selected.HP = hp
	database.DB.Save(&selected)
}