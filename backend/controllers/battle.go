package controllers

import (
	"fmt"
	"log"
	"math"
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

type MatchStats struct {
	Winner string `json:"winner"`
	Loser string `json:"loser"`
}

// In‐memory map: roomCode → *pendingBattle
var battlesMu sync.Mutex
var battles = make(map[string]*pendingBattle)
var matchMaps = make(map[string]*MatchStats)

type request struct {
	Username  string `json:"username"`
	PokemonID uint   `json:"pokemon_id"`
	Event     string `json:"event"`
}

// BattleSocket: each client connects to /ws/battle/:roomCode and sends { username, pokemon_id }.
// Once both have sent, we run the fight and push turn updates to both connections.
func BattleSocket(c *gin.Context) {
	roomCode := c.Param("roomCode")

	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		log.Println("BattleSocket: failed to upgrade:", err)
		return
	}

	defer conn.Close()

	for {
		var req struct {
			Username  string `json:"username"`
			PokemonID uint   `json:"pokemon_id"`
			Event     string `json:"event"`
		}

		if jsonErr := conn.ReadJSON(&req); jsonErr != nil {
			log.Println("BattleSocket JSON error or closed:", jsonErr)
			break
		}

		handleBattleRequest(conn, roomCode, req)
	}
}

func handleBattleRequest(conn *websocket.Conn, roomCode string, req struct {
	Username  string `json:"username"`
	PokemonID uint   `json:"pokemon_id"`
	Event     string `json:"event"`
}) {
	// 1) Load Pokémon
	var poke models.Pokemon
	err := database.DB.Preload("Types").Preload("Moves.Type").Preload("BaseStats").First(&poke, req.PokemonID).Error
	if err != nil {
		conn.WriteJSON(gin.H{"error": "Pokémon not found"})
		return
	}

	battlesMu.Lock()
	pb, exists := battles[roomCode]
	if !exists {
		pb = &pendingBattle{}
		battles[roomCode] = pb
	}
	battlesMu.Unlock()

	pb.mu.Lock()
	if req.Event == "end_battle" && pb.conn1 != nil && pb.conn2 != nil {

		endMsg := gin.H{
			"event": "end_battle",
		}
		
		pb.conn1.WriteJSON(endMsg)
		pb.conn2.WriteJSON(endMsg)

		pb.conn1.Close()
		pb.conn2.Close()
		if pb.dialog != nil {
			pb.dialog.Close()
		}
		delete(matchMaps, roomCode)
		pb.mu.Unlock()
		return
	}
	pb.mu.Unlock()

	player, ok := matchMaps[roomCode]
	if !ok {
		player = &MatchStats{}
		matchMaps[roomCode] = player	
	}


	pb.mu.Lock()
	if player.Winner == "" && player.Loser == "" {
		if pb.sub1 == nil {
			pb.sub1 = &submission{
				Username:  req.Username,
				PokemonID: req.PokemonID,
				PokeData:  poke,
			}
			pb.conn1 = conn
		} else if pb.sub2 == nil {
			if pb.sub1.Username == req.Username {
				pb.mu.Unlock()
				conn.WriteJSON(gin.H{"error": "You already submitted your Pokémon"})
				return
			}
			pb.sub2 = &submission{
				Username:  req.Username,
				PokemonID: req.PokemonID,
				PokeData:  poke,
			}
			pb.conn2 = conn
		}
	} else {
		if req.Username == player.Loser {
			if player.Loser == pb.sub1.Username {
				pb.sub1 = &submission{
					Username:  req.Username,
					PokemonID: req.PokemonID,
					PokeData:  poke,
				}
				var selectedPokemon models.SelectedPokemon
				database.DB.Where("room_id =? AND username =? AND pokemon_id =?", roomCode, pb.sub1.Username, pb.sub1.PokemonID).First(&selectedPokemon)
				pb.sub1.PokeData.CurrentHP = selectedPokemon.HP
				msg := gin.H{
					"event": "pokemon_select",
					"winner": pb.sub2.Username,
					"loser": pb.sub1.Username,
					"pokemon": pb.sub1.PokemonID,
					"hp": math.Round(float64(pb.sub1.PokeData.CurrentHP)/(float64(pb.sub1.PokeData.BaseStats.HP*5))*100),
				}
				pb.conn2.WriteJSON(msg)
			} else if player.Loser == pb.sub2.Username {
				pb.sub2 = &submission{
					Username:  req.Username,
					PokemonID: req.PokemonID,
					PokeData:  poke,
				}
				var selectedPokemon models.SelectedPokemon
				database.DB.Where("room_id =? AND username =? AND pokemon_id =?", roomCode, pb.sub2.Username, pb.sub2.PokemonID).First(&selectedPokemon)
				pb.sub2.PokeData.CurrentHP = selectedPokemon.HP
				fmt.Println("selected Pokemon: ",selectedPokemon)
				fmt.Println("selected Pokemon Current HP: ",pb.sub2.PokeData.CurrentHP)
				msg := gin.H{
					"event": "pokemon_select",
					"winner": pb.sub1.Username,
					"loser": pb.sub2.Username,
					"pokemon": pb.sub2.PokemonID,
					"hp": math.Round(float64(pb.sub2.PokeData.CurrentHP)/(float64(pb.sub2.PokeData.BaseStats.HP*5))*100),
				}
				pb.conn1.WriteJSON(msg)
			}
		}else {
			if player.Winner == pb.sub1.Username {
				pb.sub1 = &submission{
					Username:  req.Username,
					PokemonID: req.PokemonID,
					PokeData:  poke,
				}
			} else if player.Winner == pb.sub2.Username {
				pb.sub2 = &submission{
					Username:  req.Username,
					PokemonID: req.PokemonID,
					PokeData:  poke,
				}
			}
		}
	}
	pb.mu.Unlock()
	fmt.Println("Request Battle ")

	go runBattle(pb, roomCode)
}

