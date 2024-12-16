package repository

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"strings"

	"healthcare-app/internal/order/dto"
	"healthcare-app/internal/order/entity"
	utilsOrder "healthcare-app/internal/order/utils"
	"healthcare-app/pkg/database/transactor"
)

type PharmacistOrderRepository interface {
	FindByID(ctx context.Context, request *dto.GetOrderRequest) ([]*entity.Order, error)
	GetOrderById(ctx context.Context, order *dto.RequestOrderID) ([]*entity.Order, error)
	GetAllOrderFromPharmacist(ctx context.Context, request *dto.PharmacistGetOrderRequest, userId int64) ([]*entity.Order, error)
	IsPharmacistAssign(ctx context.Context, pharmacyId, pharmacistId int64) (bool, error)
	SendOrderStatus(ctx context.Context, orders []*dto.OrderResponse) error
	CancelOrderStatus(ctx context.Context, orders []*dto.OrderResponse) error
	ConfirmOrderStatus(ctx context.Context, ids []int64) error
	ReturnStockOnCanceledOrder(ctx context.Context, productId, productQuantity int64) error
}

type pharmacistOrderRepositoryImpl struct {
	db *sql.DB
}

func NewPharmacistOrderRepository(db *sql.DB) *pharmacistOrderRepositoryImpl {
	return &pharmacistOrderRepositoryImpl{
		db: db,
	}
}

func (r *pharmacistOrderRepositoryImpl) FindByID(ctx context.Context, request *dto.GetOrderRequest) ([]*entity.Order, error) {
	query := `
		select 
			o.id, o.user_id, u.email, o.order_status, o.voice_number, o.payment_img_url, o.total_product_price, o.ship_cost, o.total_payment, o.description, o.created_at, 
			p2.id, p2."name", 
			op.pharmacy_product_id, p."name", op.quantity, op.price, p.image_url  
		from orders o 
		left join users u on u.id = o.user_id
		left join order_products op on o.id = op.order_id 
		left join pharmacy_products pp  on pp.id = op.pharmacy_product_id
		left join products p on p.id = pp.product_id 
		left join pharmacies p2 on p2.id = pp.pharmacy_id 
		where p2.pharmacist_id = $1 and p2.id = $2 and o.id = $3
	`

	tx := transactor.ExtractTx(ctx)

	var (
		orders []*entity.Order
		err    error
		rows   *sql.Rows
	)

	if tx != nil {
		rows, err = tx.QueryContext(ctx, query, request.PharmacistID, request.PharmacyID, request.ID)
	} else {
		rows, err = r.db.QueryContext(ctx, query, request.PharmacistID, request.PharmacyID, request.ID)
	}

	if err != nil {
		return nil, err
	}

	defer rows.Close()

	for rows.Next() {
		order := new(entity.Order)

		if err := rows.Scan(
			&order.ID,
			&order.UserID,
			&order.UserEmail,
			&order.OrderStatus,
			&order.VoiceNumber,
			&order.PaymentImgURL,
			&order.TotalProductPrice,
			&order.ShipCost,
			&order.TotalPayment,
			&order.Description,
			&order.CreatedAt,
			&order.OrderProduct.PharmacyID,
			&order.OrderProduct.PharmacyName,
			&order.OrderProduct.ProductID,
			&order.OrderProduct.ProductName,
			&order.OrderProduct.Quantity,
			&order.OrderProduct.Price,
			&order.OrderProduct.ProductThumbnailURL,
		); err != nil {
			return nil, err
		}
		orders = append(orders, order)
	}

	return orders, nil
}

