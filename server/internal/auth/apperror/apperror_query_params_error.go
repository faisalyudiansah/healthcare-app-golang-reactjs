package apperror

import (
	"errors"

	"healthcare-app/internal/auth/constant"
	"healthcare-app/pkg/apperror"
)

func NewInvalidPharmacistIdError() *apperror.AppError {
	msg := constant.InvalidPharmacistId

	err := errors.New(msg)

	return apperror.NewAppError(err, apperror.DefaultClientErrorCode, msg)
}
