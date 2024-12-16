package apperror

import (
	"errors"

	constantProfile "healthcare-app/internal/profile/constant"
	"healthcare-app/pkg/apperror"
)

func NewInvalidIdAddressError() *apperror.AppError {
	msg := constantProfile.InvalidIdAddress
	err := errors.New(msg)
	return apperror.NewAppError(err, apperror.DefaultClientErrorCode, msg)
}

func NewInvalidIdAddressNotExistsError() *apperror.AppError {
	msg := constantProfile.InvalidIdAddressNotExists
	err := errors.New(msg)
	return apperror.NewAppError(err, apperror.DefaultClientErrorCode, msg)
}

func NewInvalidAddressNotFoundError() *apperror.AppError {
	msg := constantProfile.InvalidAddressNotFound
	err := errors.New(msg)
	return apperror.NewAppError(err, apperror.DefaultClientErrorCode, msg)
}
