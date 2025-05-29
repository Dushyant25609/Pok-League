package controllers

import (
	"net/http"
	"strconv"

	"github.com/Dushyant25609/Pok-League/database"
	"github.com/Dushyant25609/Pok-League/models"
	"github.com/gin-gonic/gin"
)

type PokemonResponse struct {
    ID        uint            `json:"pokemon_id"`
    Name      string          `json:"name"`
    Types     []string        `json:"types"`
    BaseStats models.BaseStats `json:"baseStats"`
}


func GetPaginatedPokemon(c *gin.Context) {
	// Query params with defaults
	pageStr := c.DefaultQuery("page", "1")
	limitStr := c.DefaultQuery("limit", "10")

	page, err := strconv.Atoi(pageStr)
	if err != nil || page < 1 {
		page = 1
	}

	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit < 1 {
		limit = 10
	}

	offset := (page - 1) * limit

	var pokemons []models.Pokemon
	var total int64

	// Count total Pokémon
	database.DB.Model(&models.Pokemon{}).Count(&total)

	// Fetch paginated Pokémon
	result := database.DB.
		Preload("Types").
		Preload("BaseStats").
		Preload("Stats").
		Preload("Moves").
		Preload("Moves.Type"). 
		Order("id ASC").// This is the fix for move Type being empty
		Limit(limit).
		Offset(offset).
		Find(&pokemons)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error fetching Pokémon"})
		return
	}
	var response []PokemonResponse
    for _, p := range pokemons {
        types := make([]string, len(p.Types))
        for i, t := range p.Types {
            types[i] = t.Name
        }

        response = append(response, PokemonResponse{
            ID:        p.ID,
            Name:      p.Name,
            Types:     types,
            BaseStats: p.BaseStats,
        })
    }

	c.JSON(http.StatusOK, gin.H{
		"data":       response,
		"total":      total,
		"page":       page,
		"limit":      limit,
		"totalPages": (total + int64(limit) - 1) / int64(limit),
	})
}
