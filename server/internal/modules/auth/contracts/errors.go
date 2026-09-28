package contracts

import "errors"

var (
	// Token & Session Errors
	ErrInvalidRefreshToken   = errors.New("invalid refresh token")
	ErrRefreshTokenExpired   = errors.New("refresh token expired")
	ErrTokenRevoked          = errors.New("token has been revoked")
	ErrAccessTokenExpired    = errors.New("access token expired")

	// Email Verification Errors
	ErrEmailNotVerified      = errors.New("email not verified")
	ErrVerificationTokenInvalid = errors.New("invalid verification token")
	ErrVerificationTokenExpired = errors.New("verification token expired")

	// Password Reset Errors
	ErrResetTokenInvalid     = errors.New("invalid reset token")
	ErrResetTokenExpired     = errors.New("reset token expired")
	ErrPasswordTooWeak       = errors.New("password does not meet requirements")

	// Rate Limiting
	ErrRateLimited           = errors.New("too many requests, please try again later")

	// Account
	ErrAccountDeleted        = errors.New("account has been deleted")
	ErrCurrentPasswordInvalid = errors.New("current password is incorrect")
)