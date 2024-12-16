package dto

import (
	"time"

	"healthcare-app/internal/product/entity"

	"github.com/shopspring/decimal"
)

type PharmacyProductResponse struct {
	ID            int64           `json:"id"`
	Product       product         `json:"product"`
	StockQuantity int64           `json:"stock_quantity"`
	Price         decimal.Decimal `json:"price"`
	IsActive      bool            `json:"is_active"`
	CreatedAt     time.Time       `json:"created_at"`
}

type product struct {
	ID                    int64                          `json:"id"`
	Manufacture           *ManufactureResponse           `json:"manufacture,omitempty"`
	ProductClassification *ProductClassificationResponse `json:"product_classification,omitempty"`
	ProductForm           *ProductFormResponse           `json:"product_form,omitempty"`
	Name                  string                         `json:"name,omitempty"`
	GenericName           string                         `json:"generic_name,omitempty"`
	Description           string                         `json:"description,omitempty"`
	ThumbnailURL          string                         `json:"thumbnail_url,omitempty"`
	ImageURL              string                         `json:"image_url,omitempty"`
	IsActive              bool                           `json:"is_active,omitempty"`
}

type CreatePharmacyProductRequest struct {
	PharmacistID  int64           `json:"-"`
	PharmacyID    int64           `json:"-"`
	ProductID     int64           `json:"product_id" binding:"required"`
	StockQuantity int64           `json:"stock_quantity" binding:"required,gte=1"`
	Price         decimal.Decimal `json:"price" binding:"required,dgte=1"`
	IsActive      bool            `json:"is_active" binding:"required,boolean"`
}

type UpdatePharmacyProductRequest struct {
	ID            int64 `json:"-"`
	PharmacistID  int64 `json:"-"`
	PharmacyID    int64 `json:"-"`
	StockQuantity int64 `json:"stock_quantity" binding:"required,gte=1"`
	IsActive      bool  `json:"is_active" binding:"required,boolean"`
}

type DeletePharmacyProductRequest struct {
	ID           int64 `json:"-"`
	PharmacistID int64 `json:"-"`
	PharmacyID   int64 `json:"-"`
}

type GetPharmacyProductRequest struct {
	ID           int64 `json:"-"`
	PharmacistID int64 `json:"-"`
	PharmacyID   int64 `json:"-"`
}

type SearchPharmacyProductRequest struct {
	SortBy                []string `form:"sort-by"`
	Sort                  []string `form:"sort"`
	ProductClassification []int64  `form:"product-classification" binding:"max=4,dive,numeric"`
	ProductForm           []int64  `form:"product-form" binding:"max=5,dive,numeric"`
	Manufacturer          []int64  `form:"manufacture" binding:"max=5,dive,numeric"`
	Limit                 int64    `form:"limit" binding:"numeric,gte=1,lte=25"`
	Page                  int64    `form:"page" binding:"numeric,gte=1"`
	IsActive              string   `form:"is-active" binding:"omitempty,boolean"`
	Name                  string   `form:"name"`
	GenericName           string   `form:"generic-name"`
	PharmacistID          int64    `json:"-"`
	PharmacyID            int64    `form:"-"`
}

func ConvertToPharmacyProductResponses(entities []*entity.PharmacyProduct) []*PharmacyProductResponse {
	responses := []*PharmacyProductResponse{}
	for _, entity := range entities {
		responses = append(responses, ConvertToPharmacyProductResponse(entity))
	}
	return responses
}

func ConvertToPharmacyProductResponse(entity *entity.PharmacyProduct) *PharmacyProductResponse {
	product := product{
		ID:          entity.Product.ID,
		Name:        entity.Product.Name,
		GenericName: entity.Product.GenericName,
		Description: entity.Product.Description,
		IsActive:    entity.Product.IsActive,
	}

	if entity.Product.ThumbnailURL != nil {
		product.ThumbnailURL = *entity.Product.ThumbnailURL
	}
	if entity.Product.ImageURL != nil {
		product.ImageURL = *entity.Product.ImageURL
	}

	if entity.Product.Manufacture.Name != "" {
		product.Manufacture = ConvertToManufactureResponse(&entity.Product.Manufacture)
	}
	if entity.Product.ProductClassification.Name != "" {
		product.ProductClassification = ConvertToProductClassificationResponse(&entity.Product.ProductClassification)
	}
	if entity.Product.ProductForm.Name != nil {
		product.ProductForm = ConvertToProductFormResponse(entity.Product.ProductForm)
	}

	return &PharmacyProductResponse{
		ID:            entity.ID,
		Product:       product,
		StockQuantity: entity.StockQuantity,
		Price:         entity.Price,
		IsActive:      entity.IsActive,
		CreatedAt:     entity.CreatedAt,
	}
}

func UpdateRequestToPharmacyProductEntity(request *UpdatePharmacyProductRequest) *entity.PharmacyProduct {
	return &entity.PharmacyProduct{
		ID:            request.ID,
		Product:       entity.Product{Manufacture: entity.Manufacture{}, ProductClassification: entity.ProductClassification{}, ProductForm: &entity.ProductForm{}},
		PharmacyId:    request.PharmacyID,
		StockQuantity: request.StockQuantity,
		IsActive:      request.IsActive,
	}
}

func CreateRequestToPharmacyProductEntity(request *CreatePharmacyProductRequest) *entity.PharmacyProduct {
	return &entity.PharmacyProduct{
		PharmacyId:    request.PharmacyID,
		Product:       entity.Product{ID: request.ProductID, Manufacture: entity.Manufacture{}, ProductClassification: entity.ProductClassification{}, ProductForm: &entity.ProductForm{}},
		StockQuantity: request.StockQuantity,
		IsActive:      request.IsActive,
		Price:         request.Price,
	}
}
