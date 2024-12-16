package apperror

import "healthcare-app/pkg/constant"

func NewServerError(err error) *AppError {
	msg := constant.InternalServerErrorMessage

	return NewAppError(err, DefaultServerErrorCode, msg)
}
