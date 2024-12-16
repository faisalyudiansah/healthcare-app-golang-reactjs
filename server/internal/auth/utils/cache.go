package utils

import "fmt"

const (
	resetTokenKey        = "reset"
	verificationTokenKey = "verification"
)

func VerificationTokenCacheKey(email string) string {
	return fmt.Sprintf("%v%v", email, verificationTokenKey)
}

func ResetTokenCacheKey(email string) string {
	return fmt.Sprintf("%v%v", email, resetTokenKey)
}
