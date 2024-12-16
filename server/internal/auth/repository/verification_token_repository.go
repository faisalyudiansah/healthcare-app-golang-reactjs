package repository

import (
	"context"
	"database/sql"
	"errors"

	"healthcare-app/internal/auth/entity"
	"healthcare-app/pkg/database/transactor"
)

type VerificationTokenRepository interface {
	FindByVerificationToken(ctx context.Context, token string) (*entity.VerificationToken, error)
	Save(ctx context.Context, verificationToken *entity.VerificationToken) error
	DeleteByUserID(ctx context.Context, userID int64) error
}

type verificationTokenRepositoryImpl struct {
	db *sql.DB
}

func NewVerificationTokenRepository(db *sql.DB) *verificationTokenRepositoryImpl {
	return &verificationTokenRepositoryImpl{
		db: db,
	}
}

func (r *verificationTokenRepositoryImpl) FindByVerificationToken(ctx context.Context, token string) (*entity.VerificationToken, error) {
	query := `
		select id, user_id, created_at, updated_at from token_verification_users where verification_token = $1 and deleted_at is null
	`
	tx := transactor.ExtractTx(ctx)

	var (
		err               error
		verificationToken = &entity.VerificationToken{VerificationToken: token}
	)
	if tx != nil {
		err = tx.QueryRowContext(ctx, query, token).Scan(&verificationToken.ID, &verificationToken.UserID, &verificationToken.CreatedAt, &verificationToken.UpdatedAt)
	} else {
		err = r.db.QueryRowContext(ctx, query, token).Scan(&verificationToken.ID, &verificationToken.UserID, &verificationToken.CreatedAt, &verificationToken.UpdatedAt)
	}

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}

	return verificationToken, nil
}

func (r *verificationTokenRepositoryImpl) Save(ctx context.Context, verificationToken *entity.VerificationToken) error {
	query := `
		insert into token_verification_users(user_id, verification_token) values($1, $2) returning id, created_at, updated_at
	`
	tx := transactor.ExtractTx(ctx)

	var err error
	if tx != nil {
		err = tx.QueryRowContext(ctx, query, verificationToken.UserID, verificationToken.VerificationToken).Scan(
			&verificationToken.ID,
			&verificationToken.CreatedAt,
			&verificationToken.UpdatedAt,
		)
	} else {
		err = r.db.QueryRowContext(ctx, query, verificationToken.UserID, verificationToken.VerificationToken).Scan(
			&verificationToken.ID,
			&verificationToken.CreatedAt,
			&verificationToken.UpdatedAt,
		)
	}

	return err
}

func (r *verificationTokenRepositoryImpl) DeleteByUserID(ctx context.Context, userID int64) error {
	query := `
		update token_verification_users set updated_at = now(), deleted_at = now() 
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
