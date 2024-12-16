package apperror

import (
	"errors"

	"healthcare-app/internal/pharmacy/constant"
	"healthcare-app/pkg/apperror"
)

func NewPharmacyActivationError() *apperror.AppError {
	msg := constant.PharmacyActivationErrorMessage

	err := errors.New(msg)

	return apperror.NewAppError(err, apperror.DefaultClientErrorCode, msg)
}
