package main

import (
	"fmt"

	"github.com/Dushyant25609/Pok-League/config.go"
	"github.com/Dushyant25609/Pok-League/database"
	"github.com/gin-gonic/gin"
)

func main() {
	config.LoadEnv()
	DB := database.Connect()
	database.AutoMigrateAll(DB)
	r := gin.Default()
	r.GET("/", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "Welcome to PokeLeague Backend",
		})
	})
	fmt.Println("Main file")
	// LoadEnv()
	// Connect()
}