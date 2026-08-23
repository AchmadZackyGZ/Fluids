package contracts

import "errors"

var (
	// ErrTargetUserNotFound dikembalikan jika user yang ingin di-follow tidak ditemukan
	ErrTargetUserNotFound = errors.New("target user not found")

	// ErrSelfFollowNotAllowed dikembalikan jika user mencoba mem-follow dirinya sendiri
	ErrSelfFollowNotAllowed = errors.New("cannot follow yourself")

	// ErrPostNotFound dikembalikan jika postingan yang ingin di-bookmark tidak ditemukan
	ErrPostNotFound = errors.New("post not found")

	// ErrGithubUserNotFound dikembalikan jika username GitHub tidak valid / tidak ditemukan
	ErrGithubUserNotFound = errors.New("github user not found")
)