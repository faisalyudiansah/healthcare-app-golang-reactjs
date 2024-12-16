package apperror

import (
	"errors"

	"healthcare-app/internal/order/constant"
	"healthcare-app/pkg/apperror"
)

func NewInvalidQueryStatusError() *apperror.AppError {
	msg := constant.InvalidQueryStatus
	err := errors.New(msg)
	return apperror.NewAppError(err, apperror.DefaultClientErrorCode, msg)
}

func NewInvalidIdOrderError() *apperror.AppError {
	msg := constant.InvalidIdOrder
	err := errors.New(msg)
	return apperror.NewAppError(err, apperror.DefaultClientErrorCode, msg)
}
