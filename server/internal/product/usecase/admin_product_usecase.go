package usecase

import (
	"context"
	"mime/multipart"
	"path/filepath"
	"strings"

	apperrorProduct "healthcare-app/internal/product/apperror"
	"healthcare-app/internal/product/constant"
	dtoProduct "healthcare-app/internal/product/dto"
	"healthcare-app/internal/product/entity"
	"healthcare-app/internal/product/repository"
	"healthcare-app/internal/queue/payload"
	"healthcare-app/internal/queue/tasks"
	apperrorPkg "healthcare-app/pkg/apperror"
	"healthcare-app/pkg/database/transactor"
	dtoPkg "healthcare-app/pkg/dto"
	"healthcare-app/pkg/utils/cloudinaryutils"
	"healthcare-app/pkg/utils/encryptutils"
	"healthcare-app/pkg/utils/pageutils"
)

type AdminProductUseCase interface {
	Search(ctx context.Context, request *dtoProduct.SearchProductRequest) ([]*dtoProduct.ProductResponse, *dtoPkg.PageMetaData, error)
	Get(ctx context.Context, request *dtoProduct.GetProductRequest) (*dtoProduct.ProductDetailResponse, error)
	Create(ctx context.Context, request *dtoProduct.CreateProductRequest) error
	Update(ctx context.Context, request *dtoProduct.UpdateProductRequest) error
	Delete(ctx context.Context, request *dtoProduct.DeleteProductRequest) error
}

type adminProductUseCaseImpl struct {
	base64Encryptor           encryptutils.Base64Encryptor
	cloudinaryUtil            cloudinaryutils.CloudinaryUtil
	productTask               tasks.ProductTask
	manufactureRepo           repository.ManufactureRepository
	productClassificationRepo repository.ProductClassificationRepository
	productFormRepo           repository.ProductFormRepository
	productRepo               repository.ProductRepository
	transactor                transactor.Transactor
}

func NewAdminProductUseCase(
	base64Encryptor encryptutils.Base64Encryptor,
	cloudinaryUtil cloudinaryutils.CloudinaryUtil,
	productTask tasks.ProductTask,
	manufactureRepo repository.ManufactureRepository,
	productClassificationRepo repository.ProductClassificationRepository,
	productFormRepo repository.ProductFormRepository,
	productRepo repository.ProductRepository,
	transactor transactor.Transactor,
) *adminProductUseCaseImpl {
	return &adminProductUseCaseImpl{
		base64Encryptor:           base64Encryptor,
		cloudinaryUtil:            cloudinaryUtil,
		productTask:               productTask,
		manufactureRepo:           manufactureRepo,
		productClassificationRepo: productClassificationRepo,
		productFormRepo:           productFormRepo,
		productRepo:               productRepo,
		transactor:                transactor,
	}
}

func (u *adminProductUseCaseImpl) Search(ctx context.Context, request *dtoProduct.SearchProductRequest) ([]*dtoProduct.ProductResponse, *dtoPkg.PageMetaData, error) {
	allowedSort := []string{}
	allowedDir := []string{}
	for i, s := range request.SortBy {
		ord, ok := constant.AdminAllowedSorts[strings.ToLower(s)]
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
		allowedSort = append(allowedSort, "p.created_at")
		allowedDir = append(allowedDir, "desc")
	}
	request.Sort = allowedDir
	request.SortBy = allowedSort

	products, err := u.productRepo.Search(ctx, request)
	if err != nil {
		return nil, nil, apperrorPkg.NewServerError(err)
	}

	res, metaData := pageutils.CreateMetaData(products, request.Page, request.Limit)

	return dtoProduct.ConvertToProductResponses(res), metaData, nil
}

func (u *adminProductUseCaseImpl) Get(ctx context.Context, request *dtoProduct.GetProductRequest) (*dtoProduct.ProductDetailResponse, error) {
	product, err := u.productRepo.FindByID(ctx, request.ID)
	if err != nil {
		return nil, apperrorPkg.NewServerError(err)
	}
	if product == nil {
		return nil, apperrorPkg.NewEntityNotFoundError("product")
	}
	return dtoProduct.ConvertToProductDetailResponse(product), nil
}

