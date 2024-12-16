package dto

import (
	"healthcare-app/internal/pharmacy/entity"

	"github.com/shopspring/decimal"
)

type ShippingResponse struct {
	Code       string          `json:"code"`
	Service    string          `json:"service"`
	Estimation string          `json:"estimation"`
	ShipCost   decimal.Decimal `json:"ship_cost"`
}

type RajaOngkirResponse struct {
	RajaOngkir RajaOngkir `json:"rajaongkir"`
}

type RajaOngkir struct {
	Query              Query           `json:"query"`
	Status             Status          `json:"status"`
	OriginDetails      LocationDetails `json:"origin_details"`
	DestinationDetails LocationDetails `json:"destination_details"`
	Results            []CourierResult `json:"results"`
}

type Query struct {
	Origin      string `json:"origin"`
	Destination string `json:"destination"`
	Weight      int    `json:"weight"`
	Courier     string `json:"courier"`
}

type Status struct {
	Code        int    `json:"code"`
	Description string `json:"description"`
}

type LocationDetails struct {
	CityID     string `json:"city_id"`
	ProvinceID string `json:"province_id"`
	Province   string `json:"province"`
	Type       string `json:"type"`
	CityName   string `json:"city_name"`
	PostalCode string `json:"postal_code"`
}

type CourierResult struct {
	Code  string        `json:"code"`
	Name  string        `json:"name"`
	Costs []ServiceCost `json:"costs"`
}

type ServiceCost struct {
	Service     string       `json:"service"`
	Description string       `json:"description"`
	Cost        []CostDetail `json:"cost"`
}

type CostDetail struct {
	Value int    `json:"value"`
	ETD   string `json:"etd"`
	Note  string `json:"note"`
}

type RajaOngkirCostRequest struct {
	UserID      int64 `form:"-"`
	AddressID   int64 `form:"address_id" binding:"required,numeric,gte=1"`
	PharmacyID  int64 `form:"pharmacy_id" binding:"required,numeric,gte=1"`
	Origin      int64 `form:"origin" binding:"required,numeric,gte=1"`
	Destination int64 `form:"destination" binding:"required,numeric,gte=1"`
	Weight      int64 `form:"weight" binding:"required,numeric,gte=1"`
}

type CalculateOfficialCostRequest struct {
	AddressID  int64
	PharmacyID int64
	Logistic   *entity.Logistic
}
