package repository

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"strconv"
	"strings"

	"healthcare-app/internal/product/dto"
	"healthcare-app/internal/product/entity"
	"healthcare-app/pkg/database/transactor"
)

type UserProductRepository interface {
	Search(ctx context.Context, request *dto.UserSearchProductRequest) ([]*entity.Product, error)
	FindAllByCategoryID(ctx context.Context, categoryID int64) ([]*entity.Product, error)
	FindByID(ctx context.Context, id int64) (*entity.Product, error)
	FindPharmacyByPharmacyProductID(ctx context.Context, id int64) (*entity.Pharmacy, error)
}

type userProductRepositoryImpl struct {
	db *sql.DB
}

func NewUserProductRepository(db *sql.DB) *userProductRepositoryImpl {
	return &userProductRepositoryImpl{
		db: db,
	}
}

func (r *userProductRepositoryImpl) Search(ctx context.Context, request *dto.UserSearchProductRequest) ([]*entity.Product, error) {
	tx := transactor.ExtractTx(ctx)
	query := `
		with filtered_products as (
			select
				p.product_classification_id,
				p.id, 
				p.name, 
				p.selling_unit, 
				p.sold_amount, 
				pp.id pharmacy_product_id,
				pp.price,
				pp.stock_quantity,
				p.thumbnail_url,
				row_number() over (partition by pp.product_id order by pp.price asc) as rank
			from products p 
			join pharmacy_products pp on pp.product_id = p.id
			join pharmacies ph on ph.id = pp.pharmacy_id
			join pharmacy_partners pa on pa.id = ph.partner_id
			where 
				CURRENT_TIME BETWEEN pa.start_opt AND pa.end_opt
				and p.deleted_at is null 
				and pp.is_active = true
	`
	args := []any{}
	queryBuilder := strings.Builder{}
	queryBuilder.WriteString(query)

	if request.Name != "" {
		queryBuilder.WriteString(fmt.Sprintf(" and p.name ilike $%v", len(args)+1))
		args = append(args, fmt.Sprintf(iLike, request.Name))
	}
	if request.GenericName != "" {
		queryBuilder.WriteString(fmt.Sprintf(" and p.generic_name ilike $%v", len(args)+1))
		args = append(args, fmt.Sprintf(iLike, request.GenericName))
	}

	queryBuilder.WriteString(`
		), ranked_filtered_products as (
			select * from filtered_products
			where rank = 1
			limit 500
		)
		select 
			pc.id,
			pc.name,
			rfp.pharmacy_product_id,
			rfp.id, 
			rfp.name, 
			rfp.selling_unit, 
			rfp.sold_amount, 
			rfp.price, 
			rfp.stock_quantity, 
			rfp.thumbnail_url
		from ranked_filtered_products rfp
		join product_classifications pc on pc.id = rfp.product_classification_id 
	`)

	if len(request.ProductClassification) != 0 {
		queryBuilder.WriteString(fmt.Sprintf(" and pc.id = any($%v)", len(args)+1))
		args = append(args, request.ProductClassification)
	}

	queryBuilder.WriteString(fmt.Sprintf(" order by %s %s", request.SortBy, request.Sort))

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

	products := []*entity.Product{}
	for rows.Next() {
		product := new(entity.Product)
		if err := rows.Scan(
			&product.ProductClassification.ID,
			&product.ProductClassification.Name,
			&product.PharmacyProductID,
			&product.ID,
			&product.Name,
			&product.SellingUnit,
			&product.SoldAmount,
			&product.Price,
			&product.StockQuantity,
			&product.ThumbnailURL,
		); err != nil {
			return nil, err
		}
		products = append(products, product)
	}

	err = rows.Err()
	if err != nil {
		return nil, err
	}

	return products, nil
}

