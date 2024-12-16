package repository

import (
	"context"
	"database/sql"

	"healthcare-app/pkg/database/transactor"
)

type ProductClassificationRepository interface {
	IsExistsByID(ctx context.Context, id int64) bool
}

type productClassificationRepositoryImpl struct {
	db *sql.DB
}

func NewProductClassificationRepository(db *sql.DB) *productClassificationRepositoryImpl {
	return &productClassificationRepositoryImpl{
		db: db,
	}
}

func (r *productClassificationRepositoryImpl) IsExistsByID(ctx context.Context, id int64) bool {
	query := `
		select exists(select 1 from product_classifications where id = $1)	
	`
	tx := transactor.ExtractTx(ctx)

	var (
		err   error
		exist bool
	)
	if tx != nil {
		err = tx.QueryRowContext(ctx, query, id).Scan(&exist)
	} else {
		err = r.db.QueryRowContext(ctx, query, id).Scan(&exist)
	}

	if err != nil {
		return false
	}
	return exist
}
