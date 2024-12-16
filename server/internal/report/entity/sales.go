package entity

import "github.com/shopspring/decimal"

type CategorySales struct {
	PharmacyID   int64
	PharmacyName string
	CategoryName string
	TotalAmount  decimal.Decimal
	TotalItem    int64
}

type ClassificationSales struct {
	PharmacyID         int64
	PharmacyName       string
	ClassificationName string
	TotalAmount        decimal.Decimal
	TotalItem          int64
}
