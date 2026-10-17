package security_test

import (
	"testing"

	"github.com/AchmadZackyGZ/fluids/server/internal/platform/security"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

const passwordUji = "PasswordRahasia123"

func TestHashPassword_TidakMengembalikanPlaintext(t *testing.T) {
	hash, err := security.HashPassword(passwordUji)
	require.NoError(t, err)

	assert.NotEqual(t, passwordUji, hash)
	assert.Contains(t, hash, "$2", "harus berupa hash bcrypt")
}

func TestCheckPasswordHash_PasswordBenar(t *testing.T) {
	hash, err := security.HashPassword(passwordUji)
	require.NoError(t, err)

	assert.True(t, security.CheckPasswordHash(passwordUji, hash))
}

func TestCheckPasswordHash_PasswordSalah(t *testing.T) {
	hash, err := security.HashPassword(passwordUji)
	require.NoError(t, err)

	assert.False(t, security.CheckPasswordHash("PasswordSalah999", hash))
}

// TestCheckPasswordHash_HashKosong adalah REGRESI untuk bug nyata:
// UserDTO.PasswordHash kosong karena lupa dimapping di GetUserByID,
// sehingga ChangePassword & DeleteAccount SELALU gagal.
// Yang diuji di sini: kondisi itu harus menghasilkan false, bukan panic.
func TestCheckPasswordHash_HashKosong(t *testing.T) {
	require.NotPanics(t, func() {
		assert.False(t, security.CheckPasswordHash(passwordUji, ""))
	})
}

func TestHashPassword_SaltBerbedaSetiapKali(t *testing.T) {
	hash1, err := security.HashPassword(passwordUji)
	require.NoError(t, err)
	hash2, err := security.HashPassword(passwordUji)
	require.NoError(t, err)

	assert.NotEqual(t, hash1, hash2, "bcrypt wajib memakai salt acak")

	// meski hash berbeda, keduanya valid untuk password yang sama
	assert.True(t, security.CheckPasswordHash(passwordUji, hash1))
	assert.True(t, security.CheckPasswordHash(passwordUji, hash2))
}
