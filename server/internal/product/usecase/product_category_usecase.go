package usecase

import (
	"context"
	"strings"

	appErrorProduct "healthcare-app/internal/product/apperror"
	dtoProduct "healthcare-app/internal/product/dto"
	entityProduct "healthcare-app/internal/product/entity"
	productRepo "healthcare-app/internal/product/repository"
	appErrorPkg "healthcare-app/pkg/apperror"
	"healthcare-app/pkg/database/transactor"
)

type ProductCategoryUseCase interface {
	GetAllCategories(ctx context.Context, roleId int, query string, sortBy string, sort string, limit int, offset int) ([]dtoProduct.ProductCategoryResponse, int64, error)
	PostProductCategory(ctx context.Context, req *dtoProduct.CreateProductCategoryRequest) (*dtoProduct.ProductCategoryResponse, error)
	UpdateProductCategory(ctx context.Context, req *dtoProduct.UpdateProductCategoryRequest) (*dtoProduct.ProductCategoryResponse, error)
	DeleteProductCategory(ctx context.Context, categoryId int64) error
}

type productCategoryUseCaseImpl struct {
	productCategoryRepo productRepo.ProductCategoryRepository
	transactor          transactor.Transactor
}

func NewProductCategoryUseCase(
	productCategoryRepo productRepo.ProductCategoryRepository,
	transactor transactor.Transactor,
) *productCategoryUseCaseImpl {
	return &productCategoryUseCaseImpl{
		productCategoryRepo: productCategoryRepo,
		transactor:          transactor,
	}
}

func (pc *productCategoryUseCaseImpl) GetAllCategories(ctx context.Context, roleId int, query string, sortBy string, sort string, limit int, offset int) ([]dtoProduct.ProductCategoryResponse, int64, error) {
	var dataRes []dtoProduct.ProductCategoryResponse
	var totalDataCategory int64
	err := pc.transactor.Atomic(ctx, func(cForTx context.Context) error {
		dataAllCategories, err := pc.productCategoryRepo.GetAllCategories(cForTx, query, sortBy, sort, "ilike")
		if err != nil {
			return appErrorPkg.NewServerError(err)
		}
		totalDataCategory = int64(len(dataAllCategories))
		totalData := int64(len(dataAllCategories))
		if offset < int(totalData) {
			end := offset + limit
			if end > int(totalData) {
				end = int(totalData)
			}
			dataAllCategories = dataAllCategories[offset:end]
		} else {
			dataAllCategories = []entityProduct.ProductCategory{}
		}
		for _, category := range dataAllCategories {
			dataRes = append(dataRes, dtoProduct.ProductCategoryResponse{
				ID:   category.ID,
				Name: category.Name,
			})
		}
		return nil
	})
	if err != nil {
		return nil, 0, err
	}
	return dataRes, totalDataCategory, nil
}

func (pc *productCategoryUseCaseImpl) PostProductCategory(ctx context.Context, req *dtoProduct.CreateProductCategoryRequest) (*dtoProduct.ProductCategoryResponse, error) {
	var res *dtoProduct.ProductCategoryResponse
	err := pc.transactor.Atomic(ctx, func(cForTx context.Context) error {
		existingCategories, err := pc.productCategoryRepo.GetAllCategories(cForTx, req.Name, "name", "asc", "ilike")
		if err != nil {
			return appErrorPkg.NewServerError(err)
		}
		for _, category := range existingCategories {
			if strings.EqualFold(category.Name, req.Name) {
				return appErrorProduct.NewInvalidCategoryAlreadyExists()
			}
		}
		resData, err := pc.productCategoryRepo.PostProductCategory(cForTx, req.Name)
		if err != nil {
			return appErrorPkg.NewServerError(err)
		}
		res = &dtoProduct.ProductCategoryResponse{
			ID:   resData.ID,
			Name: resData.Name,
		}
		return nil
	})
	if err != nil {
		return nil, err
	}
	return res, nil
}

func (pc *productCategoryUseCaseImpl) UpdateProductCategory(ctx context.Context, req *dtoProduct.UpdateProductCategoryRequest) (*dtoProduct.ProductCategoryResponse, error) {
	var res *dtoProduct.ProductCategoryResponse
	err := pc.transactor.Atomic(ctx, func(cForTx context.Context) error {
		categoryDb, err := pc.productCategoryRepo.FindCategoryByID(cForTx, req.ID)
		if err != nil || categoryDb.ID == 0 {
			return appErrorProduct.NewInvalidCategoryIdDoesNotExists()
		}
		if categoryDb.Name != req.Name {
			existingCategories, err := pc.productCategoryRepo.GetAllCategories(cForTx, req.Name, "name", "asc", "ilike")
			if err != nil {
				return appErrorPkg.NewServerError(err)
			}
			if len(existingCategories) > 0 {
				return appErrorProduct.NewInvalidCategoryAlreadyExists()
			}
		}

		resData, err := pc.productCategoryRepo.PutProductCategory(cForTx, req)
		if err != nil {
			return appErrorPkg.NewServerError(err)
		}
		res = &dtoProduct.ProductCategoryResponse{
			ID:   resData.ID,
			Name: resData.Name,
		}
		return nil
	})
	if err != nil {
		return nil, err
	}
	return res, nil
}

func (pc *productCategoryUseCaseImpl) DeleteProductCategory(ctx context.Context, categoryId int64) error {
	return pc.transactor.Atomic(ctx, func(cForTx context.Context) error {
		categoryDb, err := pc.productCategoryRepo.FindCategoryByID(cForTx, categoryId)
		if err != nil || categoryDb.ID == 0 {
			return appErrorProduct.NewInvalidCategoryIdDoesNotExists()
		}
		err = pc.productCategoryRepo.DeleteProductCategory(cForTx, categoryId)
		if err != nil {
			return appErrorPkg.NewServerError(err)
		}
		return nil
	})
}
