package controller

import (
	"healthcare-app/internal/pharmacy/dto"
	"healthcare-app/internal/pharmacy/usecase"
	"healthcare-app/pkg/utils/ginutils"

	"github.com/gin-gonic/gin"
)

type LogisticController struct {
	logisticUseCase usecase.LogisticUseCase
}

func NewLogisticController(logisticUseCase usecase.LogisticUseCase) *LogisticController {
	return &LogisticController{logisticUseCase: logisticUseCase}
}

func (c *LogisticController) Search(ctx *gin.Context) {
	req := new(dto.SearchLogisticRequest)
	if err := ctx.ShouldBindQuery(req); err != nil {
		ctx.Error(err)
		return
	}

	res, paging, err := c.logisticUseCase.Search(ctx, req)
	if err != nil {
		ctx.Error(err)
		return
	}
	ginutils.ResponseOKSeekPagination(ctx, res, paging)
}
