package usecase

import (
	"context"
	"path/filepath"
	"strings"

	apperrorPharmacy "healthcare-app/internal/pharmacy/apperror"
	"healthcare-app/internal/pharmacy/constant"
	dtoPharmacy "healthcare-app/internal/pharmacy/dto"
	"healthcare-app/internal/pharmacy/entity"
	"healthcare-app/internal/pharmacy/repository"
	apperrorPkg "healthcare-app/pkg/apperror"
	"healthcare-app/pkg/database/transactor"
	dtoPkg "healthcare-app/pkg/dto"
	"healthcare-app/pkg/utils/cloudinaryutils"
	"healthcare-app/pkg/utils/pageutils"

	"github.com/cloudinary/cloudinary-go/v2/api"
	"github.com/cloudinary/cloudinary-go/v2/api/uploader"
)

type PartnerUseCase interface {
	Search(ctx context.Context, request *dtoPharmacy.AdminSearchPartnerRequest) ([]*dtoPharmacy.ResponsePartner, *dtoPkg.PageMetaData, error)
	Get(ctx context.Context, request *dtoPharmacy.AdminGetPartnerRequest) (*dtoPharmacy.ResponsePartner, error)
	Create(ctx context.Context, request *dtoPharmacy.RequestCreatePartner) (*dtoPharmacy.ResponsePartner, error)
	Update(ctx context.Context, request *dtoPharmacy.RequestUpdatePartner) (*dtoPharmacy.ResponsePartner, error)
	Delete(ctx context.Context, request *dtoPharmacy.RequestDeletePartner) error
}

type partnerUseCaseImpl struct {
	cloudinaryUtil    cloudinaryutils.CloudinaryUtil
	partnerChangeRepo repository.PartnerChangeRepository
	partnerRepo       repository.PartnerRepository
	transactor        transactor.Transactor
}

func NewPartnerUseCase(
	cloudinaryUtil cloudinaryutils.CloudinaryUtil,
	partnerChangeRepo repository.PartnerChangeRepository,
	partnerRepo repository.PartnerRepository,
	transactor transactor.Transactor,
) *partnerUseCaseImpl {
	return &partnerUseCaseImpl{
		cloudinaryUtil:    cloudinaryUtil,
		partnerChangeRepo: partnerChangeRepo,
		partnerRepo:       partnerRepo,
		transactor:        transactor,
	}
}

func (u *partnerUseCaseImpl) Search(ctx context.Context, request *dtoPharmacy.AdminSearchPartnerRequest) ([]*dtoPharmacy.ResponsePartner, *dtoPkg.PageMetaData, error) {
	partners, err := u.partnerRepo.Search(ctx, request)
	if err != nil {
		return nil, nil, err
	}
	res, metaData := pageutils.CreateMetaData(partners, request.Page, request.Limit)
	return dtoPharmacy.ConvertToPartnerResponses(res), metaData, nil
}

func (u *partnerUseCaseImpl) Get(ctx context.Context, request *dtoPharmacy.AdminGetPartnerRequest) (*dtoPharmacy.ResponsePartner, error) {
	partner, err := u.partnerRepo.FindByID(ctx, request.ID)
	if err != nil {
		return nil, err
	}

	return dtoPharmacy.ConvertToPartnerResponse(partner), nil
}

