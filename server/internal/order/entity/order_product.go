package entity

import "github.com/shopspring/decimal"

type OrderProduct struct {
	Price               decimal.Decimal
	ProductName         string
	ProductThumbnailURL string
	PharmacyName        string
	ID                  int64
	OrderID             int64
	Quantity            int64
	PharmacyProductID   int64
	ProductID           int64
	PharmacyID          int64
}
