package controller

import (
	"strconv"

	appErrorAuth "healthcare-app/internal/auth/apperror"
	utilPkg "healthcare-app/internal/auth/utils"
	dtoProduct "healthcare-app/internal/product/dto"
	"healthcare-app/internal/product/usecase"
	"healthcare-app/pkg/apperror"
	dtoPkg "healthcare-app/pkg/dto"
	"healthcare-app/pkg/utils/ginutils"
	"healthcare-app/pkg/utils/pageutils"

	"github.com/gin-gonic/gin"
)

type ProductCategoryController struct {
	productCategoryUseCase usecase.ProductCategoryUseCase
}

func NewProductCategoryController(
	productCategoryUseCase usecase.ProductCategoryUseCase,
) *ProductCategoryController {
	return &ProductCategoryController{
		productCategoryUseCase: productCategoryUseCase,
	}
}

func (c *ProductCategoryController) GetAllCategories(ctx *gin.Context) {
	query := ctx.DefaultQuery("q", "")
	sortBy := ctx.DefaultQuery("sortBy", "created_at")
	sort := ctx.DefaultQuery("sort", "asc")
	limit := ctx.DefaultQuery("limit", "10")
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
	data, totalCount, err := c.productCategoryUseCase.GetAllCategories(ctx, utilPkg.GetValueRoleUserFromToken(ctx), query, sortBy, sort, limitInt, offset)
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

func (c *ProductCategoryController) PostProductCategory(ctx *gin.Context) {
	req := new(dtoProduct.CreateProductCategoryRequest)
	if err := ctx.ShouldBindJSON(req); err != nil {
		ctx.Error(err)
		return
	}
	res, err := c.productCategoryUseCase.PostProductCategory(ctx, req)
	if err != nil {
		ctx.Error(err)
		return
	}
	ginutils.ResponseCreated(ctx, res)
}

func (c *ProductCategoryController) UpdateProductCategory(ctx *gin.Context) {
	categoryId, err := strconv.Atoi(ctx.Param("categoryId"))
	if err != nil {
		ctx.Error(apperror.NewInvalidIdError())
		return
	}
	req := new(dtoProduct.UpdateProductCategoryRequest)
	req.ID = int64(categoryId)
	if err := ctx.ShouldBindJSON(req); err != nil {
		ctx.Error(err)
		return
	}
	res, err := c.productCategoryUseCase.UpdateProductCategory(ctx, req)
	if err != nil {
		ctx.Error(err)
		return
	}
	ginutils.ResponseOK(ctx, res)
}

func (c *ProductCategoryController) DeleteProductCategory(ctx *gin.Context) {
	categoryId, err := strconv.Atoi(ctx.Param("categoryId"))
	if err != nil {
		ctx.Error(apperror.NewInvalidIdError())
		return
	}
	err = c.productCategoryUseCase.DeleteProductCategory(ctx, int64(categoryId))
	if err != nil {
		ctx.Error(err)
		return
	}
	ginutils.ResponseOKPlain(ctx)
}
