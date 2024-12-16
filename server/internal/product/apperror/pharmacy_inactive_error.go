package apperror

import (
	"errors"

	"healthcare-app/internal/product/constant"
	"healthcare-app/pkg/apperror"
)

func NewPharmacyProductPharmacyInactiveError() *apperror.AppError {
	msg := constant.PharmacyProductPharmacyInactiveError

	err := errors.New(msg)

	return apperror.NewAppError(err, apperror.DefaultClientErrorCode, msg)
}
