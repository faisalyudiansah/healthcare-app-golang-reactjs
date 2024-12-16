package apperror

import (
	"errors"

	"healthcare-app/internal/cart/constant"
	"healthcare-app/pkg/apperror"
)

func NewPharmacyProductsIdError() *apperror.AppError {
	msg := constant.InvalidPharmacyProductsId
	err := errors.New(msg)
	return apperror.NewAppError(err, apperror.DefaultClientErrorCode, msg)
}

func NewCartItemAlreadyExistsError() *apperror.AppError {
	msg := constant.InvalidCartAlreadyExists
	err := errors.New(msg)
	return apperror.NewAppError(err, apperror.DefaultClientErrorCode, msg)
}

func NewPharmacyProductsIdNotFoundError() *apperror.AppError {
	msg := constant.InvalidPharmacyProductsIdNotFound
	err := errors.New(msg)
	return apperror.NewAppError(err, apperror.DefaultClientErrorCode, msg)
}

func NewCartItemNotFoundError() *apperror.AppError {
	msg := constant.InvalidCartItemNotFound
	err := errors.New(msg)
	return apperror.NewAppError(err, apperror.DefaultClientErrorCode, msg)
}
