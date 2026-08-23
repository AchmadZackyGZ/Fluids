package contracts

import "errors"

var (
	ErrPostNotFound    = errors.New("post not found")
	ErrAuthorNotFound  = errors.New("author not found")
	ErrInvalidPostType = errors.New("invalid post type")
)