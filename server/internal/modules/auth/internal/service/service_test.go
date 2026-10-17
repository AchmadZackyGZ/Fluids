package service_test

import (
	"context"
	"errors"
	"strings"
	"testing"

	"github.com/alicebob/miniredis/v2"
	"github.com/redis/go-redis/v9"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"github.com/AchmadZackyGZ/fluids/server/internal/modules/auth/contracts"
	"github.com/AchmadZackyGZ/fluids/server/internal/modules/auth/internal/service"
	userContract "github.com/AchmadZackyGZ/fluids/server/internal/modules/user/contracts"
	"github.com/AchmadZackyGZ/fluids/server/internal/platform/security"
)

// ============================================================
// Fake userContract — mencatat pemanggilan supaya bisa di-assert
// ============================================================

type passwordUpdate struct {
	UserID string
	Hash   string
}

type verifiedUpdate struct {
	UserID   string
	Verified bool
}

type fakeUserContract struct {
	users map[string]*userContract.UserDTO // key: email

	// error injection
	updatePasswordErr error
	updateVerifiedErr error
	deleteAccountErr  error
	getUserByIDErr    error

	// recorded calls
	passwordUpdates []passwordUpdate
	verifiedUpdates []verifiedUpdate
	deletedAccounts []string
}

func newFakeUserContract() *fakeUserContract {
	return &fakeUserContract{users: map[string]*userContract.UserDTO{}}
}

func (f *fakeUserContract) CreateUser(_ context.Context, req userContract.CreateUserReq) (*userContract.UserDTO, error) {
	u := &userContract.UserDTO{
		ID:           "user-" + req.Username,
		Username:     req.Username,
		Email:        req.Email,
		PasswordHash: req.PasswordHash,
		FullName:     req.FullName,
	}
	f.users[req.Email] = u
	return u, nil
}

func (f *fakeUserContract) GetUserByEmail(_ context.Context, email string) (*userContract.UserDTO, error) {
	u, ok := f.users[email]
	if !ok {
		return nil, userContract.ErrUserNotFound
	}
	return u, nil
}

func (f *fakeUserContract) GetUserByID(_ context.Context, id string) (*userContract.UserDTO, error) {
	if f.getUserByIDErr != nil {
		return nil, f.getUserByIDErr
	}
	for _, u := range f.users {
		if u.ID == id {
			return u, nil
		}
	}
	return nil, userContract.ErrUserNotFound
}

func (f *fakeUserContract) UpdatePassword(_ context.Context, userID, passwordHash string) error {
	if f.updatePasswordErr != nil {
		return f.updatePasswordErr
	}
	f.passwordUpdates = append(f.passwordUpdates, passwordUpdate{UserID: userID, Hash: passwordHash})
	return nil
}

func (f *fakeUserContract) UpdateEmailVerified(_ context.Context, userID string, verified bool) error {
	if f.updateVerifiedErr != nil {
		return f.updateVerifiedErr
	}
	f.verifiedUpdates = append(f.verifiedUpdates, verifiedUpdate{UserID: userID, Verified: verified})
	return nil
}

func (f *fakeUserContract) DeleteAccount(_ context.Context, userID string) error {
	if f.deleteAccountErr != nil {
		return f.deleteAccountErr
	}
	f.deletedAccounts = append(f.deletedAccounts, userID)
	return nil
}

// ============================================================
// Helper
// ============================================================

func newTestService(t *testing.T) (service.AuthService, *fakeUserContract, *miniredis.Miniredis) {
	t.Helper()

	// GenerateToken butuh JWT_SECRET; t.Setenv otomatis restore setelah test.
	t.Setenv("JWT_SECRET", "secret-untuk-unit-test")

	mr := miniredis.RunT(t)
	rdb := redis.NewClient(&redis.Options{Addr: mr.Addr()})
	fake := newFakeUserContract()

	return service.NewAuthService(fake, rdb), fake, mr
}

// seedUser menaruh satu user (dengan password sudah di-hash) ke fake contract.
func seedUser(t *testing.T, fake *fakeUserContract, userID, email, password string) {
	t.Helper()
	hash, err := security.HashPassword(password)
	require.NoError(t, err)

	fake.users[email] = &userContract.UserDTO{
		ID:           userID,
		Username:     "tester",
		Email:        email,
		PasswordHash: hash,
	}
}

