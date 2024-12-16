package controller

import (
	"strconv"

	"healthcare-app/internal/auth/utils"
	"healthcare-app/internal/pharmacy/dto"
	"healthcare-app/internal/pharmacy/usecase"
	"healthcare-app/pkg/apperror"
	"healthcare-app/pkg/utils/ginutils"
	"healthcare-app/pkg/utils/pageutils"

	"github.com/gin-gonic/gin"
)

type PharmacistController struct {
	pharmacistUseCase usecase.PharmacistUseCase
}

func NewPharmacistController(
	pharmacistUseCase usecase.PharmacistUseCase,
) *PharmacistController {
	return &PharmacistController{
		pharmacistUseCase: pharmacistUseCase,
	}
}

func (c *PharmacistController) SearchPharmacy(ctx *gin.Context) {
	req := &dto.PharmacistSearchPharmacyRequest{PharmacistID: utils.GetValueUserIdFromToken(ctx)}
	if err := ctx.ShouldBindQuery(req); err != nil {
		ctx.Error(err)
		return
	}

	res, paging, err := c.pharmacistUseCase.Search(ctx, req)
	if err != nil {
		ctx.Error(err)
		return
	}
	paging.Links = pageutils.CreateLinks(ctx.Request, int(paging.Page), int(paging.Size), int(paging.TotalItem), int(paging.TotalPage))
	ginutils.ResponseOKPagination(ctx, res, paging)
}

func (c *PharmacistController) GetPharmacy(ctx *gin.Context) {
	pharmacyID, err := strconv.Atoi(ctx.Param("pharmacyId"))
	if err != nil {
		ctx.Error(apperror.NewInvalidIdError())
		return
	}

	req := &dto.PharmacistGetPharmacyRequest{ID: int64(pharmacyID), PharmacistID: utils.GetValueUserIdFromToken(ctx)}
	res, err := c.pharmacistUseCase.Get(ctx, req)
	if err != nil {
		ctx.Error(err)
		return
	}
	ginutils.ResponseOK(ctx, res)
}

func (c *PharmacistController) UpdatePharmacy(ctx *gin.Context) {
	pharmacyID, err := strconv.Atoi(ctx.Param("pharmacyId"))
	if err != nil {
		ctx.Error(apperror.NewInvalidIdError())
		return
	}

	req := &dto.PharmacistUpdatePharmacyRequest{ID: int64(pharmacyID), PharmacistID: utils.GetValueUserIdFromToken(ctx)}
	if err := ctx.ShouldBindJSON(req); err != nil {
		ctx.Error(err)
		return
	}

	res, err := c.pharmacistUseCase.Update(ctx, req)
	if err != nil {
		ctx.Error(err)
		return
	}
	ginutils.ResponseOK(ctx, res)
}
