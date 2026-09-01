package repository

import (
	"context"
	"errors"

	"github.com/AchmadZackyGZ/fluids/server/internal/modules/notification/contracts"
	"github.com/AchmadZackyGZ/fluids/server/internal/modules/notification/internal/repository/gen"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jackc/pgx/v5/pgxpool"
)

// mapPgError menerjemahkan error mentah dari PostgreSQL menjadi error domain yang ramah
func mapPgError(err error) error {
	if err == nil {
		return nil
	}
	// Jika data tidak ditemukan (misal saat mencari ID notifikasi yang salah)
	if errors.Is(err, pgx.ErrNoRows) {
		return contracts.ErrNotificationNotFound
	}
	var pgErr *pgconn.PgError
	if errors.As(err, &pgErr) {
		switch pgErr.Code {
		case "23503": // foreign_key_violation (user penerima atau aktor tidak ada)
			return contracts.ErrNotificationNotFound
		}
	}
	return err
}

type NotificationRepository interface {
	ListNotifications(ctx context.Context, arg gen.ListNotificationsParams) ([]gen.Notification, error)
	CountUnreadNotifications(ctx context.Context, recipientID uuid.UUID) (int64, error)
	MarkNotificationAsRead(ctx context.Context, id, recipientID uuid.UUID) (gen.MarkNotificationAsReadRow, error)
	MarkAllNotificationsAsRead(ctx context.Context, recipientID uuid.UUID) error
	CreateNotification(ctx context.Context, arg gen.CreateNotificationParams) (gen.Notification, error)
}

type postgresRepository struct {
	q *gen.Queries
}

func NewNotificationRepository(pool *pgxpool.Pool) NotificationRepository {
	return &postgresRepository{
		q: gen.New(pool),
	}
}

func (r *postgresRepository) ListNotifications(ctx context.Context, arg gen.ListNotificationsParams) ([]gen.Notification, error) {
	items, err := r.q.ListNotifications(ctx, arg)
	if err != nil {
		return nil, mapPgError(err)
	}
	return items, nil
}

func (r *postgresRepository) CountUnreadNotifications(ctx context.Context, recipientID uuid.UUID) (int64, error) {
	count, err := r.q.CountUnreadNotifications(ctx, pgtype.UUID{Bytes: recipientID, Valid: true})
	if err != nil {
		return 0, mapPgError(err)
	}
	return count, nil
}

func (r *postgresRepository) MarkNotificationAsRead(ctx context.Context, id, recipientID uuid.UUID) (gen.MarkNotificationAsReadRow, error) {
	row, err := r.q.MarkNotificationAsRead(ctx, gen.MarkNotificationAsReadParams{
		ID:          pgtype.UUID{Bytes: id, Valid: true},
		RecipientID: pgtype.UUID{Bytes: recipientID, Valid: true},
	})
	if err != nil {
		return gen.MarkNotificationAsReadRow{}, mapPgError(err)
	}
	return row, nil
}

func (r *postgresRepository) MarkAllNotificationsAsRead(ctx context.Context, recipientID uuid.UUID) error {
	return mapPgError(r.q.MarkAllNotificationsAsRead(ctx, pgtype.UUID{Bytes: recipientID, Valid: true}))
}

func (r *postgresRepository) CreateNotification(ctx context.Context, arg gen.CreateNotificationParams) (gen.Notification, error) {
	n, err := r.q.CreateNotification(ctx, arg)
	if err != nil {
		return gen.Notification{}, mapPgError(err)
	}
	return n, nil
}