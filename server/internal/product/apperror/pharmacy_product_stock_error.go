package apperror

import (
	"errors"

	"healthcare-app/internal/product/constant"
	"healthcare-app/pkg/apperror"
)

func NewPharmacyProductStockError() *apperror.AppError {
	msg := constant.PharmacyProductStockErrorMessage

	err := errors.New(msg)

	return apperror.NewAppError(err, apperror.DefaultClientErrorCode, msg)
}
