package apperror

import (
	"errors"

	"healthcare-app/internal/cart/constant"
	"healthcare-app/pkg/apperror"
)

func NewInactiveProductError() *apperror.AppError {
	msg := constant.InactiveProductErrorMessage
	err := errors.New(msg)
	return apperror.NewAppError(err, apperror.DefaultClientErrorCode, msg)
}
