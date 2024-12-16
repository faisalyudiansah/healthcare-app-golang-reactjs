package dto

import (
	"mime/multipart"
	"time"

	"healthcare-app/internal/pharmacy/entity"
)

type ResponsePartner struct {
	ID          int64     `json:"id"`
	Name        string    `json:"name"`
	LogoURL     string    `json:"logo_url"`
	YearFounded string    `json:"year_founded" time_format:"2006"`
	ActiveDays  string    `json:"active_days" `
	StartOpt    string    `json:"start_operation" time_format:"15:04"`
	EndOpt      string    `json:"end_operation" time_format:"15:04"`
	IsActive    bool      `json:"is_active"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type RequestCreatePartner struct {
	Name        string                `form:"name" binding:"required"`
	Logo        *multipart.FileHeader `form:"logo" binding:"required"`
	YearFounded string                `form:"year_founded" binding:"required,time_format=2006"`
	ActiveDays  []string              `form:"active_days" binding:"required,min=1,no_duplicates,dive,required,day_of_weeks"`
	StartOpt    string                `form:"start_operation" binding:"required,time_format=15:04"`
	EndOpt      string                `form:"end_operation" binding:"required,time_format=15:04"`
	IsActive    bool                  `form:"is_active,omitempty" binding:"omitempty,boolean"`
}

type RequestUpdatePartner struct {
	Name        string                `form:"name" binding:"required"`
	Logo        *multipart.FileHeader `form:"logo"`
	YearFounded string                `form:"year_founded" binding:"required,time_format=2006"`
	ActiveDays  []string              `form:"active_days" binding:"required,min=1,no_duplicates,dive,required,day_of_weeks"`
	StartOpt    string                `form:"start_operation" binding:"required,time_format=15:04"`
	EndOpt      string                `form:"end_operation" binding:"required,time_format=15:04"`
	IsActive    bool                  `form:"is_active,omitempty" binding:"omitempty,boolean"`
	ID          int64                 `form:"-"`
}

type RequestDeletePartner struct {
	ID int64 `json:"-"`
}

type AdminSearchPartnerRequest struct {
	Q     string `form:"q" binding:"omitempty"`
	Limit int64  `form:"limit" binding:"numeric,gte=1,lte=25"`
	Page  int64  `form:"page" binding:"numeric,gte=1"`
}

type AdminGetPartnerRequest struct {
	ID int64 `json:"-"`
}

func ConvertToPartnerResponses(partners []*entity.Partner) []*ResponsePartner {
	res := []*ResponsePartner{}
	for _, partner := range partners {
		res = append(res, ConvertToPartnerResponse(partner))
	}
	return res
}

func ConvertToPartnerResponse(partner *entity.Partner) *ResponsePartner {
	return &ResponsePartner{
		ID:          partner.ID,
		Name:        partner.Name,
		LogoURL:     partner.LogoURL,
		YearFounded: partner.YearFounded,
		ActiveDays:  partner.ActiveDays,
		StartOpt:    partner.StartOpt,
		EndOpt:      partner.EndOpt,
		IsActive:    partner.IsActive,
		CreatedAt:   partner.CreatedAt,
		UpdatedAt:   partner.UpdatedAt,
	}
}
