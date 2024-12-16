package entity

import "time"

type ResetToken struct {
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time
	DeletedAt  *time.Time
	ResetToken string `json:"reset_token"`
	ID         int64
	UserID     int64 `json:"user_id"`
}
