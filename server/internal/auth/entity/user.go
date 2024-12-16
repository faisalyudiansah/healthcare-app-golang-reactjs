package entity

import "time"

type User struct {
	ID           int64
	Role         int
	Email        string
	HashPassword string
	IsVerified   bool
	IsOauth      bool
	CreatedAt    time.Time
	UpdatedAt    time.Time
	DeletedAt    *time.Time
}

type UserDetail struct {
	ID                *int64
	UserId            *int64
	Fullname          *string
	SipaNumber        *string
	WhatsappNumber    *string
	YearsOfExperience *int
	ImageUrl          *string
	CreatedAt         *time.Time
	UpdatedAt         *time.Time
	DeletedAt         *time.Time
}

type UserWithDetail struct {
	User       User
	UserDetail *UserDetail
}
