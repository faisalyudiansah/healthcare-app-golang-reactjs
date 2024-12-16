package controller

import (
	"strconv"

	authUtils "healthcare-app/internal/auth/utils"
	"healthcare-app/internal/order/apperror"
	orderConstant "healthcare-app/internal/order/constant"
	orderDTO "healthcare-app/internal/order/dto"
	"healthcare-app/internal/order/usecase"
	"healthcare-app/pkg/utils/ginutils"
	"healthcare-app/pkg/utils/pageutils"

	"github.com/gin-gonic/gin"
)

type UserOrderController struct {
	userOrderUseCase usecase.UserOrderUseCase
}

func NewUserOrderController(
	userOrderUseCase usecase.UserOrderUseCase,
) *UserOrderController {
	return &UserOrderController{
		userOrderUseCase: userOrderUseCase,
	}
}

func (c *UserOrderController) PostNewOrder(ctx *gin.Context) {
	req := new(orderDTO.RequestOrder)
	if err := ctx.ShouldBindJSON(req); err != nil {
		ctx.Error(err)
		return
	}
	res, err := c.userOrderUseCase.PostNewOrder(ctx, req, authUtils.GetValueUserIdFromToken(ctx))
	if err != nil {
		ctx.Error(err)
		return
	}
	ginutils.ResponseCreated(ctx, res)
}

func (c *UserOrderController) GetMyOrders(ctx *gin.Context) {
	req := new(orderDTO.QueryGetMyOrder)
	if err := ctx.ShouldBindQuery(req); err != nil {
		ctx.Error(err)
		return
	}
	res, paging, err := c.userOrderUseCase.GetMyOrders(ctx, req, authUtils.GetValueUserIdFromToken(ctx))
	if err != nil {
		ctx.Error(err)
		return
	}
	paging.Links = pageutils.CreateLinks(ctx.Request, int(paging.Page), int(paging.Size), int(paging.TotalItem), int(paging.TotalPage))
	ginutils.ResponseOKPagination(ctx, res, paging)
}

func (c *UserOrderController) GetOrderByID(ctx *gin.Context) {
	orderId := ctx.Param("orderId")
	orderIdInt, err := strconv.Atoi(orderId)
	if err != nil || orderIdInt <= 0 {
		ctx.Error(apperror.NewInvalidIdOrderError())
		return
	}
	res, err := c.userOrderUseCase.GetOrderByID(ctx, int64(orderIdInt), authUtils.GetValueUserIdFromToken(ctx))
	if err != nil {
		ctx.Error(err)
		return
	}
	ginutils.ResponseOK(ctx, res)
}

func (c *UserOrderController) PostUploadPaymentProof(ctx *gin.Context) {
	orderId := ctx.Param("orderId")
	orderIdInt, err := strconv.Atoi(orderId)
	if err != nil || orderIdInt <= 0 {
		ctx.Error(apperror.NewInvalidIdOrderError())
		return
	}
	req := new(orderDTO.RequestUploadPaymentProof)
	if err := ctx.ShouldBind(req); err != nil {
		ctx.Error(err)
		return
	}

	err = c.userOrderUseCase.PostUploadPaymentProof(ctx, req, int64(orderIdInt), authUtils.GetValueUserIdFromToken(ctx))
	if err != nil {
		ctx.Error(err)
		return
	}
	ginutils.ResponseOKPlain(ctx)
}

func (c *UserOrderController) PatchStatusOrder(ctx *gin.Context) {
	orderId := ctx.Param("orderId")
	orderIdInt, err := strconv.Atoi(orderId)
	if err != nil || orderIdInt <= 0 {
		ctx.Error(apperror.NewInvalidIdOrderError())
		return
	}
	res, err := c.userOrderUseCase.PatchStatusOrder(ctx, orderConstant.STATUS_CONFIRMED, int64(orderIdInt), authUtils.GetValueUserIdFromToken(ctx))
	if err != nil {
		ctx.Error(err)
		return
	}
	ginutils.ResponseOK(ctx, res)
}
