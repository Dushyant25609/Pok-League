package battle

import (
	"log"
	"time"

	"github.com/Dushyant25609/Pok-League/database"
	"github.com/Dushyant25609/Pok-League/models"
)

func ExecuteBattle(p1, p2 *models.Pokemon) (string, int) {
	// Set starting HP
	p1.CurrentHP = p1.BaseStats.HP
	p2.CurrentHP = p2.BaseStats.HP

	// Precompute best moves once
	bestMoveP1 := ChooseBestMove(database.DB, *p1, *p2)
	bestMoveP2 := ChooseBestMove(database.DB,*p2, *p1)

	for p1.CurrentHP > 0 && p2.CurrentHP > 0 {
		// Decide attacker for this turn
		first := CalculateFirstAttacker(p1.BaseStats.Speed, p2.BaseStats.Speed)

		var attacker, defender *models.Pokemon
		var move *models.Moves

		if first == 1 {
			attacker, defender = p1, p2
			move = bestMoveP1
		} else {
			attacker, defender = p2, p1
			move = bestMoveP2
		}

		// Sanity check
		if move == nil {
			log.Println("No effective move found!")
			break
		}

		// Recalculate dodging & performance
		if !CalculateDodge(*attacker, *defender, move) {
			damage := CalculateDamage(database.DB,*attacker, *defender, move)
			defender.CurrentHP -= damage
			if defender.CurrentHP < 0 {
				defender.CurrentHP = 0
			}
			log.Printf("%s used %s. Damage: %d. %s HP: %d\n", attacker.Name, move.Name, damage, defender.Name, defender.CurrentHP)
		} else {
			log.Printf("%s dodged the move %s from %s!\n", defender.Name, move.Name, attacker.Name)
		}

		// Add a delay if you want animation timing
		time.Sleep(1 * time.Second)
	}

	// Declare winner
	if p1.CurrentHP <= 0 {
		return p2.Name, p2.CurrentHP
	} else {
		return p1.Name, p1.CurrentHP
	}
}
