package dto

import (
	"strings"

	"healthcare-app/internal/pharmacy/entity"
	"healthcare-app/pkg/utils/geoutils"

	"github.com/shopspring/decimal"
)

type ResponsePharmacy struct {
	ID         int64       `json:"id"`
	Name       string      `json:"name"`
	Address    string      `json:"address"`
	City       string      `json:"city"`
	Pharmacist *pharmacist `json:"pharmacist,omitempty"`
	Partner    partner     `json:"partner"`
	IsActive   bool        `json:"is_active"`
}

type PharmacyDetailResponse struct {
	ID         int64               `json:"id"`
	Name       string              `json:"name"`
	Address    string              `json:"address"`
	City       string              `json:"city"`
	Pharmacist *pharmacist         `json:"pharmacist,omitempty"`
	Partner    *partner            `json:"partner"`
	Logistics  []*LogisticResponse `json:"logistics"`
	Latitude   string              `json:"latitude"`
	Longitude  string              `json:"longitude"`
	IsActive   bool                `json:"is_active"`
}

type ProductPharmacyResponse struct {
	ID         int64       `json:"id"`
	Name       string      `json:"name"`
	Address    string      `json:"address"`
	City       string      `json:"city"`
	Pharmacist *pharmacist `json:"pharmacist,omitempty"`
	Partner    partner     `json:"partner"`
	IsActive   bool        `json:"is_active"`
	Product    *product    `json:"product"`
}

type pharmacist struct {
	ID         int64  `json:"id"`
	Name       string `json:"name"`
	SipaNumber string `json:"sipa_number"`
}

type partner struct {
	ID   int64  `json:"id"`
	Name string `json:"name"`
}

type product struct {
	ID            int64           `json:"id"`
	StockQuantity int64           `json:"stock_quantity"`
	Price         decimal.Decimal `json:"price"`
}

type RequestCreatePharmacy struct {
	Name             string  `json:"name" binding:"required"`
	Address          string  `json:"address" binding:"required"`
	City             string  `json:"city" binding:"required"`
	PharmacistID     *int64  `json:"pharmacist_id,omitempty" binding:"omitempty,numeric"`
	Latitude         string  `json:"latitude" binding:"required,latitude"`
	Longitude        string  `json:"longitude" binding:"required,longitude"`
	PartnerID        int64   `json:"partner_id" binding:"required,numeric"`
	LogisticPartners []int64 `json:"logistic_partners" binding:"required,min=1,no_duplicates,dive,required,numeric"`
	IsActive         bool    `json:"is_active,omitempty" binding:"omitempty,boolean"`
}

type RequestUpdatePharmacy struct {
	Name             string  `json:"name" binding:"required"`
	Address          string  `json:"address" binding:"required"`
	City             string  `json:"city" binding:"required"`
	PharmacistID     *int64  `json:"pharmacist_id,omitempty" binding:"omitempty,numeric"`
	Latitude         string  `json:"latitude" binding:"required,latitude"`
	Longitude        string  `json:"longitude" binding:"required,longitude"`
	PartnerID        int64   `json:"partner_id" binding:"required,numeric"`
	LogisticPartners []int64 `json:"logistic_partners" binding:"required,min=1,no_duplicates,dive,required,numeric"`
	IsActive         bool    `json:"is_active,omitempty" binding:"omitempty,boolean"`
	ID               int64   `json:"-"`
}

type RequestDeletePharmacy struct {
	ID int64 `json:"-"`
}

type DownloadMedicineRequest struct {
	ID int64 `json:"-"`
}

type GetPharmacyRequest struct {
	ID int64 `json:"-"`
}

type GetProductPharmacyRequest struct {
	ProductID string `form:"product-id" binding:"required,numeric"`
	Limit     int64  `form:"limit" binding:"numeric,gte=1,lte=25"`
	Page      int64  `form:"page" binding:"numeric,gte=1"`
}

type SearchPharmacyRequest struct {
	Partner    []int64 `form:"partner" binding:"max=5,dive,numeric,gte=1"`
	Pharmacist []int64 `form:"pharmacist" binding:"max=5,dive,numeric,gte=1"`
	Name       string  `form:"name"`
	Last       string  `form:"last" binding:"omitempty,numeric,gte=0"`
	IsActive   string  `form:"is-active,omitempty" binding:"omitempty,boolean"`
	Limit      int64   `form:"limit" binding:"numeric,gte=1,lte=25"`
}

