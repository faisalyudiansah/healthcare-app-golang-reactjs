package repository

import (
	"context"
	"database/sql"
	"errors"
	"fmt"

	"healthcare-app/internal/order/constant"
	dtoOrder "healthcare-app/internal/order/dto"
	orderEntity "healthcare-app/internal/order/entity"
	"healthcare-app/internal/order/utils"
	pharmacyEntity "healthcare-app/internal/pharmacy/entity"
	productEntity "healthcare-app/internal/product/entity"
	profileEntity "healthcare-app/internal/profile/entity"
	"healthcare-app/pkg/database/transactor"

	"github.com/shopspring/decimal"
)

type UserOrderRepository interface {
	CalculateShipCost(ctx context.Context, request *dtoOrder.RequestOrder, logistic *pharmacyEntity.Logistic) (decimal.Decimal, error)
	PostNewOrderUser(ctx context.Context, reqBody dtoOrder.RequestOrder, addressDb profileEntity.Address, userId int64) (*orderEntity.OrderCheckout, error)
	PostNewOrderProductUser(ctx context.Context, orderID int64, reqBody dtoOrder.RequestListOrderProduct) (*orderEntity.OrderProductCheckout, error)
	GetPharmacyAndPartner(ctx context.Context, pharmacyProductId int64) (*pharmacyEntity.PharmacyForCart, error)
	GetMyOrders(ctx context.Context, request *dtoOrder.QueryGetMyOrder, userId int64) ([]orderEntity.OrderWithData, error)
	GetOrderByID(ctx context.Context, orderId int64, userId int64) ([]orderEntity.OrderWithData, error)
	GetOrderByIDWithSingleData(ctx context.Context, orderId int64, userId int64) (*orderEntity.OrderCheckout, error)
	PostUploadPaymentProof(ctx context.Context, imgURL string, orderId int64, userId int64) error
	PatchStatusOrder(ctx context.Context, status string, orderId int64, userId int64) error
	ProcessOrder(ctx context.Context, id int64) error
}

type userOrderRepositoryImpl struct {
	db *sql.DB
}

func NewUserOrderRepository(db *sql.DB) *userOrderRepositoryImpl {
	return &userOrderRepositoryImpl{
		db: db,
	}

}

func (uo *userOrderRepositoryImpl) CalculateShipCost(ctx context.Context, request *dtoOrder.RequestOrder, logistic *pharmacyEntity.Logistic) (decimal.Decimal, error) {
	query := `
		with pharmacy_location as(
			select location from pharmacies where id = $1
		), user_location as (
			select location from user_addresses where id = $2
		)
		select
			CEILING(ST_Distance(
				(select location FROM pharmacy_location),
				(select location FROM user_location)
			) / 1000) AS distance_km
	`
	tx := transactor.ExtractTx(ctx)

	var (
		err      error
		distance int64 = 0
	)
	if tx != nil {
		err = tx.QueryRowContext(ctx, query, request.PharmacyID, request.AddressID).Scan(&distance)
	} else {
		err = uo.db.QueryRowContext(ctx, query, request.PharmacyID, request.AddressID).Scan(&distance)
	}

	if err != nil {
		return decimal.Decimal{}, nil
	}

	return logistic.PricePerKM.Mul(decimal.NewFromInt(distance)), nil
}

