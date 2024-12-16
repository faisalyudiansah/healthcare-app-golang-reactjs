package controller

import (
	"strconv"

	"healthcare-app/internal/auth/utils"
	"healthcare-app/internal/order/dto"
	"healthcare-app/internal/order/usecase"
	"healthcare-app/pkg/utils/ginutils"
	"healthcare-app/pkg/utils/pageutils"

	"github.com/gin-gonic/gin"
)

type PharmacistOrderController struct {
	pharmacitsOrderUseCase usecase.PharmacistOrderUseCase
}

func NewPharmacistOrderController(
	pharmacitsOrderUseCase usecase.PharmacistOrderUseCase,
) *PharmacistOrderController {
	return &PharmacistOrderController{
		pharmacitsOrderUseCase: pharmacitsOrderUseCase,
	}
}

func (c *PharmacistOrderController) GetOrderById(ctx *gin.Context) {
	pharmacyId, err := strconv.Atoi(ctx.Param("pharmacyId"))
	if err != nil {
		ctx.Error(err)
		return
	}

	orderID, err := strconv.Atoi(ctx.Param("orderId"))
	if err != nil {
		ctx.Error(err)
		return
	}

	req := &dto.GetOrderRequest{PharmacyID: int64(pharmacyId), PharmacistID: utils.GetValueUserIdFromToken(ctx), ID: int64(orderID)}

	response, err := c.pharmacitsOrderUseCase.GetOrderById(ctx, req)
	if err != nil {
		ctx.Error(err)
		return
	}

	ginutils.ResponseOK(ctx, response)

}

func (c *PharmacistOrderController) GetAllOrders(ctx *gin.Context) {
	req := &dto.PharmacistGetOrderRequest{}
	if err := ctx.ShouldBindQuery(req); err != nil {
		ctx.Error(err)
		return
	}

	response, paging, err := c.pharmacitsOrderUseCase.GetAllOrders(ctx, req, utils.GetValueUserIdFromToken(ctx))
	if err != nil {
		ctx.Error(err)
		return
	}
	paging.Links = pageutils.CreateLinks(ctx.Request, int(paging.Page), int(paging.Size), int(paging.TotalItem), int(paging.TotalPage))
	ginutils.ResponseOKPagination(ctx, response, paging)
}

func (c *PharmacistOrderController) SendOrder(ctx *gin.Context) {
	pharmacyId, err := strconv.Atoi(ctx.Param("pharmacyId"))
	if err != nil {
		ctx.Error(err)
		return
	}

	req := &dto.RequestOrderID{PharmacyID: int64(pharmacyId), PharmacistID: utils.GetValueUserIdFromToken(ctx)}
	if err := ctx.ShouldBindJSON(req); err != nil {
		ctx.Error(err)
		return
	}

	err = c.pharmacitsOrderUseCase.SendOrder(ctx, req)
	if err != nil {
		ctx.Error(err)
		return
	}

	ginutils.ResponseOKPlain(ctx)
}

func (c *PharmacistOrderController) CancelOrder(ctx *gin.Context) {
	pharmacyId, err := strconv.Atoi(ctx.Param("pharmacyId"))
	if err != nil {
		ctx.Error(err)
		return
	}

	req := &dto.RequestOrderID{PharmacyID: int64(pharmacyId), PharmacistID: utils.GetValueUserIdFromToken(ctx)}
	if err := ctx.ShouldBindJSON(req); err != nil {
		ctx.Error(err)
		return
	}

	err = c.pharmacitsOrderUseCase.CancelOrder(ctx, req)
	if err != nil {
		ctx.Error(err)
		return
	}

	ginutils.ResponseOKPlain(ctx)
}
