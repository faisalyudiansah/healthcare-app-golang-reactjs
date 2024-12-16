package entity

import (
	"time"

	"github.com/shopspring/decimal"
)

type PharmacyProduct struct {
	Product                Product
	CreatedAt              time.Time
	StockQuantityUpdatedAt *time.Time
	Price                  decimal.Decimal
	ID                     int64
	PharmacyId             int64
	StockQuantity          int64
	SoldAmount             int64
	IsActive               bool
}
