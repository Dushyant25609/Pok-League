package main

import (
	"github.com/Dushyant25609/Pok-League/config.go"
	"github.com/Dushyant25609/Pok-League/database"
	"github.com/Dushyant25609/Pok-League/routes"
	"github.com/gin-gonic/gin"
)

func init() {
	config.LoadEnv()
	database.Connect()
	db := database.DB
	database.AutoMigrateAll(db)
}

func main() {
	r := gin.Default()
	r.GET("/", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "Welcome to PokeLeague Backend",
		})
	})
	routes.IndexRoutes(r)

	r.Run()
}