func ConvertToPharmacyResponses(pharmacies []*entity.Pharmacy) []*ResponsePharmacy {
	res := []*ResponsePharmacy{}
	for _, pharmacy := range pharmacies {
		res = append(res, ConvertToPharmacyResponse(pharmacy))
	}
	return res
}

func ConvertToPharmacyResponse(pharmacy *entity.Pharmacy) *ResponsePharmacy {
	var pharmac *pharmacist
	if pharmacy.PharmacistID != nil {
		pharmac = &pharmacist{ID: *pharmacy.PharmacistID, Name: pharmacy.PharmacistName}
	}

	return &ResponsePharmacy{
		ID:         pharmacy.ID,
		Name:       pharmacy.Name,
		Address:    pharmacy.Address,
		City:       pharmacy.City,
		Pharmacist: pharmac,
		Partner: partner{
			pharmacy.PartnerID,
			pharmacy.PartnerName,
		},
		IsActive: pharmacy.IsActive,
	}
}

func ConvertToPharmacyDetailResponse(pharmacy *entity.Pharmacy) *PharmacyDetailResponse {
	var pharmacis *pharmacist
	if pharmacy.PharmacistID != nil {
		pharmacis = &pharmacist{ID: *pharmacy.PharmacistID, Name: pharmacy.PharmacistName}
	}

	location := strings.Split(pharmacy.Location, " ")
	return &PharmacyDetailResponse{
		ID:         pharmacy.ID,
		Name:       pharmacy.Name,
		Address:    pharmacy.Address,
		City:       pharmacy.City,
		Pharmacist: pharmacis,
		Partner: &partner{
			pharmacy.PartnerID,
			pharmacy.PartnerName,
		},
		Longitude: location[0],
		Latitude:  location[1],
		Logistics: ConvertToLogisticResponses(pharmacy.Logistics),
		IsActive:  pharmacy.IsActive,
	}
}

func ConvertToProductPharmacyResponses(pharmacies []*entity.ProductPharmacy) []*ProductPharmacyResponse {
	responses := []*ProductPharmacyResponse{}
	for _, pharmacy := range pharmacies {
		responses = append(responses, ConvertToProductPharmacyResponse(pharmacy))
	}
	return responses
}

func ConvertToProductPharmacyResponse(pharmacy *entity.ProductPharmacy) *ProductPharmacyResponse {
	var pharmac *pharmacist
	if pharmacy.PharmacistID != nil {
		pharmac = &pharmacist{ID: *pharmacy.PharmacistID, Name: pharmacy.PharmacistName, SipaNumber: pharmacy.PharmacistSipaNumber}
	}

	return &ProductPharmacyResponse{
		ID:         pharmacy.ID,
		Name:       pharmacy.Name,
		Address:    pharmacy.Address,
		City:       pharmacy.City,
		Pharmacist: pharmac,
		Partner: partner{
			pharmacy.PartnerID,
			pharmacy.PartnerName,
		},
		IsActive: pharmacy.IsActive,
		Product: &product{
			ID:            pharmacy.PharmacyProductID,
			StockQuantity: pharmacy.StockQuantity,
			Price:         pharmacy.Price,
		},
	}
}

func RequestCreateToPharmacyEntity(pharmacy *RequestCreatePharmacy) *entity.Pharmacy {
	return &entity.Pharmacy{
		Name:         pharmacy.Name,
		Address:      pharmacy.Address,
		City:         pharmacy.City,
		Location:     geoutils.GeoFromText(pharmacy.Longitude, pharmacy.Latitude),
		PharmacistID: pharmacy.PharmacistID,
		PartnerID:    pharmacy.PartnerID,
		IsActive:     pharmacy.IsActive,
	}
}

func RequestUpdateToPharmacyEntity(pharmacy *RequestUpdatePharmacy) *entity.Pharmacy {
	return &entity.Pharmacy{
		ID:           pharmacy.ID,
		Name:         pharmacy.Name,
		Address:      pharmacy.Address,
		City:         pharmacy.City,
		Location:     geoutils.GeoFromText(pharmacy.Longitude, pharmacy.Latitude),
		PharmacistID: pharmacy.PharmacistID,
		PartnerID:    pharmacy.PartnerID,
		IsActive:     pharmacy.IsActive,
	}
}
