package dto

import (
	"time"

	"healthcare-app/internal/product/entity"

	"github.com/shopspring/decimal"
)

type UserProductDetailResponse struct {
	ID                    int64                          `json:"id"`
	PharmacyProductID     int64                          `json:"pharmacy_product_id,omitempty"`
	Pharmacy              *Pharmacy                      `json:"pharmacy,omitempty"`
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

type Pharmacy struct {
	ID         int64       `json:"id"`
	Pharmacist *Pharmacist `json:"pharmacist"`
	Name       string      `json:"name"`
	Address    string      `json:"address"`
}

type Pharmacist struct {
	ID         int64  `json:"id"`
	Name       string `json:"name"`
	SipaNumber string `json:"sipa_number"`
}

type GetProductByCategoryRequest struct {
	ID    int64 `form:"-"`
	Limit int64 `form:"limit" binding:"numeric,gte=1,lte=25"`
	Page  int64 `form:"page" binding:"numeric,gte=1"`
}

func ConvertToUserProductDetailResponse(product *entity.Product, pharmacy *entity.Pharmacy) *UserProductDetailResponse {
	res := &UserProductDetailResponse{
		ID:                product.ID,
		PharmacyProductID: product.PharmacyProductID,
		Pharmacy: &Pharmacy{
			ID: pharmacy.ID,
			Pharmacist: &Pharmacist{
				ID:         pharmacy.PharmacistID,
				Name:       pharmacy.PharmacistName,
				SipaNumber: pharmacy.PharmacistSipaNumber,
			},
			Name:    pharmacy.Name,
			Address: pharmacy.Address,
		},
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
