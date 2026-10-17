package security

import (
	"crypto/sha256"
	"encoding/hex"
)

// HashToken menghasilkan SHA-256 hex dari token mentah (opaque token).
//
// Kenapa harus SHA-256, bukan XOR manual seperti implementasi sebelumnya:
//
//  1. XOR 2-byte -> 1-byte hanya menghasilkan 16 byte dengan entropi rendah.
//     Token 32 byte dipetakan ke 16 byte, jadi banyak token berbeda berbagi
//     hash yang sama (collision). Karena hash ini dipakai sebagai Redis key,
//     collision berarti sesi user A bisa tertukar dengan user B.
//  2. XOR bersifat reversibel secara struktural (bukan one-way function).
//     Penyerang yang bisa membaca Redis dapat menyusun kembali token asli.
//  3. SHA-256 collision-resistant dan one-way: hash bocor tidak membocorkan token.
//
// Catatan soal salt: token ini di-generate acak 32 byte (256-bit entropi),
// jadi SHA-256 tanpa salt sudah cukup. Salt + bcrypt/argon2 hanya diperlukan
// untuk PASSWORD manusia, karena password punya entropi rendah dan bisa
// di-brute-force dengan rainbow table.
func HashToken(token string) string {
	sum := sha256.Sum256([]byte(token))
	return hex.EncodeToString(sum[:])
}
