package dto

import (
	"time"

	dtoPharmacy "healthcare-app/internal/pharmacy/dto"

	"github.com/shopspring/decimal"
)

type ResponseCart struct {
	UserId             int64                       `json:"user_id"`
	TotalPrice         decimal.Decimal             `json:"total_price"`
	PharmacyAndProduct ResponsePharmacyWithProduct `json:"data_pharmacy_products"`
	CreatedAt          time.Time                   `json:"created_at"`
	UpdatedAt          time.Time                   `json:"updated_at"`
}

type CartCountResponse struct {
	Count int64 `json:"count"`
}

type ResponsePharmacyWithProduct struct {
	SoldAmount       int64                        `json:"sold_amount"`
	PricePerPharmacy decimal.Decimal              `json:"total_price_per_pharmacy"`
	Pharmacy         ResponsePharmacy             `json:"pharmacy_info"`
	Product          []ResponseProductAndQuantity `json:"products_info"`
}

type ResponseProductAndQuantity struct {
	ID            int64           `json:"id"`
	Quantity      int64           `json:"quantity_in_cart"`
	StockQuantity int64           `json:"stock_quantity"`
	Price         decimal.Decimal `json:"price"`
	Product       ResponseProduct `json:"products"`
}

type ResponsePharmacy struct {
	ID           int64                       `json:"id"`
	PharmacistID *int64                      `json:"pharmacist_id"`
	PartnerID    int64                       `json:"partner_id"`
	Partner      dtoPharmacy.ResponsePartner `json:"partner"`
	Name         string                      `json:"name"`
	Address      string                      `json:"address"`
	CityID       int64                       `json:"city_id"`
	City         string                      `json:"city"`
	Latitude     string                      `json:"latitude"`
	Longitude    string                      `json:"longitude"`
	IsActive     bool                        `json:"is_active"`
	CreatedAt    time.Time                   `json:"created_at"`
	UpdatedAt    time.Time                   `json:"updated_at"`
}

type ResponseProduct struct {
	ID                      int64           `json:"id"`
	ManufactureID           int64           `json:"manufacture_id"`
	ProductClassificationID int64           `json:"product_classification_id"`
	ProductFormID           *int64          `json:"product_form_id"`
	Name                    string          `json:"name"`
	GenericName             string          `json:"generic_name"`
	Description             string          `json:"description"`
	UnitInPack              *string         `json:"unit_in_pack"`
	SellingUnit             *string         `json:"selling_unit"`
	SoldAmount              int             `json:"sold_amount"`
	Weight                  decimal.Decimal `json:"weight"`
	Height                  decimal.Decimal `json:"height"`
	Length                  decimal.Decimal `json:"length"`
	Width                   decimal.Decimal `json:"width"`
	ImageURL                string          `json:"image_url"`
	IsActive                bool            `json:"is_active"`
	CreatedAt               time.Time       `json:"created_at"`
	UpdatedAt               time.Time       `json:"updated_at"`
	DeletedAt               *time.Time      `json:"deleted_at"`
}
