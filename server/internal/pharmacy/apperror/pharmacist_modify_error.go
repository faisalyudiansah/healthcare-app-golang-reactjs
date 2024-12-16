package apperror

import (
	"errors"

	"healthcare-app/internal/pharmacy/constant"
	"healthcare-app/pkg/apperror"
)

func NewPharmacistModifyError() *apperror.AppError {
	msg := constant.PharmacistModifyErrorMessage

	err := errors.New(msg)

	return apperror.NewAppError(err, apperror.DefaultClientErrorCode, msg)
}
