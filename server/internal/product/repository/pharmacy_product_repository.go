package repository

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"strings"

	apperrorProduct "healthcare-app/internal/product/apperror"
	"healthcare-app/internal/product/dto"
	"healthcare-app/internal/product/entity"
	apperrorPkg "healthcare-app/pkg/apperror"
	"healthcare-app/pkg/database/transactor"

	"github.com/jackc/pgx/v5/pgconn"
)

type PharmacyProductRepository interface {
	IsPharmacistRelated(ctx context.Context, pharmacistID, pharmacyID int64) bool
	IsBeenBought(ctx context.Context, id int64) bool
	IsStockUpdated(ctx context.Context, id int64) bool
	Search(ctx context.Context, request *dto.SearchPharmacyProductRequest) ([]*entity.PharmacyProduct, error)
	FindByID(ctx context.Context, id int64, pharmacyID int64) (*entity.PharmacyProduct, error)
	IsPharmacyActive(ctx context.Context, id int64) bool
	Save(ctx context.Context, entity *entity.PharmacyProduct) error
	Update(ctx context.Context, entity *entity.PharmacyProduct) error
	UpdateSoldAmount(ctx context.Context, entity *entity.PharmacyProduct) error
	Delete(ctx context.Context, id, pharmacyID int64) error
	UpdateStockAndSoldAmount(ctx context.Context, quantity int, pharmacyProductId int64, pharmacyId int64, stockQuantity int, soldAmount int) error
}

type pharmacyProductRepositoryImpl struct {
	db *sql.DB
}

func NewPharmacyProductRepository(db *sql.DB) *pharmacyProductRepositoryImpl {
	return &pharmacyProductRepositoryImpl{
		db: db,
	}
}

func (r *pharmacyProductRepositoryImpl) IsPharmacistRelated(ctx context.Context, pharmacistID, pharmacyID int64) bool {
	query := `
	select exists(select 1 from users u join pharmacies p on u.id = p.pharmacist_id where p.pharmacist_id = $1 and p.id = $2)
	`
	tx := transactor.ExtractTx(ctx)

	var (
		err    error
		exists bool
	)
	if tx != nil {
		err = tx.QueryRowContext(ctx, query, pharmacistID, pharmacyID).Scan(&exists)
	} else {
		err = r.db.QueryRowContext(ctx, query, pharmacistID, pharmacyID).Scan(&exists)
	}

	if err != nil {
		return false
	}

	return exists
}

func (r *pharmacyProductRepositoryImpl) IsBeenBought(ctx context.Context, id int64) bool {
	query := `
		select exists(select 1 from order_products where pharmacy_product_id = $1)
	`
	tx := transactor.ExtractTx(ctx)

	var (
		err    error
		exists bool
	)
	if tx != nil {
		err = tx.QueryRowContext(ctx, query, id).Scan(&exists)
	} else {
		err = r.db.QueryRowContext(ctx, query, id).Scan(&exists)
	}

	if err != nil {
		return false
	}
	return exists
}

func (r *pharmacyProductRepositoryImpl) IsStockUpdated(ctx context.Context, id int64) bool {
	query := `
		select exists(select 1 from pharmacy_products where id = $1 and date(stock_quantity_updated_at) = current_date)
	`
	tx := transactor.ExtractTx(ctx)

	var (
		err    error
		exists bool
	)
	if tx != nil {
		err = tx.QueryRowContext(ctx, query, id).Scan(&exists)
	} else {
		err = r.db.QueryRowContext(ctx, query, id).Scan(&exists)
	}

	if err != nil {
		return false
	}
	return exists
}

func (r *pharmacyProductRepositoryImpl) IsPharmacyActive(ctx context.Context, id int64) bool {
	var (
		isActive bool
		err      error
	)

	query := `
		select exists(select 1 from pharmacies where id = $1 and pharmacies.is_active is true)	`

	tx := transactor.ExtractTx(ctx)

	if tx != nil {
		err = tx.QueryRowContext(ctx, query, id).Scan(&isActive)
	} else {
		err = r.db.QueryRowContext(ctx, query, id).Scan(&isActive)
	}

	if err != nil {
		return false
	}

	return isActive
}

