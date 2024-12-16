package apperror

import (
	"errors"

	"healthcare-app/internal/pharmacy/constant"
	"healthcare-app/pkg/apperror"
)

func NewPartnerDependencyError() *apperror.AppError {
	msg := constant.PartnerDependencyErrorMessage

	err := errors.New(msg)

	return apperror.NewAppError(err, apperror.DefaultClientErrorCode, msg)
}
