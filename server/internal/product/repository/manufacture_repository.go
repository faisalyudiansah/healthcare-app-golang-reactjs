package repository

import (
	"context"
	"database/sql"
	"fmt"

	"healthcare-app/internal/product/dto"
	"healthcare-app/internal/product/entity"
	"healthcare-app/pkg/database/transactor"
)

type ManufactureRepository interface {
	IsExistsByID(ctx context.Context, id int64) bool
	Search(ctx context.Context, request *dto.SearchManufactureRequest) ([]*entity.Manufacture, error)
}

type manufactureRepositoryImpl struct {
	db *sql.DB
}

func NewManufactureRepository(db *sql.DB) *manufactureRepositoryImpl {
	return &manufactureRepositoryImpl{
		db: db,
	}
}

func (r *manufactureRepositoryImpl) IsExistsByID(ctx context.Context, id int64) bool {
	query := `
	select exists(select 1 from manufactures where id = $1)	
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

func (r *manufactureRepositoryImpl) Search(ctx context.Context, request *dto.SearchManufactureRequest) ([]*entity.Manufacture, error) {
	tx := transactor.ExtractTx(ctx)

	query := `select id, name from manufactures`
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

	entities := []*entity.Manufacture{}
	for rows.Next() {
		entity := new(entity.Manufacture)
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
