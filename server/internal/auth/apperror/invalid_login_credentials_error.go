package apperror

import (
	"errors"

	"healthcare-app/internal/auth/constant"
	"healthcare-app/pkg/apperror"
)

func NewInvalidLoginCredentials(err error) *apperror.AppError {
	msg := constant.InvalidLoginCredentialsErrorMessage

	if err == nil {
		err = errors.New(msg)
	}

	return apperror.NewAppError(err, apperror.DefaultClientErrorCode, msg)
}
