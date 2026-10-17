package security_test

import (
	"strings"
	"testing"

	"github.com/AchmadZackyGZ/fluids/server/internal/platform/security"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestHashToken_Deterministik(t *testing.T) {
	token := "token-yang-sama"

	assert.Equal(t,
		security.HashToken(token),
		security.HashToken(token),
		"input yang sama harus menghasilkan hash yang sama",
	)
}

func TestHashToken_FormatSHA256(t *testing.T) {
	hash := security.HashToken("apa-saja")

	// SHA-256 menghasilkan 32 byte -> 64 karakter hex
	require.Len(t, hash, 64, "SHA-256 hex harus 64 karakter")

	for _, r := range hash {
		ok := (r >= '0' && r <= '9') || (r >= 'a' && r <= 'f')
		require.Truef(t, ok, "karakter %q bukan hex lowercase", r)
	}
}

func TestHashToken_TidakSamaDenganTokenAsli(t *testing.T) {
	token := "token-asli-yang-tidak-boleh-bocor"

	assert.NotEqual(t, token, security.HashToken(token))
	assert.NotContains(t, security.HashToken(token), token)
}

func TestHashToken_InputBerbedaHasilBerbeda(t *testing.T) {
	assert.NotEqual(t,
		security.HashToken("token-a"),
		security.HashToken("token-b"),
	)
}

// TestHashToken_TidakCollisionPadaPrefixSama adalah REGRESI untuk implementasi
// lama (XOR manual) yang menyalin token ke buffer 32 byte:
//
//	bytes := make([]byte, 32)
//	copy(bytes, token)   // <- hanya 32 byte pertama yang dipakai
//
// Artinya dua token yang 32 byte pertamanya sama menghasilkan hash IDENTIK.
// Karena hash ini dipakai sebagai Redis key, collision = sesi user bisa
// tertukar. SHA-256 tidak punya masalah ini.
func TestHashToken_TidakCollisionPadaPrefixSama(t *testing.T) {
	prefix := strings.Repeat("a", 32)

	hashA := security.HashToken(prefix + "AAAA")
	hashB := security.HashToken(prefix + "BBBB")

	assert.NotEqual(t, hashA, hashB,
		"token dengan prefix 32 byte sama TIDAK boleh punya hash sama")
}

func TestHashToken_StringKosong(t *testing.T) {
	require.NotPanics(t, func() { _ = security.HashToken("") })
	assert.Equal(t, security.HashToken(""), security.HashToken(""))
}
