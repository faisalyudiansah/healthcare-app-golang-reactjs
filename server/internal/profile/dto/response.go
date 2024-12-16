package dto

import (
	"strings"
	"time"

	dtoAuth "healthcare-app/internal/auth/dto"
	"healthcare-app/internal/profile/entity"
)

type ResponseAddress struct {
	ID                 int64      `json:"id"`
	UserId             int64      `json:"user_id"`
	IsActive           bool       `json:"is_active"`
	Address            string     `json:"address"`
	Province           string     `json:"province"`
	CityID             int64      `json:"city_id"`
	City               string     `json:"city"`
	District           string     `json:"district"`
	SubDistrict        string     `json:"sub_district"`
	Latitude           string     `json:"latitude"`
	Longitude          string     `json:"longitude"`
	ContactName        string     `json:"contact_name"`
	ContactPhoneNumber string     `json:"contact_phone_number"`
	CreatedAt          time.Time  `json:"created_at"`
	UpdatedAt          time.Time  `json:"updated_at"`
	DeletedAt          *time.Time `json:"deleted_at,omitempty"`
}

type ResponseProfile struct {
	ID         int64                       `json:"id"`
	RoleId     int                         `json:"role_id"`
	Role       string                      `json:"role"`
	Email      string                      `json:"email"`
	IsVerified bool                        `json:"is_verified"`
	UserDetail *dtoAuth.ResponseUserDetail `json:"user_detail"`
	Address    []*ResponseAddress          `json:"address"`
	CreatedAt  time.Time                   `json:"created_at"`
	UpdatedAt  time.Time                   `json:"updated_at"`
	DeletedAt  *time.Time                  `json:"deleted_at"`
}

func ConvertToAddressResponses(addresses []*entity.Address) []*ResponseAddress {
	responses := []*ResponseAddress{}
	for _, address := range addresses {
		responses = append(responses, ConvertToAddressResponse(address))
	}
	return responses
}

func ConvertToAddressResponse(address *entity.Address) *ResponseAddress {
	location := strings.Split(address.Location, " ")

	return &ResponseAddress{
		ID:                 address.ID,
		UserId:             address.UserId,
		IsActive:           address.IsActive,
		Address:            address.Address,
		Province:           address.Province,
		CityID:             address.CityID,
		City:               address.City,
		District:           address.District,
		SubDistrict:        address.SubDistrict,
		Longitude:          location[0],
		Latitude:           location[1],
		ContactName:        address.ContactName,
		ContactPhoneNumber: address.ContactPhoneNumber,
		CreatedAt:          address.CreatedAt,
		UpdatedAt:          address.UpdatedAt,
	}
}
