package config

import (
	"fmt"
	"log/slog"
	"os"

	"github.com/joho/godotenv"
)

var Config *config = nil

func init() {
	err := godotenv.Load()
	if err != nil {
		slog.Warn("failed to load .env file", "error", err)
	}

	Config = NewConfig()
}

type config struct {
	Env            string
	Port           string
	DatabasePath   string
	JWTSecret      string
	AudioDirectory string
}

func NewConfig() *config {
	return &config{
		Env:            getEnvWithDefault("ENV", "local"),
		Port:           getEnvWithDefault("PORT", "8080"),
		DatabasePath:   getEnvWithDefault("DATABASE_PATH", "./tmp/waffle-talkie.db"),
		AudioDirectory: getEnvWithDefault("AUDIO_DIRECTORY", "./tmp/audio"),
		JWTSecret:      getRequiredEnv("JWT_SECRET"),
	}
}

func getRequiredEnv(key string) string {
	value := os.Getenv(key)
	if value == "" {
		slog.Error("required environment variable not set", "key", key)
		panic(fmt.Sprintf("required environment variable %s not set", key))
	}
	return value
}

func getEnvWithDefault(key string, defaultValue string) string {
	value := os.Getenv(key)
	if value == "" {
		return defaultValue
	}
	return value
}
