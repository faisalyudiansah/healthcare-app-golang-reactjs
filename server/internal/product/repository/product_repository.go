package repository

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"strconv"
	"strings"

	entityCart "healthcare-app/internal/cart/entity"
	apperrorProduct "healthcare-app/internal/product/apperror"
	"healthcare-app/internal/product/dto"
	"healthcare-app/internal/product/entity"
	apperrorPkg "healthcare-app/pkg/apperror"
	"healthcare-app/pkg/database/transactor"

	"github.com/jackc/pgx/v5/pgconn"
)

const iLike = "%%%v%%"

type ProductRepository interface {
	RefreshView(ctx context.Context) error
	IsExists(ctx context.Context, entity *entity.Product) bool
	IsExistsByID(ctx context.Context, id int64) bool
	MostBoughtToday(ctx context.Context) ([]*entity.Product, error)
	MostBoughtAllTime(ctx context.Context) ([]*entity.Product, error)
	FastestCheapestNearest(ctx context.Context, request *dto.HomeProductRequest) ([]*entity.Product, error)
	Search(ctx context.Context, request *dto.SearchProductRequest) ([]*entity.Product, error)
	FindByID(ctx context.Context, id int64) (*entity.Product, error)
	Save(ctx context.Context, entity *entity.Product) error
	SaveImages(ctx context.Context, entity *entity.Product) error
	SaveProductCategories(ctx context.Context, entity *entity.Product, categories []*entity.ProductCategory) error
	Update(ctx context.Context, entity *entity.Product) error
	UpdateProductCategories(ctx context.Context, entity *entity.Product, categories []*entity.ProductCategory) error
	UpdateSoldAmountByPharmacyProductID(ctx context.Context, entity *entity.Product, pharmacyProductID int64) error
	DeleteByID(ctx context.Context, id int64) error
	DeleteRelatedPharmacyProduct(ctx context.Context, id int64) error
	CheckActiveAndQuantityProduct(ctx context.Context, pharmacyProductId int64) (*entity.ProductActiveAndQuantity, error)
	InactiveRelatedProduct(ctx context.Context, entity *entity.Product) error
}

type productRepositoryImpl struct {
	db *sql.DB
}

func NewProductRepository(db *sql.DB) *productRepositoryImpl {
	return &productRepositoryImpl{
		db: db,
	}
}

func (r *productRepositoryImpl) RefreshView(ctx context.Context) error {
	query := `SELECT refresh_most_boughts_view()`
	tx := transactor.ExtractTx(ctx)

	var err error
	if tx != nil {
		_, err = tx.ExecContext(ctx, query)
	} else {
		_, err = r.db.ExecContext(ctx, query)
	}

	return err
}

func (r *productRepositoryImpl) IsExists(ctx context.Context, entity *entity.Product) bool {
	query := `
		select exists(select 1 from products where name = $1 and generic_name = $2 and manufacture_id = $3 and deleted_at is null)
	`
	tx := transactor.ExtractTx(ctx)

	var (
		err    error
		unique bool
	)
	if tx != nil {
		err = tx.QueryRowContext(ctx, query, entity.Name, entity.GenericName, entity.Manufacture.ID).Scan(&unique)
	} else {
		err = r.db.QueryRowContext(ctx, query, entity.Name, entity.GenericName, entity.Manufacture.ID).Scan(&unique)
	}

	if err != nil {
		return unique
	}
	return unique
}

