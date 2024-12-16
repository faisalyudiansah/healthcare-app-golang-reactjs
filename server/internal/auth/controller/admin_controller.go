package controller

import (
	"strconv"

	appErrorAuth "healthcare-app/internal/auth/apperror"
	dtoAuth "healthcare-app/internal/auth/dto"
	"healthcare-app/internal/auth/usecase"
	utilPkg "healthcare-app/internal/auth/utils"
	dtoPkg "healthcare-app/pkg/dto"
	"healthcare-app/pkg/utils/ginutils"
	"healthcare-app/pkg/utils/pageutils"

	"github.com/gin-gonic/gin"
)

type AdminController struct {
	adminUseCase usecase.AdminUseCase
}

func NewAdminController(adminUseCase usecase.AdminUseCase) *AdminController {
	return &AdminController{
		adminUseCase: adminUseCase,
	}
}

func (c *AdminController) SearchUser(ctx *gin.Context) {
	req := new(dtoAuth.SearchUserRequest)
	if err := ctx.ShouldBindQuery(req); err != nil {
		ctx.Error(err)
		return
	}

	res, paging, err := c.adminUseCase.SearchUser(ctx, req)
	if err != nil {
		ctx.Error(err)
		return
	}
	ginutils.ResponseOKSeekPagination(ctx, res, paging)
}

func (c *AdminController) SearchPharmacist(ctx *gin.Context) {
	req := new(dtoAuth.SearchPharmacistRequest)
	if err := ctx.ShouldBindQuery(req); err != nil {
		ctx.Error(err)
		return
	}

	res, paging, err := c.adminUseCase.SearchPharmacist(ctx, req)
	if err != nil {
		ctx.Error(err)
		return
	}
	paging.Links = pageutils.CreateLinks(ctx.Request, int(paging.Page), int(paging.Size), int(paging.TotalItem), int(paging.TotalPage))
	ginutils.ResponseOKPagination(ctx, res, paging)
}

func (c *AdminController) CreateAccount(ctx *gin.Context) {
	req := new(dtoAuth.RequestPharmacistCreateAccount)
	if err := ctx.ShouldBindJSON(req); err != nil {
		ctx.Error(err)
		return
	}
	err := c.adminUseCase.CreateAccountPharmacist(ctx, req, utilPkg.GetValueRoleUserFromToken(ctx))
	if err != nil {
		ctx.Error(err)
		return
	}
	ginutils.ResponseCreatedPlain(ctx)
}

func (c *AdminController) GetAllAccount(ctx *gin.Context) {
	query := ctx.DefaultQuery("q", "")
	role := ctx.DefaultQuery("role", "")
	isAssign := ctx.DefaultQuery("is_assign", "0")
	sortBy := ctx.DefaultQuery("sortBy", "created_at")
	sort := ctx.DefaultQuery("sort", "desc")
	limit := ctx.DefaultQuery("limit", "10")
	page := ctx.DefaultQuery("page", "1")

	var roleInt int
	var err error
	if role != "" {
		roleInt, err = strconv.Atoi(role)
		if err != nil || roleInt <= 0 || roleInt > 3 {
			ctx.Error(appErrorAuth.NewInvalidQueryRoleError())
			return
		}
	}

	isAssignInt, err := strconv.Atoi(isAssign)
	if err != nil || isAssignInt < 0 {
		ctx.Error(appErrorAuth.NewInvalidQueryisAssignError())
		return
	}

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
	data, totalCount, err := c.adminUseCase.GetAllAccount(ctx, utilPkg.GetValueRoleUserFromToken(ctx), query, isAssignInt, roleInt, sortBy, sort, limitInt, offset)
	if err != nil {
		ctx.Error(err)
		return
	}

	if len(data) == 0 {
		data = []dtoAuth.ResponseUserWithDetail{}
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

func (c *AdminController) UpdateAccount(ctx *gin.Context) {
	req := new(dtoAuth.RequestPharmacistUpdateAccount)

	id := ctx.Param("pharmacistId")
	pharmacistID, err := strconv.Atoi(id)
	if err != nil {
		ctx.Error(err)
		return
	}
	req.PharmacistID = int64(pharmacistID)

	if err := ctx.ShouldBindJSON(req); err != nil {
		ctx.Error(err)
		return
	}

	res, err := c.adminUseCase.UpdateAccount(ctx, req)
	if err != nil {
		ctx.Error(err)
		return
	}

	ginutils.ResponseOK(ctx, res)
}

func (c *AdminController) DeleteAccount(ctx *gin.Context) {
	req := new(dtoAuth.RequestPharmacistDeleteAccount)

	id := ctx.Param("pharmacistId")
	pharmacistID, err := strconv.Atoi(id)
	if err != nil {
		ctx.Error(err)
		return
	}
	req.PharmacistID = int64(pharmacistID)

	err = c.adminUseCase.DeleteAccount(ctx, req)
	if err != nil {
		ctx.Error(err)
		return
	}

	ginutils.ResponseOKPlain(ctx)
}

func (c *AdminController) GetPharmacistByID(ctx *gin.Context) {
	id := ctx.Param("pharmacistId")
	pharmacistID, err := strconv.Atoi(id)
	if err != nil {
		ctx.Error(appErrorAuth.NewInvalidPharmacistIdError())
		return
	}
	res, err := c.adminUseCase.GetPharmacistByID(ctx, int64(pharmacistID))
	if err != nil {
		ctx.Error(err)
		return
	}

	ginutils.ResponseOK(ctx, res)
}
