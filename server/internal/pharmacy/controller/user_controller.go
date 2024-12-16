package controller

import (
	"healthcare-app/internal/auth/utils"
	"healthcare-app/internal/pharmacy/dto"
	"healthcare-app/internal/pharmacy/usecase"
	"healthcare-app/pkg/utils/ginutils"
	"healthcare-app/pkg/utils/pageutils"

	"github.com/gin-gonic/gin"
)

type UserController struct {
	userUseCase usecase.UserUseCase
}

func NewUserController(userUseCase usecase.UserUseCase) *UserController {
	return &UserController{
		userUseCase: userUseCase,
	}
}

func (c *UserController) Search(ctx *gin.Context) {
	req := new(dto.GetProductPharmacyRequest)
	if err := ctx.ShouldBindQuery(req); err != nil {
		ctx.Error(err)
		return
	}

	res, paging, err := c.userUseCase.Search(ctx, req)
	if err != nil {
		ctx.Error(err)
		return
	}
	paging.Links = pageutils.CreateLinks(ctx.Request, int(paging.Page), int(paging.Size), int(paging.TotalItem), int(paging.TotalPage))
	ginutils.ResponseOKPagination(ctx, res, paging)
}

func (c *UserController) Shipping(ctx *gin.Context) {
	req := &dto.RajaOngkirCostRequest{UserID: utils.GetValueUserIdFromToken(ctx)}
	if err := ctx.ShouldBind(req); err != nil {
		ctx.Error(err)
		return
	}

	res, err := c.userUseCase.Shipping(ctx, req)
	if err != nil {
		ctx.Error(err)
		return
	}
	ginutils.ResponseOK(ctx, res)
}