func (r *pharmacyProductRepositoryImpl) Search(ctx context.Context, request *dto.SearchPharmacyProductRequest) ([]*entity.PharmacyProduct, error) {
	tx := transactor.ExtractTx(ctx)

	query := `
	select 
		pp.id, 
		pp.stock_quantity, 
		pp.price, 
		pp.sold_amount, 
		pp.is_active, 
		pp.created_at, 
		m.id manufacture_id, 
		m.name manufacture_name, 
		pc.id product_classification_id, 
		pc.name product_classification_name, 
		pf.id product_form_id, 
		pf.name product_form_name, 
		p.id product_id, 
		p.name product_name, 
		p.generic_name, 
		p.description, 
		p.thumbnail_url, 
		p.image_url, 
		p.is_active product_is_active
	from 
		(select * from pharmacy_products where pharmacy_id = $1 and deleted_at is null) pp
	join 
		products p ON pp.product_id = p.id
	join 
		manufactures m ON p.manufacture_id = m.id
	join 
		product_classifications pc ON p.product_classification_id = pc.id
	left join 
		product_forms pf ON p.product_form_id = pf.id
	`

	var args []any
	args = append(args, request.PharmacistID)

	queryBuilder := strings.Builder{}
	queryBuilder.WriteString(query)

	whereAdded := false
	addCondition := func(condition string, arg any) {
		if whereAdded {
			queryBuilder.WriteString(" and ")
		} else {
			queryBuilder.WriteString(" where ")
			whereAdded = true
		}
		queryBuilder.WriteString(condition)
		args = append(args, arg)
	}

	if request.Name != "" {
		addCondition(fmt.Sprintf("p.name ilike $%d", len(args)+1), fmt.Sprintf("%%%s%%", request.Name))
	}
	if request.GenericName != "" {
		addCondition(fmt.Sprintf("p.generic_name ilike $%d", len(args)+1), fmt.Sprintf("%%%s%%", request.GenericName))
	}
	if request.IsActive != "" {
		addCondition(fmt.Sprintf("pp.is_active = $%d", len(args)+1), request.IsActive)
	}
	if len(request.ProductClassification) != 0 {
		addCondition(fmt.Sprintf("pc.id = any($%d)", len(args)+1), request.ProductClassification)
	}
	if len(request.ProductForm) != 0 {
		addCondition(fmt.Sprintf("pf.id = any($%d)", len(args)+1), request.ProductForm)
	}
	if len(request.Manufacturer) != 0 {
		addCondition(fmt.Sprintf("m.id = any($%d)", len(args)+1), request.Manufacturer)
	}

	if len(request.SortBy) > 0 {
		queryBuilder.WriteString(" order by ")
		for i, ord := range request.SortBy {
			if i > 0 {
				queryBuilder.WriteString(", ")
			}
			queryBuilder.WriteString(fmt.Sprintf("%s %s", ord, request.Sort[i]))
		}
	}

	var (
		err  error
		rows *sql.Rows
	)
	if tx != nil {
		rows, err = tx.QueryContext(ctx, queryBuilder.String(), args...)
	} else {
		rows, err = r.db.QueryContext(ctx, queryBuilder.String(), args...)
	}

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	entites := []*entity.PharmacyProduct{}
	for rows.Next() {
		entity := &entity.PharmacyProduct{Product: entity.Product{Manufacture: entity.Manufacture{}, ProductClassification: entity.ProductClassification{}, ProductForm: &entity.ProductForm{}}}
		if err := rows.Scan(
			&entity.ID,
			&entity.StockQuantity,
			&entity.Price,
			&entity.SoldAmount,
			&entity.IsActive,
			&entity.CreatedAt,
			&entity.Product.Manufacture.ID,
			&entity.Product.Manufacture.Name,
			&entity.Product.ProductClassification.ID,
			&entity.Product.ProductClassification.Name,
			&entity.Product.ProductForm.ID,
			&entity.Product.ProductForm.Name,
			&entity.Product.ID,
			&entity.Product.Name,
			&entity.Product.GenericName,
			&entity.Product.Description,
			&entity.Product.ThumbnailURL,
			&entity.Product.ImageURL,
			&entity.Product.IsActive,
		); err != nil {
			return nil, err
		}
		entites = append(entites, entity)
	}

	err = rows.Err()
	if err != nil {
		return nil, err
	}
	return entites, nil
}

