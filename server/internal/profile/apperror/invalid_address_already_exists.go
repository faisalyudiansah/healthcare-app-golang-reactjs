package apperror

import (
	"errors"

	constantProfile "healthcare-app/internal/profile/constant"
	"healthcare-app/pkg/apperror"
)

func NewInvalidAddressAlreadyExistsError() *apperror.AppError {
	msg := constantProfile.InvalidAddressAlreadyExists
	err := errors.New(msg)
	return apperror.NewAppError(err, apperror.DefaultClientErrorCode, msg)
}
