package apperror

import (
	"errors"

	"healthcare-app/internal/auth/constant"
	"healthcare-app/pkg/apperror"
)

func NewTokenAlreadyExistsError() *apperror.AppError {
	msg := constant.TokenAlreadyExistsErrorMessage

	err := errors.New(msg)

	return apperror.NewAppError(err, apperror.TooManyRequestsErrorCode, msg)
}
