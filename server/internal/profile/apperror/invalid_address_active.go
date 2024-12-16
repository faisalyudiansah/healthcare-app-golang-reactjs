package apperror

import (
	"errors"

	constantProfile "healthcare-app/internal/profile/constant"
	"healthcare-app/pkg/apperror"
)

func NewInvalidAddressActiveNotExistsError() *apperror.AppError {
	msg := constantProfile.InvalidAddressActiveNotExists
	err := errors.New(msg)
	return apperror.NewAppError(err, apperror.DefaultClientErrorCode, msg)
}
