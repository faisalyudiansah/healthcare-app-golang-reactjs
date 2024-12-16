package controller

import (
	"strconv"

	"healthcare-app/internal/product/dto"
	"healthcare-app/internal/product/usecase"
	"healthcare-app/pkg/apperror"
	"healthcare-app/pkg/utils/ginutils"
	"healthcare-app/pkg/utils/pageutils"

	"github.com/gin-gonic/gin"
)

type AdminProductController struct {
	productUseCase usecase.AdminProductUseCase
}

func NewAdminProductController(
	productUseCase usecase.AdminProductUseCase,
) *AdminProductController {
	return &AdminProductController{
		productUseCase: productUseCase,
	}
}

func (c *AdminProductController) SearchProduct(ctx *gin.Context) {
	req := &dto.SearchProductRequest{}
	if err := ctx.ShouldBindQuery(req); err != nil {
		ctx.Error(err)
		return
	}

	res, paging, err := c.productUseCase.Search(ctx, req)
	if err != nil {
		ctx.Error(err)
		return
	}
	paging.Links = pageutils.CreateLinks(ctx.Request, int(paging.Page), int(paging.Size), int(paging.TotalItem), int(paging.TotalPage))
	ginutils.ResponseOKPagination(ctx, res, paging)
}

func (c *AdminProductController) GetProduct(ctx *gin.Context) {
	productId, err := strconv.Atoi(ctx.Param("productId"))
	if err != nil {
		ctx.Error(apperror.NewInvalidIdError())
		return
	}

	req := &dto.GetProductRequest{ID: int64(productId)}
	res, err := c.productUseCase.Get(ctx, req)
	if err != nil {
		ctx.Error(err)
		return
	}
	ginutils.ResponseOK(ctx, res)
}

func (c *AdminProductController) CreateProduct(ctx *gin.Context) {
	req := new(dto.CreateProductRequest)
	if err := ctx.ShouldBind(req); err != nil {
		ctx.Error(err)
		return
	}

	err := c.productUseCase.Create(ctx, req)
	if err != nil {
		ctx.Error(err)
		return
	}
	ginutils.ResponseCreatedPlain(ctx)
}

func (c *AdminProductController) UpdateProduct(ctx *gin.Context) {
	productId, err := strconv.Atoi(ctx.Param("productId"))
	if err != nil {
		ctx.Error(apperror.NewInvalidIdError())
		return
	}

	req := new(dto.UpdateProductRequest)
	req.ID = int64(productId)
	if err := ctx.ShouldBind(req); err != nil {
		ctx.Error(err)
		return
	}

	err = c.productUseCase.Update(ctx, req)
	if err != nil {
		ctx.Error(err)
		return
	}
	ginutils.ResponseOKPlain(ctx)
}

func (c *AdminProductController) DeleteProduct(ctx *gin.Context) {
	productId, err := strconv.Atoi(ctx.Param("productId"))
	if err != nil {
		ctx.Error(apperror.NewInvalidIdError())
		return
	}

	req := &dto.DeleteProductRequest{ID: int64(productId)}
	err = c.productUseCase.Delete(ctx, req)
	if err != nil {
		ctx.Error(err)
		return
	}
	ginutils.ResponseOKPlain(ctx)
}
