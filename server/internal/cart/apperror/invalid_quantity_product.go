package apperror

import (
	"errors"

	"healthcare-app/internal/cart/constant"
	"healthcare-app/pkg/apperror"
)

func NewInsufficientStockError() *apperror.AppError {
	msg := constant.InvalidInsufficientStock
	err := errors.New(msg)
	return apperror.NewAppError(err, apperror.DefaultClientErrorCode, msg)
}

func NewInsufficientStockOnCartError() *apperror.AppError {
	msg := constant.InvalidInsufficientStockOnCart
	err := errors.New(msg)
	return apperror.NewAppError(err, apperror.DefaultClientErrorCode, msg)
}
