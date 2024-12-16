package controller

import (
	"healthcare-app/internal/order/dto"
	"healthcare-app/internal/order/usecase"
	"healthcare-app/pkg/utils/ginutils"
	"healthcare-app/pkg/utils/pageutils"

	"github.com/gin-gonic/gin"
)

type AdminOrderController struct {
	orderUseCase usecase.AdminOrderUseCase
}

func NewAdminOrderController(
	orderUseCase usecase.AdminOrderUseCase,
) *AdminOrderController {
	return &AdminOrderController{
		orderUseCase: orderUseCase,
	}
}

func (c *AdminOrderController) Search(ctx *gin.Context) {
	req := new(dto.AdminGetOrderRequest)
	if err := ctx.ShouldBindQuery(req); err != nil {
		ctx.Error(err)
		return
	}

	res, paging, err := c.orderUseCase.Search(ctx, req)
	if err != nil {
		ctx.Error(err)
		return
	}
	paging.Links = pageutils.CreateLinks(ctx.Request, int(paging.Page), int(paging.Size), int(paging.TotalItem), int(paging.TotalPage))
	ginutils.ResponseOKPagination(ctx, res, paging)
}
