package repository

import (
	"context"
	"database/sql"
	"fmt"

	"healthcare-app/internal/order/dto"
	"healthcare-app/internal/order/entity"
	"healthcare-app/pkg/database/transactor"
)

type OrderRepository interface {
	FindAllByPharmacy(ctx context.Context, request *dto.AdminGetOrderRequest) ([]*entity.Order, error)
}

type orderRepositoryImpl struct {
	db *sql.DB
}

func NewOrderRepository(db *sql.DB) *orderRepositoryImpl {
	return &orderRepositoryImpl{
		db: db,
	}
}

func (r *orderRepositoryImpl) FindAllByPharmacy(ctx context.Context, request *dto.AdminGetOrderRequest) ([]*entity.Order, error) {
	tx := transactor.ExtractTx(ctx)
	query := `
		select o.id, u.email, o.order_status, o.voice_number, o.payment_img_url, o.total_product_price, o.ship_cost, o.total_payment, o.description, o.created_at, p.id, p.name, p.image_url, ph.id, ph.name, op.price, op.quantity
		from orders o 
		join users u on u.id = o.user_id
		join order_products op on o.id = op.order_id 
		join pharmacy_products pp on op.pharmacy_product_id = pp.id 
		join products p on pp.product_id = p.id
		join pharmacies ph on pp.pharmacy_id = ph.id
	`
	args := []any{}
	if len(request.Pharmacy) != 0 {
		query = fmt.Sprintf("%v where ph.id = any($1)", query)
		args = append(args, request.Pharmacy)
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
