package entity

import (
	"time"

	productEntity "healthcare-app/internal/product/entity"

	"github.com/shopspring/decimal"
)

type PharmacyProduct struct {
	ID            int64
	Name          string
	PharmacyId    int64
	Pharmacy      PharmacyForCart
	ProductId     int64
	Product       productEntity.ProductForCart
	StockQuantity int64
	Price         decimal.Decimal
	SoldAmount    int64
	IsActive      bool
	CreatedAt     time.Time
	UpdatedAt     time.Time
	DeletedAt     *time.Time
}