func (u *partnerUseCaseImpl) Create(ctx context.Context, request *dtoPharmacy.RequestCreatePartner) (*dtoPharmacy.ResponsePartner, error) {
	if filepath.Ext(request.Logo.Filename) != ".png" {
		return nil, apperrorPharmacy.NewPartnerImageError()
	}
	if request.Logo.Size > constant.MAX_IMAGE_SIZE {
		return nil, apperrorPharmacy.NewPartnerImageError()
	}

	var partner *entity.Partner
	err := u.transactor.Atomic(ctx, func(txCtx context.Context) error {
		if ok := u.partnerRepo.IsExistsByName(txCtx, request.Name); ok {
			return apperrorPharmacy.NewPartnerAlreadyExistsError(request.Name)
		}

		f, err := request.Logo.Open()
		if err != nil {
			return err
		}
		imgUrl, err := u.cloudinaryUtil.UploadImage(txCtx, f, uploader.UploadParams{
			PublicID:       strings.ToLower(strings.ReplaceAll(request.Name, " ", "-")),
			UniqueFilename: api.Bool(true),
			Overwrite:      api.Bool(true),
			Invalidate:     api.Bool(true),
		})
		if err != nil {
			return apperrorPkg.NewServerError(err)
		}

		partner = &entity.Partner{
			Name:        request.Name,
			LogoURL:     imgUrl,
			YearFounded: request.YearFounded,
			ActiveDays:  strings.Join(request.ActiveDays, ","),
			StartOpt:    request.StartOpt,
			EndOpt:      request.EndOpt,
			IsActive:    request.IsActive,
		}

		if err := u.partnerRepo.Save(txCtx, partner); err != nil {
			return apperrorPkg.NewServerError(err)
		}
		return nil
	})

	if err != nil {
		return nil, err
	}

	return dtoPharmacy.ConvertToPartnerResponse(partner), nil
}

func (u *partnerUseCaseImpl) Update(ctx context.Context, request *dtoPharmacy.RequestUpdatePartner) (*dtoPharmacy.ResponsePartner, error) {
	if request.Logo != nil {
		if filepath.Ext(request.Logo.Filename) != ".png" {
			return nil, apperrorPharmacy.NewPartnerImageError()
		}
		if request.Logo.Size > constant.MAX_IMAGE_SIZE {
			return nil, apperrorPharmacy.NewPartnerImageError()
		}
	}

	partner, err := u.partnerRepo.FindByID(ctx, request.ID)
	if err != nil {
		return nil, apperrorPkg.NewEntityNotFoundError("partner")
	}

	err = u.transactor.Atomic(ctx, func(txCtx context.Context) error {
		if request.Name != partner.Name {
			if ok := u.partnerRepo.IsExistsByName(txCtx, request.Name); ok {
				return apperrorPharmacy.NewPartnerAlreadyExistsError(request.Name)
			}
		}

		if request.Logo != nil {
			f, err := request.Logo.Open()
			if err != nil {
				return err
			}
			imgUrl, err := u.cloudinaryUtil.UploadImage(txCtx, f, uploader.UploadParams{
				PublicID:       strings.ToLower(strings.ReplaceAll(request.Name, " ", "-")),
				UniqueFilename: api.Bool(true),
				Overwrite:      api.Bool(true),
			})
			if err != nil {
				return apperrorPkg.NewServerError(err)
			}
			partner.LogoURL = imgUrl
		}

		partner.Name = request.Name
		partner.YearFounded = request.YearFounded
		partner.IsActive = request.IsActive

		if err := u.partnerRepo.UpdateIsActiveRelatedPharmacy(txCtx, partner); err != nil {
			return apperrorPkg.NewServerError(err)
		}

		if err := u.partnerChangeRepo.DeleteByPartnerID(txCtx, request.ID); err != nil {
			return apperrorPkg.NewServerError(err)
		}
		if err := u.partnerChangeRepo.Save(txCtx, &entity.PartnerChange{PartnerID: request.ID, ActiveDays: strings.Join(request.ActiveDays, ","), StartOpt: request.StartOpt, EndOpt: request.EndOpt}); err != nil {
			return apperrorPkg.NewServerError(err)
		}
		return nil
	})

	if err != nil {
		return nil, err
	}

	return dtoPharmacy.ConvertToPartnerResponse(partner), nil
}

func (u *partnerUseCaseImpl) Delete(ctx context.Context, request *dtoPharmacy.RequestDeletePartner) error {
	err := u.transactor.Atomic(ctx, func(txCtx context.Context) error {
		count, err := u.partnerRepo.CountRelatedPharmacy(txCtx, request.ID)
		if err != nil {
			return apperrorPkg.NewServerError(err)
		}
		if count != 0 {
			return apperrorPharmacy.NewPartnerDependencyError()
		}

		return u.partnerRepo.DeleteByID(txCtx, request.ID)
	})

	return err
}