// ============================================================
// Register & Login
// ============================================================

func TestRegister_MengembalikanTokenDanUser(t *testing.T) {
	svc, _, _ := newTestService(t)

	res, err := svc.Register(context.Background(), service.RegisterReq{
		Username: "zacky",
		Email:    "zacky@example.com",
		Password: "Password123",
		FullName: "Zacky",
	})

	require.NoError(t, err)
	require.NotNil(t, res)
	assert.NotEmpty(t, res.Token)
	assert.NotEmpty(t, res.RefreshToken)
	require.NotNil(t, res.User)
	assert.Equal(t, "zacky@example.com", res.User.Email)
	assert.NotEqual(t, "Password123", res.User.PasswordHash, "password tidak boleh disimpan plaintext")
	assert.True(t, security.CheckPasswordHash("Password123", res.User.PasswordHash))
}

func TestLogin_Sukses(t *testing.T) {
	svc, fake, mr := newTestService(t)
	seedUser(t, fake, "user-1", "a@b.com", "Password123")

	res, err := svc.Login(context.Background(), service.LoginReq{
		Email:    "a@b.com",
		Password: "Password123",
	})

	require.NoError(t, err)
	assert.NotEmpty(t, res.Token)

	// refresh token harus tersimpan di Redis DAN tercatat di index per-user
	refreshHash := security.HashToken(res.RefreshToken)
	assert.True(t, mr.Exists("refresh_token:"+refreshHash),
		"refresh token harus tersimpan di Redis")
	assert.True(t, mr.Exists("user_refresh_tokens:user-1"),
		"index per-user harus dibuat supaya revokeAllUserTokens tidak perlu SCAN")
}

func TestLogin_PasswordSalah(t *testing.T) {
	svc, fake, _ := newTestService(t)
	seedUser(t, fake, "user-1", "a@b.com", "Password123")

	_, err := svc.Login(context.Background(), service.LoginReq{
		Email:    "a@b.com",
		Password: "PasswordSalah999",
	})

	assert.ErrorIs(t, err, service.ErrInvalidCredentials)
}

// TestLogin_EmailTidakAdaTidakBocorkanKeberadaanEmail memastikan error untuk
// email tidak terdaftar SAMA dengan error password salah. Kalau berbeda,
// penyerang bisa memakai login untuk menebak email mana yang terdaftar.
func TestLogin_EmailTidakAdaTidakBocorkanKeberadaanEmail(t *testing.T) {
	svc, _, _ := newTestService(t)

	_, err := svc.Login(context.Background(), service.LoginReq{
		Email:    "tidak-ada@example.com",
		Password: "Password123",
	})

	assert.ErrorIs(t, err, service.ErrInvalidCredentials)
	assert.NotErrorIs(t, err, userContract.ErrUserNotFound,
		"jangan bocorkan bahwa email tidak terdaftar")
}

// ============================================================
// VerifyEmail
// ============================================================

func TestVerifyEmail_Sukses(t *testing.T) {
	svc, fake, mr := newTestService(t)

	rawToken := "token-verifikasi-mentah"
	key := "email_verification:" + security.HashToken(rawToken)
	mr.Set(key, "user-1")

	err := svc.VerifyEmail(context.Background(), contracts.VerifyEmailReq{Token: rawToken})

	require.NoError(t, err)
	require.Len(t, fake.verifiedUpdates, 1)
	assert.Equal(t, "user-1", fake.verifiedUpdates[0].UserID)
	assert.True(t, fake.verifiedUpdates[0].Verified)
	assert.False(t, mr.Exists(key), "token harus dihapus setelah dipakai (sekali pakai)")
}

func TestVerifyEmail_TokenTidakDikenal(t *testing.T) {
	svc, _, _ := newTestService(t)

	err := svc.VerifyEmail(context.Background(), contracts.VerifyEmailReq{Token: "token-palsu"})

	assert.ErrorIs(t, err, service.ErrVerificationTokenInvalid)
}

