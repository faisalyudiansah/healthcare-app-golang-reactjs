package repository

import (
	"context"
	"database/sql"
	"errors"

	"healthcare-app/internal/auth/entity"
	"healthcare-app/pkg/database/transactor"
)

type ResetTokenRepository interface {
	FindByResetToken(ctx context.Context, token string) (*entity.ResetToken, error)
	Save(ctx context.Context, resetToken *entity.ResetToken) error
	DeleteByUserID(ctx context.Context, userID int64) error
}

type resetTokenRepositoryImpl struct {
	db *sql.DB
}

func NewResetTokenRepository(db *sql.DB) *resetTokenRepositoryImpl {
	return &resetTokenRepositoryImpl{
		db: db,
	}
}

func (r *resetTokenRepositoryImpl) FindByResetToken(ctx context.Context, token string) (*entity.ResetToken, error) {
	query := `
		select id, user_id, created_at, updated_at from token_reset_users where reset_token = $1 and deleted_at is null
	`
	tx := transactor.ExtractTx(ctx)

	var (
		err        error
		resetToken = &entity.ResetToken{ResetToken: token}
	)
	if tx != nil {
		err = tx.QueryRowContext(ctx, query, token).Scan(&resetToken.ID, &resetToken.UserID, &resetToken.CreatedAt, &resetToken.UpdatedAt)
	} else {
		err = r.db.QueryRowContext(ctx, query, token).Scan(&resetToken.ID, &resetToken.UserID, &resetToken.CreatedAt, &resetToken.UpdatedAt)
	}

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}

	return resetToken, nil
}

func (r *resetTokenRepositoryImpl) Save(ctx context.Context, resetToken *entity.ResetToken) error {
	query := `
		insert into token_reset_users(user_id, reset_token) values ($1, $2) returning id, created_at, updated_at
	`
	tx := transactor.ExtractTx(ctx)

	var err error
	if tx != nil {
		err = tx.QueryRowContext(ctx, query, resetToken.UserID, resetToken.ResetToken).Scan(&resetToken.ID, &resetToken.CreatedAt, &resetToken.UpdatedAt)
	} else {
		err = r.db.QueryRowContext(ctx, query, resetToken.UserID, resetToken.ResetToken).Scan(&resetToken.ID, &resetToken.CreatedAt, &resetToken.UpdatedAt)
	}

	return err
}

func (r *resetTokenRepositoryImpl) DeleteByUserID(ctx context.Context, userID int64) error {
	query := `
		update token_reset_users set updated_at = now(), deleted_at = now() 
		where deleted_at is null and user_id = $1
	`
	tx := transactor.ExtractTx(ctx)

	var err error
	if tx != nil {
		_, err = tx.ExecContext(ctx, query, userID)
	} else {
		_, err = r.db.ExecContext(ctx, query, userID)
	}

	return err
}