func (uo *userOrderRepositoryImpl) PostNewOrderUser(ctx context.Context, reqBody dtoOrder.RequestOrder, addressDb profileEntity.Address, userId int64) (*orderEntity.OrderCheckout, error) {
	query := `
		INSERT INTO orders (user_id, order_status, voice_number, payment_img_url, total_product_price, ship_cost, total_payment, description, address) VALUES 
		($1, $2, $3, NULL, $4, $5, $6, $7, $8)
		RETURNING id, user_id, order_status, voice_number, payment_img_url, total_product_price, ship_cost, total_payment, description, address, created_at, updated_at, deleted_at;
	`
	totalProductPrice, totalPayment := int64(0), int64(0)
	for _, orderProduct := range reqBody.OrderProducts {
		totalProductPrice += orderProduct.Price * int64(orderProduct.Quantity)
	}
	totalPayment = totalProductPrice + reqBody.ShipCost.IntPart()
	addressOrder := fmt.Sprintf("%v, %v, %v, %v, %v", addressDb.Address, addressDb.Province, addressDb.City, addressDb.District, addressDb.SubDistrict)

	var order orderEntity.OrderCheckout
	var err error
	tx := transactor.ExtractTx(ctx)
	if tx != nil {
		err = tx.QueryRowContext(ctx, query, userId, constant.STATUS_WAITING, utils.GenerateInvoiceNumber(), totalProductPrice, reqBody.ShipCost, totalPayment, reqBody.Description, addressOrder).Scan(
			&order.ID,
			&order.UserID,
			&order.OrderStatus,
			&order.VoiceNumber,
			&order.PaymentImgURL,
			&order.TotalProductPrice,
			&order.ShipCost,
			&order.TotalPayment,
			&order.Description,
			&order.Address,
			&order.CreatedAt,
			&order.UpdatedAt,
			&order.DeletedAt,
		)
	} else {
		err = uo.db.QueryRowContext(ctx, query, userId, constant.STATUS_WAITING, utils.GenerateInvoiceNumber(), totalProductPrice, reqBody.ShipCost, totalPayment, reqBody.Description, addressOrder).Scan(
			&order.ID,
			&order.UserID,
			&order.OrderStatus,
			&order.VoiceNumber,
			&order.PaymentImgURL,
			&order.TotalProductPrice,
			&order.ShipCost,
			&order.TotalPayment,
			&order.Description,
			&order.Address,
			&order.CreatedAt,
			&order.UpdatedAt,
			&order.DeletedAt,
		)
	}
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	return &order, nil
}

func (uo *userOrderRepositoryImpl) PostNewOrderProductUser(ctx context.Context, orderID int64, reqBody dtoOrder.RequestListOrderProduct) (*orderEntity.OrderProductCheckout, error) {
	query := `
		INSERT INTO order_products (order_id, pharmacy_product_id, quantity, price, created_at, updated_at) VALUES 
		($1, $2, $3, $4, NOW(), NOW())
		RETURNING id, order_id, pharmacy_product_id, quantity, price, created_at, updated_at;
	`
	var orderProduct orderEntity.OrderProductCheckout
	var err error
	tx := transactor.ExtractTx(ctx)
	if tx != nil {
		err = tx.QueryRowContext(ctx, query, orderID, reqBody.PharmacyProductId, reqBody.Quantity, reqBody.Price).Scan(
			&orderProduct.ID,
			&orderProduct.OrderID,
			&orderProduct.PharmacyProductID,
			&orderProduct.Quantity,
			&orderProduct.Price,
			&orderProduct.CreatedAt,
			&orderProduct.UpdatedAt,
		)
	} else {
		err = uo.db.QueryRowContext(ctx, query, orderID, reqBody.PharmacyProductId, reqBody.Quantity, reqBody.Price).Scan(
			&orderProduct.ID,
			&orderProduct.OrderID,
			&orderProduct.PharmacyProductID,
			&orderProduct.Quantity,
			&orderProduct.Price,
			&orderProduct.CreatedAt,
			&orderProduct.UpdatedAt,
		)
	}
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	return &orderProduct, nil
}

