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

	// ✅ CORS Middleware — LET THIS HANDLE OPTIONS
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"https://pokeleague.kroww.com"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	// ✅ Example health check
	r.GET("/", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"message": "Welcome to PokeLeague Backend"})
	})

	// ✅ Your actual API routes
	routes.IndexRoutes(r)

	// Start server
	r.Run()
}
