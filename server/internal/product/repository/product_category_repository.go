package repository

import (
	"context"
	"database/sql"
	"errors"
	"fmt"

	dtoProduct "healthcare-app/internal/product/dto"
	entityProduct "healthcare-app/internal/product/entity"
	"healthcare-app/pkg/database/transactor"
)

type ProductCategoryRepository interface {
	GetAllCategories(ctx context.Context, query string, sortBy string, sort string, operator string) ([]entityProduct.ProductCategory, error)
	PostProductCategory(ctx context.Context, reqBody string) (*entityProduct.ProductCategory, error)
	FindCategoryByID(ctx context.Context, id int64) (*entityProduct.ProductCategory, error)
	PutProductCategory(ctx context.Context, req *dtoProduct.UpdateProductCategoryRequest) (*entityProduct.ProductCategory, error)
	DeleteProductCategory(ctx context.Context, id int64) error
}

type productCategoryRepositoryImpl struct {
	db *sql.DB
}

func NewProductCategoryRepository(db *sql.DB) *productCategoryRepositoryImpl {
	return &productCategoryRepositoryImpl{
		db: db,
	}
}

func (pc *productCategoryRepositoryImpl) GetAllCategories(ctx context.Context, query string, sortBy string, sort string, operator string) ([]entityProduct.ProductCategory, error) {
	querySql := `
		SELECT
			cp.id ,
			cp."name" ,
			cp.created_at ,
			cp.updated_at 
		FROM category_products cp 
	`
	if operator == "ilike" {
		querySql += " WHERE cp.name ILIKE $1"
	} else {
		querySql += " WHERE cp.name LIKE $1"
	}
	querySql += fmt.Sprintf(" ORDER BY cp.%s %s", sortBy, sort)
	searchKey := "%" + query + "%"
	tx := transactor.ExtractTx(ctx)
	var err error
	var rows *sql.Rows
	if tx != nil {
		rows, err = tx.QueryContext(ctx, querySql, searchKey)
	} else {
		rows, err = pc.db.QueryContext(ctx, querySql, searchKey)
	}
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	defer rows.Close()
	var dataAllCategories []entityProduct.ProductCategory = []entityProduct.ProductCategory{}
	for rows.Next() {
		var category entityProduct.ProductCategory
		err := rows.Scan(
			&category.ID, &category.Name, &category.CreatedAt, &category.UpdatedAt,
		)
		if err != nil {
			if errors.Is(err, sql.ErrNoRows) {
				return dataAllCategories, nil
			}
			return nil, err
		}
		dataAllCategories = append(dataAllCategories, category)
	}
	return dataAllCategories, nil
}

func (pc *productCategoryRepositoryImpl) PostProductCategory(ctx context.Context, reqBody string) (*entityProduct.ProductCategory, error) {
	querySql := `
        INSERT INTO category_products (name, created_at, updated_at)
        VALUES ($1, NOW(), NOW())
        RETURNING id, name, created_at, updated_at
    `

	tx := transactor.ExtractTx(ctx)
	var err error
	var categoryRes entityProduct.ProductCategory
	if tx != nil {
		err = tx.QueryRowContext(ctx, querySql, reqBody).Scan(
			&categoryRes.ID,
			&categoryRes.Name,
			&categoryRes.CreatedAt,
			&categoryRes.UpdatedAt,
		)
	} else {
		err = pc.db.QueryRowContext(ctx, querySql, reqBody).Scan(
			&categoryRes.ID,
			&categoryRes.Name,
			&categoryRes.CreatedAt,
			&categoryRes.UpdatedAt,
		)
	}
	if err != nil {
		return nil, err
	}
	return &categoryRes, nil
}

func (pc *productCategoryRepositoryImpl) PutProductCategory(ctx context.Context, req *dtoProduct.UpdateProductCategoryRequest) (*entityProduct.ProductCategory, error) {
	querySql := `
        UPDATE category_products
		SET name = $1,
			updated_at = NOW()
		WHERE id = $2
		RETURNING id, name, created_at, updated_at
    `
	tx := transactor.ExtractTx(ctx)
	var err error
	var categoryRes entityProduct.ProductCategory
	if tx != nil {
		err = tx.QueryRowContext(ctx, querySql, req.Name, req.ID).Scan(
			&categoryRes.ID,
			&categoryRes.Name,
			&categoryRes.CreatedAt,
			&categoryRes.UpdatedAt,
		)
	} else {
		err = pc.db.QueryRowContext(ctx, querySql, req.Name, req.ID).Scan(
			&categoryRes.ID,
			&categoryRes.Name,
			&categoryRes.CreatedAt,
			&categoryRes.UpdatedAt,
		)
	}
	if err != nil {
		return nil, err
	}
	return &categoryRes, nil
}

func (r *productCategoryRepositoryImpl) FindCategoryByID(ctx context.Context, id int64) (*entityProduct.ProductCategory, error) {
	querySql := `
		SELECT 
			cp.id,
			cp."name",
			cp.created_at,
			cp.updated_at
		FROM category_products cp
		WHERE cp.id = $1 
	`
	tx := transactor.ExtractTx(ctx)
	var category entityProduct.ProductCategory
	var err error
	if tx != nil {
		err = tx.QueryRowContext(ctx, querySql, id).Scan(
			&category.ID,
			&category.Name,
			&category.CreatedAt,
			&category.UpdatedAt,
		)
	} else {
		err = r.db.QueryRowContext(ctx, querySql, id).Scan(
			&category.ID,
			&category.Name,
			&category.CreatedAt,
			&category.UpdatedAt,
		)
	}
	if err != nil {
		return nil, err
	}
	return &category, nil
}

func (pc *productCategoryRepositoryImpl) DeleteProductCategory(ctx context.Context, id int64) error {
	query := `DELETE FROM category_products WHERE id = $1`
	tx := transactor.ExtractTx(ctx)
	var err error
	if tx != nil {
		_, err = tx.ExecContext(ctx, query, id)
	} else {
		_, err = pc.db.ExecContext(ctx, query, id)
	}
	if err != nil {
		return err
	}
	return nil
}
