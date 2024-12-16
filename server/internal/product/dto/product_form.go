package dto

import (
	"healthcare-app/internal/product/entity"
)

type ProductFormResponse struct {
	ID   int64  `json:"id"`
	Name string `json:"name"`
}

type SearchProductFormRequest struct {
	Q     string `form:"q" binding:"omitempty"`
	Limit int64  `form:"limit" binding:"numeric,gte=1,lte=25"`
	Page  int64  `form:"page" binding:"numeric,gte=1"`
}

func ConvertToProductFormResponses(productForms []*entity.ProductForm) []*ProductFormResponse {
	res := []*ProductFormResponse{}
	for _, productForm := range productForms {
		res = append(res, ConvertToProductFormResponse(productForm))
	}
	return res
}

func ConvertToProductFormResponse(productForm *entity.ProductForm) *ProductFormResponse {
	return &ProductFormResponse{
		ID:   *productForm.ID,
		Name: *productForm.Name,
	}
}
