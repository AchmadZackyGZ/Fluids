package service

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"time"

	"github.com/AchmadZackyGZ/fluids/server/internal/modules/social/contracts"
	"github.com/AchmadZackyGZ/fluids/server/internal/modules/social/internal/repository"
	"github.com/AchmadZackyGZ/fluids/server/internal/modules/social/internal/repository/gen"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/redis/go-redis/v9"
)

type SocialService interface {
	contracts.SocialContract
}

type socialService struct {
	repo  repository.SocialRepository
	redis *redis.Client
}

func NewSocialService(repo repository.SocialRepository, rdb *redis.Client) SocialService {
	return &socialService{
		repo:  repo,
		redis: rdb,
	}
}

func (s *socialService) FollowUser(ctx context.Context, followerIDStr, followingIDStr string) error {
	followerID, err := uuid.Parse(followerIDStr)
	if err != nil {
		return errors.New("invalid follower id")
	}
	followingID, err := uuid.Parse(followingIDStr)
	if err != nil {
		return errors.New("invalid following id")
	}
	if followerID == followingID {
		return contracts.ErrSelfFollowNotAllowed
	}
	return s.repo.FollowUser(ctx, followerID, followingID)
}

func (s *socialService) UnfollowUser(ctx context.Context, followerIDStr, followingIDStr string) error {
	followerID, err := uuid.Parse(followerIDStr)
	if err != nil {
		return errors.New("invalid follower id")
	}
	followingID, err := uuid.Parse(followingIDStr)
	if err != nil {
		return errors.New("invalid following id")
	}
	return s.repo.UnfollowUser(ctx, followerID, followingID)
}

func (s *socialService) IsFollowing(ctx context.Context, followerIDStr, followingIDStr string) (bool, error) {
	followerID, err := uuid.Parse(followerIDStr)
	if err != nil {
		return false, errors.New("invalid follower id")
	}
	followingID, err := uuid.Parse(followingIDStr)
	if err != nil {
		return false, errors.New("invalid following id")
	}
	return s.repo.IsFollowing(ctx, followerID, followingID)
}

func (s *socialService) GetFollowers(ctx context.Context, userIDStr string, limit, offset int32) ([]contracts.UserRelationDTO, error) {
	uid, err := uuid.Parse(userIDStr)
	if err != nil {
		return nil, errors.New("invalid user id")
	}
	if limit <= 0 {
		limit = 20
	}

	rows, err := s.repo.GetFollowers(ctx, gen.GetFollowersParams{
		FollowingID: pgtype.UUID{Bytes: uid, Valid: true},
		Limit:       limit,
		Offset:      offset,
	})
	if err != nil {
		return nil, err
	}

	dtos := make([]contracts.UserRelationDTO, 0, len(rows))
	for _, r := range rows {
		followerUUID := uuid.UUID(r.ID.Bytes)
		isMutual, _ := s.repo.IsFollowing(ctx, uid, followerUUID)

		dtos = append(dtos, contracts.UserRelationDTO{
			ID:         followerUUID.String(),
			Username:   r.Username,
			FullName:   r.FullName,
			AvatarURL:  r.AvatarUrl,
			Bio:        r.Bio,
			FollowedAt: r.FollowedAt.Time,
			IsMutual:   isMutual,
		})
	}
	return dtos, nil
}

func (s *socialService) GetFollowing(ctx context.Context, userIDStr string, limit, offset int32) ([]contracts.UserRelationDTO, error) {
	uid, err := uuid.Parse(userIDStr)
	if err != nil {
		return nil, errors.New("invalid user id")
	}
	if limit <= 0 {
		limit = 20
	}

	rows, err := s.repo.GetFollowing(ctx, gen.GetFollowingParams{
		FollowerID: pgtype.UUID{Bytes: uid, Valid: true},
		Limit:      limit,
		Offset:     offset,
	})
	if err != nil {
		return nil, err
	}

	dtos := make([]contracts.UserRelationDTO, 0, len(rows))
	for _, r := range rows {
		followingUUID := uuid.UUID(r.ID.Bytes)
		isMutual, _ := s.repo.IsFollowing(ctx, followingUUID, uid)

		dtos = append(dtos, contracts.UserRelationDTO{
			ID:         followingUUID.String(),
			Username:   r.Username,
			FullName:   r.FullName,
			AvatarURL:  r.AvatarUrl,
			Bio:        r.Bio,
			FollowedAt: r.FollowedAt.Time,
			IsMutual:   isMutual,
		})
	}
	return dtos, nil
}

func (s *socialService) GetSocialStats(ctx context.Context, userIDStr string) (*contracts.SocialStatsDTO, error) {
	uid, err := uuid.Parse(userIDStr)
	if err != nil {
		return nil, errors.New("invalid user id")
	}

	followers, err := s.repo.CountFollowers(ctx, uid)
	if err != nil {
		return nil, err
	}

	following, err := s.repo.CountFollowing(ctx, uid)
	if err != nil {
		return nil, err
	}

	return &contracts.SocialStatsDTO{
		FollowersCount: followers,
		FollowingCount: following,
	}, nil
}

