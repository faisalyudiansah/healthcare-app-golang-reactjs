package apperror

import (
	"errors"

	"healthcare-app/internal/product/constant"
	"healthcare-app/pkg/apperror"
)

func NewProductClassificationError() *apperror.AppError {
	msg := constant.ProductClassificationErrorMessage

	err := errors.New(msg)

	return apperror.NewAppError(err, apperror.DefaultClientErrorCode, msg)
}
