package apperror

import (
	"errors"

	"healthcare-app/internal/pharmacy/constant"
	"healthcare-app/pkg/apperror"
)

func NewPharmacyDependencyError() *apperror.AppError {
	msg := constant.PharmacyDependencyErrorMessage

	err := errors.New(msg)

	return apperror.NewAppError(err, apperror.DefaultClientErrorCode, msg)
}