func (s *socialService) BookmarkPost(ctx context.Context, userIDStr, postIDStr string) error {
	uid, err := uuid.Parse(userIDStr)
	if err != nil {
		return errors.New("invalid user id")
	}
	pid, err := uuid.Parse(postIDStr)
	if err != nil {
		return errors.New("invalid post id")
	}
	return s.repo.CreateBookmark(ctx, uid, pid)
}

func (s *socialService) UnbookmarkPost(ctx context.Context, userIDStr, postIDStr string) error {
	uid, err := uuid.Parse(userIDStr)
	if err != nil {
		return errors.New("invalid user id")
	}
	pid, err := uuid.Parse(postIDStr)
	if err != nil {
		return errors.New("invalid post id")
	}
	return s.repo.DeleteBookmark(ctx, uid, pid)
}

func (s *socialService) IsBookmarked(ctx context.Context, userIDStr, postIDStr string) (bool, error) {
	uid, err := uuid.Parse(userIDStr)
	if err != nil {
		return false, errors.New("invalid user id")
	}
	pid, err := uuid.Parse(postIDStr)
	if err != nil {
		return false, errors.New("invalid post id")
	}
	return s.repo.IsBookmarked(ctx, uid, pid)
}

func (s *socialService) ListBookmarks(ctx context.Context, userIDStr string, limit, offset int32) ([]contracts.BookmarkDTO, error) {
	uid, err := uuid.Parse(userIDStr)
	if err != nil {
		return nil, errors.New("invalid user id")
	}
	if limit <= 0 {
		limit = 20
	}

	rows, err := s.repo.ListBookmarks(ctx, gen.ListBookmarksParams{
		UserID: pgtype.UUID{Bytes: uid, Valid: true},
		Limit:  limit,
		Offset: offset,
	})
	if err != nil {
		return nil, err
	}

	dtos := make([]contracts.BookmarkDTO, 0, len(rows))
	for _, r := range rows {
		dtos = append(dtos, contracts.BookmarkDTO{
			PostID:        uuid.UUID(r.ID.Bytes).String(),
			AuthorID:      uuid.UUID(r.AuthorID.Bytes).String(),
			PostType:      r.PostType,
			Caption:       r.Caption,
			LikesCount:    r.LikesCount,
			CommentsCount: r.CommentsCount,
			SharesCount:   r.SharesCount,
			CreatedAt:     r.CreatedAt.Time,
			BookmarkedAt:  r.BookmarkedAt.Time,
		})
	}
	return dtos, nil
}

func (s *socialService) LinkGithub(ctx context.Context, userIDStr, githubUsername string) error {
	uid, err := uuid.Parse(userIDStr)
	if err != nil {
		return errors.New("invalid user id")
	}

	_, err = s.repo.UpdateGithubUsername(ctx, uid, githubUsername)
	if err != nil {
		return err
	}

	// Hapus cache lama di Redis jika ada
	if s.redis != nil {
		s.redis.Del(ctx, fmt.Sprintf("github:contributions:%s", githubUsername))
	}
	return nil
}

// GetGithubActivity menarik live heatmap dari GitHub dengan caching Redis (TTL: 6 Jam)
func (s *socialService) GetGithubActivity(ctx context.Context, username string) (*contracts.GithubActivityDTO, error) {
	cacheKey := fmt.Sprintf("github:contributions:%s", username)

	// 1. Cek Redis Cache
	if s.redis != nil {
		cachedData, err := s.redis.Get(ctx, cacheKey).Result()
		if err == nil && cachedData != "" {
			var cachedDTO contracts.GithubActivityDTO
			if json.Unmarshal([]byte(cachedData), &cachedDTO) == nil {
				cachedDTO.Source = "cache"
				return &cachedDTO, nil
			}
		}
	}

	// 2. Jika Cache Miss: Fetch dari Public GitHub Contributions API
	apiURL := fmt.Sprintf("https://github-contributions-api.jogruber.de/v4/%s?y=last", username)
	resp, err := http.Get(apiURL)
	if err != nil || resp.StatusCode != http.StatusOK {
		return nil, contracts.ErrGithubUserNotFound
	}
	defer resp.Body.Close()

	var apiResult struct {
		Total struct {
			LastYear int `json:"lastYear"`
		} `json:"total"`
		Contributions []struct {
			Date  string `json:"date"`
			Count int    `json:"count"`
			Level int    `json:"level"`
		} `json:"contributions"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&apiResult); err != nil {
		return nil, errors.New("failed to parse github contributions")
	}

	days := make([]contracts.ContributionDay, 0, len(apiResult.Contributions))
	for _, c := range apiResult.Contributions {
		days = append(days, contracts.ContributionDay{
			Date:  c.Date,
			Count: c.Count,
			Level: c.Level,
		})
	}

	resultDTO := &contracts.GithubActivityDTO{
		Username:           username,
		TotalContributions: apiResult.Total.LastYear,
		Days:               days,
		Source:             "live",
	}

	// 3. Simpan ke Redis Cache (TTL: 6 Jam)
	if s.redis != nil {
		if dataBytes, err := json.Marshal(resultDTO); err == nil {
			s.redis.Set(ctx, cacheKey, string(dataBytes), 6*time.Hour)
		}
	}

	return resultDTO, nil
}