func (r *userProductRepositoryImpl) FindAllByCategoryID(ctx context.Context, categoryID int64) ([]*entity.Product, error) {
	query := `
		WITH filtered_products AS (
			SELECT
				product_id
			FROM
				product_categories
			WHERE 
				category_id = $1
		), cheapest_products AS (
			SELECT 
				pp.pharmacy_id pharmacy_id,
				p.product_classification_id,
				p.id, 
				p.name, 
				p.selling_unit, 
				p.sold_amount, 
				pp.id pharmacy_product_id,
				pp.price,
				pp.stock_quantity,
				p.thumbnail_url,
				ROW_NUMBER() OVER (PARTITION BY pp.product_id ORDER BY pp.price ASC) AS rank
			FROM filtered_products fp
			JOIN products p ON p.id = fp.product_id 
			JOIN pharmacy_products pp ON pp.product_id = p.id
			WHERE p.deleted_at IS NULL AND pp.is_active = true
		), ranked_filtered_products AS(
			SELECT
				*
			FROM
				cheapest_products
			WHERE
				rank = 1
			LIMIT 500
		)
		SELECT 
			pc.id,
			pc.name,
			rfp.pharmacy_product_id,
			rfp.id, 
			rfp.name, 
			rfp.selling_unit, 
			rfp.sold_amount, 
			rfp.price, 
			rfp.stock_quantity, 
			rfp.thumbnail_url
		FROM ranked_filtered_products rfp
		JOIN product_classifications pc ON pc.id = rfp.product_classification_id 
		JOIN pharmacies ph ON ph.id = rfp.pharmacy_id
		JOIN pharmacy_partners pa ON pa.id = ph.partner_id
		WHERE 
			CURRENT_TIME BETWEEN pa.start_opt AND pa.end_opt
	`
	tx := transactor.ExtractTx(ctx)

	var (
		err  error
		rows *sql.Rows
	)
	if tx != nil {
		rows, err = tx.QueryContext(ctx, query, categoryID)
	} else {
		rows, err = r.db.QueryContext(ctx, query, categoryID)
	}

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	products := []*entity.Product{}
	for rows.Next() {
		product := new(entity.Product)
		if err := rows.Scan(
			&product.ProductClassification.ID,
			&product.ProductClassification.Name,
			&product.PharmacyProductID,
			&product.ID,
			&product.Name,
			&product.SellingUnit,
			&product.SoldAmount,
			&product.Price,
			&product.StockQuantity,
			&product.ThumbnailURL,
		); err != nil {
			return nil, err
		}
		products = append(products, product)
	}

	err = rows.Err()
	if err != nil {
		return nil, err
	}

	return products, nil
}

