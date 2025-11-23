package util

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"encoding/base64"
	"errors"
	"io"
	"os"
	"strings"
)

var (
	// APP_ENCRYPTION_KEY must be a base64-encoded 32-byte key for AES-256
	envEncKeyName = "APP_ENCRYPTION_KEY"
)

func getEncKey() ([]byte, error) {
	b64 := os.Getenv(envEncKeyName)
	// Be resilient to common .env formatting: trim spaces and surrounding quotes
	b64 = strings.TrimSpace(b64)
	if len(b64) >= 2 {
		if (b64[0] == '"' && b64[len(b64)-1] == '"') || (b64[0] == '\'' && b64[len(b64)-1] == '\'') {
			b64 = b64[1 : len(b64)-1]
		}
	}
	if b64 == "" {
		return nil, errors.New("encryption key not set: APP_ENCRYPTION_KEY")
	}
	raw, err := base64.StdEncoding.DecodeString(b64)
	if err != nil {
		return nil, err
	}
	if len(raw) != 32 {
		return nil, errors.New("APP_ENCRYPTION_KEY must decode to 32 bytes (AES-256)")
	}
	return raw, nil
}

// Encrypt returns base64(nonce|ciphertext) using AES-GCM
func EncryptString(plain string) (string, error) {
	key, err := getEncKey()
	if err != nil {
		return "", err
	}
	block, err := aes.NewCipher(key)
	if err != nil {
		return "", err
	}
	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return "", err
	}
	nonce := make([]byte, gcm.NonceSize())
	if _, err := io.ReadFull(rand.Reader, nonce); err != nil {
		return "", err
	}
	ciphertext := gcm.Seal(nil, nonce, []byte(plain), nil)
	out := append(nonce, ciphertext...)
	return base64.StdEncoding.EncodeToString(out), nil
}

// Decrypt expects base64(nonce|ciphertext)
func DecryptString(encB64 string) (string, error) {
	key, err := getEncKey()
	if err != nil {
		return "", err
	}
	data, err := base64.StdEncoding.DecodeString(encB64)
	if err != nil {
		return "", err
	}
	block, err := aes.NewCipher(key)
	if err != nil {
		return "", err
	}
	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return "", err
	}
	if len(data) < gcm.NonceSize() {
		return "", errors.New("ciphertext too short")
	}
	nonce := data[:gcm.NonceSize()]
	ct := data[gcm.NonceSize():]
	plain, err := gcm.Open(nil, nonce, ct, nil)
	if err != nil {
		return "", err
	}
	return string(plain), nil
}
