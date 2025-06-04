package battle

import (
	"math"
	"math/rand"
	"time"

	"github.com/Dushyant25609/Pok-League/models"
	"gorm.io/gorm"
)

func CalculatePerformanceMultiplier(hpPercent float64) float64 {
	switch {
	case hpPercent < 30 && rand.Float64() < 0.0001:
		return 1.5 // miracle
	case hpPercent < 50:
		return 0.5
	case hpPercent < 75:
		return 0.75
	default:
		return 1.0
	}
}

func CalculateFirstAttacker(p1Speed, p2Speed int) int {
	totalSpeed := float64(p1Speed + p2Speed)
	if totalSpeed == 0 {
		return rand.Intn(2) + 1
	}
	p1Chance := (float64(p1Speed) / totalSpeed) * 100
	r := rand.Float64() * 100
	if r < p1Chance {
		return 1
	}
	return 2
}

func CalculateTypeEffectiveness(db *gorm.DB, moveTypeID uint, defenderTypes []models.Type) float64 {
	effectiveness := 1.0

	for _, defType := range defenderTypes {
		var eff models.TypeEffectiveness
		db.Where("attacking_type_id = ? AND defending_type_id = ?", moveTypeID, defType.ID).First(&eff)
		if eff.ID != 0 {
			effectiveness *= eff.Multiplier
		}
	}
	return effectiveness
}

func ChooseBestMove(db *gorm.DB, attacker models.Pokemon, defender models.Pokemon) *models.Moves {
	bestScore := -1.0
	var bestMove *models.Moves

	for _, move := range attacker.Moves {
		effectiveness := CalculateTypeEffectiveness(db, move.TypeID, defender.Types)
		score := effectiveness * float64(move.Power)
		if score > bestScore {
			bestScore = score
			bestMove = &move
		}
	}
	return bestMove
}

func CalculateDamage(db *gorm.DB, attacker models.Pokemon, defender models.Pokemon, move *models.Moves) int {
	hpPercent := float64(attacker.BaseStats.HP) / float64(attacker.BaseStats.HP) * 100 // Full HP assumed
	perf := CalculatePerformanceMultiplier(hpPercent)
	effectiveness := CalculateTypeEffectiveness(db, move.TypeID, defender.Types)
	damage := int(effectiveness * float64(move.Power) * perf)
	return damage
}

func CalculateDodge(attacker models.Pokemon, defender models.Pokemon, move *models.Moves) bool {
	speedDiff := defender.BaseStats.Speed - attacker.BaseStats.Speed
	base := 10.0
	var mod float64

	if speedDiff > 0 {
		mod = (float64(speedDiff) / float64(move.Accuracy+speedDiff)) * 100
	} else {
		mod = -(math.Abs(float64(speedDiff)) / float64(move.Accuracy+int(math.Abs(float64(speedDiff))))) * 100
	}

	dodgeChance := base + mod
	hpPercent := float64(defender.BaseStats.HP) / float64(defender.BaseStats.HP) * 100 // Full HP assumed
	dodgeChance *= CalculatePerformanceMultiplier(hpPercent)

	if dodgeChance < 0 {
		return false
	}
	return rand.Float64()*100 < dodgeChance
}

func ExecuteBattleTurn(db *gorm.DB, p1, p2 *models.Pokemon) {
	rand.Seed(time.Now().UnixNano())
	first := CalculateFirstAttacker(p1.BaseStats.Speed, p2.BaseStats.Speed)
	var attacker, defender *models.Pokemon
	if first == 1 {
		attacker = p1
		defender = p2
	} else {
		attacker = p2
		defender = p1
	}

	move := ChooseBestMove(db, *attacker, *defender)
	if move == nil {
		return
	}

	if !CalculateDodge(*attacker, *defender, move) {
		damage := CalculateDamage(db, *attacker, *defender, move)
		defender.BaseStats.HP -= damage
	}
}


func DecideTurnOrder(p1, p2 *models.Pokemon) (*models.Pokemon, *models.Pokemon) {
	first := CalculateFirstAttacker(p1.BaseStats.Speed, p2.BaseStats.Speed)
	if first == 1 {
		return p1, p2
	}
	return p2, p1
}