// TestVerifyEmail_UpdateDBGagalTokenTidakTerhapus adalah REGRESI untuk urutan
// operasi: kalau token dihapus DULU lalu update DB gagal, user terjebak —
// token hilang, email belum terverifikasi, dan harus minta token baru.
func TestVerifyEmail_UpdateDBGagalTokenTidakTerhapus(t *testing.T) {
	svc, fake, mr := newTestService(t)

	rawToken := "token-verifikasi-mentah"
	key := "email_verification:" + security.HashToken(rawToken)
	mr.Set(key, "user-1")

	fake.updateVerifiedErr = errors.New("database sedang down")

	err := svc.VerifyEmail(context.Background(), contracts.VerifyEmailReq{Token: rawToken})

	require.Error(t, err)
	assert.True(t, mr.Exists(key),
		"token TIDAK boleh terhapus kalau update DB gagal — user harus bisa coba lagi")
}

// ============================================================
// ResetPassword
// ============================================================

// TestResetPassword_MenyimpanHashBaru adalah REGRESI untuk bug terbesar:
// kode lama memakai `_, err = security.HashPassword(...)` sehingga hash
// dibuang dan password TIDAK PERNAH berubah.
func TestResetPassword_MenyimpanHashBaru(t *testing.T) {
	svc, fake, mr := newTestService(t)

	rawToken := "token-reset-mentah"
	key := "password_reset:" + security.HashToken(rawToken)
	mr.Set(key, "user-1")

	err := svc.ResetPassword(context.Background(), contracts.ResetPasswordReq{
		Token:       rawToken,
		NewPassword: "PasswordBaru456",
	})

	require.NoError(t, err)
	require.Len(t, fake.passwordUpdates, 1, "password harus benar-benar disimpan")
	assert.Equal(t, "user-1", fake.passwordUpdates[0].UserID)

	assert.True(t, security.CheckPasswordHash("PasswordBaru456", fake.passwordUpdates[0].Hash),
		"hash yang disimpan harus cocok dengan password baru")
	assert.False(t, security.CheckPasswordHash("Password123", fake.passwordUpdates[0].Hash),
		"password lama tidak boleh cocok lagi")

	assert.False(t, mr.Exists(key), "token reset harus hangus setelah dipakai")
}

func TestResetPassword_TokenTidakDikenal(t *testing.T) {
	svc, fake, _ := newTestService(t)

	err := svc.ResetPassword(context.Background(), contracts.ResetPasswordReq{
		Token:       "token-palsu",
		NewPassword: "PasswordBaru456",
	})

	assert.ErrorIs(t, err, service.ErrResetTokenInvalid)
	assert.Empty(t, fake.passwordUpdates, "password tidak boleh berubah kalau token invalid")
}

// ============================================================
// ChangePassword
// ============================================================

func TestChangePassword_PasswordLamaSalah(t *testing.T) {
	svc, fake, _ := newTestService(t)
	seedUser(t, fake, "user-1", "a@b.com", "PasswordLama123")

	err := svc.ChangePassword(context.Background(), "user-1", contracts.ChangePasswordReq{
		CurrentPassword: "BukanPasswordLama",
		NewPassword:     "PasswordBaru456",
	})

	assert.ErrorIs(t, err, service.ErrCurrentPasswordInvalid)
	assert.Empty(t, fake.passwordUpdates)
}

func TestChangePassword_Sukses(t *testing.T) {
	svc, fake, _ := newTestService(t)
	seedUser(t, fake, "user-1", "a@b.com", "PasswordLama123")

	err := svc.ChangePassword(context.Background(), "user-1", contracts.ChangePasswordReq{
		CurrentPassword: "PasswordLama123",
		NewPassword:     "PasswordBaru456",
	})

	require.NoError(t, err)
	require.Len(t, fake.passwordUpdates, 1)
	assert.True(t, security.CheckPasswordHash("PasswordBaru456", fake.passwordUpdates[0].Hash))
}

