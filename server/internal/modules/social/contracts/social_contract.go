package contracts

import (
	"context"
	"time"
)

type UserRelationDTO struct {
	ID         string    `json:"id"`
	Username   string    `json:"username"`
	FullName   string    `json:"full_name"`
	AvatarURL  string    `json:"avatar_url"`
	Bio        string    `json:"bio"`
	FollowedAt time.Time `json:"followed_at"`
	IsMutual   bool      `json:"is_mutual"` // Status: Saling Mengikuti
}

type SocialStatsDTO struct {
	FollowersCount int64 `json:"followers_count"`
	FollowingCount int64 `json:"following_count"`
}

type BookmarkDTO struct {
	PostID        string    `json:"post_id"`
	AuthorID      string    `json:"author_id"`
	PostType      string    `json:"post_type"`
	Caption       string    `json:"caption"`
	LikesCount    int32     `json:"likes_count"`
	CommentsCount int32     `json:"comments_count"`
	SharesCount   int32     `json:"shares_count"`
	CreatedAt     time.Time `json:"created_at"`
	BookmarkedAt  time.Time `json:"bookmarked_at"`
}

// Struct untuk Data Heatmap Kontribusi GitHub 365 Hari
type ContributionDay struct {
	Date  string `json:"date"`  // format "2026-08-23"
	Count int    `json:"count"` // jumlah commit hari itu
	Level int    `json:"level"` // 0: 0 commit, 1: 1-3, 2: 4-9, 3: 10+
}

type GithubActivityDTO struct {
	Username           string            `json:"username"`
	TotalContributions int               `json:"total_contributions"`
	Days               []ContributionDay `json:"days"`
	Source             string            `json:"source"` // "cache" atau "live"
}

type SocialContract interface {
	FollowUser(ctx context.Context, followerID, followingID string) error
	UnfollowUser(ctx context.Context, followerID, followingID string) error
	IsFollowing(ctx context.Context, followerID, followingID string) (bool, error)
	GetFollowers(ctx context.Context, userID string, limit, offset int32) ([]UserRelationDTO, error)
	GetFollowing(ctx context.Context, userID string, limit, offset int32) ([]UserRelationDTO, error)
	GetSocialStats(ctx context.Context, userID string) (*SocialStatsDTO, error)
	BookmarkPost(ctx context.Context, userID, postID string) error
	UnbookmarkPost(ctx context.Context, userID, postID string) error
	IsBookmarked(ctx context.Context, userID, postID string) (bool, error)
	ListBookmarks(ctx context.Context, userID string, limit, offset int32) ([]BookmarkDTO, error)
	LinkGithub(ctx context.Context, userID, githubUsername string) error
	GetGithubActivity(ctx context.Context, username string) (*GithubActivityDTO, error)
}