package main

import (
	"net/http"
	"time"

	"github.com/Dushyant25609/Pok-League/config.go"
	"github.com/Dushyant25609/Pok-League/database"
	"github.com/Dushyant25609/Pok-League/routes"

	"github.com/gin-contrib/cors"
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
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"https://pokeleague.kroww.com"}, // Replace with your frontend origin
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))
	r.OPTIONS("/*path", func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", "https://pokeleague.kroww.com")
		c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Content-Type, Authorization")
		c.Status(http.StatusOK)
	})

	routes.IndexRoutes(r)
	r.Run()
}
