package dto

import (
	"mime/multipart"
	"time"

	"healthcare-app/internal/product/entity"

	"github.com/shopspring/decimal"
)

type ProductResponse struct {
	ID                    int64                          `json:"id"`
	PharmacyProductID     int64                          `json:"pharmacy_product_id,omitempty"`
	ProductClassification *ProductClassificationResponse `json:"product_classification,omitempty"`
	Name                  string                         `json:"name"`
	SellingUnit           *string                        `json:"selling_unit"`
	SoldAmount            int64                          `json:"sold_amount"`
	Price                 decimal.Decimal                `json:"price,omitempty"`
	StockQuantity         int64                          `json:"stock_quantity,omitempty"`
	ThumbnailURL          *string                        `json:"thumbnail_url"`
}

type ProductDetailResponse struct {
	ID                    int64                          `json:"id"`
	PharmacyProductID     int64                          `json:"pharmacy_product_id,omitempty"`
	Manufacture           *ManufactureResponse           `json:"manufacture,omitempty"`
	ProductClassification *ProductClassificationResponse `json:"product_classification,omitempty"`
	ProductForm           *ProductFormResponse           `json:"product_form,omitempty"`
	ProductCategories     []*ProductCategoryResponse     `json:"product_categories,omitempty"`
	Name                  string                         `json:"name"`
	GenericName           string                         `json:"generic_name"`
	Description           string                         `json:"description"`
	UnitInPack            *string                        `json:"unit_in_pack"`
	SellingUnit           *string                        `json:"selling_unit"`
	SoldAmount            int64                          `json:"sold_amount"`
	Weight                decimal.Decimal                `json:"weight"`
	Height                decimal.Decimal                `json:"height"`
	Length                decimal.Decimal                `json:"length"`
	Width                 decimal.Decimal                `json:"width"`
	Price                 decimal.Decimal                `json:"price,omitempty"`
	StockQuantity         int64                          `json:"stock_quantity,omitempty"`
	ThumbnailURL          *string                        `json:"thumbnail_url"`
	ImageURL              *string                        `json:"image_url"`
	SecondaryImageURL     *string                        `json:"secondary_image_url,omitempty"`
	TertiaryImageURL      *string                        `json:"tertiary_image_url,omitempty"`
	IsActive              bool                           `json:"is_active"`
	CreatedAt             time.Time                      `json:"created_at"`
}

type CreateProductRequest struct {
	ManufactureID           int64                 `form:"manufacture_id" binding:"required,numeric"`
	ProductClassificationID int64                 `form:"product_classification_id" binding:"required,numeric"`
	ProductFormID           *int64                `form:"product_form_id" binding:"omitempty,numeric"`
	ProductCategories       []int64               `form:"product_categories" binding:"required,min=1,max=20,no_duplicates,dive,required,numeric"`
	Name                    string                `form:"name" binding:"required,max=75"`
	GenericName             string                `form:"generic_name" binding:"required"`
	Description             string                `form:"description" binding:"required"`
	UnitInPack              *string               `form:"unit_in_pack,omitempty"`
	SellingUnit             *string               `form:"selling_unit,omitempty"`
	Weight                  *decimal.Decimal      `form:"weight" binding:"required,dgt=0"`
	Height                  *decimal.Decimal      `form:"height" binding:"required,dgt=0"`
	Length                  *decimal.Decimal      `form:"length" binding:"required,dgt=0"`
	Width                   *decimal.Decimal      `form:"width" binding:"required,dgt=0"`
	IsActive                bool                  `form:"is_active" binding:"required,boolean"`
	Thumbnail               *multipart.FileHeader `form:"thumbnail" binding:"required"`
	Image                   *multipart.FileHeader `form:"image" binding:"required"`
	SecondaryImage          *multipart.FileHeader `form:"secondary_image"`
	TertiaryImage           *multipart.FileHeader `form:"tertiary_image"`
}

type UpdateProductRequest struct {
	ID                      int64                 `form:"-"`
	ManufactureID           int64                 `form:"manufacture_id" binding:"required,numeric"`
	ProductClassificationID int64                 `form:"product_classification_id" binding:"required,numeric"`
	ProductFormID           *int64                `form:"product_form_id" binding:"omitempty,numeric"`
	ProductCategories       []int64               `form:"product_categories" binding:"required,min=1,max=20,no_duplicates,dive,required,numeric"`
	Name                    string                `form:"name" binding:"required,max=75"`
	GenericName             string                `form:"generic_name" binding:"required"`
	Description             string                `form:"description" binding:"required"`
	UnitInPack              *string               `form:"unit_in_pack,omitempty"`
	SellingUnit             *string               `form:"selling_unit,omitempty"`
	Weight                  *decimal.Decimal      `form:"weight" binding:"required,dgt=0"`
	Height                  *decimal.Decimal      `form:"height" binding:"required,dgt=0"`
	Length                  *decimal.Decimal      `form:"length" binding:"required,dgt=0"`
	Width                   *decimal.Decimal      `form:"width" binding:"required,dgt=0"`
	IsActive                bool                  `form:"is_active" binding:"required,boolean"`
	Thumbnail               *multipart.FileHeader `form:"thumbnail"`
	Image                   *multipart.FileHeader `form:"image"`
	SecondaryImage          *multipart.FileHeader `form:"secondary_image"`
	TertiaryImage           *multipart.FileHeader `form:"tertiary_image"`
}

type GetProductRequest struct {
	ID int64 `json:"-"`
}

type DeleteProductRequest struct {
	ID int64 `json:"-"`
}

