package config

import (
	"log/slog"
	"os"

	"github.com/joho/godotenv"
)

var Config *config = nil

func init() {
	err := godotenv.Load()
	if err != nil {
		slog.Error("failed to load .env file", "error", err)
		panic(err)
	}

	Config = NewConfig()
}

type config struct {
	Env          string
	Port         string
	DatabasePath string
	JWTSecret    string
}

func NewConfig() *config {
	return &config{
		Env:          getEnvWithDefault("ENV", "local"),
		Port:         getEnvWithDefault("PORT", "8080"),
		DatabasePath: getEnvWithDefault("DATABASE_PATH", "./waffle-talkie.db"),
		JWTSecret:    getEnvWithDefault("JWT_SECRET", "dev-secret-change-in-production"),
	}
}

func getEnvWithDefault(key string, defaultValue string) string {
	value := os.Getenv(key)
	if value == "" {
		return defaultValue
	}
	return value
}
