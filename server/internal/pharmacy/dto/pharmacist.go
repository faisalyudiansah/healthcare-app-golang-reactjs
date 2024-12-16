package dto

import (
	"healthcare-app/internal/pharmacy/entity"
	"healthcare-app/pkg/utils/geoutils"
)

type PharmacistUpdatePharmacyRequest struct {
	Name             string  `json:"name" binding:"required"`
	Address          string  `json:"address" binding:"required"`
	City             string  `json:"city" binding:"required"`
	Latitude         string  `json:"latitude" binding:"required,latitude"`
	Longitude        string  `json:"longitude" binding:"required,longitude"`
	PartnerID        int64   `json:"partner_id" binding:"required,numeric"`
	LogisticPartners []int64 `json:"logistic_partners" binding:"required,min=1,no_duplicates,dive,required,numeric"`
	IsActive         bool    `json:"is_active,omitempty" binding:"omitempty,boolean"`
	PharmacistID     int64   `json:"-"`
	ID               int64   `json:"-"`
}

type PharmacistSearchPharmacyRequest struct {
	Name         string `form:"name"`
	Limit        int64  `form:"limit" binding:"numeric,gte=1,lte=25"`
	Page         int64  `form:"page" binding:"numeric,gte=1"`
	PharmacistID int64
}

type PharmacistGetPharmacyRequest struct {
	ID           int64
	PharmacistID int64
}

func PharmacistUpdatePharmacyRequestToPharmacyEntity(pharmacy *PharmacistUpdatePharmacyRequest) *entity.Pharmacy {
	return &entity.Pharmacy{
		ID:           pharmacy.ID,
		Name:         pharmacy.Name,
		Address:      pharmacy.Address,
		City:         pharmacy.City,
		Location:     geoutils.GeoFromText(pharmacy.Longitude, pharmacy.Latitude),
		PharmacistID: &pharmacy.PharmacistID,
		PartnerID:    pharmacy.PartnerID,
		IsActive:     pharmacy.IsActive,
	}
}
