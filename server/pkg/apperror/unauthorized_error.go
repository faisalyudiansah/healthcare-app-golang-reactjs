package apperror

import (
	"errors"

	"healthcare-app/pkg/constant"
)

func NewUnauthorizedError() *AppError {
	msg := constant.UnauthorizedErrorMessage

	err := errors.New(msg)

	return NewAppError(err, UnauthorizedErrorCode, msg)
}
