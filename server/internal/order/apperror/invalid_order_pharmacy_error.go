package apperror

import (
	"errors"

	"healthcare-app/internal/order/constant"
	"healthcare-app/pkg/apperror"
)

func NewInvalidOrderPharmacy() *apperror.AppError {
	msg := constant.InvalidOrderPharmacyErrorMessage
	err := errors.New(msg)
	return apperror.NewAppError(err, apperror.DefaultClientErrorCode, msg)
}
