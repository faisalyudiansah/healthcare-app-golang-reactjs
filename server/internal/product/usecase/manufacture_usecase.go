package usecase

import (
	"context"

	dtoProduct "healthcare-app/internal/product/dto"
	"healthcare-app/internal/product/repository"
	apperrorPkg "healthcare-app/pkg/apperror"
	dtoPkg "healthcare-app/pkg/dto"
	"healthcare-app/pkg/utils/pageutils"
)

type ManufactureUseCase interface {
	Search(ctx context.Context, request *dtoProduct.SearchManufactureRequest) ([]*dtoProduct.ManufactureResponse, *dtoPkg.PageMetaData, error)
}

type manufactureUseCaseImpl struct {
	manufactureRepo repository.ManufactureRepository
}

func NewManufactureUseCase(
	manufactureRepo repository.ManufactureRepository,
) *manufactureUseCaseImpl {
	return &manufactureUseCaseImpl{
		manufactureRepo: manufactureRepo,
	}
}

func (u *manufactureUseCaseImpl) Search(ctx context.Context, request *dtoProduct.SearchManufactureRequest) ([]*dtoProduct.ManufactureResponse, *dtoPkg.PageMetaData, error) {
	manufactures, err := u.manufactureRepo.Search(ctx, request)
	if err != nil {
		return nil, nil, apperrorPkg.NewServerError(err)
	}

	res, metaData := pageutils.CreateMetaData(manufactures, request.Page, request.Limit)

	return dtoProduct.ConvertToManufactureResponses(res), metaData, nil
}
