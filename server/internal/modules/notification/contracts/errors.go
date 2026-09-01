package contracts

import "errors"

var (
	ErrNotificationNotFound = errors.New("notification not found")
	ErrUnauthorizedAccess   = errors.New("unauthorized access to notification")
)