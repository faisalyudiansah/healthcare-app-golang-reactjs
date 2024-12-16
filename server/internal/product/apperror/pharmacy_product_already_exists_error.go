package apperror

import (
	"errors"

	"healthcare-app/internal/product/constant"
	"healthcare-app/pkg/apperror"
)

func NewPharmacyProductAlreadyExistsError() *apperror.AppError {
	msg := constant.PharmacyProductAlreadyExistsErrorMessage

	err := errors.New(msg)

	return apperror.NewAppError(err, apperror.DefaultClientErrorCode, msg)
}
