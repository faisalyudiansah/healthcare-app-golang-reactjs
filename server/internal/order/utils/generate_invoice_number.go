package utils

import (
	"fmt"

	"github.com/google/uuid"
)

func GenerateInvoiceNumber() string {
	id := uuid.NewString()
	invoiceNumber := fmt.Sprintf("FAVIPIRAVIR-%s", id)
	return invoiceNumber
}

func GeneratePaymentProofTitle(orderID int64) string {
	invoiceNumber := fmt.Sprintf("PAYMENT-PROOF-%v-FAVIPIRAVIR", orderID)
	return invoiceNumber
}

func GeneratePhotoProfileTitle(userID int64, nameUser string) string {
	invoiceNumber := fmt.Sprintf("photo-profile-%v-%v-FAVIPIRAVIR", userID, nameUser)
	return invoiceNumber
}