// TestChangePassword_MencabutSemuaSesi memastikan index per-user dipakai:
// semua refresh token user (di semua device) harus hilang.
func TestChangePassword_MencabutSemuaSesi(t *testing.T) {
	svc, fake, mr := newTestService(t)
	seedUser(t, fake, "user-1", "a@b.com", "PasswordLama123")

	// dua sesi aktif di dua device
	mr.Set("refresh_token:hash-sesi-1", "user-1")
	mr.Set("refresh_token:hash-sesi-2", "user-1")
	if _, addErr := mr.SAdd("user_refresh_tokens:user-1", "hash-sesi-1", "hash-sesi-2"); addErr != nil {
		t.Fatalf("gagal menyiapkan index: %v", addErr)
	}

	err := svc.ChangePassword(context.Background(), "user-1", contracts.ChangePasswordReq{
		CurrentPassword: "PasswordLama123",
		NewPassword:     "PasswordBaru456",
	})

	require.NoError(t, err)
	assert.False(t, mr.Exists("refresh_token:hash-sesi-1"), "sesi device 1 harus tercabut")
	assert.False(t, mr.Exists("refresh_token:hash-sesi-2"), "sesi device 2 harus tercabut")
	assert.False(t, mr.Exists("user_refresh_tokens:user-1"), "index ikut dibersihkan")
}

// ============================================================
// DeleteAccount
// ============================================================

func TestDeleteAccount_PasswordSalah(t *testing.T) {
	svc, fake, _ := newTestService(t)
	seedUser(t, fake, "user-1", "a@b.com", "Password123")

	err := svc.DeleteAccount(context.Background(), "user-1", contracts.DeleteAccountReq{
		Password: "PasswordSalah",
	})

	assert.ErrorIs(t, err, service.ErrCurrentPasswordInvalid)
	assert.Empty(t, fake.deletedAccounts, "akun tidak boleh dihapus kalau password salah")
}

func TestDeleteAccount_Sukses(t *testing.T) {
	svc, fake, _ := newTestService(t)
	seedUser(t, fake, "user-1", "a@b.com", "Password123")

	err := svc.DeleteAccount(context.Background(), "user-1", contracts.DeleteAccountReq{
		Password: "Password123",
	})

	require.NoError(t, err)
	assert.Equal(t, []string{"user-1"}, fake.deletedAccounts,
		"soft delete harus dipanggil di modul user")
}

// ============================================================
// RevokeToken
// ============================================================

// TestRevokeToken_BenarBenarMencabut adalah REGRESI untuk bug double-hash:
// RevokeToken() dulu memanggil hashToken(tokenHash) padahal handler SUDAH
// mengirim hash. Key yang dihapus tidak pernah cocok, sehingga logout
// mengembalikan 200 tapi token tetap hidup.
func TestRevokeToken_BenarBenarMencabut(t *testing.T) {
	svc, _, mr := newTestService(t)

	rawToken := "refresh-token-mentah"
	hash := security.HashToken(rawToken)
	key := "refresh_token:" + hash
	mr.Set(key, "user-1")
	if _, addErr := mr.SAdd("user_refresh_tokens:user-1", hash); addErr != nil {
		t.Fatalf("gagal menyiapkan index: %v", addErr)
	}

	// handler mengirim HASH, bukan token mentah
	err := svc.RevokeToken(context.Background(), "user-1", hash)

	require.NoError(t, err)
	assert.False(t, mr.Exists(key), "token harus benar-benar terhapus (regresi double-hash)")

	sisa, err := mr.SCard("user_refresh_tokens:user-1")
	require.NoError(t, err)
	assert.Equal(t, 0, sisa, "hash harus dibersihkan dari index per-user")
}

// ============================================================
// RequestPasswordReset
// ============================================================

func TestRequestPasswordReset_MenyimpanToken(t *testing.T) {
	svc, fake, mr := newTestService(t)
	seedUser(t, fake, "user-1", "a@b.com", "Password123")

	err := svc.RequestPasswordReset(context.Background(), contracts.ForgotPasswordReq{Email: "a@b.com"})

	require.NoError(t, err)

	var ada bool
	for _, k := range mr.Keys() {
		if strings.HasPrefix(k, "password_reset:") {
			ada = true
			break
		}
	}
	assert.True(t, ada, "token reset harus tersimpan di Redis")
}

// TestRequestPasswordReset_EmailTidakAdaTetapSukses: jangan bocorkan
// keberadaan email lewat perbedaan response.
func TestRequestPasswordReset_EmailTidakAdaTetapSukses(t *testing.T) {
	svc, _, _ := newTestService(t)

	err := svc.RequestPasswordReset(context.Background(), contracts.ForgotPasswordReq{
		Email: "tidak-ada@example.com",
	})

	assert.NoError(t, err)
}
