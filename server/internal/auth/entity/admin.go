package entity

type UserOrAdmin struct {
	ID             int64
	Role           int64
	Email          string
	Name           *string
	WhatsappNumber *string
	IsVerified     bool
}
