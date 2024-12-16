package apperror

import (
	"errors"

	"healthcare-app/internal/profile/constant"
	"healthcare-app/pkg/apperror"
)

func NewUserReachMaximumNumberOfAddress() *apperror.AppError {
	msg := constant.InvalidUserReachesMaximumNumberOfAddresses

	err := errors.New(msg)

	return apperror.NewAppError(err, apperror.DefaultClientErrorCode, msg)
}
