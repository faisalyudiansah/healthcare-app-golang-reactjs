package apperror

import (
	"errors"

	"healthcare-app/pkg/constant"
)

func NewTimeoutError() *AppError {
	msg := constant.RequestTimeoutErrorMessage

	err := errors.New(msg)

	return NewAppError(err, RequestTimeoutErrorCode, msg)
}
