package apperror

import (
	"errors"
	"fmt"

	"healthcare-app/internal/auth/constant"
	"healthcare-app/pkg/apperror"
)

func NewInvalidPharmacistIdDoesNotExistsError(pharmacistID int64) *apperror.AppError {
	msg := fmt.Sprintf(constant.InvalidPharmacistIdDoesNotExists, pharmacistID)
	err := errors.New(msg)
	return apperror.NewAppError(err, apperror.NotFoundErrorCode, msg)
}