func runBattle(pb *pendingBattle, roomCode string) {
	fmt.Println("runBattle")
	pb.mu.Lock()
	if pb.sub1 == nil || pb.sub2 == nil || pb.sub1.PokeData.Name == "" || pb.sub2.PokeData.Name == "" {
		pb.mu.Unlock()
		return
	}
	sub1 := pb.sub1
	sub2 := pb.sub2
	conn1 := pb.conn1
	conn2 := pb.conn2
	pb.mu.Unlock()

	// Validate team membership
	validate := func(username string, pid uint, wsConn *websocket.Conn) bool {
		var selected models.SelectedPokemon
		result := database.DB.Where("room_id = ? AND username = ? AND pokemon_id = ? AND deleted_at IS NULL", roomCode, username, pid).First(&selected)
		if result.Error != nil || result.RowsAffected == 0 {
			wsConn.WriteJSON(gin.H{"error": "Pokémon not part of your team"})
			return false
		}
		return true
	}

	if !validate(sub1.Username, sub1.PokemonID, conn1) || !validate(sub2.Username, sub2.PokemonID, conn2) {
		return
	}

	

	// Setup battle
	p1 := &sub1.PokeData
	p2 := &sub2.PokeData

	startMsg := gin.H{
		"event": "battle_start",
		"p1":    p1.Name,
		"p2":    p2.Name,
		"p1_id": p1.ID,
		"p2_id": p2.ID,
	}
	conn1.WriteJSON(startMsg)
	conn2.WriteJSON(startMsg)

	var s1, s2 models.SelectedPokemon
	database.DB.Where("room_id =? AND username =? AND pokemon_id =?", roomCode, sub1.Username, sub1.PokemonID).First(&s1)
	database.DB.Where("room_id =? AND username =? AND pokemon_id =?", roomCode, sub2.Username, sub2.PokemonID).First(&s2)

	p1.CurrentHP = s1.HP
	p2.CurrentHP = s2.HP


	if p1.Name == p2.Name {
		p1.Name = sub1.Username + "'s " + p1.Name
		p2.Name = sub2.Username + "'s " + p2.Name
	}

	move1, eff1 := battle.ChooseBestMove(database.DB, *p1, *p2)
	move2, eff2 := battle.ChooseBestMove(database.DB, *p2, *p1)
	dialog := battle.NewBattleDialog()
	pb.dialog = dialog

	fmt.Println("HP1: ", p1.CurrentHP)
	fmt.Println("Base HP1: ", p1.BaseStats.HP * 5)
	fmt.Println("HP2: ", p2.CurrentHP)
	fmt.Println("Base HP2: ", p2.BaseStats.HP * 5)

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
	dialog.SendCustomMessage("Battle begins between "+p1.Name+" and "+p2.Name, "battle_start")
	time.Sleep(1 * time.Second)

	// Loop battle
	for p1.CurrentHP > 0 && p2.CurrentHP > 0 {
		attacker, defender, move, percent, eff := func() (*models.Pokemon, *models.Pokemon, *models.Moves, float64, float64) {
			n, p := battle.CalculateFirstAttacker(p1.BaseStats.Speed, p2.BaseStats.Speed)
			if n == 1 {
				return p1, p2, move1, p, eff1
			}
			return p2, p1, move2, p, eff2
		}()

		attack := "dodged"
		damage := 0
		dodge, dodgeChance, dodgepercent := battle.CalculateDodge(*attacker, *defender, move)
		critical := false
		if !dodge && rand.Float64() < 0.15 {
			critical = true
		}
		if !dodge {
			dmg := battle.CalculateDamage(database.DB, *attacker, *defender, move)
			damage = dmg/5
			attack = "damaged"
			defender.CurrentHP -= damage
			if defender.CurrentHP < 0 {
				defender.CurrentHP = 0
			}
		}
		dialog.NarrateBattleTurn(attacker, defender, move, dodge, damage, critical)
		update := gin.H{
			"event":         "turn_update",
			"attacker":      attacker.Name,
			"defender":      defender.Name,
			"move":          move.Name,
			"hp1":           p1.CurrentHP,
			"attack":        attack,
			"damage":        damage,
			"hp2":           p2.CurrentHP,
			"first":         percent,
			"effective":     eff,
			"dodgeChance":   dodgeChance,
			"dodgepercent":  dodgepercent,
			"dodge":         dodge,
			"critical":      critical,
		}
		safeWriteJSON(&pb.mu1, conn1, update)
		safeWriteJSON(&pb.mu2, conn2, update)
		time.Sleep(2 * time.Second)
	}

	// Final results
	var winnerUser, loserUser string
	var winnerPokemon, loserPokemon uint
	var winnerHP, loserHp, winnerBaseHp int
	if p1.CurrentHP > 0 {
		winnerUser = sub1.Username
		loserUser = sub2.Username
		loserPokemon = p2.ID
		winnerPokemon = p1.ID
		winnerBaseHp = p1.BaseStats.HP
		winnerHP = p1.CurrentHP
		loserHp = p2.CurrentHP
	} else {
		winnerUser = sub2.Username
		loserUser = sub1.Username
		winnerPokemon = p2.ID
		loserPokemon = p1.ID
		winnerBaseHp = p2.BaseStats.HP
		winnerHP = p2.CurrentHP
		loserHp = p1.CurrentHP
	}

	matchMaps[roomCode] = &MatchStats{
		Winner: winnerUser,
		Loser:  loserUser,
	}

	fmt.Println("HP1: ", p1.CurrentHP)
	fmt.Println("Base HP1: ", p1.BaseStats.HP * 5)
	fmt.Println("HP2: ", p2.CurrentHP)
	fmt.Println("Base HP2: ", p2.BaseStats.HP * 5)

	dialog.NarrateBattleEnd(winnerUser, loserUser)
	RemoveLoserPokemon(loserPokemon, loserUser, roomCode)
	updatePostBattleStats(p1.ID, p1.CurrentHP > 0)
	updatePostBattleStats(p2.ID, p2.CurrentHP > 0)
	UpdateHpLeft(winnerPokemon, winnerHP, winnerUser, roomCode)

	pb.sub1.PokeData.Name = ""
	pb.sub2.PokeData.Name = ""

	

	result := gin.H{
		"event":   "battle_result",
		"winner":  winnerUser,
		"winnerPokemon": winnerPokemon,
		"loserPokemon": loserPokemon,
		"hp":      math.Round((float64(winnerHP) / (float64(winnerBaseHp)*5)) * 100),
		"loserHp": loserHp,
	}
	safeWriteJSON(&pb.mu1, conn1, result)
	safeWriteJSON(&pb.mu2, conn2, result)
	time.Sleep(3 * time.Second)
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
	fmt.Println("Updated HP left for pokemon_id:", pokemon_id, "to", hp)
}