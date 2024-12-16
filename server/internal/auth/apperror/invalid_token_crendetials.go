package apperror

import (
	"errors"

	"healthcare-app/internal/auth/constant"
	"healthcare-app/pkg/apperror"
)

func NewInvalidTokenCredentials() *apperror.AppError {
	msg := constant.InvalidTokenCredentialsErrorMessage

	err := errors.New(msg)

	return apperror.NewAppError(err, apperror.DefaultClientErrorCode, msg)
}
