package apperror

import (
	"errors"

	"healthcare-app/internal/order/constant"
	"healthcare-app/pkg/apperror"
)

func NewInvalidSentOrder() *apperror.AppError {
	msg := constant.InvalidOrderSentErrorMessage
	err := errors.New(msg)
	return apperror.NewAppError(err, apperror.DefaultClientErrorCode, msg)
}
