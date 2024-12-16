package apperror

import (
	"errors"

	"healthcare-app/internal/auth/constant"
	"healthcare-app/pkg/apperror"
)

func NewInvalidUserIdError() *apperror.AppError {
	msg := constant.InvalidUserId

	err := errors.New(msg)

	return apperror.NewAppError(err, apperror.DefaultClientErrorCode, msg)
}