func (c *userOrderRepositoryImpl) GetPharmacyAndPartner(ctx context.Context, pharmacyProductId int64) (*pharmacyEntity.PharmacyForCart, error) {
	query := `
		SELECT 
			p.id, p.pharmacist_id, p.partner_id, p.name, p.address, p.city, ST_Y(p.location) AS latitude, ST_X(p.location) AS longitude, p.is_active, p.created_at, p.updated_at,
			ps.id, ps.name, ps.logo_url, ps.year_founded, ps.active_days, ps.start_opt, ps.end_opt, ps.is_active, ps.created_at, ps.updated_at
		FROM pharmacies p 
		JOIN pharmacy_partners ps ON ps.id = p.partner_id 
		WHERE p.id = $1
	`
	var pharmacyAndPartners pharmacyEntity.PharmacyForCart
	tx := transactor.ExtractTx(ctx)
	var err error
	if tx != nil {
		err = tx.QueryRowContext(ctx, query, pharmacyProductId).Scan(
			&pharmacyAndPartners.ID, &pharmacyAndPartners.PharmacistID, &pharmacyAndPartners.PartnerID, &pharmacyAndPartners.Name, &pharmacyAndPartners.Address, &pharmacyAndPartners.City, &pharmacyAndPartners.Latitude, &pharmacyAndPartners.Longitude, &pharmacyAndPartners.IsActive, &pharmacyAndPartners.CreatedAt, &pharmacyAndPartners.UpdatedAt,
			&pharmacyAndPartners.Partner.ID, &pharmacyAndPartners.Partner.Name, &pharmacyAndPartners.Partner.LogoURL, &pharmacyAndPartners.Partner.YearFounded, &pharmacyAndPartners.Partner.ActiveDays, &pharmacyAndPartners.Partner.StartOpt, &pharmacyAndPartners.Partner.EndOpt, &pharmacyAndPartners.Partner.IsActive, &pharmacyAndPartners.Partner.CreatedAt, &pharmacyAndPartners.Partner.UpdatedAt,
		)
	} else {
		err = c.db.QueryRowContext(ctx, query, pharmacyProductId).Scan(
			&pharmacyAndPartners.ID, &pharmacyAndPartners.ID, &pharmacyAndPartners.PharmacistID, &pharmacyAndPartners.PartnerID, &pharmacyAndPartners.Name, &pharmacyAndPartners.Address, &pharmacyAndPartners.City, &pharmacyAndPartners.Latitude, &pharmacyAndPartners.Longitude, &pharmacyAndPartners.IsActive, &pharmacyAndPartners.CreatedAt, &pharmacyAndPartners.UpdatedAt,
			&pharmacyAndPartners.Partner.ID, &pharmacyAndPartners.Partner.Name, &pharmacyAndPartners.Partner.LogoURL, &pharmacyAndPartners.Partner.YearFounded, &pharmacyAndPartners.Partner.ActiveDays, &pharmacyAndPartners.Partner.StartOpt, &pharmacyAndPartners.Partner.EndOpt, &pharmacyAndPartners.Partner.IsActive, &pharmacyAndPartners.Partner.CreatedAt, &pharmacyAndPartners.Partner.UpdatedAt,
		)
	}
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &pharmacyAndPartners, nil
}

