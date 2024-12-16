package payload

import (
	"mime/multipart"

	"healthcare-app/pkg/utils/encryptutils"
)

type ProcessOrderPayload struct {
	ID     int64  `json:"id"`
	UserID int64  `json:"user_id"`
	Image  string `json:"image"`
}

type ConfirmOrderPayload struct {
	IDs []int64 `json:"ids"`
}

func ConvertToProcessOrderPayload(id, userId int64, image *multipart.FileHeader, base64Encryptor encryptutils.Base64Encryptor) *ProcessOrderPayload {
	return &ProcessOrderPayload{
		ID:     id,
		UserID: userId,
		Image:  convertImageToBase64(base64Encryptor, image),
	}
}
