package dto

type RequestCart struct {
	PharmacyProductId int64 `json:"pharmacy_product_id" binding:"required,gte=1,numeric"`
	Quantity          int64 `json:"quantity" binding:"required,gte=1,numeric"`
}
