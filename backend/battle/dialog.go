package battle

import (
	"fmt"
	"math/rand"
	"time"

	"github.com/Dushyant25609/Pok-League/models"
)

// DialogMessage represents a single battle narration message
type DialogMessage struct {
	Text      string `json:"text"`
	Type      string `json:"type"` // "attack", "dodge", "critical", "winner", "loser", etc.
	Timestamp int64  `json:"timestamp"`
}

// BattleDialog manages the dialog channel for a battle
type BattleDialog struct {
	Messages chan DialogMessage
	Closed   bool
}

// NewBattleDialog creates a new battle dialog with a buffered channel
func NewBattleDialog() *BattleDialog {
	return &BattleDialog{
		Messages: make(chan DialogMessage, 100), // Buffered channel to prevent blocking
		Closed:   false,
	}
}

// Close closes the dialog channel
func (bd *BattleDialog) Close() {
	if !bd.Closed {
		close(bd.Messages)
		bd.Closed = true
	}
}

// SendAttackMessage sends an attack message to the channel
func (bd *BattleDialog) SendAttackMessage(attacker, moveName string) {
	if bd.Closed {
		return
	}
	phrase := AttackPhrases[rand.Intn(len(AttackPhrases))]
	text := fmt.Sprintf(phrase, attacker, moveName)
	bd.Messages <- DialogMessage{
		Text:      text,
		Type:      "attack",
		Timestamp: time.Now().UnixNano() / int64(time.Millisecond),
	}
}

// SendDodgeMessage sends a dodge message to the channel
func (bd *BattleDialog) SendDodgeMessage(defender, moveName string) {
	if bd.Closed {
		return
	}
	phrase := DodgePhrases[rand.Intn(len(DodgePhrases))]
	text := fmt.Sprintf(phrase, defender, moveName)
	bd.Messages <- DialogMessage{
		Text:      text,
		Type:      "dodge",
		Timestamp: time.Now().UnixNano() / int64(time.Millisecond),
	}
}

// SendCriticalHitMessage sends a critical hit message to the channel
func (bd *BattleDialog) SendCriticalHitMessage(attacker, moveName string) {
	if bd.Closed {
		return
	}
	phrase := CriticalHitPhrases[rand.Intn(len(CriticalHitPhrases))]
	text := fmt.Sprintf(phrase, attacker, moveName)
	bd.Messages <- DialogMessage{
		Text:      text,
		Type:      "critical",
		Timestamp: time.Now().UnixNano() / int64(time.Millisecond),
	}
}

// SendWinnerMessage sends a winner message to the channel
func (bd *BattleDialog) SendWinnerMessage(winner string) {
	if bd.Closed {
		return
	}
	phrase := WinnerPhrases[rand.Intn(len(WinnerPhrases))]
	text := fmt.Sprintf(phrase, winner)
	bd.Messages <- DialogMessage{
		Text:      text,
		Type:      "winner",
		Timestamp: time.Now().UnixNano() / int64(time.Millisecond),
	}
}

// SendLoserMessage sends a loser message to the channel
func (bd *BattleDialog) SendLoserMessage(loser string) {
	if bd.Closed {
		return
	}
	phrase := LoserPhrases[rand.Intn(len(LoserPhrases))]
	text := fmt.Sprintf(phrase, loser)
	bd.Messages <- DialogMessage{
		Text:      text,
		Type:      "loser",
		Timestamp: time.Now().UnixNano() / int64(time.Millisecond),
	}
}

// SendCustomMessage sends a custom message to the channel
func (bd *BattleDialog) SendCustomMessage(text, messageType string) {
	if bd.Closed {
		return
	}
	bd.Messages <- DialogMessage{
		Text:      text,
		Type:      messageType,
		Timestamp: time.Now().UnixNano() / int64(time.Millisecond),
	}
}

// NarrateBattleTurn narrates a battle turn with appropriate messages
func (bd *BattleDialog) NarrateBattleTurn(attacker, defender *models.Pokemon, moveUsed *models.Moves, dodged bool, damage int, critical bool) {
	// Add a small delay between messages for dramatic effect
	time.Sleep(500 * time.Millisecond)
	
	// Send attack message
	bd.SendAttackMessage(attacker.Name, moveUsed.Name)
	
	time.Sleep(1000 * time.Millisecond)
	
	if dodged {
		// Send dodge message if the attack was dodged
		bd.SendDodgeMessage(defender.Name, moveUsed.Name)
	} else {
		// Send critical hit message if applicable
		if critical {
			bd.SendCriticalHitMessage(attacker.Name, moveUsed.Name)
		}
		
		// Send custom damage message
		damageText := fmt.Sprintf("%s took %d damage!", defender.Name, damage)
		bd.SendCustomMessage(damageText, "damage")
	}
}

// NarrateBattleEnd narrates the end of a battle
func (bd *BattleDialog) NarrateBattleEnd(winner, loser string) {
	time.Sleep(1000 * time.Millisecond)
	bd.SendLoserMessage(loser)
	time.Sleep(1000 * time.Millisecond)
	bd.SendWinnerMessage(winner)
}

var AttackPhrases = []string{
    "%s used %s with fierce determination!",
    "%s launched %s straight at the opponent!",
    "%s blasted %s at full force!",
    "%s delivered a powerful %s!",
    "%s didn't hold back with %s!",
    "%s charged forward using %s!",
    "%s let loose a wild %s!",
    "%s executed %s perfectly!",
    "%s went all in with %s!",
    "%s struck hard with %s!",
}

var DodgePhrases = []string{
    "%s swiftly dodged the incoming %s!",
    "%s sidestepped and avoided %s!",
    "%s leapt away, avoiding the %s just in time!",
    "%s predicted the %s and evaded!",
    "%s vanished right before %s hit!",
    "%s was too quick for the %s!",
    "%s saw the %s coming and escaped!",
    "%s ducked under the %s effortlessly!",
    "%s twisted away and avoided %s!",
    "%s escaped the hit as %s missed completely!",
}

var CriticalHitPhrases = []string{
    "CRITICAL! %s's %s hit the weak spot!",
    "A crushing blow — %s's %s landed perfectly!",
    "%s's %s was right on target — critical hit!",
    "%s used %s and it shattered the defense!",
    "%s's %s was devastating — a perfect strike!",
    "%s unleashed a critical %s!",
    "Massive impact! %s's %s hit hard!",
    "That %s from %s was brutally effective!",
    "The %s by %s turned the tide!",
    "One shot, one critical — %s nailed it with %s!",
}

var WinnerPhrases = []string{
    "%s stands victorious!",
    "%s wins the battle with overwhelming power!",
    "%s is the last Pokémon standing!",
    "%s emerges as the true champion!",
    "%s roars in victory!",
    "%s takes the crown after a fierce fight!",
    "%s proves its dominance!",
    "%s has claimed the battlefield!",
    "%s outlasted its opponent!",
    "%s finishes strong and takes the win!",
}

var LoserPhrases = []string{
    "%s couldn't keep going and faints.",
    "%s is out of energy!",
    "%s took the final blow and falls.",
    "%s collapses — it's over.",
    "%s fought bravely but goes down.",
    "%s faints after a hard-fought battle.",
    "%s gives in to exhaustion.",
    "%s can't battle anymore!",
    "%s takes a deep hit and collapses.",
    "%s has been defeated!",
}
