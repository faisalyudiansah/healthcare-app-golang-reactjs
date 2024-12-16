package dto

import (
	"time"

	"healthcare-app/internal/auth/entity"
)

type UserPharmacistResponse struct {
	ID                int64     `json:"id"`
	Name              string    `json:"name"`
	Email             string    `json:"email"`
	SipaNumber        string    `json:"sipa_number"`
	WhatsappNumber    string    `json:"whatsapp_number"`
	YearsOfExperience int64     `json:"years_of_experience"`
	IsAssigned        bool      `json:"is_assigned"`
	CreatedAt         time.Time `json:"created_at"`
}

type SearchPharmacistRequest struct {
	SortBy   []string `form:"sort-by"`
	Sort     []string `form:"sort"`
	Name     string   `form:"name"`
	Sipa     string   `form:"sipa"`
	Whatsapp string   `form:"whatsapp"`
	Email    string   `form:"email"`
	MinYoe   int64    `form:"min-yoe" binding:"gte=0,ltecsfield=MaxYoe"`
	MaxYoe   int64    `form:"max-yoe" binding:"gte=0,lte=100,gtecsfield=MinYoe"`
	Limit    int64    `form:"limit" binding:"numeric,gte=1,lte=25"`
	Page     int64    `form:"page" binding:"numeric,gte=1"`
}

func ConvertToUserPharmacistResponses(pharmacists []*entity.UserPharmacist) []*UserPharmacistResponse {
	responses := []*UserPharmacistResponse{}
	for _, pharmacist := range pharmacists {
		responses = append(responses, ConvertToUserPharmacistResponse(pharmacist))
	}
	return responses
}

func ConvertToUserPharmacistResponse(pharmacist *entity.UserPharmacist) *UserPharmacistResponse {
	return &UserPharmacistResponse{
		ID:                pharmacist.ID,
		Name:              pharmacist.Fullname,
		Email:             pharmacist.Email,
		SipaNumber:        pharmacist.SipaNumber,
		WhatsappNumber:    pharmacist.WhatsappNumber,
		YearsOfExperience: pharmacist.YearsOfExperience,
		IsAssigned:        pharmacist.IsAssigned,
		CreatedAt:         pharmacist.CreatedAt,
	}
}