func (r *pharmacyProductRepositoryImpl) FindByID(ctx context.Context, id int64, pharmacyID int64) (*entity.PharmacyProduct, error) {
	query := `
		select pp.id, pp.stock_quantity, pp.price, pp.sold_amount, pp.is_active, pp.created_at, m.id, m.name, pc.id, pc.name, pf.id, pf.name, p.id, p.name, p.generic_name, p.description, p.thumbnail_url, p.image_url, p.is_active
		from pharmacy_products pp 
		join products p on pp.product_id = p.id
		join manufactures m on p.manufacture_id = m.id 
		join product_classifications pc on p.product_classification_id = pc.id 
		left join product_forms pf on p.product_form_id = pf.id
		where pp.id = $1 and pp.pharmacy_id = $2 and p.deleted_at is null
	`
	tx := transactor.ExtractTx(ctx)

	var (
		err    error
		entity = &entity.PharmacyProduct{ID: id, Product: entity.Product{Manufacture: entity.Manufacture{}, ProductClassification: entity.ProductClassification{}, ProductForm: &entity.ProductForm{}}}
	)
	if tx != nil {
		err = tx.QueryRowContext(ctx, query, id, pharmacyID).Scan(
			&entity.ID,
			&entity.StockQuantity,
			&entity.Price,
			&entity.SoldAmount,
			&entity.IsActive,
			&entity.CreatedAt,
			&entity.Product.Manufacture.ID,
			&entity.Product.Manufacture.Name,
			&entity.Product.ProductClassification.ID,
			&entity.Product.ProductClassification.Name,
			&entity.Product.ProductForm.ID,
			&entity.Product.ProductForm.Name,
			&entity.Product.ID,
			&entity.Product.Name,
			&entity.Product.GenericName,
			&entity.Product.Description,
			&entity.Product.ThumbnailURL,
			&entity.Product.ImageURL,
			&entity.Product.IsActive,
		)
	} else {
		err = r.db.QueryRowContext(ctx, query, id, pharmacyID).Scan(
			&entity.ID,
			&entity.StockQuantity,
			&entity.Price,
			&entity.SoldAmount,
			&entity.IsActive,
			&entity.CreatedAt,
			&entity.Product.Manufacture.ID,
			&entity.Product.Manufacture.Name,
			&entity.Product.ProductClassification.ID,
			&entity.Product.ProductClassification.Name,
			&entity.Product.ProductForm.ID,
			&entity.Product.ProductForm.Name,
			&entity.Product.ID,
			&entity.Product.Name,
			&entity.Product.GenericName,
			&entity.Product.Description,
			&entity.Product.ThumbnailURL,
			&entity.Product.ImageURL,
			&entity.Product.IsActive,
		)
	}

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, apperrorPkg.NewEntityNotFoundError("pharmacy product")
		}
		return nil, err
	}

	return entity, nil
}

