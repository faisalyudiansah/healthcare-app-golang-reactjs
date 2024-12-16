package controller

import (
	"strconv"

	appErrorAuth "healthcare-app/internal/auth/apperror"
	"healthcare-app/internal/auth/utils"
	cartDto "healthcare-app/internal/cart/dto"
	cartUseCase "healthcare-app/internal/cart/usecase"
	appErrorPkg "healthcare-app/pkg/apperror"
	dtoPkg "healthcare-app/pkg/dto"
	"healthcare-app/pkg/utils/ginutils"
	"healthcare-app/pkg/utils/pageutils"

	"github.com/gin-gonic/gin"
)

type CartController struct {
	cartUseCase cartUseCase.CartUseCase
}

func NewCartController(
	cartUseCase cartUseCase.CartUseCase,
) *CartController {
	return &CartController{
		cartUseCase: cartUseCase,
	}
}

func (c *CartController) CountCart(ctx *gin.Context) {
	res, err := c.cartUseCase.CountCart(ctx, utils.GetValueUserIdFromToken(ctx))
	if err != nil {
		ctx.Error(err)
		return
	}

	ginutils.ResponseOK(ctx, res)
}

func (c *CartController) GetMyCart(ctx *gin.Context) {
	query := ctx.DefaultQuery("q", "")
	sortBy := ctx.DefaultQuery("sortBy", "created_at")
	sort := ctx.DefaultQuery("sort", "asc")
	limit := ctx.DefaultQuery("limit", "5")
	page := ctx.DefaultQuery("page", "1")
	limitInt, err := strconv.Atoi(limit)
	if err != nil || limitInt <= 0 {
		ctx.Error(appErrorAuth.NewInvalidQueryLimitError())
		return
	}
	pageInt, err := strconv.Atoi(page)
	if err != nil || pageInt <= 0 {
		ctx.Error(appErrorAuth.NewInvalidQueryPageError())
		return
	}
	offset := (pageInt - 1) * limitInt
	data, totalCount, err := c.cartUseCase.GetMyCart(ctx, utils.GetValueUserIdFromToken(ctx), query, sortBy, sort, limitInt, offset)
	if err != nil {
		ctx.Error(err)
		return
	}
	pageCount := (totalCount + int64(limitInt) - 1) / int64(limitInt)
	pageMetaData := &dtoPkg.PageMetaData{
		Page:      int64(pageInt),
		Size:      int64(limitInt),
		TotalItem: totalCount,
		TotalPage: pageCount,
		Links: pageutils.CreateLinks(
			ctx.Request,
			pageInt,
			limitInt,
			int(totalCount),
			int(pageCount),
		),
	}
	ginutils.ResponseOKPagination(ctx, data, pageMetaData)
}

func (c *CartController) CreateCart(ctx *gin.Context) {
	req := new(cartDto.RequestCart)
	if err := ctx.ShouldBindJSON(req); err != nil {
		ctx.Error(err)
		return
	}
	err := c.cartUseCase.CreateCart(ctx, req, utils.GetValueUserIdFromToken(ctx))
	if err != nil {
		ctx.Error(err)
		return
	}
	ginutils.ResponseCreatedPlain(ctx)
}

func (c *CartController) DeleteCart(ctx *gin.Context) {
	PharmacyProductId, err := strconv.Atoi(ctx.Param("PharmacyProductId"))
	if err != nil {
		ctx.Error(appErrorPkg.NewInvalidIdError())
		return
	}
	err = c.cartUseCase.DeleteCart(ctx, int64(PharmacyProductId), utils.GetValueUserIdFromToken(ctx))
	if err != nil {
		ctx.Error(err)
		return
	}
	ginutils.ResponseOKPlain(ctx)
}

func (c *CartController) PutQuantityCart(ctx *gin.Context) {
	req := new(cartDto.RequestCart)
	if err := ctx.ShouldBindJSON(req); err != nil {
		ctx.Error(err)
		return
	}
	err := c.cartUseCase.PutQuantityCart(ctx, req, utils.GetValueUserIdFromToken(ctx))
	if err != nil {
		ctx.Error(err)
		return
	}
	ginutils.ResponseOKPlain(ctx)
}
