package database
import (
	"fmt"
	"log"
	"os"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

func Connect() {
	dsn := os.Getenv("DB_URL")
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to the database")
	}
	err = AutoMigrateAll(db)
	if err != nil {
		log.Fatal("Migration failed:", err)
	}
	fmt.Println("Database connected successfully")
	DB = db
}