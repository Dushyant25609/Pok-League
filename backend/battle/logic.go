package battle

import (
	"math"
	"math/rand"

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

func CalculateFirstAttacker(p1Speed, p2Speed int) (int, float64) {
	totalSpeed := float64(p1Speed + p2Speed)
	if totalSpeed == 0 {
		n := rand.Intn(2) + 1
		return n, float64(n)
	}
	p1Chance := (float64(p1Speed) / totalSpeed) * 100
	r := rand.Float64() * 100
	if r < p1Chance {
		return 1, r
	}
	return 2, r
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

func ChooseBestMove(db *gorm.DB, attacker models.Pokemon, defender models.Pokemon) (*models.Moves, float64) {
	bestScore := -1.0
	effect := 1.0
	var bestMove *models.Moves

	for _, move := range attacker.Moves {
		effectiveness := CalculateTypeEffectiveness(db, move.TypeID, defender.Types)
		score := effectiveness * float64(move.Power)
		if score > bestScore {
			bestScore = score
			bestMove = &move
			effect = effectiveness
		}
	}
	return bestMove, effect
}

func CalculateDamage(db *gorm.DB, attacker models.Pokemon, defender models.Pokemon, move *models.Moves) int {
	// Calculate HP percentage based on current HP, not base HP
	hpPercent := float64(attacker.CurrentHP) / float64(attacker.BaseStats.HP) * 100
	perf := CalculatePerformanceMultiplier(hpPercent)
	effectiveness := CalculateTypeEffectiveness(db, move.TypeID, defender.Types)
	damage := int(effectiveness * float64(move.Power) * perf)
	return damage
}

func CalculateDodge(attacker models.Pokemon, defender models.Pokemon, move *models.Moves) (bool, float64, float64) {
	speedDiff := defender.BaseStats.Speed - attacker.BaseStats.Speed
	base := 20.0
	var mod float64

	if speedDiff > 0 {
		mod = (float64(speedDiff) / float64(move.Accuracy+speedDiff)) * 100
	} else {
		mod = -(math.Abs(float64(speedDiff)) / float64(move.Accuracy+int(math.Abs(float64(speedDiff))))) * 100
	}

	dodgeChance := base + mod
	// Calculate HP percentage based on current HP, not base HP
	hpPercent := float64(defender.CurrentHP) / float64(defender.BaseStats.HP) * 100
	dodgeChance *= CalculatePerformanceMultiplier(hpPercent)

	if dodgeChance < 0 {
		return false, dodgeChance, 0
	}
	n := rand.Float64() * 100
	return n < dodgeChance, dodgeChance, n
}