func (u *adminProductUseCaseImpl) Create(ctx context.Context, request *dtoProduct.CreateProductRequest) error {
	if request.ProductClassificationID != constant.NON_OBAT &&
		(request.ProductFormID == nil || request.UnitInPack == nil || request.SellingUnit == nil) {
		return apperrorProduct.NewProductClassificationError()
	}

	if err := u.validateProductImage(
		request.Thumbnail,
		request.Image,
		request.SecondaryImage,
		request.TertiaryImage,
	); err != nil {
		return err
	}

	product := dtoProduct.CreateRequestToProductEntity(request)
	return u.transactor.Atomic(ctx, func(txCtx context.Context) error {
		if !u.manufactureRepo.IsExistsByID(txCtx, request.ManufactureID) {
			return apperrorPkg.NewEntityNotFoundError("manufacture")
		}
		if !u.productClassificationRepo.IsExistsByID(txCtx, request.ProductClassificationID) {
			return apperrorPkg.NewEntityNotFoundError("product classification")
		}
		if request.ProductFormID != nil && !u.productFormRepo.IsExistsByID(txCtx, *request.ProductFormID) {
			return apperrorPkg.NewEntityNotFoundError("product form")
		}
		if u.productRepo.IsExists(txCtx, product) {
			return apperrorProduct.NewProductAlreadyExistsError()
		}
		if err := u.productRepo.Save(txCtx, product); err != nil {
			return err
		}

		return u.productTask.QueueCreateProduct(
			txCtx,
			payload.CreateRequestToProductPayload(
				u.base64Encryptor,
				product,
				request,
			),
		)
	})
}

func (u *adminProductUseCaseImpl) Update(ctx context.Context, request *dtoProduct.UpdateProductRequest) error {
	if request.ProductClassificationID != constant.NON_OBAT &&
		(request.ProductFormID == nil || request.UnitInPack == nil || request.SellingUnit == nil) {
		return apperrorProduct.NewProductClassificationError()
	}

	if err := u.validateProductImage(
		request.Thumbnail,
		request.Image,
		request.SecondaryImage,
		request.TertiaryImage,
	); err != nil {
		return err
	}

	product := dtoProduct.UpdateRequestToProductEntity(request)
	return u.transactor.Atomic(ctx, func(txCtx context.Context) error {
		extProduct, err := u.productRepo.FindByID(txCtx, request.ID)
		if err != nil {
			return apperrorPkg.NewServerError(err)
		}
		if !u.productRepo.IsExistsByID(txCtx, request.ID) {
			return apperrorPkg.NewEntityNotFoundError("product")
		}
		if !u.manufactureRepo.IsExistsByID(txCtx, request.ManufactureID) {
			return apperrorPkg.NewEntityNotFoundError("manufacture")
		}
		if !u.productClassificationRepo.IsExistsByID(txCtx, request.ProductClassificationID) {
			return apperrorPkg.NewEntityNotFoundError("product classification")
		}
		if request.ProductFormID != nil && !u.productFormRepo.IsExistsByID(txCtx, *request.ProductFormID) {
			return apperrorPkg.NewEntityNotFoundError("product form")
		}

		if extProduct != nil && extProduct.Manufacture.ID != request.ManufactureID {
			if u.productRepo.IsExists(txCtx, &entity.Product{
				Manufacture: entity.Manufacture{ID: request.ManufactureID},
				Name:        request.Name,
				GenericName: request.GenericName,
			}) {
				return apperrorProduct.NewProductAlreadyExistsError()
			}
		}

		return u.productTask.QueueUpdateProduct(
			txCtx,
			payload.UpdateRequestToProductPayload(
				u.base64Encryptor,
				product,
				request,
			),
		)
	})
}

func (u *adminProductUseCaseImpl) Delete(ctx context.Context, request *dtoProduct.DeleteProductRequest) error {
	err := u.transactor.Atomic(ctx, func(txCtx context.Context) error {
		if err := u.productRepo.DeleteByID(txCtx, request.ID); err != nil {
			return err
		}
		if err := u.productRepo.DeleteRelatedPharmacyProduct(txCtx, request.ID); err != nil {
			return apperrorPkg.NewServerError(err)
		}
		return nil
	})

	return err
}

func (u *adminProductUseCaseImpl) validateProductImage(thumbnail, image, secondaryImage, tertiaryImage *multipart.FileHeader) error {
	if filepath.Ext(thumbnail.Filename) != ".png" {
		return apperrorProduct.NewProductImageError()
	}
	if thumbnail.Size > constant.MAX_IMAGE_SIZE {
		return apperrorProduct.NewProductImageError()
	}

	if filepath.Ext(image.Filename) != ".png" {
		return apperrorProduct.NewProductImageError()
	}
	if image.Size > constant.MAX_IMAGE_SIZE {
		return apperrorProduct.NewProductImageError()
	}

	if secondaryImage != nil {
		if filepath.Ext(secondaryImage.Filename) != ".png" {
			return apperrorProduct.NewProductImageError()
		}
		if secondaryImage.Size > constant.MAX_IMAGE_SIZE {
			return apperrorProduct.NewProductImageError()
		}
	}

	if tertiaryImage != nil {
		if filepath.Ext(tertiaryImage.Filename) != ".png" {
			return apperrorProduct.NewProductImageError()
		}
		if tertiaryImage.Size > constant.MAX_IMAGE_SIZE {
			return apperrorProduct.NewProductImageError()
		}
	}
	return nil
}
