package apperror

import (
	"errors"

	"healthcare-app/pkg/constant"
)

func NewLimitError() *AppError {
	msg := constant.TooManyRequestsErrorMessage

	err := errors.New(msg)

	return NewAppError(err, TooManyRequestsErrorCode, msg)
}
