package service

import (
	"context"
	"errors"
	"fmt"
	"strconv"
	"time"

	"github.com/AchmadZackyGZ/fluids/server/internal/modules/notification/contracts"
	"github.com/AchmadZackyGZ/fluids/server/internal/modules/notification/internal/repository"
	"github.com/AchmadZackyGZ/fluids/server/internal/modules/notification/internal/repository/gen"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/redis/go-redis/v9"
)

type NotificationService interface {
	contracts.NotificationContract
}

type notificationService struct {
	repo  repository.NotificationRepository
	redis *redis.Client
}

func NewNotificationService(repo repository.NotificationRepository, rdb *redis.Client) NotificationService {
	return &notificationService{
		repo:  repo,
		redis: rdb,
	}
}

// 1. GetNotifications mengambil daftar notifikasi dengan filter kategori & pagination
func (s *notificationService) GetNotifications(ctx context.Context, userID string, category string, limit, offset int32) ([]contracts.NotificationDTO, error) {
	uid, err := uuid.Parse(userID)
	if err != nil {
		return nil, errors.New("invalid user id")
	}

	if limit <= 0 {
		limit = 20
	}
	if offset < 0 {
		offset = 0
	}
	if category == "" {
		category = "all"
	}

	rows, err := s.repo.ListNotifications(ctx, gen.ListNotificationsParams{
		RecipientID: pgtype.UUID{Bytes: uid, Valid: true},
		Limit:       limit,
		Offset:      offset,
		Column4:     category,
	})
	if err != nil {
		return nil, err
	}

	dtos := make([]contracts.NotificationDTO, 0, len(rows))
	for _, r := range rows {
		var entityIDStr string
		if r.EntityID.Valid {
			entityIDStr = uuid.UUID(r.EntityID.Bytes).String()
		}

		dtos = append(dtos, contracts.NotificationDTO{
			ID:             uuid.UUID(r.ID.Bytes).String(),
			ActorUsername:  r.ActorUsername,
			ActorAvatarUrl: r.ActorAvatarUrl,
			EntityType:     r.EntityType,
			EntityID:       entityIDStr,
			Caption:        r.Caption,
			ReadStatus:     r.ReadAt.Valid, // true jika read_at terisi, false jika NULL
			CreatedAt:      r.CreatedAt.Time,
		})
	}

	return dtos, nil
}

// 2. GetUnreadCount menghitung jumlah notifikasi belum dibaca (dengan Redis Caching)
func (s *notificationService) GetUnreadCount(ctx context.Context, userID string) (*contracts.UnreadCountDTO, error) {
	uid, err := uuid.Parse(userID)
	if err != nil {
		return nil, errors.New("invalid user id")
	}

	cacheKey := fmt.Sprintf("notifications:unread:%s", userID)

	// A. Cek In-Memory Cache di Redis terlebih dahulu
	if s.redis != nil {
		if cachedVal, err := s.redis.Get(ctx, cacheKey).Result(); err == nil {
			if count, err := strconv.ParseInt(cachedVal, 10, 64); err == nil {
				return &contracts.UnreadCountDTO{UnreadCount: count}, nil
			}
		}
	}

	// B. Jika Cache Miss: Hitung langsung dari PostgreSQL (menggunakan Partial Index)
	count, err := s.repo.CountUnreadNotifications(ctx, uid)
	if err != nil {
		return nil, err
	}

	// C. Simpan hasil perhitungan ke Redis (TTL 2 Menit)
	if s.redis != nil {
		s.redis.Set(ctx, cacheKey, count, 2*time.Minute)
	}

	return &contracts.UnreadCountDTO{UnreadCount: count}, nil
}

// 3. MarkAsRead menandai 1 notifikasi spesifik sebagai sudah dibaca
func (s *notificationService) MarkAsRead(ctx context.Context, userID, notificationID string) error {
	uid, err := uuid.Parse(userID)
	if err != nil {
		return errors.New("invalid user id")
	}
	nid, err := uuid.Parse(notificationID)
	if err != nil {
		return errors.New("invalid notification id")
	}

	_, err = s.repo.MarkNotificationAsRead(ctx, nid, uid)
	if err != nil {
		return err
	}

	// Bersihkan cache counter di Redis agar angka badge lonceng langsung berkurang
	if s.redis != nil {
		s.redis.Del(ctx, fmt.Sprintf("notifications:unread:%s", userID))
	}

	return nil
}

// 4. MarkAllAsRead menandai semua notifikasi milik user menjadi sudah dibaca
func (s *notificationService) MarkAllAsRead(ctx context.Context, userID string) error {
	uid, err := uuid.Parse(userID)
	if err != nil {
		return errors.New("invalid user id")
	}

	if err := s.repo.MarkAllNotificationsAsRead(ctx, uid); err != nil {
		return err
	}

	// Set counter di Redis menjadi 0
	if s.redis != nil {
		s.redis.Set(ctx, fmt.Sprintf("notifications:unread:%s", userID), 0, 2*time.Minute)
	}

	return nil
}