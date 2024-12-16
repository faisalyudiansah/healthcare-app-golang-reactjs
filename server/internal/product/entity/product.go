package entity

import (
	"time"

	"github.com/shopspring/decimal"
)

type Product struct {
	ID                    int64
	Manufacture           Manufacture
	ProductClassification ProductClassification
	ProductForm           *ProductForm
	ProductCategories     []*ProductCategory
	PharmacyProductID     int64
	Name                  string
	GenericName           string
	Description           string
	UnitInPack            *string
	SellingUnit           *string
	SoldAmount            int64
	Weight                decimal.Decimal
	Height                decimal.Decimal
	Length                decimal.Decimal
	Width                 decimal.Decimal
	Price                 decimal.Decimal
	StockQuantity         int64
	ThumbnailURL          *string
	ImageURL              *string
	SecondaryImageURL     *string
	TertiaryImageURL      *string
	IsActive              bool
	CreatedAt             time.Time
	UpdatedAt             time.Time
}

type ProductForCart struct {
	ID                      int64
	ManufactureID           int64
	ProductClassificationID int64
	ProductFormID           *int64
	Name                    string
	GenericName             string
	Description             string
	UnitInPack              *string
	SellingUnit             *string
	SoldAmount              int
	Weight                  decimal.Decimal
	Height                  decimal.Decimal
	Length                  decimal.Decimal
	Width                   decimal.Decimal
	ImageURL                string
	IsActive                bool
	CreatedAt               time.Time
	UpdatedAt               time.Time
	DeletedAt               *time.Time
}

type ProductActiveAndQuantity struct {
	ProductID         int64
	IsActive          bool
	PharmacyProductID int64
	StockQuantity     int
	SoldAmount        int
}
