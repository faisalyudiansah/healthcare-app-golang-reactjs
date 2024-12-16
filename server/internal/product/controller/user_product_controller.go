package controller

import (
	"strconv"

	"healthcare-app/internal/auth/utils"
	"healthcare-app/internal/product/dto"
	"healthcare-app/internal/product/usecase"
	"healthcare-app/pkg/apperror"
	"healthcare-app/pkg/utils/ginutils"
	"healthcare-app/pkg/utils/pageutils"

	"github.com/gin-gonic/gin"
)

type UserProductController struct {
	userProductUseCase usecase.UserProductUseCase
}

func NewUserProductController(
	userProductUseCase usecase.UserProductUseCase,
) *UserProductController {
	return &UserProductController{
		userProductUseCase: userProductUseCase,
	}
}

func (c *UserProductController) List(ctx *gin.Context) {
	categoryID, err := strconv.Atoi(ctx.Param("categoryId"))
	if err != nil {
		ctx.Error(apperror.NewInvalidIdError())
		return
	}

	req := &dto.GetProductByCategoryRequest{ID: int64(categoryID)}
	if err := ctx.ShouldBindQuery(req); err != nil {
		ctx.Error(err)
		return
	}

	res, paging, err := c.userProductUseCase.ListByCategory(ctx, req)
	if err != nil {
		ctx.Error(err)
		return
	}
	paging.Links = pageutils.CreateLinks(ctx.Request, int(paging.Page), int(paging.Size), int(paging.TotalItem), int(paging.TotalPage))
	ginutils.ResponseOKPagination(ctx, res, paging)
}

func (c *UserProductController) Home(ctx *gin.Context) {
	req := &dto.HomeProductRequest{UserID: utils.GetValueUserIdFromToken(ctx)}
	if err := ctx.ShouldBindQuery(req); err != nil {
		ctx.Error(err)
		return
	}

	res, paging, err := c.userProductUseCase.List(ctx, req)
	if err != nil {
		ctx.Error(err)
		return
	}
	paging.Links = pageutils.CreateLinks(ctx.Request, int(paging.Page), int(paging.Size), int(paging.TotalItem), int(paging.TotalPage))
	ginutils.ResponseOKPagination(ctx, res, paging)
}

func (c *UserProductController) Search(ctx *gin.Context) {
	req := &dto.UserSearchProductRequest{}
	if err := ctx.ShouldBindQuery(req); err != nil {
		ctx.Error(err)
		return
	}

	res, paging, err := c.userProductUseCase.Search(ctx, req)
	if err != nil {
		ctx.Error(err)
		return
	}
	paging.Links = pageutils.CreateLinks(ctx.Request, int(paging.Page), int(paging.Size), int(paging.TotalItem), int(paging.TotalPage))
	ginutils.ResponseOKPagination(ctx, res, paging)
}

func (c *UserProductController) Get(ctx *gin.Context) {
	productId, err := strconv.Atoi(ctx.Param("productId"))
	if err != nil {
		ctx.Error(apperror.NewInvalidIdError())
		return
	}

	req := &dto.GetProductRequest{ID: int64(productId)}
	res, err := c.userProductUseCase.Get(ctx, req)
	if err != nil {
		ctx.Error(err)
		return
	}
	ginutils.ResponseOK(ctx, res)
}
