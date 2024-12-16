package repository

import (
	"context"
	"database/sql"
	"errors"
	"fmt"

	cartDto "healthcare-app/internal/cart/dto"
	entityCart "healthcare-app/internal/cart/entity"
	entityPharmacy "healthcare-app/internal/pharmacy/entity"
	entityProduct "healthcare-app/internal/product/entity"
	"healthcare-app/pkg/database/transactor"
)

type CartRepository interface {
	CountByUserID(ctx context.Context, userID int64) (int64, error)
	GetMyCart(ctx context.Context, userId int64, query string, sortBy string, sort string, limit int, offset int) ([]entityCart.CartWithData, error)
	FindPharmacyProductById(ctx context.Context, pharmacyProductId int64) (*entityPharmacy.PharmacyProduct, error)
	CreateCart(ctx context.Context, reqBody *cartDto.RequestCart, userId int64) error
	CartItemExists(ctx context.Context, userId, pharmacyProductId int64) (bool, error)
	DeleteCart(ctx context.Context, userId int64, pharmacyProductId int64) error
	GetCartItem(ctx context.Context, userId, pharmacyProductId int64) (*entityCart.CartWithProduct, error)
	GetCartItemWithPharmacyId(ctx context.Context, userId, pharmacyProductId int64, pharmacyId int64) (*entityCart.CartWithProduct, error)
	UpdateCartQuantity(ctx context.Context, userId, pharmacyProductId int64, quantity int64) error
}

type cartRepositoryImpl struct {
	db *sql.DB
}

func NewCartRepository(db *sql.DB) *cartRepositoryImpl {
	return &cartRepositoryImpl{
		db: db,
	}
}

func (c *cartRepositoryImpl) CountByUserID(ctx context.Context, userID int64) (int64, error) {
	query := `
		select sum(quantity) from user_cart_items where user_id = $1 group by user_id
	`
	tx := transactor.ExtractTx(ctx)

	var (
		err   error
		count int64
	)
	if tx != nil {
		err = tx.QueryRowContext(ctx, query, userID).Scan(&count)
	} else {
		err = c.db.QueryRowContext(ctx, query, userID).Scan(&count)
	}

	if errors.Is(err, sql.ErrNoRows) {
		return 0, nil
	}
	return count, nil
}

