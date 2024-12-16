package apperror

import (
	"errors"

	constantProduct "healthcare-app/internal/product/constant"
	"healthcare-app/pkg/apperror"
)

func NewInvalidCategoryAlreadyExists() *apperror.AppError {
	msg := constantProduct.InvalidCategoryAlreadyExists
	err := errors.New(msg)
	return apperror.NewAppError(err, apperror.DefaultClientErrorCode, msg)
}

func NewInvalidCategoryIdDoesNotExists() *apperror.AppError {
	msg := constantProduct.InvalidCategoryIdDoesNotExists
	err := errors.New(msg)
	return apperror.NewAppError(err, apperror.DefaultClientErrorCode, msg)
}

func NewInvalidCategoryNameAtLeast3char() *apperror.AppError {
	msg := constantProduct.InvalidCategoryNameAtLeast3char
	err := errors.New(msg)
	return apperror.NewAppError(err, apperror.DefaultClientErrorCode, msg)
}
