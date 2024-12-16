package dto

import "healthcare-app/internal/product/entity"

type ProductCategoryResponse struct {
	ID   int64  `json:"id"`
	Name string `json:"name"`
}

type CreateProductCategoryRequest struct {
	Name string `json:"name" binding:"required"`
}

type UpdateProductCategoryRequest struct {
	Name string `json:"name" binding:"required"`
	ID   int64  `json:"-"`
}

type DeleteProductCategoryRequest struct {
	ID int64 `json:"-"`
}

type SearchProductCategoryRequest struct {
	Q     string `form:"q" binding:"required"`
	Limit string `form:"limit" binding:"omitempty,numeric"`
	Page  string `form:"page" binding:"omitempty,numeric"`
}

func ConvertToProductCategoryResponses(productCategories []*entity.ProductCategory) []*ProductCategoryResponse {
	responses := []*ProductCategoryResponse{}
	for _, category := range productCategories {
		responses = append(responses, ConvertToProductCategoryResponse(category))
	}
	return responses
}

func ConvertToProductCategoryResponse(productCategory *entity.ProductCategory) *ProductCategoryResponse {
	return &ProductCategoryResponse{
		ID:   productCategory.ID,
		Name: productCategory.Name,
	}
}
