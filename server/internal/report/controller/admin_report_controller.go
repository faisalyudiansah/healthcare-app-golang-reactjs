package controller

import (
	"healthcare-app/internal/report/dto"
	"healthcare-app/internal/report/usecase"
	"healthcare-app/pkg/utils/ginutils"
	"healthcare-app/pkg/utils/pageutils"

	"github.com/gin-gonic/gin"
)

type AdminReportController struct {
	reportUseCase usecase.AdminReportUseCase
}

func NewAdminReportController(
	reportUseCase usecase.AdminReportUseCase,
) *AdminReportController {
	return &AdminReportController{
		reportUseCase: reportUseCase,
	}
}

func (c *AdminReportController) SearchSalesReport(ctx *gin.Context) {
	req := new(dto.SearchSalesRequest)
	if err := ctx.ShouldBindQuery(req); err != nil {
		ctx.Error(err)
		return
	}

	res, paging, err := c.reportUseCase.GetSalesReport(ctx, req)
	if err != nil {
		ctx.Error(err)
		return
	}
	paging.Links = pageutils.CreateLinks(ctx.Request, int(paging.Page), int(paging.Size), int(paging.TotalItem), int(paging.TotalPage))
	ginutils.ResponseOKPagination(ctx, res, paging)
}