func (r *userProductRepositoryImpl) FindByID(ctx context.Context, id int64) (*entity.Product, error) {
	query := `
		with cheapest_product as (
			select id, price, stock_quantity, product_id 
			from (
				select id, product_id, price, stock_quantity, row_number() over (partition by product_id order by price asc) as rank
				from pharmacy_products
				where product_id = $1
			) as ranked_product where rank = 1
		)
		select 
			m.id, m.name, 
			pc.id, pc.name, 
			pf.id, pf.name, chp.id,
			p.id, p.name, p.generic_name, p.description, 
			p.unit_in_pack, p.selling_unit, p.sold_amount, chp.price, chp.stock_quantity,
			p.height, p.weight, p.length, p.width, 
			p.thumbnail_url, p.image_url, p.secondary_image_url, p.tertiary_image_url, 
			p.is_active, p.created_at, 
			coalesce(string_agg(cp.id::TEXT, ','), ''), 
			coalesce(string_agg(cp.name, ','), '')
		from 
			products p 
		join 
			cheapest_product chp on chp.product_id = p.id
		join 
			manufactures m ON p.manufacture_id = m.id 
		join 
			product_classifications pc ON p.product_classification_id = pc.id 
		left join 
			product_forms pf ON p.product_form_id = pf.id 
		left join 
			product_categories pcg ON p.id = pcg.product_id 
		left join 
			category_products cp ON pcg.category_id = cp.id 
		where 
			p.id = $1 
			AND p.deleted_at is null
		group by 
			m.id, pc.id, pf.id, p.id, chp.id, chp.price, chp.stock_quantity
	`
	tx := transactor.ExtractTx(ctx)

	var (
		err           error
		product       = &entity.Product{ID: id, Manufacture: entity.Manufacture{}, ProductClassification: entity.ProductClassification{}, ProductForm: &entity.ProductForm{}, ProductCategories: []*entity.ProductCategory{}}
		categoryIDs   string
		categoryNames string
	)

	if tx != nil {
		err = tx.QueryRowContext(ctx, query, id).Scan(
			&product.Manufacture.ID,
			&product.Manufacture.Name,
			&product.ProductClassification.ID,
			&product.ProductClassification.Name,
			&product.PharmacyProductID,
			&product.ProductForm.ID,
			&product.ProductForm.Name,
			&product.ID,
			&product.Name,
			&product.GenericName,
			&product.Description,
			&product.UnitInPack,
			&product.SellingUnit,
			&product.SoldAmount,
			&product.Price,
			&product.StockQuantity,
			&product.Height,
			&product.Weight,
			&product.Length,
			&product.Width,
			&product.ThumbnailURL,
			&product.ImageURL,
			&product.SecondaryImageURL,
			&product.TertiaryImageURL,
			&product.IsActive,
			&product.CreatedAt,
			&categoryIDs,
			&categoryNames,
		)
	} else {
		err = r.db.QueryRowContext(ctx, query, id).Scan(
			&product.Manufacture.ID,
			&product.Manufacture.Name,
			&product.ProductClassification.ID,
			&product.ProductClassification.Name,
			&product.ProductForm.ID,
			&product.ProductForm.Name,
			&product.PharmacyProductID,
			&product.ID,
			&product.Name,
			&product.GenericName,
			&product.Description,
			&product.UnitInPack,
			&product.SellingUnit,
			&product.SoldAmount,
			&product.Price,
			&product.StockQuantity,
			&product.Height,
			&product.Weight,
			&product.Length,
			&product.Width,
			&product.ThumbnailURL,
			&product.ImageURL,
			&product.SecondaryImageURL,
			&product.TertiaryImageURL,
			&product.IsActive,
			&product.CreatedAt,
			&categoryIDs,
			&categoryNames,
		)
	}

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}

	idStrings := strings.Split(categoryIDs, ",")
	if len(idStrings) != 0 && idStrings[0] != "" {
		ids := make([]int64, len(idStrings))
		for i, s := range idStrings {
			ids[i], err = strconv.ParseInt(s, 10, 64)
			if err != nil {
				return nil, err
			}
		}

		names := strings.Split(categoryNames, ",")
		for i, id := range ids {
			product.ProductCategories = append(product.ProductCategories, &entity.ProductCategory{
				ID:   id,
				Name: names[i],
			})
		}
	}

	return product, nil
}

func (r *userProductRepositoryImpl) FindPharmacyByPharmacyProductID(ctx context.Context, id int64) (*entity.Pharmacy, error) {
	query := `
		SELECT 
			u.id, ud.full_name, ud.sipa_number, ph.id, ph.name, ph.address
		FROM pharmacy_products pp
		JOIN pharmacies ph ON ph.id = pp.pharmacy_id
		JOIN users u ON u.id = ph.pharmacist_id
		JOIN user_details ud ON ud.user_id = u.id
		WHERE pp.id = $1
	`
	tx := transactor.ExtractTx(ctx)

	var (
		err      error
		pharmacy = &entity.Pharmacy{}
	)
	if tx != nil {
		err = tx.QueryRowContext(ctx, query, id).Scan(
			&pharmacy.PharmacistID,
			&pharmacy.PharmacistName,
			&pharmacy.PharmacistSipaNumber,
			&pharmacy.ID,
			&pharmacy.Name,
			&pharmacy.Address,
		)
	} else {
		err = r.db.QueryRowContext(ctx, query, id).Scan(
			&pharmacy.PharmacistID,
			&pharmacy.PharmacistName,
			&pharmacy.PharmacistSipaNumber,
			&pharmacy.ID,
			&pharmacy.Name,
			&pharmacy.Address,
		)
	}

	if err != nil {
		return nil, err
	}

	return pharmacy, nil
}
