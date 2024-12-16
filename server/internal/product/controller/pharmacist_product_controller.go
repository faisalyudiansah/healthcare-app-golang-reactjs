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

type PharmacistProductController struct {
	pharmacistProductUseCase usecase.PharmacistProductUseCase
	adminProductUseCase      usecase.AdminProductUseCase
}

func NewPharmacistProductController(
	pharmacistProductUseCase usecase.PharmacistProductUseCase,
	adminProductUseCase usecase.AdminProductUseCase,
) *PharmacistProductController {
	return &PharmacistProductController{
		pharmacistProductUseCase: pharmacistProductUseCase,
		adminProductUseCase:      adminProductUseCase,
	}
}

func (c *PharmacistProductController) SearchProduct(ctx *gin.Context) {
	req := &dto.SearchProductRequest{}
	if err := ctx.ShouldBindQuery(req); err != nil {
		ctx.Error(err)
		return
	}

	res, paging, err := c.adminProductUseCase.Search(ctx, req)
	if err != nil {
		ctx.Error(err)
		return
	}
	paging.Links = pageutils.CreateLinks(ctx.Request, int(paging.Page), int(paging.Size), int(paging.TotalItem), int(paging.TotalPage))
	ginutils.ResponseOKPagination(ctx, res, paging)
}

func (c *PharmacistProductController) GetProductDetail(ctx *gin.Context) {
	productId, err := strconv.Atoi(ctx.Param("productId"))
	if err != nil {
		ctx.Error(apperror.NewInvalidIdError())
		return
	}

	req := &dto.GetProductRequest{ID: int64(productId)}
	res, err := c.pharmacistProductUseCase.GetDetail(ctx, req)
	if err != nil {
		ctx.Error(err)
		return
	}
	ginutils.ResponseOK(ctx, res)
}

func (c *PharmacistProductController) Search(ctx *gin.Context) {
	pharmacyID, err := strconv.Atoi(ctx.Param("pharmacyId"))
	if err != nil {
		ctx.Error(apperror.NewInvalidIdError())
		return
	}

	req := &dto.SearchPharmacyProductRequest{PharmacistID: utils.GetValueUserIdFromToken(ctx), PharmacyID: int64(pharmacyID)}
	if err := ctx.ShouldBindQuery(req); err != nil {
		ctx.Error(err)
		return
	}

	res, paging, err := c.pharmacistProductUseCase.Search(ctx, req)
	if err != nil {
		ctx.Error(err)
		return
	}
	paging.Links = pageutils.CreateLinks(ctx.Request, int(paging.Page), int(paging.Size), int(paging.TotalItem), int(paging.TotalPage))
	ginutils.ResponseOKPagination(ctx, res, paging)
}

func (c *PharmacistProductController) Create(ctx *gin.Context) {
	pharmacyID, err := strconv.Atoi(ctx.Param("pharmacyId"))
	if err != nil {
		ctx.Error(apperror.NewInvalidIdError())
		return
	}

	req := &dto.CreatePharmacyProductRequest{PharmacistID: utils.GetValueUserIdFromToken(ctx), PharmacyID: int64(pharmacyID)}
	if err := ctx.ShouldBindJSON(req); err != nil {
		ctx.Error(err)
		return
	}

	res, err := c.pharmacistProductUseCase.Create(ctx, req)
	if err != nil {
		ctx.Error(err)
		return
	}
	ginutils.ResponseCreated(ctx, res)
}

func (c *PharmacistProductController) Get(ctx *gin.Context) {
	pharmacyID, err := strconv.Atoi(ctx.Param("pharmacyId"))
	if err != nil {
		ctx.Error(apperror.NewInvalidIdError())
		return
	}

	pharmacyProductID, err := strconv.Atoi(ctx.Param("pharmacyProductId"))
	if err != nil {
		ctx.Error(apperror.NewInvalidIdError())
		return
	}

	req := &dto.GetPharmacyProductRequest{ID: int64(pharmacyProductID), PharmacistID: utils.GetValueUserIdFromToken(ctx), PharmacyID: int64(pharmacyID)}
	res, err := c.pharmacistProductUseCase.Get(ctx, req)
	if err != nil {
		ctx.Error(err)
		return
	}
	ginutils.ResponseOK(ctx, res)
}

func (c *PharmacistProductController) Update(ctx *gin.Context) {
	pharmacyID, err := strconv.Atoi(ctx.Param("pharmacyId"))
	if err != nil {
		ctx.Error(apperror.NewInvalidIdError())
		return
	}

	pharmacyProductID, err := strconv.Atoi(ctx.Param("pharmacyProductId"))
	if err != nil {
		ctx.Error(apperror.NewInvalidIdError())
		return
	}

	req := &dto.UpdatePharmacyProductRequest{ID: int64(pharmacyProductID), PharmacistID: utils.GetValueUserIdFromToken(ctx), PharmacyID: int64(pharmacyID)}
	if err := ctx.ShouldBindJSON(req); err != nil {
		ctx.Error(err)
		return
	}

	res, err := c.pharmacistProductUseCase.Update(ctx, req)
	if err != nil {
		ctx.Error(err)
		return
	}
	ginutils.ResponseOK(ctx, res)
}

func (c *PharmacistProductController) Delete(ctx *gin.Context) {
	pharmacyID, err := strconv.Atoi(ctx.Param("pharmacyId"))
	if err != nil {
		ctx.Error(apperror.NewInvalidIdError())
		return
	}

	pharmacyProductID, err := strconv.Atoi(ctx.Param("pharmacyProductId"))
	if err != nil {
		ctx.Error(apperror.NewInvalidIdError())
		return
	}

	req := &dto.DeletePharmacyProductRequest{ID: int64(pharmacyProductID), PharmacistID: utils.GetValueUserIdFromToken(ctx), PharmacyID: int64(pharmacyID)}
	if err := c.pharmacistProductUseCase.Delete(ctx, req); err != nil {
		ctx.Error(err)
		return
	}
	ginutils.ResponseOKPlain(ctx)
}
