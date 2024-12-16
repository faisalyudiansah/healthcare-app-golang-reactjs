package dto

import (
	"time"

	"healthcare-app/internal/auth/entity"
)

type UserOrAdminResponse struct {
	ID             int64   `json:"id"`
	Role           int64   `json:"role"`
	Email          string  `json:"email"`
	Name           *string `json:"name"`
	WhatsappNumber *string `json:"whatsapp_number"`
	IsVerified     bool    `json:"is_verified"`
}

type RequestPharmacistCreateAccount struct {
	Email             string `json:"email" binding:"required,email"`
	Fullname          string `json:"full_name" binding:"required"`
	SipaNumber        string `json:"sipa_number" binding:"required"`
	WhatsappNumber    string `json:"whatsapp_number" binding:"required,phone_number"`
	YearsOfExperience int    `json:"years_of_experience" binding:"required,max=70,gte=0"`
}

type ResponsePharmacistCreateAccount struct {
	Email          string    `json:"email"`
	RoleId         int       `json:"role_id"`
	Role           string    `json:"role"`
	Fullname       string    `json:"full_name"`
	SipaNumber     string    `json:"sipa_number"`
	WhatsappNumber string    `json:"whatsapp_number"`
	ImageUrl       string    `json:"image_url"`
	CreatedAt      time.Time `json:"created_at"`
}

type RequestPharmacistUpdateAccount struct {
	PharmacistID      int64   `json:"pharmacist_id" binding:"required"`
	WhatsappNumber    *string `json:"whatsapp_number" binding:"omitempty,phone_number"`
	YearsOfExperience *int    `json:"years_of_experience" binding:"omitempty,max=70,gte=0"`
}

type RequestPharmacistDeleteAccount struct {
	PharmacistID int64 `json:"pharmacist_id" binding:"required"`
}

type ResponsePharmacistUpdateAccount struct {
	PharmacistID      int64  `json:"pharmacist_id"`
	Fullname          string `json:"full_name"`
	SipaNumber        string `json:"sipa_number"`
	WhatsappNumber    string `json:"whatsapp_number"`
	YearsOfExperience int    `json:"years_of_experience"`
}

type ResponsePharmacistDeleteAccount struct {
}

type SearchUserRequest struct {
	Role  []int64 `form:"role" binding:"required,dive,numeric,role"`
	Name  string  `form:"name"`
	Last  string  `form:"last" binding:"omitempty,numeric,gte=0"`
	Limit int64   `form:"limit" binding:"numeric,gte=1,lte=25"`
}

func ConvertToUserOrAdminResponses(users []*entity.UserOrAdmin) []*UserOrAdminResponse {
	responses := []*UserOrAdminResponse{}
	for _, user := range users {
		responses = append(responses, ConvertToUserOrAdminResponse(user))
	}
	return responses
}

func ConvertToUserOrAdminResponse(user *entity.UserOrAdmin) *UserOrAdminResponse {
	return &UserOrAdminResponse{
		ID:             user.ID,
		Role:           user.Role,
		Email:          user.Email,
		Name:           user.Name,
		WhatsappNumber: user.WhatsappNumber,
		IsVerified:     user.IsVerified,
	}
}
