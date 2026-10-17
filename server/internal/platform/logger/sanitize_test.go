package logger_test

import (
	"testing"

	"github.com/AchmadZackyGZ/fluids/server/internal/platform/logger"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestSanitizeArgs_SensorKeyEksak(t *testing.T) {
	got := logger.SanitizeArgs("password", "rahasia", "email", "a@b.com")

	require.Len(t, got, 4)
	assert.Equal(t, "password", got[0])
	assert.Equal(t, "[REDACTED]", got[1])
	assert.Equal(t, "email", got[2])
	assert.Equal(t, "a@b.com", got[3], "email bukan data sensitif")
}

// TestSanitizeArgs_SensorVarianPassword adalah REGRESI KEAMANAN.
//
// Deny-list lama hanya mencocokkan EKSAK, sehingga key seperti
// "current_password" dan "new_password" LOLOS dan password user
// tercetak utuh di log produksi:
//
//	{"current_password":"Password123","new_password":"PasswordGanti789"}
//
// Sekarang isSensitiveKey() juga mencocokkan substring.
func TestSanitizeArgs_SensorVarianPassword(t *testing.T) {
	kasus := []string{
		"password",
		"password_hash",
		"current_password",
		"new_password",
		"confirm_password",
		"old_password",
		"Password", // beda kapitalisasi
	}

	for _, key := range kasus {
		t.Run(key, func(t *testing.T) {
			got := logger.SanitizeArgs(key, "Password123")

			require.Len(t, got, 2)
			assert.Equal(t, "[REDACTED]", got[1],
				"nilai untuk key %q wajib disensor", key)
		})
	}
}

func TestSanitizeArgs_SensorVarianToken(t *testing.T) {
	kasus := []string{
		"token",
		"reset_token",
		"verification_token",
		"refresh_token",
		"access_token",
		"resetToken", // camelCase tetap tertangkap karena lowercase-kan dulu
	}

	for _, key := range kasus {
		t.Run(key, func(t *testing.T) {
			got := logger.SanitizeArgs(key, "abc123def456")

			require.Len(t, got, 2)
			assert.Equal(t, "[REDACTED]", got[1])
		})
	}
}

func TestSanitizeArgs_SensorSecretDanAPIKey(t *testing.T) {
	kasus := []string{"secret", "client_secret", "api_key", "apikey", "private_key"}

	for _, key := range kasus {
		t.Run(key, func(t *testing.T) {
			got := logger.SanitizeArgs(key, "sangat-rahasia")
			require.Len(t, got, 2)
			assert.Equal(t, "[REDACTED]", got[1])
		})
	}
}

func TestSanitizeArgs_FieldAmanTidakDisensor(t *testing.T) {
	got := logger.SanitizeArgs(
		"email", "a@b.com",
		"user_id", "u-1",
		"count", 3,
		"error", "boom",
	)

	require.Len(t, got, 8)
	assert.Equal(t, "a@b.com", got[1])
	assert.Equal(t, "u-1", got[3])
	assert.Equal(t, 3, got[5])
	assert.Equal(t, "boom", got[7])
}

func TestSanitizeArgs_ArgumenGanjilDikembalikanApaAdanya(t *testing.T) {
	got := logger.SanitizeArgs("password") // tanpa pasangan nilai

	require.Len(t, got, 1)
	assert.Equal(t, "password", got[0],
		"argumen ganjil tidak boleh diproses (bukan key-value valid)")
}

func TestSanitizeArgs_TanpaArgumen(t *testing.T) {
	got := logger.SanitizeArgs()
	assert.Empty(t, got)
}
