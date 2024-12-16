package repository

import (
	"context"
	"database/sql"
	"fmt"

	"healthcare-app/internal/product/dto"
	"healthcare-app/internal/product/entity"
	"healthcare-app/pkg/database/transactor"
)

type ProductFormRepository interface {
	IsExistsByID(ctx context.Context, id int64) bool
	Search(ctx context.Context, request *dto.SearchProductFormRequest) ([]*entity.ProductForm, error)
}

type productFormRepositoryImpl struct {
	db *sql.DB
}

func NewProductFormRepository(db *sql.DB) *productFormRepositoryImpl {
	return &productFormRepositoryImpl{
		db: db,
	}
}

func (r *productFormRepositoryImpl) IsExistsByID(ctx context.Context, id int64) bool {
	query := `
		select exists(select 1 from product_forms where id = $1)	
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

func (r *productFormRepositoryImpl) Search(ctx context.Context, request *dto.SearchProductFormRequest) ([]*entity.ProductForm, error) {
	tx := transactor.ExtractTx(ctx)

	query := `select id, name from product_forms`
	if request.Q != "" {
		query = fmt.Sprintf("%v where name ilike '%%%v%%'", query, request.Q)
	}

	var (
		err  error
		rows *sql.Rows
	)
	if tx != nil {
		rows, err = tx.QueryContext(ctx, query)
	} else {
		rows, err = r.db.QueryContext(ctx, query)
	}

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	entities := []*entity.ProductForm{}
	for rows.Next() {
		entity := new(entity.ProductForm)
		if err := rows.Scan(&entity.ID, &entity.Name); err != nil {
			return nil, err
		}
		entities = append(entities, entity)
	}

	err = rows.Err()
	if err != nil {
		return nil, err
	}

	return entities, err
}
