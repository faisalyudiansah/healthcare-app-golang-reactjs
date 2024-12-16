package apperror

import (
	"errors"

	"healthcare-app/internal/order/constant"
	"healthcare-app/pkg/apperror"
)

func NewInvalidStatusAlreadyConfirmedError() *apperror.AppError {
	msg := constant.InvalidStatusAlreadyConfirmed
	err := errors.New(msg)
	return apperror.NewAppError(err, apperror.DefaultClientErrorCode, msg)
}

func NewInvalidStatusChangesError() *apperror.AppError {
	msg := constant.InvalidStatusChanges
	err := errors.New(msg)
	return apperror.NewAppError(err, apperror.DefaultClientErrorCode, msg)
}
