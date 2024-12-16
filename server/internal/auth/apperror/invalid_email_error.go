package apperror

import (
	"errors"

	"healthcare-app/internal/auth/constant"
	"healthcare-app/pkg/apperror"
)

func NewEmailNotExistsError() *apperror.AppError {
	msg := constant.EmailNotExistsErrorMessage

	err := errors.New(msg)

	return apperror.NewAppError(err, apperror.ForbiddenAccessErrorCode, msg)
}
