package apperror

import (
	"errors"

	"healthcare-app/pkg/constant"
)

func NewInvalidIdError() *AppError {
	msg := constant.InvalidIDErrorMessage

	err := errors.New(msg)

	return NewAppError(err, DefaultClientErrorCode, msg)
}