func (r *pharmacyProductRepositoryImpl) Save(ctx context.Context, entity *entity.PharmacyProduct) error {
	query := `
		insert into pharmacy_products(pharmacy_id, product_id, stock_quantity, price) values ($1, $2, $3, $4) returning id, created_at
	`
	tx := transactor.ExtractTx(ctx)

	var err error
	if tx != nil {
		err = tx.QueryRowContext(
			ctx,
			query,
			entity.PharmacyId,
			entity.Product.ID,
			entity.StockQuantity,
			entity.Price,
		).Scan(&entity.ID, &entity.CreatedAt)
	} else {
		err = r.db.QueryRowContext(
			ctx,
			query,
			entity.PharmacyId,
			entity.Product.ID,
			entity.StockQuantity,
			entity.Price,
		).Scan(&entity.ID, &entity.CreatedAt)
	}

	if err, ok := err.(*pgconn.PgError); ok {
		if err.SQLState() == "23505" {
			return apperrorProduct.NewPharmacyProductAlreadyExistsError()
		}
	}

	return err
}

func (r *pharmacyProductRepositoryImpl) Update(ctx context.Context, entity *entity.PharmacyProduct) error {
	query := `
		update pharmacy_products set stock_quantity = $3, is_active = $4, updated_at = now()
	`
	if entity.StockQuantityUpdatedAt != nil {
		query = fmt.Sprintf("%v, stock_quantity_updated_at = now()", query)
	}
	query = fmt.Sprintf("%v where id = $1 and pharmacy_id = $2 and deleted_at is null", query)
	tx := transactor.ExtractTx(ctx)

	var (
		err    error
		result sql.Result
	)
	if tx != nil {
		result, err = tx.ExecContext(
			ctx,
			query,
			entity.ID,
			entity.PharmacyId,
			entity.StockQuantity,
			entity.IsActive,
		)
	} else {
		result, err = r.db.ExecContext(
			ctx,
			query,
			entity.ID,
			entity.PharmacyId,
			entity.StockQuantity,
			entity.IsActive,
		)
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		return apperrorPkg.NewEntityNotFoundError("pharmacy product")
	}

	return err
}

func (r *pharmacyProductRepositoryImpl) UpdateSoldAmount(ctx context.Context, entity *entity.PharmacyProduct) error {
	query := `
		update pharmacy_products set sold_amount = sold_amount + $2, updated_at = now()
		where id = $1 and deleted_at is null
	`
	tx := transactor.ExtractTx(ctx)

	var (
		err    error
		result sql.Result
	)
	if tx != nil {
		result, err = tx.ExecContext(
			ctx,
			query,
			entity.ID,
			entity.SoldAmount,
		)
	} else {
		result, err = r.db.ExecContext(
			ctx,
			query,
			entity.ID,
			entity.SoldAmount,
		)
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		return apperrorPkg.NewEntityNotFoundError("pharmacy product")
	}

	return err
}

func (r *pharmacyProductRepositoryImpl) Delete(ctx context.Context, id, pharmacyID int64) error {
	query := `
		update pharmacy_products set updated_at = now(), deleted_at = now() where id = $1 and pharmacy_id = $2 and deleted_at is null
	`
	tx := transactor.ExtractTx(ctx)

	var (
		err    error
		result sql.Result
	)
	if tx != nil {
		result, err = tx.ExecContext(
			ctx,
			query,
			id,
			pharmacyID,
		)
	} else {
		result, err = r.db.ExecContext(
			ctx,
			query,
			id,
			pharmacyID,
		)
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		return apperrorPkg.NewEntityNotFoundError("pharmacy product")
	}

	return err
}

func (r *pharmacyProductRepositoryImpl) UpdateStockAndSoldAmount(ctx context.Context, quantity int, pharmacyProductId int64, pharmacyId int64, stockQuantity int, soldAmount int) error {
	query := `
		update pharmacy_products
		set stock_quantity = $1,
			sold_amount = $2,
			updated_at = now()
		where id = $3 AND pharmacy_id = $4 and deleted_at is null
	`
	tx := transactor.ExtractTx(ctx)
	var (
		err error
	)
	if tx != nil {
		_, err = tx.ExecContext(ctx, query, stockQuantity-quantity, soldAmount+quantity, pharmacyProductId, pharmacyId)
	} else {
		_, err = r.db.ExecContext(ctx, query, stockQuantity-quantity, soldAmount+quantity, pharmacyProductId, pharmacyId)
	}
	return err
}
