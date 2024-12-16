package controller

import (
	"strconv"

	"healthcare-app/internal/auth/utils"
	appErrorProfile "healthcare-app/internal/profile/apperror"
	dtoProfile "healthcare-app/internal/profile/dto"
	"healthcare-app/internal/profile/usecase"
	"healthcare-app/pkg/utils/ginutils"

	"github.com/gin-gonic/gin"
)

type AddressController struct {
	addressUseCase usecase.AddressUseCase
}

func NewAddressController(addressUseCase usecase.AddressUseCase) *AddressController {
	return &AddressController{
		addressUseCase: addressUseCase,
	}
}

func (ac *AddressController) PostNewAddress(ctx *gin.Context) {
	req := new(dtoProfile.RequestCreateAddress)
	if err := ctx.ShouldBindJSON(req); err != nil {
		ctx.Error(err)
		return
	}
	dataNewAddress, err := ac.addressUseCase.PostNewAddress(ctx, req, utils.GetValueUserIdFromToken(ctx))
	if err != nil {
		ctx.Error(err)
		return
	}
	ginutils.ResponseCreated(ctx, dataNewAddress)
}

func (ac *AddressController) PatchAddressActive(ctx *gin.Context) {
	idAddress := ctx.Param("idAddress")
	idAddressInt, err := strconv.Atoi(idAddress)
	if err != nil || idAddressInt <= 0 {
		ctx.Error(appErrorProfile.NewInvalidIdAddressError())
		return
	}
	res, err := ac.addressUseCase.PatchAddressActive(ctx, int64(idAddressInt), utils.GetValueUserIdFromToken(ctx))
	if err != nil {
		ctx.Error(err)
		return
	}
	ginutils.ResponseCreated(ctx, res)
}

func (ac *AddressController) GetAllMyAddress(ctx *gin.Context) {
	addresses, err := ac.addressUseCase.GetAllMyAddress(ctx, utils.GetValueUserIdFromToken(ctx))
	if err != nil {
		ctx.Error(err)
		return
	}

	ginutils.ResponseOK(ctx, addresses)
}

func (ac *AddressController) DeleteMyAddress(ctx *gin.Context) {
	idAddress := ctx.Param("idAddress")
	idAddressInt, err := strconv.Atoi(idAddress)
	if err != nil || idAddressInt <= 0 {
		ctx.Error(appErrorProfile.NewInvalidIdAddressError())
		return
	}

	err = ac.addressUseCase.SoftDeleteAddress(ctx, int64(idAddressInt), utils.GetValueUserIdFromToken(ctx))
	if err != nil {
		ctx.Error(err)
		return
	}

	ginutils.ResponseOKPlain(ctx)
}

func (ac *AddressController) PutMyAddress(ctx *gin.Context) {
	idAddress := ctx.Param("idAddress")
	idAddressInt, err := strconv.Atoi(idAddress)
	if err != nil || idAddressInt <= 0 {
		ctx.Error(appErrorProfile.NewInvalidIdAddressError())
		return
	}
	req := new(dtoProfile.RequestPutAddress)
	if err := ctx.ShouldBindJSON(req); err != nil {
		ctx.Error(err)
		return
	}
	res, err := ac.addressUseCase.PutMyAddress(ctx, req, int64(idAddressInt), utils.GetValueUserIdFromToken(ctx))
	if err != nil {
		ctx.Error(err)
		return
	}
	ginutils.ResponseOK(ctx, res)
}
