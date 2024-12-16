package controller

import (
	"healthcare-app/internal/product/dto"
	"healthcare-app/internal/product/usecase"
	"healthcare-app/pkg/utils/ginutils"
	"healthcare-app/pkg/utils/pageutils"

	"github.com/gin-gonic/gin"
)

type ManufactureController struct {
	manufactureUseCase usecase.ManufactureUseCase
}

func NewManufactureController(
	manufactureUseCase usecase.ManufactureUseCase,
) *ManufactureController {
	return &ManufactureController{
		manufactureUseCase: manufactureUseCase,
	}
}

func (c *ManufactureController) Search(ctx *gin.Context) {
	req := new(dto.SearchManufactureRequest)
	if err := ctx.ShouldBindQuery(req); err != nil {
		ctx.Error(err)
		return
	}

	res, paging, err := c.manufactureUseCase.Search(ctx, req)
	if err != nil {
		ctx.Error(err)
		return
	}
	paging.Links = pageutils.CreateLinks(ctx.Request, int(paging.Page), int(paging.Size), int(paging.TotalItem), int(paging.TotalPage))
	ginutils.ResponseOKPagination(ctx, res, paging)
}
