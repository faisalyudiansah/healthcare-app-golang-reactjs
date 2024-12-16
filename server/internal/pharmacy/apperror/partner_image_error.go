package apperror

import (
	"errors"
	"fmt"

	"healthcare-app/internal/pharmacy/constant"
	"healthcare-app/pkg/apperror"
)

func NewPartnerImageError() *apperror.AppError {
	msg := fmt.Sprintf(constant.PartnerImageErrorMessage, fmt.Sprintf("%vkb", constant.MAX_IMAGE_SIZE/1024))

	err := errors.New(msg)

	return apperror.NewAppError(err, apperror.DefaultClientErrorCode, msg)
}
