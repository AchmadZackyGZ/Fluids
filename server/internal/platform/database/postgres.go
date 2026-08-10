package database

import (
	"context"
	"errors"
	"fmt"
	"os"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/joho/godotenv"
)

// NewPostgresPool menyediakan koneksi Database Pool murni untuk seluruh modul dari variabel .env
func NewPostgresPool() (*pgxpool.Pool, error) {
	_ = godotenv.Load()

	dbHost := os.Getenv("DB_HOST")
	dbPort := os.Getenv("DB_PORT")
	dbUser := os.Getenv("DB_USER")
	dbPassword := os.Getenv("DB_PASSWORD")
	dbName := os.Getenv("DB_NAME")

	if dbHost == "" || dbPort == "" || dbUser == "" || dbPassword == "" || dbName == "" {
		return nil, errors.New("missing required database environment variables (DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME)")
	}

	dsn := fmt.Sprintf("postgres://%s:%s@%s:%s/%s?sslmode=disable", dbUser, dbPassword, dbHost, dbPort, dbName)
	return pgxpool.New(context.Background(), dsn)
}