package controller

import (
	"healthcare-app/internal/product/dto"
	"healthcare-app/internal/product/usecase"
	"healthcare-app/pkg/utils/ginutils"
	"healthcare-app/pkg/utils/pageutils"

	"github.com/gin-gonic/gin"
)

type ProductFormController struct {
	productFormUseCase usecase.ProductFormUseCase
}

func NewProductFormController(
	productFormUseCase usecase.ProductFormUseCase,
) *ProductFormController {
	return &ProductFormController{
		productFormUseCase: productFormUseCase,
	}
}

func (c *ProductFormController) Search(ctx *gin.Context) {
	req := new(dto.SearchProductFormRequest)
	if err := ctx.ShouldBindQuery(req); err != nil {
		ctx.Error(err)
		return
	}

	res, paging, err := c.productFormUseCase.Search(ctx, req)
	if err != nil {
		ctx.Error(err)
		return
	}
	paging.Links = pageutils.CreateLinks(ctx.Request, int(paging.Page), int(paging.Size), int(paging.TotalItem), int(paging.TotalPage))
	ginutils.ResponseOKPagination(ctx, res, paging)
}