func (c *userOrderRepositoryImpl) GetMyOrders(ctx context.Context, request *dtoOrder.QueryGetMyOrder, userId int64) ([]orderEntity.OrderWithData, error) {
	tx := transactor.ExtractTx(ctx)
	query := `
		SELECT 
			o.id, o.user_id, o.order_status, o.voice_number, o.payment_img_url, o.total_payment, o.ship_cost, o.total_product_price, o.description, o.address, o.created_at, o.updated_at, o.deleted_at,
			op.id, op.order_id, op.pharmacy_product_id, op.quantity, op.price, op.created_at, op.updated_at,
			pp.id, pp.pharmacy_id, pp.product_id, pp.stock_quantity, pp.price, pp.sold_amount, pp.created_at, pp.updated_at, pp.deleted_at,
			p.id, p.manufacture_id, p.product_classification_id, p.product_form_id, p.name, p.generic_name, p.description, p.unit_in_pack, p.selling_unit, p.sold_amount, p.weight, p.height, p.length, p.width, p.image_url, p.is_active, p.created_at, p.updated_at, p.deleted_at,
			p2.id, p2.pharmacist_id, p2.partner_id, p2.name, p2.address, p2.city, ST_Y(p2.location) AS latitude,  ST_X(p2.location) AS longitude, p2.is_active, p2.created_at, p2.updated_at,
			pp2.id, pp2.name, pp2.logo_url, pp2.year_founded, pp2.active_days, pp2.start_opt, pp2.end_opt, pp2.is_active, pp2.created_at, pp2.updated_at
		FROM orders o 
		JOIN order_products op ON op.order_id = o.id 
		JOIN pharmacy_products pp ON pp.id = op.pharmacy_product_id 
		JOIN products p ON p.id = pp.product_id 
		JOIN pharmacies p2 ON p2.id = pp.pharmacy_id 
		JOIN pharmacy_partners pp2 ON pp2.id = p2.partner_id 
		WHERE o.user_id = $1 AND o.deleted_at IS NULL AND (p.name ILIKE $2 OR p.generic_name ILIKE $2 OR p2.name ILIKE $2 OR pp2.name ILIKE $2)
	`
	if request.Status != 0 {
		query += ` AND o.order_status = $3`
	}
	if request.SortBy != "" || request.Sort != "" {
		query += fmt.Sprintf(" ORDER BY o.%s %s", request.SortBy, request.Sort)
	}
	var (
		err  error
		rows *sql.Rows
	)
	searchKey := "%" + request.Search + "%"
	if request.Status != 0 {
		if tx != nil {
			rows, err = tx.QueryContext(ctx, query, userId, searchKey, utils.ConvertOrderStatus(int64(request.Status)))
		} else {
			rows, err = c.db.QueryContext(ctx, query, userId, searchKey, utils.ConvertOrderStatus(int64(request.Status)))
		}
	} else {
		if tx != nil {
			rows, err = tx.QueryContext(ctx, query, userId, searchKey)
		} else {
			rows, err = c.db.QueryContext(ctx, query, userId, searchKey)
		}
	}
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var dataDb []orderEntity.OrderWithData
	for rows.Next() {
		var (
			orders          orderEntity.OrderWithData
			orderProduct    orderEntity.OrderProductWithData
			pharmacy        pharmacyEntity.PharmacyForCart
			product         productEntity.ProductForCart
			pharmacyProduct pharmacyEntity.PharmacyProduct
			partner         pharmacyEntity.Partner
		)
		if err := rows.Scan(
			&orders.ID, &orders.UserID, &orders.OrderStatus, &orders.VoiceNumber, &orders.PaymentImgURL, &orders.TotalPayment, &orders.ShipCost, &orders.TotalProductPrice, &orders.Description, &orders.Address, &orders.CreatedAt, &orders.UpdatedAt, &orders.DeletedAt,
			&orderProduct.ID, &orderProduct.OrderID, &orderProduct.PharmacyProductID, &orderProduct.Quantity, &orderProduct.Price, &orderProduct.CreatedAt, &orderProduct.UpdatedAt,
			&pharmacyProduct.ID, &pharmacyProduct.PharmacyId, &pharmacyProduct.ProductId, &pharmacyProduct.StockQuantity, &pharmacyProduct.Price, &pharmacyProduct.SoldAmount, &pharmacyProduct.CreatedAt, &pharmacyProduct.UpdatedAt, &pharmacyProduct.DeletedAt,
			&product.ID, &product.ManufactureID, &product.ProductClassificationID, &product.ProductFormID, &product.Name, &product.GenericName, &product.Description, &product.UnitInPack, &product.SellingUnit, &product.SoldAmount, &product.Weight, &product.Height, &product.Length, &product.Width, &product.ImageURL, &product.IsActive, &product.CreatedAt, &product.UpdatedAt, &product.DeletedAt,
			&pharmacy.ID, &pharmacy.PharmacistID, &pharmacy.PartnerID, &pharmacy.Name, &pharmacy.Address, &pharmacy.City, &pharmacy.Latitude, &pharmacy.Longitude, &pharmacy.IsActive, &pharmacy.CreatedAt, &pharmacy.UpdatedAt,
			&partner.ID, &partner.Name, &partner.LogoURL, &partner.YearFounded, &partner.ActiveDays, &partner.StartOpt, &partner.EndOpt, &partner.IsActive, &partner.CreatedAt, &partner.UpdatedAt,
		); err != nil {
			return nil, err
		}
		pharmacy.Partner = partner
		pharmacyProduct.Product = product
		pharmacyProduct.Pharmacy = pharmacy
		orderProduct.PharmacyProduct = pharmacyProduct
		orders.OrderProduct = orderProduct
		dataDb = append(dataDb, orders)
	}
	err = rows.Err()
	if err != nil {
		return nil, err
	}
	return dataDb, nil
}

