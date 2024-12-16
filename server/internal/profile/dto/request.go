package dto

import "mime/multipart"

type RequestCreateAddress struct {
	Address            string `json:"address" binding:"required"`
	Province           string `json:"province" binding:"required"`
	CityID             int64  `json:"city_id" binding:"required"`
	City               string `json:"city" binding:"required"`
	District           string `json:"district" binding:"required"`
	SubDistrict        string `json:"sub_district" binding:"required"`
	ContactName        string `json:"contact_name" binding:"required"`
	ContactPhoneNumber string `json:"contact_phone_number" binding:"required,phone_number"`
	Latitude           string `json:"latitude" binding:"required,latitude"`
	Longitude          string `json:"longitude" binding:"required,longitude"`
}

type RequestPutAddress struct {
	Address            string `json:"address" binding:"omitempty"`
	Province           string `json:"province" binding:"omitempty"`
	CityID             int64  `json:"city_id" binding:"required"`
	City               string `json:"city" binding:"omitempty"`
	District           string `json:"district" binding:"omitempty"`
	SubDistrict        string `json:"sub_district" binding:"omitempty"`
	ContactName        string `json:"contact_name" binding:"required"`
	ContactPhoneNumber string `json:"contact_phone_number" binding:"required,phone_number"`
	Latitude           string `json:"latitude" binding:"omitempty,latitude"`
	Longitude          string `json:"longitude" binding:"omitempty,longitude"`
}

type RequestPutMyProfile struct {
	Fullname          string                `form:"full_name" binding:"omitempty"`
	WhatsappNumber    string                `form:"whatsapp_number" binding:"omitempty,phone_number"`
	ProfileImage      *multipart.FileHeader `form:"profile_image" binding:"omitempty"`
	YearsOfExperience *int                  `form:"years_of_experience" binding:"omitempty,max=70"`
}

type RequestProfileId struct {
	ID int64 `json:"-" binding:"required,numeric"`
}
