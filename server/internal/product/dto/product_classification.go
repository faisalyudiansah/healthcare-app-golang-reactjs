package dto

import "healthcare-app/internal/product/entity"

type ProductClassificationResponse struct {
	ID   int64  `json:"id"`
	Name string `json:"name"`
}

func ConvertToProductClassificationResponse(productClassification *entity.ProductClassification) *ProductClassificationResponse {
	return &ProductClassificationResponse{
		ID:   productClassification.ID,
		Name: productClassification.Name,
	}
}
