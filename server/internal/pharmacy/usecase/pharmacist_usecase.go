package usecase

import (
	"context"

	apperrorPharmacy "healthcare-app/internal/pharmacy/apperror"
	dtoPharmacy "healthcare-app/internal/pharmacy/dto"
	"healthcare-app/internal/pharmacy/repository"
	apperrorPkg "healthcare-app/pkg/apperror"
	"healthcare-app/pkg/database/transactor"
	dtoPkg "healthcare-app/pkg/dto"
	"healthcare-app/pkg/utils/pageutils"
)

type PharmacistUseCase interface {
	Search(ctx context.Context, request *dtoPharmacy.PharmacistSearchPharmacyRequest) ([]*dtoPharmacy.ResponsePharmacy, *dtoPkg.PageMetaData, error)
	Get(ctx context.Context, request *dtoPharmacy.PharmacistGetPharmacyRequest) (*dtoPharmacy.PharmacyDetailResponse, error)
	Update(ctx context.Context, request *dtoPharmacy.PharmacistUpdatePharmacyRequest) (*dtoPharmacy.ResponsePharmacy, error)
}

type pharmacistUseCaseImpl struct {
	pharmacyRepo                 repository.PharmacyRepository
	pharmacistPharmacyRepository repository.PharmacistPharmacyRepository
	transactor                   transactor.Transactor
}

func NewPharmacistUseCase(
	pharmacyRepo repository.PharmacyRepository,
	pharmacistPharmacyRepository repository.PharmacistPharmacyRepository,
	transactor transactor.Transactor,
) *pharmacistUseCaseImpl {
	return &pharmacistUseCaseImpl{
		pharmacyRepo:                 pharmacyRepo,
		pharmacistPharmacyRepository: pharmacistPharmacyRepository,
		transactor:                   transactor,
	}
}

func (u *pharmacistUseCaseImpl) Search(ctx context.Context, request *dtoPharmacy.PharmacistSearchPharmacyRequest) ([]*dtoPharmacy.ResponsePharmacy, *dtoPkg.PageMetaData, error) {
	pharmacies, err := u.pharmacistPharmacyRepository.Search(ctx, request)
	if err != nil {
		return nil, nil, apperrorPkg.NewServerError(err)
	}

	res, metaData := pageutils.CreateMetaData(dtoPharmacy.ConvertToPharmacyResponses(pharmacies), request.Page, request.Limit)
	return res, metaData, nil
}

func (u *pharmacistUseCaseImpl) Get(ctx context.Context, request *dtoPharmacy.PharmacistGetPharmacyRequest) (*dtoPharmacy.PharmacyDetailResponse, error) {
	pharmacy, err := u.pharmacistPharmacyRepository.FindByID(ctx, request)
	if err != nil {
		return nil, err
	}
	return dtoPharmacy.ConvertToPharmacyDetailResponse(pharmacy), nil
}

func (u *pharmacistUseCaseImpl) Update(ctx context.Context, request *dtoPharmacy.PharmacistUpdatePharmacyRequest) (*dtoPharmacy.ResponsePharmacy, error) {
	pharmacy := dtoPharmacy.PharmacistUpdatePharmacyRequestToPharmacyEntity(request)
	err := u.transactor.Atomic(ctx, func(txCtx context.Context) error {
		entityPharmacy, err := u.pharmacyRepo.FindByID(txCtx, request.ID)
		if err != nil {
			return err
		}
		if *entityPharmacy.PharmacistID != *pharmacy.PharmacistID {
			return apperrorPharmacy.NewPharmacistModifyError()
		}

		if err := u.pharmacyRepo.Update(txCtx, pharmacy); err != nil {
			return err
		}
		return nil
	})

	if err != nil {
		return nil, err
	}
	return dtoPharmacy.ConvertToPharmacyResponse(pharmacy), nil
}
