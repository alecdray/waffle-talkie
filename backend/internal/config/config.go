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

type Env string

func (e Env) String() string {
	return string(e)
}

func (e Env) IsProd() bool {
	return e == EnvProd
}

const (
	EnvLocal Env = "local"
	EnvProd  Env = "prod"
)

type config struct {
	Env            Env
	Port           string
	DatabasePath   string
	JWTSecret      string
	AudioDirectory string
}

func NewConfig() *config {
	env := Env(getEnvWithDefault("ENV", "local"))

	var jwtSecret *string
	if !env.IsProd() {
		jwtSecret = getOptionalEnv("JWT_SECRET")
	}

	jwtSecretFilePath := getOptionalEnv("JWT_SECRET_FILE")
	if jwtSecretFilePath != nil {
		secret, err := getSecretFromFile(*jwtSecretFilePath)
		if err != nil {
			slog.Warn("failed to read JWT secret from file", "error", err)
		} else {
			jwtSecret = &secret
		}
	}

	if jwtSecret == nil || *jwtSecret == "" {
		slog.Error("JWT secret not set")
		panic("JWT secret not set")
	}

	return &config{
		Env:            env,
		Port:           getEnvWithDefault("PORT", "8080"),
		DatabasePath:   getEnvWithDefault("DATABASE_PATH", "./tmp/waffle-talkie.db"),
		AudioDirectory: getEnvWithDefault("AUDIO_DIRECTORY", "./tmp/audio"),
		JWTSecret:      *jwtSecret,
	}
}

func getOptionalEnv(key string) *string {
	value := os.Getenv(key)
	if value == "" {
		return nil
	}
	return &value
}

func getRequiredEnv(key string) string {
	value := getOptionalEnv(key)
	if value == nil {
		slog.Error("required environment variable not set", "key", key)
		panic(fmt.Sprintf("required environment variable %s not set", key))
	}
	return *value
}

func getEnvWithDefault(key string, defaultValue string) string {
	value := getOptionalEnv(key)
	if value == nil {
		return defaultValue
	}
	return *value
}

func getSecretFromFile(path string) (string, error) {
	content, err := os.ReadFile(path)
	if err != nil {
		return "", err
	}
	return string(content), nil
}
