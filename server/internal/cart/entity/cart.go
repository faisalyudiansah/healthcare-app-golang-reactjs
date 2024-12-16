package entity

import (
	"time"

	pharmacyEntity "healthcare-app/internal/pharmacy/entity"
	productEntity "healthcare-app/internal/product/entity"
)

type Cart struct {
	ID         int64
	UserId     int64
	ProductId  int64
	PharmacyId int64
	Quantity   int64
	CreatedAt  time.Time
	UpdatedAt  time.Time
}

type CartWithData struct {
	ID              int64
	UserId          int64
	PharmacyProduct pharmacyEntity.PharmacyProduct
	Quantity        int64
	CreatedAt       time.Time
	UpdatedAt       time.Time
}

type CartWithProduct struct {
	ID        int64
	UserId    int64
	Product   productEntity.ProductForCart
	Quantity  int64
	CreatedAt time.Time
	UpdatedAt time.Time
}

type CartWithPharmacyProductId struct {
	ID                int64
	UserId            int64
	PharmacyProductId int64
	Quantity          int64
	CreatedAt         time.Time
	UpdatedAt         time.Time
}
