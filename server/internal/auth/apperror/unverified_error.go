package apperror

import (
	"errors"

	"healthcare-app/internal/auth/constant"
	"healthcare-app/pkg/apperror"
)

func NewUnverifiedError() *apperror.AppError {
	msg := constant.UnverifiedErrorMessage

	err := errors.New(msg)

	return apperror.NewAppError(err, apperror.ForbiddenAccessErrorCode, msg)
}
