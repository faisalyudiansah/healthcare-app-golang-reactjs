package apperror

import (
	"errors"

	"healthcare-app/pkg/constant"
)

func NewForbiddenAccessError() *AppError {
	msg := constant.ForbiddenAccessErrorMessage

	err := errors.New(msg)

	return NewAppError(err, ForbiddenAccessErrorCode, msg)
}
