package usecase

import (
	"context"

	dtoProduct "healthcare-app/internal/product/dto"
	"healthcare-app/internal/product/repository"
	apperrorPkg "healthcare-app/pkg/apperror"
	dtoPkg "healthcare-app/pkg/dto"
	"healthcare-app/pkg/utils/pageutils"
)

type ProductFormUseCase interface {
	Search(ctx context.Context, request *dtoProduct.SearchProductFormRequest) ([]*dtoProduct.ProductFormResponse, *dtoPkg.PageMetaData, error)
}

type productFormUseCaseImpl struct {
	productFormRepo repository.ProductFormRepository
}

func NewProductFormUseCase(
	productFormRepo repository.ProductFormRepository,
) *productFormUseCaseImpl {
	return &productFormUseCaseImpl{
		productFormRepo: productFormRepo,
	}
}

func (u *productFormUseCaseImpl) Search(ctx context.Context, request *dtoProduct.SearchProductFormRequest) ([]*dtoProduct.ProductFormResponse, *dtoPkg.PageMetaData, error) {
	productForms, err := u.productFormRepo.Search(ctx, request)
	if err != nil {
		return nil, nil, apperrorPkg.NewServerError(err)
	}

	res, metaData := pageutils.CreateMetaData(productForms, request.Page, request.Limit)

	return dtoProduct.ConvertToProductFormResponses(res), metaData, nil
}
