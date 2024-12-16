package apperror

import (
	"errors"

	"healthcare-app/internal/product/constant"
	"healthcare-app/pkg/apperror"
)

func NewNoNearbyPharmaciesError() *apperror.AppError {
	msg := constant.NoNearbyPharmaciesErrorMessage

	err := errors.New(msg)

	return apperror.NewAppError(err, apperror.DefaultClientErrorCode, msg)
}
