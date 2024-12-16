package usecase

import (
	"context"
	"strings"
	"time"

	apperrorProduct "healthcare-app/internal/product/apperror"
	"healthcare-app/internal/product/constant"
	dtoProduct "healthcare-app/internal/product/dto"
	"healthcare-app/internal/product/entity"
	repositoryProduct "healthcare-app/internal/product/repository"
	"healthcare-app/internal/product/utils"
	repositoryProfile "healthcare-app/internal/profile/repository"
	apperrorPkg "healthcare-app/pkg/apperror"
	dtoPkg "healthcare-app/pkg/dto"
	"healthcare-app/pkg/utils/geoutils"
	"healthcare-app/pkg/utils/pageutils"
	"healthcare-app/pkg/utils/redisutils"
)

type UserProductUseCase interface {
	List(ctx context.Context, request *dtoProduct.HomeProductRequest) ([]*dtoProduct.ProductResponse, *dtoPkg.PageMetaData, error)
	ListByCategory(ctx context.Context, request *dtoProduct.GetProductByCategoryRequest) ([]*dtoProduct.ProductResponse, *dtoPkg.PageMetaData, error)
	Search(ctx context.Context, request *dtoProduct.UserSearchProductRequest) ([]*dtoProduct.ProductResponse, *dtoPkg.PageMetaData, error)
	Get(ctx context.Context, request *dtoProduct.GetProductRequest) (*dtoProduct.UserProductDetailResponse, error)
	RefreshView(ctx context.Context) error
}

type userProductUseCaseImpl struct {
	redisUtils            redisutils.RedisUtil
	addressRepository     repositoryProfile.AddressRepository
	productRepository     repositoryProduct.ProductRepository
	userProductRepository repositoryProduct.UserProductRepository
}

func NewUserProductUseCase(
	redisUtils redisutils.RedisUtil,
	addressRepository repositoryProfile.AddressRepository,
	productRepository repositoryProduct.ProductRepository,
	userProductRepository repositoryProduct.UserProductRepository,
) *userProductUseCaseImpl {
	return &userProductUseCaseImpl{
		redisUtils:            redisUtils,
		addressRepository:     addressRepository,
		productRepository:     productRepository,
		userProductRepository: userProductRepository,
	}
}

func (u *userProductUseCaseImpl) ListByCategory(ctx context.Context, request *dtoProduct.GetProductByCategoryRequest) ([]*dtoProduct.ProductResponse, *dtoPkg.PageMetaData, error) {
	products, err := u.userProductRepository.FindAllByCategoryID(ctx, request.ID)
	if err != nil {
		return nil, nil, apperrorPkg.NewServerError(err)
	}

	res, metaData := pageutils.CreateMetaData(dtoProduct.ConvertToProductResponses(products), request.Page, request.Limit)
	return res, metaData, nil
}

func (u *userProductUseCaseImpl) List(ctx context.Context, request *dtoProduct.HomeProductRequest) ([]*dtoProduct.ProductResponse, *dtoPkg.PageMetaData, error) {
	address, err := u.addressRepository.FindAddressByIDAndActive(ctx, request.UserID)
	if err != nil {
		return nil, nil, apperrorPkg.NewServerError(err)
	}

	var productsCache []*dtoProduct.ProductResponse
	if err := u.redisUtils.GetWithScanJSON(ctx, utils.UserProductCacheKey(request.UserID), &productsCache); err != nil {
		return nil, nil, apperrorPkg.NewServerError(err)
	}

	if len(productsCache) != 0 {
		res, metaData := pageutils.CreateMetaData(productsCache, request.Page, request.Limit)
		return res, metaData, nil
	}

	var products []*entity.Product
	if request.UserID == 0 || address == nil {
		mostBought, err := u.mostBought(ctx)
		if err != nil {
			return nil, nil, err
		}
		products = mostBought
	} else {
		location := strings.Split(address.Location, " ")
		request.Location = geoutils.GeoFromText(location[0], location[1])
		fcnProduct, err := u.fastestCheapestNearest(ctx, request)

		if err != nil {
			return nil, nil, err
		}
		products = fcnProduct

		go func() {
			if err := u.redisUtils.SetJSON(
				context.Background(),
				utils.UserProductCacheKey(request.UserID),
				dtoProduct.ConvertToProductResponses(products), 5*time.Minute,
			); err != nil {
				return
			}
		}()
	}

	res, metaData := pageutils.CreateMetaData(dtoProduct.ConvertToProductResponses(products), request.Page, request.Limit)
	return res, metaData, nil
}

func (u *userProductUseCaseImpl) mostBought(ctx context.Context) ([]*entity.Product, error) {
	products, err := u.productRepository.MostBoughtToday(ctx)
	if err != nil {
		return nil, apperrorPkg.NewServerError(err)
	}
	if len(products) > 0 {
		return products, nil
	}

	products, err = u.productRepository.MostBoughtAllTime(ctx)
	if err != nil {
		return nil, apperrorPkg.NewServerError(err)
	}
	return products, nil
}

func (u *userProductUseCaseImpl) fastestCheapestNearest(ctx context.Context, request *dtoProduct.HomeProductRequest) ([]*entity.Product, error) {
	products, err := u.productRepository.FastestCheapestNearest(ctx, request)
	if err != nil {
		return nil, apperrorPkg.NewServerError(err)
	}
	if len(products) == 0 {
		return nil, apperrorProduct.NewNoNearbyPharmaciesError()
	}
	return products, nil
}

func (u *userProductUseCaseImpl) Search(ctx context.Context, request *dtoProduct.UserSearchProductRequest) ([]*dtoProduct.ProductResponse, *dtoPkg.PageMetaData, error) {
	if _, ok := constant.UserAllowedSorts[strings.ToLower(request.SortBy)]; !ok {
		request.SortBy = "rfp.price"
	} else {
		request.SortBy = constant.UserAllowedSorts[strings.ToLower(request.SortBy)]
	}
	if _, ok := constant.AllowedOrderDir[strings.ToLower(request.Sort)]; !ok {
		request.Sort = "asc"
	}

	products, err := u.userProductRepository.Search(ctx, request)
	if err != nil {
		return nil, nil, apperrorPkg.NewServerError(err)
	}

	res, metaData := pageutils.CreateMetaData(products, request.Page, request.Limit)

	return dtoProduct.ConvertToProductResponses(res), metaData, nil
}

func (u *userProductUseCaseImpl) Get(ctx context.Context, request *dtoProduct.GetProductRequest) (*dtoProduct.UserProductDetailResponse, error) {
	product, err := u.userProductRepository.FindByID(ctx, request.ID)
	if err != nil {
		return nil, apperrorPkg.NewServerError(err)
	}
	if product == nil {
		return nil, apperrorPkg.NewEntityNotFoundError("product")
	}

	pharmacy, err := u.userProductRepository.FindPharmacyByPharmacyProductID(ctx, product.PharmacyProductID)
	if err != nil {
		return nil, apperrorPkg.NewServerError(err)
	}

	return dtoProduct.ConvertToUserProductDetailResponse(product, pharmacy), nil
}

func (u *userProductUseCaseImpl) RefreshView(ctx context.Context) error {
	return u.productRepository.RefreshView(ctx)
}
