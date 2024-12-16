package entity

import (
	"time"

	pharmacyEntity "healthcare-app/internal/pharmacy/entity"

	"github.com/shopspring/decimal"
)

type Order struct {
	OrderProduct      OrderProduct
	CreatedAt         time.Time
	TotalProductPrice decimal.Decimal
	ShipCost          decimal.Decimal
	TotalPayment      decimal.Decimal
	OrderStatus       string
	VoiceNumber       string
	PaymentImgURL     *string
	Description       *string
	ID                int64
	UserID            int64
	UserEmail         string
}

type OrderCheckout struct {
	ID                int64
	UserID            int64
	OrderStatus       string
	VoiceNumber       string
	PaymentImgURL     *string
	TotalProductPrice decimal.Decimal
	ShipCost          decimal.Decimal
	TotalPayment      decimal.Decimal
	Description       *string
	Address           string
	CreatedAt         time.Time
	UpdatedAt         time.Time
	DeletedAt         *time.Time
}

type OrderProductCheckout struct {
	ID                int64
	OrderID           int64
	PharmacyProductID int64
	Quantity          int
	Price             decimal.Decimal
	CreatedAt         time.Time
	UpdatedAt         time.Time
}

type OrderProductWithData struct {
	ID                int64
	OrderID           int64
	PharmacyProductID int64
	PharmacyProduct   pharmacyEntity.PharmacyProduct
	Quantity          int
	Price             decimal.Decimal
	CreatedAt         time.Time
	UpdatedAt         time.Time
}

type OrderWithData struct {
	ID                int64
	UserID            int64
	OrderStatus       string
	VoiceNumber       string
	PaymentImgURL     *string
	TotalProductPrice decimal.Decimal
	ShipCost          decimal.Decimal
	TotalPayment      decimal.Decimal
	Description       *string
	Address           string
	OrderProduct      OrderProductWithData
	CreatedAt         time.Time
	UpdatedAt         time.Time
	DeletedAt         *time.Time
}
