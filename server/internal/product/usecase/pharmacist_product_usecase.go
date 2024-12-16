package usecase

import (
	"context"
	"strings"
	"time"

	apperrorProduct "healthcare-app/internal/product/apperror"
	"healthcare-app/internal/product/constant"
	dtoProduct "healthcare-app/internal/product/dto"
	"healthcare-app/internal/product/repository"
	apperrorPkg "healthcare-app/pkg/apperror"
	"healthcare-app/pkg/database/transactor"
	dtoPkg "healthcare-app/pkg/dto"
	"healthcare-app/pkg/utils/pageutils"
)

type PharmacistProductUseCase interface {
	Search(ctx context.Context, request *dtoProduct.SearchPharmacyProductRequest) ([]*dtoProduct.PharmacyProductResponse, *dtoPkg.PageMetaData, error)
	GetDetail(ctx context.Context, request *dtoProduct.GetProductRequest) (*dtoProduct.ProductDetailResponse, error)
	Get(ctx context.Context, request *dtoProduct.GetPharmacyProductRequest) (*dtoProduct.PharmacyProductResponse, error)
	Create(ctx context.Context, request *dtoProduct.CreatePharmacyProductRequest) (*dtoProduct.PharmacyProductResponse, error)
	Update(ctx context.Context, request *dtoProduct.UpdatePharmacyProductRequest) (*dtoProduct.PharmacyProductResponse, error)
	Delete(ctx context.Context, request *dtoProduct.DeletePharmacyProductRequest) error
}

type pharmacistProductUseCaseImpl struct {
	productRepo         repository.ProductRepository
	pharmacyProductRepo repository.PharmacyProductRepository
	transactor          transactor.Transactor
}

func NewPharmacistProductUseCase(
	productRepo repository.ProductRepository,
	pharmacyProductRepo repository.PharmacyProductRepository,
	transactor transactor.Transactor,
) *pharmacistProductUseCaseImpl {
	return &pharmacistProductUseCaseImpl{
		productRepo:         productRepo,
		pharmacyProductRepo: pharmacyProductRepo,
		transactor:          transactor,
	}
}

func (u *pharmacistProductUseCaseImpl) Search(ctx context.Context, request *dtoProduct.SearchPharmacyProductRequest) ([]*dtoProduct.PharmacyProductResponse, *dtoPkg.PageMetaData, error) {
	if !u.pharmacyProductRepo.IsPharmacistRelated(ctx, request.PharmacistID, request.PharmacyID) {
		return nil, nil, apperrorProduct.NewPharmacistProductError()
	}

	allowedSort := []string{}
	allowedDir := []string{}
	for i, s := range request.SortBy {
		ord, ok := constant.PharmacistAllowedSorts[strings.ToLower(s)]
		if !ok {
			continue
		}

		dir := ""
		if len(request.Sort) > i {
			dir = request.Sort[i]
		}
		_, ok = constant.AllowedOrderDir[strings.ToLower(dir)]
		if !ok {
			dir = "asc"
		}
		allowedSort = append(allowedSort, ord)
		allowedDir = append(allowedDir, dir)
	}
	if len(request.SortBy) == 0 {
		allowedSort = append(allowedSort, "pp.created_at")
		allowedDir = append(allowedDir, "asc")
	}
	request.Sort = allowedDir
	request.SortBy = allowedSort

	pharmacyProducts, err := u.pharmacyProductRepo.Search(ctx, request)
	if err != nil {
		return nil, nil, apperrorPkg.NewServerError(err)
	}

	res, metaData := pageutils.CreateMetaData(pharmacyProducts, request.Page, request.Limit)
	return dtoProduct.ConvertToPharmacyProductResponses(res), metaData, nil
}

func (u *pharmacistProductUseCaseImpl) GetDetail(ctx context.Context, request *dtoProduct.GetProductRequest) (*dtoProduct.ProductDetailResponse, error) {
	product, err := u.productRepo.FindByID(ctx, request.ID)
	if err != nil {
		return nil, apperrorPkg.NewServerError(err)
	}
	if product == nil {
		return nil, apperrorPkg.NewEntityNotFoundError("product")
	}
	return dtoProduct.ConvertToProductDetailResponse(product), nil
}

