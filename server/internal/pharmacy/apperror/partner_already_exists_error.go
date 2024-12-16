package apperror

import (
	"errors"
	"fmt"

	"healthcare-app/internal/pharmacy/constant"
	"healthcare-app/pkg/apperror"
)

func NewPartnerAlreadyExistsError(name string) *apperror.AppError {
	msg := fmt.Sprintf(constant.PartnerAlreadyExistsErrorMessage, name)

	err := errors.New(msg)

	return apperror.NewAppError(err, apperror.DefaultClientErrorCode, msg)
}