func (r *productRepositoryImpl) IsExistsByID(ctx context.Context, id int64) bool {
	query := `
		select exists(select 1 from products where id = $1 and deleted_at is null)	
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

func (r *productRepositoryImpl) FastestCheapestNearest(ctx context.Context, request *dto.HomeProductRequest) ([]*entity.Product, error) {
	tx := transactor.ExtractTx(ctx)
	query := `
	WITH params AS (
		SELECT 
			ST_Y(ST_GeomFromText($1)) AS user_lat,
			ST_X(ST_GeomFromText($1)) AS user_lon
	),
	pharmacies_bb AS (
		SELECT 
			ph.id,
			ph.partner_id,
			ph.location,
			ph.is_active
		FROM
			pharmacies ph, params
		WHERE
			ST_Within(ph.location, ST_MakeEnvelope(
				user_lon - (0.009 * 25), user_lat - (0.009 * 25),
				user_lon + (0.009 * 25), user_lat + (0.009 * 25),
				4326
			))
		LIMIT 5000
	),
	fastest_pharmacies AS (
		SELECT DISTINCT ON (pl.pharmacy_id) 
			pl.pharmacy_id
		FROM pharmacy_logistics pl
		JOIN logistics l ON pl.logistic_id = l.id  
		JOIN pharmacies_bb ph ON ph.id = pl.pharmacy_id
		JOIN pharmacy_partners pa ON pa.id = ph.partner_id
		WHERE ST_DWithin(ph.location, ST_SetSRID($1, 4326), 25000)
			AND ph.is_active = true
			AND CURRENT_TIME BETWEEN pa.start_opt AND pa.end_opt
		ORDER BY pl.pharmacy_id, l.max_delivery ASC
		LIMIT 1000
	),
	cheapest_products AS (
		SELECT   
			pp.product_id, 
			pp.id AS pharmacy_product_id, 
			pp.price, 
			pp.stock_quantity, 
			ROW_NUMBER() OVER (PARTITION BY pp.product_id ORDER BY pp.price ASC) AS rank 
		FROM fastest_pharmacies fp 
		JOIN pharmacy_products pp ON fp.pharmacy_id = pp.pharmacy_id 
		WHERE pp.stock_quantity > 0
	)
	SELECT  
		pc.id AS product_classification_id, 
		pc.name AS product_classification_name, 
		cp.pharmacy_product_id, 
		cp.product_id, 
		p.name AS product_name, 
		cp.stock_quantity, 
		cp.price, 
		p.sold_amount, 
		p.selling_unit, 
		p.thumbnail_url 
	FROM cheapest_products cp 
	JOIN products p ON cp.product_id = p.id 
	JOIN product_classifications pc ON p.product_classification_id = pc.id 
	WHERE cp.rank = 1 AND p.is_active = true 
	LIMIT 500
	`

	var (
		err  error
		rows *sql.Rows
	)
	if tx != nil {
		rows, err = tx.QueryContext(ctx, query, request.Location)
	} else {
		rows, err = r.db.QueryContext(ctx, query, request.Location)
	}

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	products := []*entity.Product{}
	for rows.Next() {
		product := &entity.Product{ProductClassification: entity.ProductClassification{}}
		if err := rows.Scan(
			&product.ProductClassification.ID,
			&product.ProductClassification.Name,
			&product.PharmacyProductID,
			&product.ID,
			&product.Name,
			&product.StockQuantity,
			&product.Price,
			&product.SoldAmount,
			&product.SellingUnit,
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

func (r *productRepositoryImpl) MostBoughtToday(ctx context.Context) ([]*entity.Product, error) {
	tx := transactor.ExtractTx(ctx)
	query := `
	select 
		product_classification_id,
		product_classification_name,
		pharmacy_product_id,
		product_id, 
		product_name, 
		stock_quantity, 
		price, 
		total_sold, 
		selling_unit, 
		thumbnail_url
	from most_boughts_today where is_active = true and rank = 1
	`

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

	products := []*entity.Product{}
	for rows.Next() {
		product := &entity.Product{ProductClassification: entity.ProductClassification{}}
		if err := rows.Scan(
			&product.ProductClassification.ID,
			&product.ProductClassification.Name,
			&product.PharmacyProductID,
			&product.ID,
			&product.Name,
			&product.StockQuantity,
			&product.Price,
			&product.SoldAmount,
			&product.SellingUnit,
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

func (r *productRepositoryImpl) MostBoughtAllTime(ctx context.Context) ([]*entity.Product, error) {
	tx := transactor.ExtractTx(ctx)
	query := `
	select 
		product_classification_id,
		product_classification_name,
		pharmacy_product_id,
		product_id, 
		product_name, 
		stock_quantity, 
		price, 
		sold_amount, 
		selling_unit, 
		thumbnail_url
	from most_boughts_all_time where is_active = true and rank = 1
	`

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

	products := []*entity.Product{}
	for rows.Next() {
		product := &entity.Product{ProductClassification: entity.ProductClassification{}}
		if err := rows.Scan(
			&product.ProductClassification.ID,
			&product.ProductClassification.Name,
			&product.PharmacyProductID,
			&product.ID,
			&product.Name,
			&product.StockQuantity,
			&product.Price,
			&product.SoldAmount,
			&product.SellingUnit,
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

func (r *productRepositoryImpl) Search(ctx context.Context, request *dto.SearchProductRequest) ([]*entity.Product, error) {
	tx := transactor.ExtractTx(ctx)

	baseQuery := `
	select m.id, m.name, pc.id, pc.name, pf.id, pf.name, p.id, p.name, p.generic_name, p.description, p.unit_in_pack, p.selling_unit, p.sold_amount, p.height, p.weight, p.length, p.width, p.thumbnail_url, p.image_url, p.secondary_image_url, p.tertiary_image_url, p.is_active, p.created_at 
	from products p join manufactures m on p.manufacture_id = m.id join product_classifications pc on p.product_classification_id = pc.id left join product_forms pf on p.product_form_id = pf.id
	where p.deleted_at is null
	`

	usageQuery := `
	with product_usages as (
		select count(product_id) as total_usage, product_id from pharmacy_products group by product_id
	)
	select m.id, m.name, pc.id, pc.name, pf.id, pf.name, p.id, p.name, p.generic_name, p.description, p.unit_in_pack, p.selling_unit, p.sold_amount, p.height, p.weight, p.length, p.width, p.thumbnail_url, p.image_url, p.secondary_image_url, p.tertiary_image_url, p.is_active, p.created_at,
	pu.total_usage
	from products p 
	join manufactures m on p.manufacture_id = m.id 
	join product_classifications pc on p.product_classification_id = pc.id 
	left join product_usages pu on pu.product_id = p.id
	left join product_forms pf on p.product_form_id = pf.id
	left join pharmacy_products pp on pp.product_id = p.id
	where p.deleted_at is null
	`

	args := []any{}
	queryBuilder := strings.Builder{}

	sortingByUsage := false
	for _, ord := range request.SortBy {
		if ord == "total_usage" {
			sortingByUsage = true
			break
		}
	}

	if sortingByUsage {
		queryBuilder.WriteString(usageQuery)
	} else {
		queryBuilder.WriteString(baseQuery)
	}

	if request.Name != "" {
		queryBuilder.WriteString(fmt.Sprintf(" and p.name ilike $%v", len(args)+1))
		args = append(args, fmt.Sprintf(iLike, request.Name))
	}
	if request.GenericName != "" {
		queryBuilder.WriteString(fmt.Sprintf(" and p.generic_name ilike $%v", len(args)+1))
		args = append(args, fmt.Sprintf(iLike, request.GenericName))
	}
	if request.Description != "" {
		queryBuilder.WriteString(fmt.Sprintf(" and p.description ilike $%v", len(args)+1))
		args = append(args, fmt.Sprintf(iLike, request.Description))
	}
	if request.IsActive != "" {
		queryBuilder.WriteString(fmt.Sprintf(" and p.is_active = $%v", len(args)+1))
		args = append(args, request.IsActive)
	}
	if len(request.ProductClassification) != 0 {
		queryBuilder.WriteString(fmt.Sprintf(" and pc.id = any($%v)", len(args)+1))
		args = append(args, request.ProductClassification)
	}
	if len(request.ProductForm) != 0 {
		queryBuilder.WriteString(fmt.Sprintf(" and pf.id = any($%v)", len(args)+1))
		args = append(args, request.ProductForm)
	}
	if len(request.Manufacturer) != 0 {
		queryBuilder.WriteString(fmt.Sprintf(" and m.id = any($%v)", len(args)+1))
		args = append(args, request.Manufacturer)
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

	entities := []*entity.Product{}
	for rows.Next() {
		entity := &entity.Product{Manufacture: entity.Manufacture{}, ProductClassification: entity.ProductClassification{}, ProductForm: &entity.ProductForm{}}
		if sortingByUsage {
			var totalUsage int64
			if err := rows.Scan(
				&entity.Manufacture.ID,
				&entity.Manufacture.Name,
				&entity.ProductClassification.ID,
				&entity.ProductClassification.Name,
				&entity.ProductForm.ID,
				&entity.ProductForm.Name,
				&entity.ID,
				&entity.Name,
				&entity.GenericName,
				&entity.Description,
				&entity.UnitInPack,
				&entity.SellingUnit,
				&entity.SoldAmount,
				&entity.Height,
				&entity.Weight,
				&entity.Length,
				&entity.Width,
				&entity.ThumbnailURL,
				&entity.ImageURL,
				&entity.SecondaryImageURL,
				&entity.TertiaryImageURL,
				&entity.IsActive,
				&entity.CreatedAt,
				&totalUsage,
			); err != nil {
				return nil, err
			}
		} else {
			if err := rows.Scan(
				&entity.Manufacture.ID,
				&entity.Manufacture.Name,
				&entity.ProductClassification.ID,
				&entity.ProductClassification.Name,
				&entity.ProductForm.ID,
				&entity.ProductForm.Name,
				&entity.ID,
				&entity.Name,
				&entity.GenericName,
				&entity.Description,
				&entity.UnitInPack,
				&entity.SellingUnit,
				&entity.SoldAmount,
				&entity.Height,
				&entity.Weight,
				&entity.Length,
				&entity.Width,
				&entity.ThumbnailURL,
				&entity.ImageURL,
				&entity.SecondaryImageURL,
				&entity.TertiaryImageURL,
				&entity.IsActive,
				&entity.CreatedAt,
			); err != nil {
				return nil, err
			}
		}
		entities = append(entities, entity)
	}

	err = rows.Err()
	if err != nil {
		return nil, err
	}

	return entities, nil
}

func (r *productRepositoryImpl) FindByID(ctx context.Context, id int64) (*entity.Product, error) {
	query := `
		select 
			m.id, m.name, 
			pc.id, pc.name, 
			pf.id, pf.name,
			p.id, p.name, p.generic_name, p.description, 
			p.unit_in_pack, p.selling_unit, p.sold_amount,
			p.height, p.weight, p.length, p.width, 
			p.thumbnail_url, p.image_url, p.secondary_image_url, p.tertiary_image_url, 
			p.is_active, p.created_at, 
			coalesce(string_agg(cp.id::TEXT, ','), ''), 
			coalesce(string_agg(cp.name, ','), '')
		from 
			products p 
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
			m.id, pc.id, pf.id, p.id
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
			&product.ProductForm.ID,
			&product.ProductForm.Name,
			&product.ID,
			&product.Name,
			&product.GenericName,
			&product.Description,
			&product.UnitInPack,
			&product.SellingUnit,
			&product.SoldAmount,
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
			&product.ID,
			&product.Name,
			&product.GenericName,
			&product.Description,
			&product.UnitInPack,
			&product.SellingUnit,
			&product.SoldAmount,
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

func (r *productRepositoryImpl) Save(ctx context.Context, entity *entity.Product) error {
	query := `
		insert into products(manufacture_id, product_classification_id, product_form_id, name, generic_name, description, unit_in_pack, selling_unit, height, weight, length, width, thumbnail_url, image_url, secondary_image_url, tertiary_image_url, is_active)
		values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17) returning id, created_at
	`
	tx := transactor.ExtractTx(ctx)

	var err error
	if tx != nil {
		err = tx.QueryRowContext(
			ctx,
			query,
			entity.Manufacture.ID,
			entity.ProductClassification.ID,
			entity.ProductForm.ID,
			entity.Name,
			entity.GenericName,
			entity.Description,
			entity.UnitInPack,
			entity.SellingUnit,
			entity.Height,
			entity.Weight,
			entity.Length,
			entity.Width,
			entity.ThumbnailURL,
			entity.ImageURL,
			entity.SecondaryImageURL,
			entity.TertiaryImageURL,
			entity.IsActive,
		).Scan(&entity.ID, &entity.CreatedAt)
	} else {
		err = r.db.QueryRowContext(
			ctx,
			query,
			entity.Manufacture.ID,
			entity.ProductClassification.ID,
			entity.ProductForm.ID,
			entity.Name,
			entity.GenericName,
			entity.Description,
			entity.UnitInPack,
			entity.SellingUnit,
			entity.Height,
			entity.Weight,
			entity.Length,
			entity.Width,
			entity.ThumbnailURL,
			entity.ImageURL,
			entity.SecondaryImageURL,
			entity.TertiaryImageURL,
			entity.IsActive,
		).Scan(&entity.ID, &entity.CreatedAt)
	}

	if err, ok := err.(*pgconn.PgError); ok {
		if err.SQLState() == "23505" {
			return apperrorProduct.NewProductAlreadyExistsError()
		}
	}

	return err
}

func (r *productRepositoryImpl) SaveImages(ctx context.Context, entity *entity.Product) error {
	query := `
		update products set image_url = $2, thumbnail_url = $3, secondary_image_url = $4, tertiary_image_url = $5
		where id = $1
	`
	tx := transactor.ExtractTx(ctx)

	var err error
	if tx != nil {
		_, err = tx.ExecContext(ctx, query, entity.ID, entity.ImageURL, entity.ThumbnailURL, entity.SecondaryImageURL, entity.TertiaryImageURL)
	} else {
		_, err = r.db.ExecContext(ctx, query, entity.ID, entity.ImageURL, entity.ThumbnailURL, entity.SecondaryImageURL, entity.TertiaryImageURL)
	}

	if err, ok := err.(*pgconn.PgError); ok {
		if err.SQLState() == "23505" {
			return apperrorProduct.NewProductAlreadyExistsError()
		}
	}

	return err
}

func (r *productRepositoryImpl) SaveProductCategories(ctx context.Context, entity *entity.Product, categories []*entity.ProductCategory) error {
	tx := transactor.ExtractTx(ctx)

	var params []string
	var args []any
	for i := 0; i < len(categories); i++ {
		params = append(params, fmt.Sprintf("($%d, $%d)", i*2+1, i*2+2))
		args = append(args, entity.ID)
		args = append(args, categories[i].ID)
	}
	query := fmt.Sprintf("insert into product_categories(product_id, category_id) values %s", strings.Join(params, ","))

	var err error
	if tx != nil {
		_, err = tx.ExecContext(ctx, query, args...)
	} else {
		_, err = r.db.ExecContext(ctx, query, args...)
	}

	if err, ok := err.(*pgconn.PgError); ok {
		if err.SQLState() == "23503" {
			return apperrorPkg.NewEntityNotFoundError("product category")
		}
	}

	return err
}

func (r *productRepositoryImpl) UpdateProductCategories(ctx context.Context, entity *entity.Product, categories []*entity.ProductCategory) error {
	tx := transactor.ExtractTx(ctx)

	query := "delete from product_categories where product_id = $1"

	var err error
	if tx != nil {
		_, err = tx.ExecContext(ctx, query, entity.ID)
	} else {
		_, err = r.db.ExecContext(ctx, query, entity.ID)
	}

	if err != nil {
		return err
	}

	return r.SaveProductCategories(ctx, entity, categories)
}

func (r *productRepositoryImpl) Update(ctx context.Context, entity *entity.Product) error {
	query := `
		update products set manufacture_id = $2, product_classification_id = $3, product_form_id = $4, name = $5, generic_name = $6, description = $7, unit_in_pack = $8, selling_unit = $9, height = $10, weight = $11, length = $12, width = $13, is_active = $14
		where id = $1 and deleted_at is null returning created_at
	`
	tx := transactor.ExtractTx(ctx)

	var err error
	if tx != nil {
		err = tx.QueryRowContext(
			ctx,
			query,
			entity.ID,
			entity.Manufacture.ID,
			entity.ProductClassification.ID,
			entity.ProductForm.ID,
			entity.Name,
			entity.GenericName,
			entity.Description,
			entity.UnitInPack,
			entity.SellingUnit,
			entity.Height,
			entity.Weight,
			entity.Length,
			entity.Width,
			entity.IsActive,
		).Scan(&entity.CreatedAt)
	} else {
		err = r.db.QueryRowContext(
			ctx,
			query,
			entity.ID,
			entity.Manufacture.ID,
			entity.ProductClassification.ID,
			entity.ProductForm.ID,
			entity.Name,
			entity.GenericName,
			entity.Description,
			entity.UnitInPack,
			entity.SellingUnit,
			entity.Height,
			entity.Weight,
			entity.Length,
			entity.Width,
			entity.IsActive,
		).Scan(&entity.CreatedAt)
	}

	if err, ok := err.(*pgconn.PgError); ok {
		if err.SQLState() == "23505" {
			return apperrorProduct.NewProductAlreadyExistsError()
		}
	}

	return err
}

func (r *productRepositoryImpl) UpdateSoldAmountByPharmacyProductID(ctx context.Context, entity *entity.Product, pharmacyProductID int64) error {
	query := `
		with root_product as (
			select product_id 
			from pharmacy_products 
			where id = $1 and deleted_at is null
		)
		update products 
		set sold_amount = sold_amount + $2, updated_at = NOW()
		where id = (select product_id from root_product) 
		and deleted_at is null
	`
	tx := transactor.ExtractTx(ctx)

	var err error
	if tx != nil {
		_, err = tx.ExecContext(ctx, query, pharmacyProductID, entity.SoldAmount)
	} else {
		_, err = r.db.ExecContext(ctx, query, pharmacyProductID, entity.SoldAmount)
	}

	return err
}

func (r *productRepositoryImpl) DeleteByID(ctx context.Context, id int64) error {
	query := `
	update products set updated_at = now(), deleted_at = now() where id = $1 and deleted_at is null
	`
	tx := transactor.ExtractTx(ctx)

	var (
		err error
		res sql.Result
	)
	if tx != nil {
		res, err = tx.ExecContext(ctx, query, id)
	} else {
		res, err = r.db.ExecContext(ctx, query, id)
	}

	rowsAffected, _ := res.RowsAffected()
	if rowsAffected == 0 {
		return apperrorPkg.NewEntityNotFoundError("product")
	}

	return err
}

func (r *productRepositoryImpl) DeleteRelatedPharmacyProduct(ctx context.Context, id int64) error {
	query := `
		update pharmacy_products set updated_at = now(), deleted_at = now() where product_id = $1 and deleted_at is null
	`
	tx := transactor.ExtractTx(ctx)

	var err error
	if tx != nil {
		_, err = tx.ExecContext(ctx, query, id)
	} else {
		_, err = r.db.ExecContext(ctx, query, id)
	}

	return err
}

func (p *productRepositoryImpl) GetProduct(ctx context.Context, userId int64, query string, sortBy string, sort string, limit int, offset int) ([]entityCart.Cart, error) {
	querySql := `
		SELECT
			uc.id ,
			uc.user_id ,
			uc.product_id ,
			uc.pharmacy_id ,
			uc.quantity ,
			uc.created_at ,
			uc.updated_at 
		FROM user_cart_items uc 
		LEFT JOIN products p ON p.id = uc.user_id 
		WHERE uc.user_id = $1 AND p."name" = $2 
	`
	querySql += fmt.Sprintf(" ORDER BY uc.%s %s", sortBy, sort)
	searchKey := "%" + query + "%"
	tx := transactor.ExtractTx(ctx)
	var err error
	var rows *sql.Rows
	if tx != nil {
		rows, err = tx.QueryContext(ctx, querySql, userId, searchKey)
	} else {
		rows, err = p.db.QueryContext(ctx, querySql, userId, searchKey)
	}
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	defer rows.Close()
	var dataAllMyCart []entityCart.Cart = []entityCart.Cart{}
	for rows.Next() {
		var cart entityCart.Cart
		err := rows.Scan(
			&cart.ID, &cart.UserId, &cart.ProductId, &cart.PharmacyId, &cart.Quantity, &cart.CreatedAt, &cart.UpdatedAt,
		)
		if err != nil {
			if errors.Is(err, sql.ErrNoRows) {
				return dataAllMyCart, nil
			}
			return nil, err
		}
		dataAllMyCart = append(dataAllMyCart, cart)
	}
	return dataAllMyCart, nil
}

func (p *productRepositoryImpl) CheckActiveAndQuantityProduct(ctx context.Context, pharmacyProductId int64) (*entity.ProductActiveAndQuantity, error) {
	query := `
	SELECT 
	p.id, p.is_active ,
	pp.id, pp.stock_quantity, pp.sold_amount 
	FROM products p 
	JOIN pharmacy_products pp ON pp.product_id = p.id 
	WHERE pp.id = $1 AND p.deleted_at IS NULL AND pp.deleted_at IS NULL 
	`
	var product entity.ProductActiveAndQuantity
	tx := transactor.ExtractTx(ctx)
	var err error
	if tx != nil {
		err = tx.QueryRowContext(ctx, query, pharmacyProductId).Scan(
			&product.ProductID,
			&product.IsActive,
			&product.PharmacyProductID,
			&product.StockQuantity,
			&product.SoldAmount,
		)
	} else {
		err = p.db.QueryRowContext(ctx, query, pharmacyProductId).Scan(
			&product.ProductID,
			&product.IsActive,
			&product.PharmacyProductID,
			&product.StockQuantity,
			&product.SoldAmount,
		)
	}
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &product, nil
}

func (r *productRepositoryImpl) InactiveRelatedProduct(ctx context.Context, entity *entity.Product) error {
	query := `
		update pharmacy_products set is_active = false where product_id $1
	`
	tx := transactor.ExtractTx(ctx)

	var err error
	if tx != nil {
		_, err = tx.ExecContext(ctx, query, entity.ID)
	} else {
		_, err = r.db.ExecContext(ctx, query, entity.ID)
	}

	return err
}