func (r *pharmacistOrderRepositoryImpl) GetOrderById(ctx context.Context, order *dto.RequestOrderID) ([]*entity.Order, error) {
	query := `
		select 
			o.id, o.user_id, u.email, o.order_status, o.voice_number, o.payment_img_url, o.total_product_price, o.ship_cost, o.total_payment, o.description, o.created_at, 
			p2.id, p2."name", 
			op.pharmacy_product_id, p."name", op.quantity, op.price, p.image_url  
		from orders o 
		left join users u on u.id = o.user_id
		left join order_products op on o.id = op.order_id 
		left join pharmacy_products pp  on pp.id = op.pharmacy_product_id
		left join products p on p.id = pp.product_id 
		left join pharmacies p2 on p2.id = pp.pharmacy_id 
		where p2.pharmacist_id = $1 and p2.id = $2 and o.id in (
	`

	placeholders := make([]string, len(order.OrderID))
	args := make([]any, len(order.OrderID)+2)
	args[0] = order.PharmacistID
	args[1] = order.PharmacyID
	for i, id := range order.OrderID {
		placeholders[i] = fmt.Sprintf("$%v", i+3)
		args[i+2] = id
	}

	query += strings.Join(placeholders, ",") + ") ORDER BY p2.id, o.id"

	tx := transactor.ExtractTx(ctx)

	var (
		orders []*entity.Order
		err    error
		rows   *sql.Rows
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

	for rows.Next() {
		order := new(entity.Order)

		if err := rows.Scan(
			&order.ID,
			&order.UserID,
			&order.UserEmail,
			&order.OrderStatus,
			&order.VoiceNumber,
			&order.PaymentImgURL,
			&order.TotalProductPrice,
			&order.ShipCost,
			&order.TotalPayment,
			&order.Description,
			&order.CreatedAt,
			&order.OrderProduct.PharmacyID,
			&order.OrderProduct.PharmacyName,
			&order.OrderProduct.ProductID,
			&order.OrderProduct.ProductName,
			&order.OrderProduct.Quantity,
			&order.OrderProduct.Price,
			&order.OrderProduct.ProductThumbnailURL,
		); err != nil {

			return nil, err
		}
		orders = append(orders, order)
	}

	return orders, nil
}

func (r *pharmacistOrderRepositoryImpl) GetAllOrderFromPharmacist(ctx context.Context, request *dto.PharmacistGetOrderRequest, userId int64) ([]*entity.Order, error) {
	tx := transactor.ExtractTx(ctx)
	query := `
		select o.id, o.user_id, u.email, o.order_status, o.voice_number, o.payment_img_url, o.total_product_price, o.ship_cost, o.total_payment, o.description, o.created_at, p.id, p.name, p.image_url, ph.id, ph.name, op.price, op.quantity
		from orders o 
		join users u on u.id = o.user_id
		join order_products op on o.id = op.order_id 
		join pharmacy_products pp on op.pharmacy_product_id = pp.id 
		join products p on pp.product_id = p.id
		join pharmacies ph on pp.pharmacy_id = ph.id
	`
	args := []any{}

	if len(request.Pharmacy) != 0 {
		query = fmt.Sprintf("%v where ph.id = any($1) and ph.pharmacist_id = %d", query, userId)
		args = append(args, request.Pharmacy)
	} else {
		query = fmt.Sprintf("%v where ph.pharmacist_id = %d", query, userId)
	}

	if utilsOrder.ConvertOrderStatus(request.Status) != "" {
		query = fmt.Sprintf("%v and o.order_status = '%v'", query, utilsOrder.ConvertOrderStatus(request.Status))
	}

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

	entities := []*entity.Order{}
	for rows.Next() {
		entity := &entity.Order{OrderProduct: entity.OrderProduct{}}
		if err := rows.Scan(
			&entity.ID,
			&entity.UserID,
			&entity.UserEmail,
			&entity.OrderStatus,
			&entity.VoiceNumber,
			&entity.PaymentImgURL,
			&entity.TotalProductPrice,
			&entity.ShipCost,
			&entity.TotalPayment,
			&entity.Description,
			&entity.CreatedAt,
			&entity.OrderProduct.ProductID,
			&entity.OrderProduct.ProductName,
			&entity.OrderProduct.ProductThumbnailURL,
			&entity.OrderProduct.PharmacyID,
			&entity.OrderProduct.PharmacyName,
			&entity.OrderProduct.Price,
			&entity.OrderProduct.Quantity,
		); err != nil {
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

func (r *pharmacistOrderRepositoryImpl) IsPharmacistAssign(ctx context.Context, pharmacyId, pharmacistId int64) (bool, error) {
	query := `
		select pharmacist_id
		from pharmacies
		where id = $1 and pharmacist_id = $2
	`
	tx := transactor.ExtractTx(ctx)

	var err error

	if tx != nil {
		err = tx.QueryRowContext(ctx, query, &pharmacyId, &pharmacistId).Scan(&pharmacistId)
	} else {
		err = r.db.QueryRowContext(ctx, query, &pharmacyId, &pharmacistId).Scan(&pharmacistId)
	}

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return false, nil
		}
		return false, err
	}
	return true, nil
}

func (r *pharmacistOrderRepositoryImpl) SendOrderStatus(ctx context.Context, orders []*dto.OrderResponse) error {
	query := `
		update orders set order_status = 'SENT', updated_at = NOW()
		where order_status = 'PROCESSED' and id in (
	`
	placeholders := make([]string, len(orders))
	args := make([]any, len(orders))

	for i, order := range orders {
		placeholders[i] = fmt.Sprintf("$%v", i+1)
		args[i] = order.ID
	}
	query += strings.Join(placeholders, ",") + ")"

	tx := transactor.ExtractTx(ctx)

	var (
		err error
	)

	if tx != nil {
		_, err = tx.ExecContext(ctx, query, args...)
	} else {
		_, err = r.db.ExecContext(ctx, query, args...)
	}

	if err != nil {
		return err
	}

	return nil
}

func (r *pharmacistOrderRepositoryImpl) CancelOrderStatus(ctx context.Context, orders []*dto.OrderResponse) error {
	query := `
		update orders set order_status = 'CANCELLED', updated_at = NOW()
		where order_status in ('PROCESSED', 'WAITING') and id in (
	`
	placeholders := make([]string, len(orders))
	args := make([]any, len(orders))

	for i, order := range orders {
		placeholders[i] = fmt.Sprintf("$%v", i+1)
		args[i] = order.ID
	}
	query += strings.Join(placeholders, ",") + ")"

	tx := transactor.ExtractTx(ctx)

	var (
		err error
	)

	if tx != nil {
		_, err = tx.ExecContext(ctx, query, args...)
	} else {
		_, err = r.db.ExecContext(ctx, query, args...)
	}

	if err != nil {
		return err
	}

	return nil
}

func (r *pharmacistOrderRepositoryImpl) ConfirmOrderStatus(ctx context.Context, ids []int64) error {
	query := `
		update orders set order_status = 'CONFIRMED', updated_at = NOW()
		where order_status = 'PROCESSED' and id in (
	`
	placeholders := make([]string, len(ids))
	args := make([]any, len(ids))

	for i, order := range ids {
		placeholders[i] = fmt.Sprintf("$%v", i+1)
		args[i] = order
	}
	query += strings.Join(placeholders, ",") + ")"

	tx := transactor.ExtractTx(ctx)

	var (
		err error
	)

	if tx != nil {
		_, err = tx.ExecContext(ctx, query, args...)
	} else {
		_, err = r.db.ExecContext(ctx, query, args...)
	}

	if err != nil {
		return err
	}

	return nil
}

func (r *pharmacistOrderRepositoryImpl) ReturnStockOnCanceledOrder(ctx context.Context, productId, productQuantity int64) error {
	query := `
		update pharmacy_products set stock_quantity = stock_quantity + $2, updated_at = NOW(), stock_quantity_updated_at = NOW()
		where id = $1 and deleted_at is null
	`

	tx := transactor.ExtractTx(ctx)

	var err error

	if tx != nil {
		_, err = tx.ExecContext(ctx, query, &productId, &productQuantity)
	} else {
		_, err = r.db.ExecContext(ctx, query, &productId, &productQuantity)
	}

	if err != nil {
		return err
	}

	return nil
}
