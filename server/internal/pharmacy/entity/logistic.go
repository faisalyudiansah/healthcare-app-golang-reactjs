package entity

import (
	"time"

	"github.com/shopspring/decimal"
)

type Logistic struct {
	ID          int64
	Code        string
	Service     string
	MinDelivery int64
	MaxDelivery int64
	PricePerKM  decimal.Decimal
	CreatedAt   time.Time
	UpdatedAt   time.Time
}