type SearchProductRequest struct {
	SortBy                []string `form:"sort-by"`
	Sort                  []string `form:"sort"`
	ProductClassification []int64  `form:"product-classification" binding:"max=4,dive,numeric,gte=1"`
	ProductForm           []int64  `form:"product-form" binding:"max=5,dive,numeric,gte=1"`
	Manufacturer          []int64  `form:"manufacture" binding:"max=5,dive,numeric,gte=1"`
	Limit                 int64    `form:"limit" binding:"numeric,gte=1,lte=25"`
	Page                  int64    `form:"page" binding:"numeric,gte=1"`
	IsActive              string   `form:"is-active" binding:"omitempty,boolean"`
	Name                  string   `form:"name"`
	GenericName           string   `form:"generic-name"`
	Description           string   `form:"description"`
}

type UserSearchProductRequest struct {
	SortBy                string  `form:"sort-by"`
	Sort                  string  `form:"sort"`
	ProductClassification []int64 `form:"product-classification" binding:"max=4,dive,numeric,gte=1"`
	Limit                 int64   `form:"limit" binding:"numeric,gte=1,lte=25"`
	Page                  int64   `form:"page" binding:"numeric,gte=1"`
	Name                  string  `form:"name"`
	GenericName           string  `form:"generic-name"`
}

type HomeProductRequest struct {
	Location string `form:"-"`
	Limit    int64  `form:"limit" binding:"numeric,gte=1,lte=25"`
	Page     int64  `form:"page" binding:"numeric,gte=1"`
	UserID   int64  `form:"-"`
}

func ConvertToProductResponses(products []*entity.Product) []*ProductResponse {
	res := []*ProductResponse{}
	for _, product := range products {
		res = append(res, ConvertToProductResponse(product))
	}
	return res
}

func ConvertToProductResponse(product *entity.Product) *ProductResponse {
	res := &ProductResponse{
		ID:                product.ID,
		PharmacyProductID: product.PharmacyProductID,
		Name:              product.Name,
		SellingUnit:       product.SellingUnit,
		SoldAmount:        product.SoldAmount,
		Price:             product.Price,
		StockQuantity:     product.StockQuantity,
		ThumbnailURL:      product.ThumbnailURL,
	}

	if product.ProductClassification.Name != "" {
		res.ProductClassification = ConvertToProductClassificationResponse(&product.ProductClassification)
	}

	return res
}

func ConvertToProductDetailResponse(product *entity.Product) *ProductDetailResponse {
	res := &ProductDetailResponse{
		ID:                product.ID,
		PharmacyProductID: product.PharmacyProductID,
		Name:              product.Name,
		GenericName:       product.GenericName,
		Description:       product.Description,
		UnitInPack:        product.UnitInPack,
		SellingUnit:       product.SellingUnit,
		SoldAmount:        product.SoldAmount,
		Weight:            product.Weight,
		Height:            product.Height,
		Length:            product.Length,
		Width:             product.Width,
		Price:             product.Price,
		StockQuantity:     product.StockQuantity,
		ThumbnailURL:      product.ThumbnailURL,
		ImageURL:          product.ImageURL,
		SecondaryImageURL: product.SecondaryImageURL,
		TertiaryImageURL:  product.TertiaryImageURL,
		IsActive:          product.IsActive,
		CreatedAt:         product.CreatedAt,
	}

	if product.Manufacture.Name != "" {
		res.Manufacture = ConvertToManufactureResponse(&product.Manufacture)
	}
	if product.ProductClassification.Name != "" {
		res.ProductClassification = ConvertToProductClassificationResponse(&product.ProductClassification)
	}
	if product.ProductForm.Name != nil {
		res.ProductForm = ConvertToProductFormResponse(product.ProductForm)
	}
	if len(product.ProductCategories) != 0 {
		res.ProductCategories = ConvertToProductCategoryResponses(product.ProductCategories)
	}

	return res
}

func CreateRequestToProductEntity(request *CreateProductRequest) *entity.Product {
	var productForm *entity.ProductForm
	if request.ProductFormID != nil {
		productForm = &entity.ProductForm{ID: request.ProductFormID}
	}

	return &entity.Product{
		Manufacture:           entity.Manufacture{ID: request.ManufactureID},
		ProductClassification: entity.ProductClassification{ID: request.ProductClassificationID},
		ProductForm:           productForm,
		Name:                  request.Name,
		GenericName:           request.GenericName,
		Description:           request.Description,
		UnitInPack:            request.UnitInPack,
		SellingUnit:           request.SellingUnit,
		Height:                *request.Height,
		Weight:                *request.Weight,
		Length:                *request.Length,
		Width:                 *request.Width,
		IsActive:              request.IsActive,
	}
}

func UpdateRequestToProductEntity(request *UpdateProductRequest) *entity.Product {
	var productForm *entity.ProductForm
	if request.ProductFormID != nil {
		productForm = &entity.ProductForm{ID: request.ProductFormID}
	}

	return &entity.Product{
		ID:                    request.ID,
		Manufacture:           entity.Manufacture{ID: request.ManufactureID},
		ProductClassification: entity.ProductClassification{ID: request.ProductClassificationID},
		ProductForm:           productForm,
		Name:                  request.Name,
		GenericName:           request.GenericName,
		Description:           request.Description,
		UnitInPack:            request.UnitInPack,
		SellingUnit:           request.SellingUnit,
		Height:                *request.Height,
		Weight:                *request.Weight,
		Length:                *request.Length,
		Width:                 *request.Width,
		IsActive:              request.IsActive,
	}
}