func (c *userOrderRepositoryImpl) GetOrderByID(ctx context.Context, orderId int64, userId int64) ([]orderEntity.OrderWithData, error) {
	tx := transactor.ExtractTx(ctx)
	query := `
		SELECT 
			o.id, o.user_id, o.order_status, o.voice_number, o.payment_img_url, o.total_product_price, o.ship_cost, o.total_payment, o.description, o.address, o.created_at, o.updated_at, o.deleted_at,
			op.id, op.order_id, op.pharmacy_product_id, op.quantity, op.price, op.created_at, op.updated_at,
			pp.id, pp.pharmacy_id, pp.product_id, pp.stock_quantity, pp.price, pp.sold_amount, pp.created_at, pp.updated_at, pp.deleted_at,
			p.id, p.manufacture_id, p.product_classification_id, p.product_form_id, p.name, p.generic_name, p.description, p.unit_in_pack, p.selling_unit, p.sold_amount, p.weight, p.height, p.length, p.width, p.image_url, p.is_active, p.created_at, p.updated_at, p.deleted_at,
			p2.id, p2.pharmacist_id, p2.partner_id, p2.name, p2.address, p2.city, ST_Y(p2.location) AS latitude,  ST_X(p2.location) AS longitude, p2.is_active, p2.created_at, p2.updated_at,
			pp2.id, pp2.name, pp2.logo_url, pp2.year_founded, pp2.active_days, pp2.start_opt, pp2.end_opt, pp2.is_active, pp2.created_at, pp2.updated_at
		FROM orders o 
		JOIN order_products op ON op.order_id = o.id 
		JOIN pharmacy_products pp ON pp.id = op.pharmacy_product_id 
		JOIN products p ON p.id = pp.product_id 
		JOIN pharmacies p2 ON p2.id = pp.pharmacy_id 
		JOIN pharmacy_partners pp2 ON pp2.id = p2.partner_id 
		WHERE o.user_id = $1 AND o.id = $2 AND o.deleted_at IS NULL
	`
	var (
		err  error
		rows *sql.Rows
	)
	if tx != nil {
		rows, err = tx.QueryContext(ctx, query, userId, orderId)
	} else {
		rows, err = c.db.QueryContext(ctx, query, userId, orderId)
	}
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var dataDb []orderEntity.OrderWithData
	for rows.Next() {
		var (
			orders          orderEntity.OrderWithData
			orderProduct    orderEntity.OrderProductWithData
			pharmacy        pharmacyEntity.PharmacyForCart
			product         productEntity.ProductForCart
			pharmacyProduct pharmacyEntity.PharmacyProduct
			partner         pharmacyEntity.Partner
		)
		if err := rows.Scan(
			&orders.ID, &orders.UserID, &orders.OrderStatus, &orders.VoiceNumber, &orders.PaymentImgURL, &orders.TotalProductPrice, &orders.ShipCost, &orders.TotalPayment, &orders.Description, &orders.Address, &orders.CreatedAt, &orders.UpdatedAt, &orders.DeletedAt,
			&orderProduct.ID, &orderProduct.OrderID, &orderProduct.PharmacyProductID, &orderProduct.Quantity, &orderProduct.Price, &orderProduct.CreatedAt, &orderProduct.UpdatedAt,
			&pharmacyProduct.ID, &pharmacyProduct.PharmacyId, &pharmacyProduct.ProductId, &pharmacyProduct.StockQuantity, &pharmacyProduct.Price, &pharmacyProduct.SoldAmount, &pharmacyProduct.CreatedAt, &pharmacyProduct.UpdatedAt, &pharmacyProduct.DeletedAt,
			&product.ID, &product.ManufactureID, &product.ProductClassificationID, &product.ProductFormID, &product.Name, &product.GenericName, &product.Description, &product.UnitInPack, &product.SellingUnit, &product.SoldAmount, &product.Weight, &product.Height, &product.Length, &product.Width, &product.ImageURL, &product.IsActive, &product.CreatedAt, &product.UpdatedAt, &product.DeletedAt,
			&pharmacy.ID, &pharmacy.PharmacistID, &pharmacy.PartnerID, &pharmacy.Name, &pharmacy.Address, &pharmacy.City, &pharmacy.Latitude, &pharmacy.Longitude, &pharmacy.IsActive, &pharmacy.CreatedAt, &pharmacy.UpdatedAt,
			&partner.ID, &partner.Name, &partner.LogoURL, &partner.YearFounded, &partner.ActiveDays, &partner.StartOpt, &partner.EndOpt, &partner.IsActive, &partner.CreatedAt, &partner.UpdatedAt,
		); err != nil {
			return nil, err
		}
		pharmacy.Partner = partner
		pharmacyProduct.Product = product
		pharmacyProduct.Pharmacy = pharmacy
		orderProduct.PharmacyProduct = pharmacyProduct
		orders.OrderProduct = orderProduct
		dataDb = append(dataDb, orders)
	}

	err = rows.Err()
	if err != nil {
		return nil, err
	}
	return dataDb, nil
}

