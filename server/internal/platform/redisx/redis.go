package redisx

import (
	"context"
	"fmt"
	"os"

	"github.com/redis/go-redis/v9"
)

// NewRedisClient menginisialisasi koneksi pool ke Redis dari .env
func NewRedisClient() (*redis.Client, error) {
	host := os.Getenv("REDIS_HOST")
	if host == "" {
		host = "localhost"
	}
	port := os.Getenv("REDIS_PORT")
	if port == "" {
		port = "6379"
	}

	rdb := redis.NewClient(&redis.Options{
		Addr: fmt.Sprintf("%s:%s", host, port),
	})

	// Uji ping koneksi
	if err := rdb.Ping(context.Background()).Err(); err != nil {
		// Jika Redis offline, log warning dan tetap kembalikan instance
		return rdb, nil
	}

	return rdb, nil
}