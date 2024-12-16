package repository

import (
	"context"
	"database/sql"
	"errors"

	"healthcare-app/internal/auth/entity"
	"healthcare-app/pkg/database/transactor"
)

type RefreshTokenRepository interface {
	FindByJTI(ctx context.Context, jti string) (*entity.RefreshToken, error)
	Save(ctx context.Context, entity *entity.RefreshToken) error
	DeleteByJTI(ctx context.Context, jti string) error
	DeleteByUserID(ctx context.Context, userID int64) error
}

type refreshTokenRepositoryImpl struct {
	db *sql.DB
}

func NewRefreshTokenRepository(db *sql.DB) *refreshTokenRepositoryImpl {
	return &refreshTokenRepositoryImpl{
		db: db,
	}
}

func (r *refreshTokenRepositoryImpl) FindByJTI(ctx context.Context, jti string) (*entity.RefreshToken, error) {
	query := `
		select id, user_id, refresh_token, jti, created_at
		from refresh_token_users
		where jti = $1
	`
	tx := transactor.ExtractTx(ctx)

	var (
		err          error
		refreshToken = new(entity.RefreshToken)
	)
	if tx != nil {
		err = tx.QueryRowContext(ctx, query, jti).Scan(
			&refreshToken.ID,
			&refreshToken.UserID,
			&refreshToken.RefreshToken,
			&refreshToken.JTI,
			&refreshToken.CreatedAt,
		)
	} else {
		err = r.db.QueryRowContext(ctx, query, jti).Scan(
			&refreshToken.ID,
			&refreshToken.UserID,
			&refreshToken.RefreshToken,
			&refreshToken.JTI,
			&refreshToken.CreatedAt,
		)
	}

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}

	return refreshToken, nil
}

func (r *refreshTokenRepositoryImpl) Save(ctx context.Context, entity *entity.RefreshToken) error {
	query := `
		insert into refresh_token_users(user_id, refresh_token, jti)
		values ($1, $2, $3)
		returning id, created_at, updated_at
	`
	tx := transactor.ExtractTx(ctx)

	var err error
	if tx != nil {
		err = tx.QueryRowContext(ctx, query, entity.UserID, entity.RefreshToken, entity.JTI).
			Scan(&entity.ID, &entity.CreatedAt, &entity.UpdatedAt)
	} else {
		err = r.db.QueryRowContext(ctx, query, entity.UserID, entity.RefreshToken, entity.JTI).
			Scan(&entity.ID, &entity.CreatedAt, &entity.UpdatedAt)
	}

	return err
}

func (r *refreshTokenRepositoryImpl) DeleteByJTI(ctx context.Context, jti string) error {
	query := `
		delete from refresh_token_users where jti = $1
	`
	tx := transactor.ExtractTx(ctx)

	var err error
	if tx != nil {
		_, err = tx.ExecContext(ctx, query, jti)
	} else {
		_, err = r.db.ExecContext(ctx, query, jti)
	}

	return err
}

func (r *refreshTokenRepositoryImpl) DeleteByUserID(ctx context.Context, userID int64) error {
	query := `
		delete from refresh_token_users where user_id = $1
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