func (c *userOrderRepositoryImpl) GetOrderByIDWithSingleData(ctx context.Context, orderId int64, userId int64) (*orderEntity.OrderCheckout, error) {
	query := `
		SELECT 
			o.id, o.user_id, o.order_status, o.voice_number, o.payment_img_url, o.total_product_price, o.ship_cost, o.total_payment, o.description, o.address, o.created_at, o.updated_at, o.deleted_at
		FROM orders o 
		WHERE o.id = $1 AND o.user_id = $2 AND o.deleted_at IS NULL
	`
	var order orderEntity.OrderCheckout
	tx := transactor.ExtractTx(ctx)
	var err error
	if tx != nil {
		err = tx.QueryRowContext(ctx, query, orderId, userId).Scan(
			&order.ID,
			&order.UserID,
			&order.OrderStatus,
			&order.VoiceNumber,
			&order.PaymentImgURL,
			&order.TotalProductPrice,
			&order.ShipCost,
			&order.TotalPayment,
			&order.Description,
			&order.Address,
			&order.CreatedAt,
			&order.UpdatedAt,
			&order.DeletedAt,
		)
	} else {
		err = c.db.QueryRowContext(ctx, query, orderId, userId).Scan(
			&order.ID,
			&order.UserID,
			&order.OrderStatus,
			&order.VoiceNumber,
			&order.PaymentImgURL,
			&order.TotalProductPrice,
			&order.ShipCost,
			&order.TotalPayment,
			&order.Description,
			&order.Address,
			&order.CreatedAt,
			&order.UpdatedAt,
			&order.DeletedAt,
		)
	}
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &order, nil
}

func (c *userOrderRepositoryImpl) PostUploadPaymentProof(ctx context.Context, imgURL string, orderId int64, userId int64) error {
	query := `
		update orders 
		set payment_img_url = $1, 
			updated_at = now() 
		WHERE id = $2 AND user_id = $3
	`
	tx := transactor.ExtractTx(ctx)
	var err error
	if tx != nil {
		_, err = tx.ExecContext(ctx, query, imgURL, orderId, userId)
	} else {
		_, err = c.db.ExecContext(ctx, query, imgURL, orderId, userId)
	}

	return err
}

func (c *userOrderRepositoryImpl) PatchStatusOrder(ctx context.Context, status string, orderId int64, userId int64) error {
	query := `
		update orders 
		set order_status = $1, 
			updated_at = now() 
		WHERE id = $2 AND user_id = $3
	`
	tx := transactor.ExtractTx(ctx)
	var err error
	if tx != nil {
		_, err = tx.ExecContext(ctx, query, status, orderId, userId)
	} else {
		_, err = c.db.ExecContext(ctx, query, status, orderId, userId)
	}

	return err
}

func (c *userOrderRepositoryImpl) ProcessOrder(ctx context.Context, id int64) error {
	query := `
		update orders 
		set order_status = $1, updated_at = now() 
		where id = $2
	`
	tx := transactor.ExtractTx(ctx)

	var err error
	if tx != nil {
		_, err = tx.ExecContext(ctx, query, constant.STATUS_PROCESSED, id)
	} else {
		_, err = c.db.ExecContext(ctx, query, constant.STATUS_PROCESSED, id)
	}

	return err
}
