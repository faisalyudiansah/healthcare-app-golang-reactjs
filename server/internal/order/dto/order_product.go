package dto

import (
	"github.com/shopspring/decimal"
)

type OrderProductResponse struct {
	Pharmacy pharmacy  `json:"pharmacy"`
	Products []product `json:"products"`
}

type pharmacy struct {
	ID   int64  `json:"id"`
	Name string `json:"name"`
}

type product struct {
	ID           int64           `json:"id"`
	Name         string          `json:"name"`
	Quantity     int64           `json:"quantity"`
	Price        decimal.Decimal `json:"price"`
	ThumbnailURL string          `json:"thumbnail_url"`
}
