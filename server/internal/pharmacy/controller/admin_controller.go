package controller

import (
	"os"
	"strconv"

	"healthcare-app/internal/pharmacy/dto"
	"healthcare-app/internal/pharmacy/usecase"
	"healthcare-app/pkg/apperror"
	"healthcare-app/pkg/utils/ginutils"
	"healthcare-app/pkg/utils/pageutils"

	"github.com/gin-gonic/gin"
)

type AdminController struct {
	partnerUseCase  usecase.PartnerUseCase
	pharmacyUseCase usecase.PharmacyUseCase
}

func NewAdminController(
	partnerUseCase usecase.PartnerUseCase,
	pharmacyUseCase usecase.PharmacyUseCase,
) *AdminController {
	return &AdminController{
		partnerUseCase:  partnerUseCase,
		pharmacyUseCase: pharmacyUseCase,
	}
}

func (c *AdminController) GetAllPartner(ctx *gin.Context) {
	req := new(dto.AdminSearchPartnerRequest)
	if err := ctx.ShouldBindQuery(req); err != nil {
		ctx.Error(err)
		return
	}

	res, paging, err := c.partnerUseCase.Search(ctx, req)
	if err != nil {
		ctx.Error(err)
		return
	}
	paging.Links = pageutils.CreateLinks(ctx.Request, int(paging.Page), int(paging.Size), int(paging.TotalItem), int(paging.TotalPage))
	ginutils.ResponseOKPagination(ctx, res, paging)
}

func (c *AdminController) GetPartner(ctx *gin.Context) {
	partnerID, err := strconv.Atoi(ctx.Param("partnerId"))
	if err != nil {
		ctx.Error(apperror.NewInvalidIdError())
		return
	}

	req := &dto.AdminGetPartnerRequest{ID: int64(partnerID)}
	res, err := c.partnerUseCase.Get(ctx, req)
	if err != nil {
		ctx.Error(err)
		return
	}
	ginutils.ResponseOK(ctx, res)
}

func (c *AdminController) CreatePartner(ctx *gin.Context) {
	req := new(dto.RequestCreatePartner)
	if err := ctx.ShouldBind(req); err != nil {
		ctx.Error(err)
		return
	}

	res, err := c.partnerUseCase.Create(ctx, req)
	if err != nil {
		ctx.Error(err)
		return
	}

	ginutils.ResponseCreated(ctx, res)
}

func (c *AdminController) UpdatePartner(ctx *gin.Context) {
	partnerID, err := strconv.Atoi(ctx.Param("partnerId"))
	if err != nil {
		ctx.Error(apperror.NewInvalidIdError())
		return
	}

	req := new(dto.RequestUpdatePartner)
	req.ID = int64(partnerID)
	if err := ctx.ShouldBind(req); err != nil {
		ctx.Error(err)
		return
	}

	res, err := c.partnerUseCase.Update(ctx, req)
	if err != nil {
		ctx.Error(err)
		return
	}
	ginutils.ResponseOK(ctx, res)
}

func (c *AdminController) DeletePartner(ctx *gin.Context) {
	partnerID, err := strconv.Atoi(ctx.Param("partnerId"))
	if err != nil {
		ctx.Error(apperror.NewInvalidIdError())
		return
	}

	req := &dto.RequestDeletePartner{ID: int64(partnerID)}
	if err := c.partnerUseCase.Delete(ctx, req); err != nil {
		ctx.Error(err)
		return
	}
	ginutils.ResponseOKPlain(ctx)
}

func (c *AdminController) SearchPharmacy(ctx *gin.Context) {
	req := new(dto.SearchPharmacyRequest)
	if err := ctx.ShouldBindQuery(req); err != nil {
		ctx.Error(err)
		return
	}

	res, paging, err := c.pharmacyUseCase.Search(ctx, req)
	if err != nil {
		ctx.Error(err)
		return
	}
	ginutils.ResponseOKSeekPagination(ctx, res, paging)
}

func (c *AdminController) GetPharmacy(ctx *gin.Context) {
	pharmacyID, err := strconv.Atoi(ctx.Param("pharmacyId"))
	if err != nil {
		ctx.Error(apperror.NewInvalidIdError())
		return
	}

	req := &dto.GetPharmacyRequest{ID: int64(pharmacyID)}
	res, err := c.pharmacyUseCase.Get(ctx, req)
	if err != nil {
		ctx.Error(err)
		return
	}
	ginutils.ResponseOK(ctx, res)
}

func (c *AdminController) CreatePharmacy(ctx *gin.Context) {
	req := new(dto.RequestCreatePharmacy)
	if err := ctx.ShouldBindJSON(req); err != nil {
		ctx.Error(err)
		return
	}

	res, err := c.pharmacyUseCase.Create(ctx, req)
	if err != nil {
		ctx.Error(err)
		return
	}
	ginutils.ResponseCreated(ctx, res)
}

func (c *AdminController) UpdatePharmacy(ctx *gin.Context) {
	pharmacyID, err := strconv.Atoi(ctx.Param("pharmacyId"))
	if err != nil {
		ctx.Error(apperror.NewInvalidIdError())
		return
	}

	req := new(dto.RequestUpdatePharmacy)
	req.ID = int64(pharmacyID)
	if err := ctx.ShouldBindJSON(req); err != nil {
		ctx.Error(err)
		return
	}

	res, err := c.pharmacyUseCase.Update(ctx, req)
	if err != nil {
		ctx.Error(err)
		return
	}
	ginutils.ResponseOK(ctx, res)
}

func (c *AdminController) DeletePharmacy(ctx *gin.Context) {
	pharmacyID, err := strconv.Atoi(ctx.Param("pharmacyId"))
	if err != nil {
		ctx.Error(apperror.NewInvalidIdError())
		return
	}

	req := &dto.RequestDeletePharmacy{ID: int64(pharmacyID)}
	if err := c.pharmacyUseCase.Delete(ctx, req); err != nil {
		ctx.Error(err)
		return
	}
	ginutils.ResponseOKPlain(ctx)
}

func (c *AdminController) DownloadPharmacyMedicines(ctx *gin.Context) {
	pharmacyID, err := strconv.Atoi(ctx.Param("pharmacyId"))
	if err != nil {
		ctx.Error(apperror.NewInvalidIdError())
		return
	}

	req := &dto.DownloadMedicineRequest{ID: int64(pharmacyID)}
	f, err := c.pharmacyUseCase.DownloadMedicines(ctx, req)
	if err != nil {
		ctx.Error(err)
		return
	}
	defer f.Close()
	defer os.Remove(f.Name())

	ctx.FileAttachment(f.Name(), "medicines.csv")
}
