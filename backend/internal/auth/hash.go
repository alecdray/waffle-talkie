package auth

import (
	"golang.org/x/crypto/bcrypt"
)

// HashDeviceID creates a bcrypt hash of the device ID for secure storage.
// The original device ID is never stored in the database or sent to clients.
func HashDeviceID(deviceID string) (string, error) {
	hash, err := bcrypt.GenerateFromPassword([]byte(deviceID), bcrypt.DefaultCost)
	if err != nil {
		return "", err
	}
	return string(hash), nil
}

// CompareDeviceID compares a plain device ID against a bcrypt hash.
func CompareDeviceID(hashedDeviceID, plainDeviceID string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hashedDeviceID), []byte(plainDeviceID))
	return err == nil
}
