package auth

import (
	"crypto/sha256"
	"encoding/hex"
)

// HashDeviceID creates a SHA-256 hash of the device ID for secure storage.
// The original device ID is never stored in the database.
func HashDeviceID(deviceID string) string {
	hash := sha256.Sum256([]byte(deviceID))
	return hex.EncodeToString(hash[:])
}
