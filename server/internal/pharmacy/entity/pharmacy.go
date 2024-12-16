package entity

import (
	"time"

	"github.com/shopspring/decimal"
)

type Pharmacy struct {
	CreatedAt      time.Time
	UpdatedAt      time.Time
	Name           string
	Address        string
	City           string
	Location       string
	ID             int64
	PharmacistID   *int64
	PharmacistName string
	PartnerID      int64
	PartnerName    string
	Logistics      []*Logistic
	IsActive       bool
}

type ProductPharmacy struct {
	PharmacistID         *int64
	PharmacistName       string
	PharmacistSipaNumber string
	PartnerID            int64
	PartnerName          string
	ID                   int64
	Name                 string
	Address              string
	City                 string
	Location             string
	IsActive             bool
	PharmacyProductID    int64
	StockQuantity        int64
	Price                decimal.Decimal
}

type PharmacyForCart struct {
	ID           int64
	PharmacistID *int64
	PartnerID    int64
	Partner      Partner
	Name         string
	Address      string
	CityID       int64
	City         string
	Latitude     string
	Longitude    string
	IsActive     bool
	CreatedAt    time.Time
	UpdatedAt    time.Time
}
