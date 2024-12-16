package entity

import "time"

type RefreshToken struct {
	ID           int64
	UserID       int64
	RefreshToken string
	JTI          string
	CreatedAt    time.Time
	UpdatedAt    time.Time
}
