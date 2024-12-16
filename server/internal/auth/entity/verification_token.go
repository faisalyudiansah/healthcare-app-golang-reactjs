package entity

import "time"

type VerificationToken struct {
	CreatedAt         time.Time `json:"created_at"`
	UpdatedAt         time.Time
	DeletedAt         *time.Time
	VerificationToken string `json:"verification_token"`
	ID                int64
	UserID            int64 `json:"user_id"`
}
