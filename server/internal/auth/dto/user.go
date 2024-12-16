package dto

import "time"

type ResponseLogin struct {
	AccessToken string `json:"access_token"`
}

type ResponseRegister struct {
	ID         int64     `json:"id"`
	Email      string    `json:"email"`
	IsVerified bool      `json:"is_verified"`
	RoleId     int       `json:"role_id"`
	Role       string    `json:"role"`
	CreatedAt  time.Time `json:"created_at"`
}

type ResponseUser struct {
	ID         int64      `json:"id"`
	RoleId     int        `json:"role_id"`
	Role       string     `json:"role"`
	Email      string     `json:"email"`
	IsVerified bool       `json:"is_verified"`
	IsOauth    bool       `json:"is_oauth,omitempty"`
	CreatedAt  time.Time  `json:"created_at"`
	UpdatedAt  time.Time  `json:"updated_at"`
	DeletedAt  *time.Time `json:"deleted_at"`
}

type ResponseUserWithDetail struct {
	ID         int64               `json:"id"`
	RoleId     int                 `json:"role_id"`
	Role       string              `json:"role"`
	Email      string              `json:"email"`
	IsVerified bool                `json:"is_verified"`
	CreatedAt  time.Time           `json:"created_at"`
	UpdatedAt  time.Time           `json:"updated_at"`
	DeletedAt  *time.Time          `json:"deleted_at"`
	UserDetail *ResponseUserDetail `json:"user_detail"`
}

type ResponseUserDetail struct {
	Id                int64      `json:"id"`
	UserId            int64      `json:"user_id"`
	Fullname          string     `json:"full_name"`
	SipaNumber        *string    `json:"sipa_number"`
	WhatsappNumber    *string    `json:"whatsapp_number"`
	YearsOfExperience *int       `json:"years_of_experience"`
	ImageUrl          string     `json:"image_url"`
	CreatedAt         time.Time  `json:"created_at"`
	UpdatedAt         time.Time  `json:"updated_at"`
	DeletedAt         *time.Time `json:"deleted_at"`
}

type RequestUserLogin struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

type RequestUserRegister struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,password"`
}
type RequestUserSendVerification struct {
	Email string `json:"email" binding:"required,email"`
}
type RequestUserVerifyAccount struct {
	VerificationToken string `json:"verification_token" binding:"required"`
	Email             string `json:"email" binding:"required"`
	Password          string `json:"password" binding:"required"`
}
type RequestUserForgotPassword struct {
	Email string `json:"email" binding:"required,email"`
}

type RequestUserResetPassword struct {
	ResetToken string `json:"reset_token" binding:"required"`
	Email      string `json:"email" binding:"required"`
	Password   string `json:"password" binding:"required,password"`
}
