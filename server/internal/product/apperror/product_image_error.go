package apperror

import (
	"errors"
	"fmt"

	"healthcare-app/internal/product/constant"
	"healthcare-app/pkg/apperror"
)

func NewProductImageError() *apperror.AppError {
	msg := fmt.Sprintf(constant.ProductImageErrorMessage, fmt.Sprintf("%vkb", constant.MAX_IMAGE_SIZE/1024))

	err := errors.New(msg)

	return apperror.NewAppError(err, apperror.DefaultClientErrorCode, msg)
}
