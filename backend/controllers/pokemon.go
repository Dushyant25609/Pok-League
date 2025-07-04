package controllers

import (
	"math"
	"net/http"
	"strconv"

	"github.com/Dushyant25609/Pok-League/database"
	"github.com/Dushyant25609/Pok-League/models"
	"github.com/gin-gonic/gin"
	"github.com/lib/pq"
)

type PokemonResponse struct {
    ID        uint            
    Name      string          
    Types     []string        
    BaseStats models.BaseStats 
}

type PokemonStatsResponse struct{
	ID        uint            
    Name      string          
    Types     []string        
    Stats models.PokemonStats
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

// GET /api/pokemon/gen/:generation?page=1&limit=10

func GetPokemonsByGeneration(c *gin.Context) {
    generationStr := c.Param("generation")
    pageStr := c.DefaultQuery("page", "1")
    limitStr := c.DefaultQuery("limit", "10")
    generation, err := strconv.Atoi(generationStr)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid generation"})
        return
    }

    page, _ := strconv.Atoi(pageStr)
    limit, _ := strconv.Atoi(limitStr)

    if page < 1 {
        page = 1
    }
    if limit < 1 {
        limit = 10
    }

    offset := (page - 1) * limit

    var pokemons []models.Pokemon

    result := database.DB.Preload("Types").
        Preload("BaseStats").
        Where("generation = ?", generation).
        Order("id ASC").
        Limit(limit).
        Offset(offset).
        Find(&pokemons)

    if result.Error != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
        return
    }

    var total int64
    database.DB.Model(&models.Pokemon{}).Where("generation = ?", generation).Count(&total)
	
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
        "limit":      limit,
        "page":       page,
        "total":      total,
        "totalPages": int(math.Ceil(float64(total) / float64(limit))),
    })
}


func GetAvailablePokemon(c *gin.Context) {
	roomCode := c.Param("code")
	pageStr := c.DefaultQuery("page", "1")
	limitStr := c.DefaultQuery("limit", "10")

	page, _ := strconv.Atoi(pageStr)
	limit, _ := strconv.Atoi(limitStr)
	offset := (page - 1) * limit

	var room models.BattleRoom
	if err := database.DB.First(&room, "code = ?", roomCode).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Room not found"})
		return
	}

	baseQuery := database.DB.Model(&models.Pokemon{}).
		Joins("LEFT JOIN pokemon_types ON pokemons.id = pokemon_types.pokemon_id").
		Joins("LEFT JOIN types ON types.id = pokemon_types.type_id")

	if len(room.Generations) > 0 {
		baseQuery = baseQuery.Where("pokemons.generation = ANY(?)", pq.Array(room.Generations))
	}

	if !room.AllowLegendaries {
		baseQuery = baseQuery.Where("pokemons.rarity != ?", "legendary")
	}

	if !room.AllowMythical {
		baseQuery = baseQuery.Where("pokemons.rarity != ?", "mythical")
	}

	if len(room.BannedTypes) > 0 {
		baseQuery = baseQuery.Where(`
			NOT EXISTS (
				SELECT 1
				FROM pokemon_types pt2
				JOIN types t2 ON pt2.type_id = t2.id
				WHERE pt2.pokemon_id = pokemons.id AND t2.id = ANY(?)
			)
		`, pq.Array(room.BannedTypes))
	}

	// Subquery to get Pokémon IDs only
	var ids []uint
	if err := baseQuery.
		Distinct("pokemons.id").
		Pluck("pokemons.id", &ids).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch Pokémon IDs"})
		return
	}

	total := int64(len(ids))

	var pokemons []models.Pokemon
	if len(ids) > 0 {
		if err := database.DB.Preload("Types").
			Preload("BaseStats").
			Where("id IN ?", ids).
			Order("id ASC").
			Offset(offset).
			Limit(limit).
			Find(&pokemons).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch Pokémon data"})
			return
		}
	}

	var response []PokemonResponse
	for _, p := range pokemons {
		types := make([]string, 0)
		for _, t := range p.Types {
			types = append(types, t.Name)
		}
		response = append(response, PokemonResponse{
			ID:        p.ID,
			Name:      p.Name,
			Types:     types,
			BaseStats: p.BaseStats,
		})
	}

	c.JSON(http.StatusOK, gin.H{
		"page":       page,
		"limit":      limit,
		"total":      total,
		"data":       response,
		"totalPages": int(math.Ceil(float64(total) / float64(limit))),
	})
}


func GetPokemonStats(c *gin.Context) {
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
	database.DB.Model(&models.PokemonStats{}).Count(&total)

	if err := database.DB.
		Model(&models.Pokemon{}).
		Select(`
			pokemons.*,
			ps.battles_won,
			ps.battles_lost,
			ps.total_battles,
			(CASE WHEN ps.total_battles = 0 THEN 0 ELSE ps.battles_won::float / ps.total_battles END) AS win_rate
		`).
		Joins("INNER JOIN pokemon_stats ps ON ps.pokemon_id = pokemons.id").
		Preload("Types").
		Preload("Stats").
		Order("win_rate DESC, ps.battles_won DESC, ps.battles_lost ASC").
		Limit(limit).
		Offset(offset).
		Find(&pokemons).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}


	var response []PokemonStatsResponse
	for _, p := range pokemons {
		types := make([]string, len(p.Types))
		for i, t := range p.Types {
			types[i] = t.Name
		}
		response = append(response, PokemonStatsResponse{
			ID:    p.ID,
			Name:  p.Name,
			Types: types,
			Stats: p.Stats,
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




func GetPokemonByID(c *gin.Context) {
	id := c.Param("id")
	ID, err := strconv.Atoi(id)
	if err != nil {
		c.JSON(http.StatusNoContent, gin.H{"error": "Id not found"})
	}

	var stats models.Pokemon
	if err := database.DB.
		Preload("Types").
		Preload("BaseStats").
		Preload("Stats").
		Preload("Moves").
		Preload("Moves.Type").
		First(&stats, ID).Error; err!= nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Pokemon not found"})
		return
	}
	c.JSON(http.StatusOK, stats)
}