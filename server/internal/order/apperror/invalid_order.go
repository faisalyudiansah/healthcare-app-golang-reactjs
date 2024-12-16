package apperror

import (
	"errors"

	"healthcare-app/internal/order/constant"
	"healthcare-app/pkg/apperror"
)

func NewInvalidOrderNotFound() *apperror.AppError {
	msg := constant.InvalidOrderNotFound
	err := errors.New(msg)
	return apperror.NewAppError(err, apperror.DefaultClientErrorCode, msg)
}
