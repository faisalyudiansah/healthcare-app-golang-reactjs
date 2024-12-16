package apperror

import (
	"errors"

	"healthcare-app/internal/pharmacy/constant"
	"healthcare-app/pkg/apperror"
)

func NewPharmacyAlreadyExistsError() *apperror.AppError {
	msg := constant.PharmacyAlreadyExistsErrorMessage

	err := errors.New(msg)

	return apperror.NewAppError(err, apperror.DefaultClientErrorCode, msg)
}
