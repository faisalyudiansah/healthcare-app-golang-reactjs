package controller

import (
	"healthcare-app/internal/profile/dto"
	"healthcare-app/internal/profile/usecase"
	"healthcare-app/pkg/utils/ginutils"
	"healthcare-app/pkg/utils/pageutils"

	"github.com/gin-gonic/gin"
)

type ClusterController struct {
	clusterUseCase usecase.ClusterUseCase
}

func NewClusterController(clusterUseCase usecase.ClusterUseCase) *ClusterController {
	return &ClusterController{
		clusterUseCase: clusterUseCase,
	}
}

func (c *ClusterController) ListProvince(ctx *gin.Context) {
	req := &dto.GetProvinceRequest{}
	if err := ctx.ShouldBindQuery(req); err != nil {
		ctx.Error(err)
		return
	}

	res, paging, err := c.clusterUseCase.ListProvince(ctx, req)
	if err != nil {
		ctx.Error(err)
		return
	}

	paging.Links = pageutils.CreateLinks(ctx.Request, int(paging.Page), int(paging.Size), int(paging.TotalItem), int(paging.TotalPage))
	ginutils.ResponseOKPagination(ctx, res, paging)
}

func (c *ClusterController) SearchCity(ctx *gin.Context) {
	req := &dto.SearchCityRequest{}
	if err := ctx.ShouldBindQuery(req); err != nil {
		ctx.Error(err)
		return
	}

	res, err := c.clusterUseCase.SearchCity(ctx, req)
	if err != nil {
		ctx.Error(err)
		return
	}

	ginutils.ResponseOK(ctx, res)
}

func (c *ClusterController) ListCity(ctx *gin.Context) {
	req := &dto.GetCityRequest{}
	if err := ctx.ShouldBindQuery(req); err != nil {
		ctx.Error(err)
		return
	}

	res, paging, err := c.clusterUseCase.ListCity(ctx, req)
	if err != nil {
		ctx.Error(err)
		return
	}

	paging.Links = pageutils.CreateLinks(ctx.Request, int(paging.Page), int(paging.Size), int(paging.TotalItem), int(paging.TotalPage))
	ginutils.ResponseOKPagination(ctx, res, paging)
}

func (c *ClusterController) ListDistrict(ctx *gin.Context) {
	req := &dto.GetDistrictRequest{}
	if err := ctx.ShouldBindQuery(req); err != nil {
		ctx.Error(err)
		return
	}

	res, paging, err := c.clusterUseCase.ListDistrict(ctx, req)
	if err != nil {
		ctx.Error(err)
		return
	}

	paging.Links = pageutils.CreateLinks(ctx.Request, int(paging.Page), int(paging.Size), int(paging.TotalItem), int(paging.TotalPage))
	ginutils.ResponseOKPagination(ctx, res, paging)
}

func (c *ClusterController) ListSubDistrict(ctx *gin.Context) {
	req := &dto.GetSubDistrictRequest{}
	if err := ctx.ShouldBindQuery(req); err != nil {
		ctx.Error(err)
		return
	}

	res, paging, err := c.clusterUseCase.ListSubDistrict(ctx, req)
	if err != nil {
		ctx.Error(err)
		return
	}

	paging.Links = pageutils.CreateLinks(ctx.Request, int(paging.Page), int(paging.Size), int(paging.TotalItem), int(paging.TotalPage))
	ginutils.ResponseOKPagination(ctx, res, paging)
}