func (c *cartRepositoryImpl) GetMyCart(ctx context.Context, userId int64, query string, sortBy string, sort string, limit int, offset int) ([]entityCart.CartWithData, error) {
	validSortBy := map[string]string{"price": "pp.price", "created_at": "uc.created_at"}
	sortBy = validSortBy[sortBy]
	querySql := `
		SELECT 
			uc.id, uc.user_id, uc.pharmacy_product_id, uc.quantity, uc.created_at, uc.updated_at, 
			pp.id, pp.pharmacy_id, pp.product_id, pp.stock_quantity, pp.price, pp.sold_amount, pp.created_at, pp.updated_at, pp.deleted_at,
			p2.id, p2.manufacture_id, p2.product_classification_id, p2.product_form_id, p2.name, p2.generic_name, p2.description, p2.unit_in_pack, p2.selling_unit, p2.sold_amount, p2.weight, p2.height, p2.length, p2.width, p2.image_url, p2.is_active, p2.created_at, p2.updated_at, p2.deleted_at,
			p.id, p.pharmacist_id, p.partner_id, p.name, p.address, p.city_id, p.city, ST_Y(p.location) AS latitude,  ST_X(p.location) AS longitude, p.is_active, p.created_at, p.updated_at,
			ps.id, ps.name, ps.logo_url, ps.year_founded, ps.active_days, ps.start_opt, ps.end_opt, ps.is_active, ps.created_at, ps.updated_at
		FROM user_cart_items uc
		INNER JOIN pharmacy_products pp ON pp.id = uc.pharmacy_product_id
		INNER JOIN pharmacies p ON pp.pharmacy_id = p.id 
		INNER JOIN products p2 ON pp.product_id = p2.id 
		INNER JOIN pharmacy_partners ps ON p.partner_id = ps.id
		WHERE uc.user_id = $1 AND (p2.name ILIKE $2 OR p2.generic_name ILIKE $2 OR p.name ILIKE $2 OR ps.name ILIKE $2)
		ORDER BY %s %s
	`
	querySql = fmt.Sprintf(querySql, sortBy, sort)
	searchKey := "%" + query + "%"
	tx := transactor.ExtractTx(ctx)
	var err error
	var rows *sql.Rows
	if tx != nil {
		rows, err = tx.QueryContext(ctx, querySql, userId, searchKey)
	} else {
		rows, err = c.db.QueryContext(ctx, querySql, userId, searchKey)
	}
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	defer rows.Close()
	var carts []entityCart.CartWithData
	for rows.Next() {
		var cart entityCart.CartWithData
		var pharmacy entityPharmacy.PharmacyForCart
		var partner entityPharmacy.Partner
		var product entityProduct.ProductForCart
		var pharmacyProduct entityPharmacy.PharmacyProduct
		err := rows.Scan(
			&cart.ID, &cart.UserId, &pharmacyProduct.ID, &cart.Quantity, &cart.CreatedAt, &cart.UpdatedAt,
			&pharmacyProduct.ID, &pharmacyProduct.PharmacyId, &pharmacyProduct.ProductId, &pharmacyProduct.StockQuantity, &pharmacyProduct.Price, &pharmacyProduct.SoldAmount, &pharmacyProduct.CreatedAt, &pharmacyProduct.UpdatedAt, &pharmacyProduct.DeletedAt,
			&product.ID, &product.ManufactureID, &product.ProductClassificationID, &product.ProductFormID, &product.Name, &product.GenericName, &product.Description, &product.UnitInPack, &product.SellingUnit, &product.SoldAmount, &product.Weight, &product.Height, &product.Length, &product.Width, &product.ImageURL, &product.IsActive, &product.CreatedAt, &product.UpdatedAt, &product.DeletedAt,
			&pharmacy.ID, &pharmacy.PharmacistID, &pharmacy.PartnerID, &pharmacy.Name, &pharmacy.Address, &pharmacy.CityID, &pharmacy.City, &pharmacy.Latitude, &pharmacy.Longitude, &pharmacy.IsActive, &pharmacy.CreatedAt, &pharmacy.UpdatedAt,
			&partner.ID, &partner.Name, &partner.LogoURL, &partner.YearFounded, &partner.ActiveDays, &partner.StartOpt, &partner.EndOpt, &partner.IsActive, &partner.CreatedAt, &partner.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		pharmacy.Partner = partner
		pharmacyProduct.Pharmacy = pharmacy
		pharmacyProduct.Product = product
		cart.PharmacyProduct = pharmacyProduct
		carts = append(carts, cart)
	}
	return carts, nil
}

func (c *cartRepositoryImpl) FindPharmacyProductById(ctx context.Context, pharmacyProductId int64) (*entityPharmacy.PharmacyProduct, error) {
	query := "SELECT id, stock_quantity, is_active FROM pharmacy_products WHERE id = $1"
	tx := transactor.ExtractTx(ctx)
	var row *sql.Row
	if tx != nil {
		row = tx.QueryRowContext(ctx, query, pharmacyProductId)
	} else {
		row = c.db.QueryRowContext(ctx, query, pharmacyProductId)
	}
	var product entityPharmacy.PharmacyProduct
	err := row.Scan(&product.ID, &product.StockQuantity, &product.IsActive)
	if err == sql.ErrNoRows {
		return nil, err
	}
	if err != nil {
		return nil, err
	}
	return &product, nil
}

func (c *cartRepositoryImpl) CreateCart(ctx context.Context, reqBody *cartDto.RequestCart, userId int64) error {
	query := `
        INSERT INTO user_cart_items (user_id, pharmacy_product_id, quantity, created_at, updated_at)
        VALUES ($1, $2, $3, NOW(), NOW())
    `
	tx := transactor.ExtractTx(ctx)
	var err error
	if tx != nil {
		_, err = tx.ExecContext(ctx, query, userId, reqBody.PharmacyProductId, reqBody.Quantity)
	} else {
		_, err = c.db.ExecContext(ctx, query, userId, reqBody.PharmacyProductId, reqBody.Quantity)
	}
	return err
}

func (c *cartRepositoryImpl) CartItemExists(ctx context.Context, userId, pharmacyProductId int64) (bool, error) {
	query := `
        SELECT EXISTS (
            SELECT 1 FROM user_cart_items 
            WHERE user_id = $1 AND pharmacy_product_id = $2
        )
    `
	tx := transactor.ExtractTx(ctx)
	var exists bool
	var err error
	if tx != nil {
		err = tx.QueryRowContext(ctx, query, userId, pharmacyProductId).Scan(&exists)
	} else {
		err = c.db.QueryRowContext(ctx, query, userId, pharmacyProductId).Scan(&exists)
	}
	if err != nil {
		return false, err
	}
	return exists, nil
}

func (c *cartRepositoryImpl) DeleteCart(ctx context.Context, userId int64, pharmacyProductId int64) error {
	query := `
        DELETE FROM user_cart_items 
        WHERE user_id = $1 AND pharmacy_product_id = $2
    `
	tx := transactor.ExtractTx(ctx)
	var err error
	if tx != nil {
		_, err = tx.ExecContext(ctx, query, userId, pharmacyProductId)
	} else {
		_, err = c.db.ExecContext(ctx, query, userId, pharmacyProductId)
	}
	return err
}

func (c *cartRepositoryImpl) GetCartItem(ctx context.Context, userId, pharmacyProductId int64) (*entityCart.CartWithProduct, error) {
	query := `
		SELECT 
			uc.id, uc.user_id, uc.quantity, uc.created_at, uc.updated_at,
			p2.id, p2.manufacture_id, p2.product_classification_id, p2.product_form_id, p2.name, p2.generic_name, p2.description, p2.unit_in_pack, p2.selling_unit, p2.sold_amount, p2.weight, p2.height, p2.length, p2.width, p2.image_url, p2.is_active, p2.created_at, p2.updated_at, p2.deleted_at
		FROM user_cart_items uc
		INNER JOIN pharmacy_products pp ON pp.id = uc.pharmacy_product_id
		INNER JOIN products p2 ON pp.product_id = p2.id 
		WHERE uc.user_id = $1 AND uc.pharmacy_product_id = $2
	`
	var cartItem entityCart.CartWithProduct
	var product entityProduct.ProductForCart
	tx := transactor.ExtractTx(ctx)
	var err error
	if tx != nil {
		err = tx.QueryRowContext(ctx, query, userId, pharmacyProductId).Scan(
			&cartItem.ID, &cartItem.UserId, &cartItem.Quantity, &cartItem.CreatedAt, &cartItem.UpdatedAt,
			&product.ID, &product.ManufactureID, &product.ProductClassificationID, &product.ProductFormID, &product.Name, &product.GenericName, &product.Description, &product.UnitInPack, &product.SellingUnit, &product.SoldAmount, &product.Weight, &product.Height, &product.Length, &product.Width, &product.ImageURL, &product.IsActive, &product.CreatedAt, &product.UpdatedAt, &product.DeletedAt,
		)
	} else {
		err = c.db.QueryRowContext(ctx, query, userId, pharmacyProductId).Scan(
			&cartItem.ID, &cartItem.UserId, &cartItem.Quantity, &cartItem.CreatedAt, &cartItem.UpdatedAt,
			&product.ID, &product.ManufactureID, &product.ProductClassificationID, &product.ProductFormID, &product.Name, &product.GenericName, &product.Description, &product.UnitInPack, &product.SellingUnit, &product.SoldAmount, &product.Weight, &product.Height, &product.Length, &product.Width, &product.ImageURL, &product.IsActive, &product.CreatedAt, &product.UpdatedAt, &product.DeletedAt,
		)
	}
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	cartItem.Product = product
	return &cartItem, nil
}

func (c *cartRepositoryImpl) GetCartItemWithPharmacyId(ctx context.Context, userId, pharmacyProductId int64, pharmacyId int64) (*entityCart.CartWithProduct, error) {
	query := `
		SELECT 
			uc.id, uc.user_id, uc.quantity, uc.created_at, uc.updated_at,
			p2.id, p2.manufacture_id, p2.product_classification_id, p2.product_form_id, p2.name, p2.generic_name, p2.description, p2.unit_in_pack, p2.selling_unit, p2.sold_amount, p2.weight, p2.height, p2.length, p2.width, p2.image_url, p2.is_active, p2.created_at, p2.updated_at, p2.deleted_at
		FROM user_cart_items uc
		INNER JOIN pharmacy_products pp ON pp.id = uc.pharmacy_product_id
		INNER JOIN products p2 ON pp.product_id = p2.id 
		WHERE uc.user_id = $1 AND uc.pharmacy_product_id = $2 AND pp.pharmacy_id = $3
	`
	var cartItem entityCart.CartWithProduct
	var product entityProduct.ProductForCart
	tx := transactor.ExtractTx(ctx)
	var err error
	if tx != nil {
		err = tx.QueryRowContext(ctx, query, userId, pharmacyProductId, pharmacyId).Scan(
			&cartItem.ID, &cartItem.UserId, &cartItem.Quantity, &cartItem.CreatedAt, &cartItem.UpdatedAt,
			&product.ID, &product.ManufactureID, &product.ProductClassificationID, &product.ProductFormID, &product.Name, &product.GenericName, &product.Description, &product.UnitInPack, &product.SellingUnit, &product.SoldAmount, &product.Weight, &product.Height, &product.Length, &product.Width, &product.ImageURL, &product.IsActive, &product.CreatedAt, &product.UpdatedAt, &product.DeletedAt,
		)
	} else {
		err = c.db.QueryRowContext(ctx, query, userId, pharmacyProductId, pharmacyId).Scan(
			&cartItem.ID, &cartItem.UserId, &cartItem.Quantity, &cartItem.CreatedAt, &cartItem.UpdatedAt,
			&product.ID, &product.ManufactureID, &product.ProductClassificationID, &product.ProductFormID, &product.Name, &product.GenericName, &product.Description, &product.UnitInPack, &product.SellingUnit, &product.SoldAmount, &product.Weight, &product.Height, &product.Length, &product.Width, &product.ImageURL, &product.IsActive, &product.CreatedAt, &product.UpdatedAt, &product.DeletedAt,
		)
	}
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	cartItem.Product = product
	return &cartItem, nil
}

func (c *cartRepositoryImpl) UpdateCartQuantity(ctx context.Context, userId, pharmacyProductId int64, quantity int64) error {
	query := `
		UPDATE user_cart_items
		SET quantity = $1, updated_at = NOW()
		WHERE user_id = $2 AND pharmacy_product_id = $3
	`
	tx := transactor.ExtractTx(ctx)
	var err error
	if tx != nil {
		_, err = tx.ExecContext(ctx, query, quantity, userId, pharmacyProductId)
	} else {
		_, err = c.db.ExecContext(ctx, query, quantity, userId, pharmacyProductId)
	}
	if err != nil {
		return err
	}
	return nil
}
