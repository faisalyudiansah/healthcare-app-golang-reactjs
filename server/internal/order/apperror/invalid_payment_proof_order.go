package apperror

import (
	"errors"
	"fmt"

	orderConst "healthcare-app/internal/order/constant"
	"healthcare-app/pkg/apperror"
)

func NewInvalidImageErrorMessagePaymentProofError() *apperror.AppError {
	msg := fmt.Sprintf(orderConst.InvalidImageErrorMessagePaymentProof)
	err := errors.New(msg)
	return apperror.NewAppError(err, apperror.DefaultClientErrorCode, msg)
}

func NewInvalidPhotoMaxSizeError() *apperror.AppError {
	msg := fmt.Sprintf(orderConst.InvalidPhotoMaxSize, fmt.Sprintf("%vkb", orderConst.MAX_IMAGE_SIZE/1024))
	err := errors.New(msg)
	return apperror.NewAppError(err, apperror.DefaultClientErrorCode, msg)
}

func NewInvalidPaymentAlreadyUpload() *apperror.AppError {
	msg := orderConst.InvalidAlreadyUploadPaymentProof
	err := errors.New(msg)
	return apperror.NewAppError(err, apperror.DefaultClientErrorCode, msg)
}

func NewInvalidStatusPhotoPaymentProofNull() *apperror.AppError {
	msg := orderConst.InvalidStatusPhotoPaymentProofNull
	err := errors.New(msg)
	return apperror.NewAppError(err, apperror.DefaultClientErrorCode, msg)
}
