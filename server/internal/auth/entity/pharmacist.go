package entity

import "time"

type UserPharmacist struct {
	ID                int64
	Role              int64
	Email             string
	HashPassword      string
	IsVerified        bool
	Fullname          string
	SipaNumber        string
	WhatsappNumber    string
	YearsOfExperience int64
	ImageUrl          string
	IsAssigned        bool
	CreatedAt         time.Time
	UpdatedAt         time.Time
}
