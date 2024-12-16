package repository

import (
	"context"
	"database/sql"

	"healthcare-app/internal/report/dto"
	"healthcare-app/internal/report/entity"
	"healthcare-app/pkg/database/transactor"
)

type SalesRepository interface {
	FindAllCategorySales(ctx context.Context, request *dto.SearchSalesRequest) ([]*entity.CategorySales, error)
	FindAllClassificationSales(ctx context.Context, request *dto.SearchSalesRequest) ([]*entity.ClassificationSales, error)
}

type salesRepositoryImpl struct {
	db *sql.DB
}

func NewSalesRepository(db *sql.DB) *salesRepositoryImpl {
	return &salesRepositoryImpl{
		db: db,
	}
}

func (r *salesRepositoryImpl) FindAllCategorySales(ctx context.Context, request *dto.SearchSalesRequest) ([]*entity.CategorySales, error) {
	tx := transactor.ExtractTx(ctx)

	query := `
	select 
		ph.id,
		ph.name,
		cp.name,
		SUM(op.price * op.quantity) total_product_price,
		SUM(op.quantity) total_item
	from
		order_products op
	join 
		pharmacy_products pp on op.pharmacy_product_id = pp.id
	join 
		products p on pp.product_id = p.id
	join 
		product_categories pc on p.id = pc.product_id
	join 
		category_products cp on pc.category_id = cp.id
	join 
		orders o on op.order_id = o.id
	join 
		pharmacies ph on pp.pharmacy_id = ph.id
	where 
		o.created_at between $1 and $2
		and (coalesce(array_length($3::bigint[], 1), 0) = 0 OR p.id = any($3::bigint[]))
		and (coalesce(array_length($4::bigint[], 1), 0) = 0 OR cp.id = any($4::bigint[]))
		and (coalesce(array_length($5::bigint[], 1), 0) = 0 OR ph.id = any($5::bigint[]))
	group by 
		ph.id, cp.name
	`
	args := []any{request.StartDate, request.EndDate, request.Product, request.ProductCategory, request.Pharmacy}

	var (
		err  error
		rows *sql.Rows
	)
	if tx != nil {
		rows, err = tx.QueryContext(ctx, query, args...)
	} else {
		rows, err = r.db.QueryContext(ctx, query, args...)
	}

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	entities := []*entity.CategorySales{}
	for rows.Next() {
		entity := new(entity.CategorySales)
		if err := rows.Scan(&entity.PharmacyID, &entity.PharmacyName, &entity.CategoryName, &entity.TotalAmount, &entity.TotalItem); err != nil {
			return nil, err
		}
		entities = append(entities, entity)
	}

	err = rows.Err()
	if err != nil {
		return nil, err
	}

	return entities, nil
}

func (r *salesRepositoryImpl) FindAllClassificationSales(ctx context.Context, request *dto.SearchSalesRequest) ([]*entity.ClassificationSales, error) {
	tx := transactor.ExtractTx(ctx)

	query := `
	select 
		ph.id,
		ph.name,
		pc.name,
		SUM(op.price * op.quantity) total_product_price,
		SUM(op.quantity) total_item
	from
		order_products op
	join 
		pharmacy_products pp on op.pharmacy_product_id = pp.id
	join 
		products p on pp.product_id = p.id
	join 
		product_classifications pc ON p.product_classification_id = pc.id
	join 
		orders o on op.order_id = o.id
	join 
		pharmacies ph on pp.pharmacy_id = ph.id
	where 
		o.created_at between $1 and $2
		and (coalesce(array_length($3::bigint[], 1), 0) = 0 OR p.id = any($3::bigint[]))
		and (coalesce(array_length($4::bigint[], 1), 0) = 0 OR pc.id = any($4::bigint[]))
		and (coalesce(array_length($5::bigint[], 1), 0) = 0 OR ph.id = any($5::bigint[]))
	group by 
		ph.id, pc.name
	`
	args := []any{request.StartDate, request.EndDate, request.Product, request.ProductClassification, request.Pharmacy}

	var (
		err  error
		rows *sql.Rows
	)
	if tx != nil {
		rows, err = tx.QueryContext(ctx, query, args...)
	} else {
		rows, err = r.db.QueryContext(ctx, query, args...)
	}

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	entities := []*entity.ClassificationSales{}
	for rows.Next() {
		entity := new(entity.ClassificationSales)
		if err := rows.Scan(&entity.PharmacyID, &entity.PharmacyName, &entity.ClassificationName, &entity.TotalAmount, &entity.TotalItem); err != nil {
			return nil, err
		}
		entities = append(entities, entity)
	}

	err = rows.Err()
	if err != nil {
		return nil, err
	}

	return entities, nil
}
