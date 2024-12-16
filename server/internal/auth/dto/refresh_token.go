package dto

import "time"

type RefreshTokenResponse struct {
	ExpiredAt    time.Time `json:"expired_at"`
	RefreshToken string    `json:"refresh_token"`
	UserID       int64     `json:"user_id"`
}

type CreateRefreshTokenRequest struct {
	JTI    string
	UserID int64
}

type GetRefreshTokenRequest struct {
	JTI string
}

type DeleteRefreshTokenRequest struct {
	JTI string
}