func (u *pharmacistProductUseCaseImpl) Get(ctx context.Context, request *dtoProduct.GetPharmacyProductRequest) (*dtoProduct.PharmacyProductResponse, error) {
	if !u.pharmacyProductRepo.IsPharmacistRelated(ctx, request.PharmacistID, request.PharmacyID) {
		return nil, apperrorProduct.NewPharmacistProductError()
	}
	pharmacyProduct, err := u.pharmacyProductRepo.FindByID(ctx, request.ID, request.PharmacyID)
	if err != nil {
		return nil, err
	}

	return dtoProduct.ConvertToPharmacyProductResponse(pharmacyProduct), nil
}

func (u *pharmacistProductUseCaseImpl) Create(ctx context.Context, request *dtoProduct.CreatePharmacyProductRequest) (*dtoProduct.PharmacyProductResponse, error) {
	pharmacyProduct := dtoProduct.CreateRequestToPharmacyProductEntity(request)

	err := u.transactor.Atomic(ctx, func(txCtx context.Context) error {
		if !u.pharmacyProductRepo.IsPharmacistRelated(txCtx, request.PharmacistID, request.PharmacyID) {
			return apperrorProduct.NewPharmacistProductError()
		}

		if pharmacyProduct.IsActive {
			isPharmacyActive := u.pharmacyProductRepo.IsPharmacyActive(txCtx, pharmacyProduct.PharmacyId)
			if !isPharmacyActive {
				return apperrorProduct.NewPharmacyProductPharmacyInactiveError()
			}
		}

		if err := u.pharmacyProductRepo.Save(txCtx, pharmacyProduct); err != nil {
			return err
		}

		return nil
	})

	if err != nil {
		return nil, err
	}

	return dtoProduct.ConvertToPharmacyProductResponse(pharmacyProduct), nil
}

func (u *pharmacistProductUseCaseImpl) Update(ctx context.Context, request *dtoProduct.UpdatePharmacyProductRequest) (*dtoProduct.PharmacyProductResponse, error) {
	pharmacyProduct := dtoProduct.UpdateRequestToPharmacyProductEntity(request)
	err := u.transactor.Atomic(ctx, func(txCtx context.Context) error {
		if !u.pharmacyProductRepo.IsPharmacistRelated(txCtx, request.PharmacistID, request.PharmacyID) {
			return apperrorProduct.NewPharmacistProductError()
		}
		extProduct, err := u.pharmacyProductRepo.FindByID(txCtx, request.ID, request.PharmacyID)
		if err != nil {
			return err
		}

		if extProduct.StockQuantity != request.StockQuantity {
			if u.pharmacyProductRepo.IsStockUpdated(txCtx, request.ID) {
				return apperrorProduct.NewPharmacyProductStockError()
			}
			now := time.Now()
			pharmacyProduct.StockQuantityUpdatedAt = &now
		}

		pharmacyProduct.Product.ID = extProduct.Product.ID
		pharmacyProduct.Price = extProduct.Price
		pharmacyProduct.CreatedAt = extProduct.CreatedAt
		if err := u.pharmacyProductRepo.Update(txCtx, pharmacyProduct); err != nil {
			return err
		}
		return nil
	})

	if err != nil {
		return nil, err
	}
	return dtoProduct.ConvertToPharmacyProductResponse(pharmacyProduct), nil
}

func (u *pharmacistProductUseCaseImpl) Delete(ctx context.Context, request *dtoProduct.DeletePharmacyProductRequest) error {
	err := u.transactor.Atomic(ctx, func(txCtx context.Context) error {
		if !u.pharmacyProductRepo.IsPharmacistRelated(txCtx, request.PharmacistID, request.PharmacyID) {
			return apperrorProduct.NewPharmacistProductError()
		}
		if u.pharmacyProductRepo.IsBeenBought(txCtx, request.ID) {
			return apperrorProduct.NewPharmacyProductDeletionError()
		}
		if err := u.pharmacyProductRepo.Delete(txCtx, request.ID, request.PharmacyID); err != nil {
			return err
		}
		return nil
	})

	if err != nil {
		return err
	}
	return nil
}
