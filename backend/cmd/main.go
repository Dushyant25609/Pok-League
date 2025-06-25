package main

import (
	"github.com/Dushyant25609/Pok-League/config.go"
	"github.com/Dushyant25609/Pok-League/database"
	"github.com/Dushyant25609/Pok-League/routes"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/gin-contrib/cors"
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
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"https://pokeleague.kroww.com"}, // Replace with your frontend origin
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))
	routes.IndexRoutes(r)
	r.Run()
}
