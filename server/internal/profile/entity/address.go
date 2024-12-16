package entity

import "time"

type Address struct {
	ID                 int64
	UserId             int64
	IsActive           bool
	Address            string
	Province           string
	CityID             int64
	City               string
	District           string
	SubDistrict        string
	ContactName        string
	ContactPhoneNumber string
	Location           string
	CreatedAt          time.Time
	UpdatedAt          time.Time
	DeletedAt          *time.Time
}
