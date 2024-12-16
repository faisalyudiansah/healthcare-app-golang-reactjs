package usecase

import (
	"context"

	authRepo "healthcare-app/internal/auth/repository"
	appErrorCart "healthcare-app/internal/cart/apperror"
	cartDto "healthcare-app/internal/cart/dto"
	cartRepo "healthcare-app/internal/cart/repository"
	dtoPharmacy "healthcare-app/internal/pharmacy/dto"
	appErrorPkg "healthcare-app/pkg/apperror"
	"healthcare-app/pkg/database/transactor"

	"github.com/shopspring/decimal"
)

type CartUseCase interface {
	CountCart(ctx context.Context, userID int64) (*cartDto.CartCountResponse, error)
	GetMyCart(ctx context.Context, userId int64, query string, sortBy string, sort string, limit int, offset int) ([]cartDto.ResponseCart, int64, error)
	CreateCart(ctx context.Context, reqBody *cartDto.RequestCart, userId int64) error
	DeleteCart(ctx context.Context, PharmacyProductId int64, userId int64) error
	PutQuantityCart(ctx context.Context, reqBody *cartDto.RequestCart, userId int64) error
}

type cartUseCaseImpl struct {
	cartRepo   cartRepo.CartRepository
	userRepo   authRepo.UserRepository
	transactor transactor.Transactor
}

func NewCartUseCase(
	cartRepo cartRepo.CartRepository,
	userRepo authRepo.UserRepository,
	transactor transactor.Transactor,
) *cartUseCaseImpl {
	return &cartUseCaseImpl{
		cartRepo:   cartRepo,
		userRepo:   userRepo,
		transactor: transactor,
	}
}

func (c *cartUseCaseImpl) CountCart(ctx context.Context, userID int64) (*cartDto.CartCountResponse, error) {
	count, err := c.cartRepo.CountByUserID(ctx, userID)
	if err != nil {
		return nil, appErrorPkg.NewServerError(err)
	}
	return &cartDto.CartCountResponse{
		Count: count,
	}, nil
}

func (c *cartUseCaseImpl) GetMyCart(ctx context.Context, userId int64, query string, sortBy string, sort string, limit int, offset int) ([]cartDto.ResponseCart, int64, error) {
	var totalCount int64
	var responseCarts []cartDto.ResponseCart
	var totalCartPrice decimal.Decimal
	err := c.transactor.Atomic(ctx, func(cForTx context.Context) error {
		userDb, err := c.userRepo.FindByID(cForTx, userId)
		if err != nil || userDb.ID == 0 {
			return appErrorPkg.NewForbiddenAccessError()
		}
		cartDb, err := c.cartRepo.GetMyCart(cForTx, userId, query, sortBy, sort, limit, offset)
		if err != nil {
			return appErrorPkg.NewServerError(err)
		}
		pharmacyMap := make(map[int64]*cartDto.ResponsePharmacyWithProduct)
		pharmacyKeys := make([]int64, 0)
		for _, cart := range cartDb {
			pharmacyID := cart.PharmacyProduct.Pharmacy.ID
			if pharmacyMap[pharmacyID] == nil {
				pharmacyMap[pharmacyID] = &cartDto.ResponsePharmacyWithProduct{
					SoldAmount:       cart.PharmacyProduct.SoldAmount,
					PricePerPharmacy: decimal.NewFromInt(0),
					Pharmacy: cartDto.ResponsePharmacy{
						ID:           cart.PharmacyProduct.Pharmacy.ID,
						PharmacistID: cart.PharmacyProduct.Pharmacy.PharmacistID,
						PartnerID:    cart.PharmacyProduct.Pharmacy.PartnerID,
						Partner: dtoPharmacy.ResponsePartner{
							ID:          cart.PharmacyProduct.Pharmacy.Partner.ID,
							Name:        cart.PharmacyProduct.Pharmacy.Partner.Name,
							LogoURL:     cart.PharmacyProduct.Pharmacy.Partner.LogoURL,
							YearFounded: cart.PharmacyProduct.Pharmacy.Partner.YearFounded,
							ActiveDays:  cart.PharmacyProduct.Pharmacy.Partner.ActiveDays,
							StartOpt:    cart.PharmacyProduct.Pharmacy.Partner.StartOpt,
							EndOpt:      cart.PharmacyProduct.Pharmacy.Partner.EndOpt,
							IsActive:    cart.PharmacyProduct.Pharmacy.Partner.IsActive,
							CreatedAt:   cart.PharmacyProduct.Pharmacy.Partner.CreatedAt,
							UpdatedAt:   cart.PharmacyProduct.Pharmacy.Partner.UpdatedAt,
						},
						Name:      cart.PharmacyProduct.Pharmacy.Name,
						Address:   cart.PharmacyProduct.Pharmacy.Address,
						CityID:    cart.PharmacyProduct.Pharmacy.CityID,
						City:      cart.PharmacyProduct.Pharmacy.City,
						Latitude:  cart.PharmacyProduct.Pharmacy.Latitude,
						Longitude: cart.PharmacyProduct.Pharmacy.Longitude,
						IsActive:  cart.PharmacyProduct.Pharmacy.IsActive,
						CreatedAt: cart.PharmacyProduct.CreatedAt,
						UpdatedAt: cart.PharmacyProduct.UpdatedAt,
					},
					Product: []cartDto.ResponseProductAndQuantity{},
				}
				pharmacyKeys = append(pharmacyKeys, pharmacyID)
			}
			productPrice := cart.PharmacyProduct.Price.Mul(decimal.NewFromInt(int64(cart.Quantity)))
			pharmacyMap[pharmacyID].PricePerPharmacy = pharmacyMap[pharmacyID].PricePerPharmacy.Add(productPrice)
			totalCartPrice = totalCartPrice.Add(productPrice)
			pharmacyMap[pharmacyID].Product = append(pharmacyMap[pharmacyID].Product, cartDto.ResponseProductAndQuantity{
				ID:            cart.PharmacyProduct.ID,
				Quantity:      cart.Quantity,
				StockQuantity: cart.PharmacyProduct.StockQuantity,
				Price:         cart.PharmacyProduct.Price,
				Product: cartDto.ResponseProduct{
					ID:                      cart.PharmacyProduct.Product.ID,
					ManufactureID:           cart.PharmacyProduct.Product.ManufactureID,
					ProductClassificationID: cart.PharmacyProduct.Product.ProductClassificationID,
					ProductFormID:           cart.PharmacyProduct.Product.ProductFormID,
					Name:                    cart.PharmacyProduct.Product.Name,
					GenericName:             cart.PharmacyProduct.Product.GenericName,
					Description:             cart.PharmacyProduct.Product.Description,
					UnitInPack:              cart.PharmacyProduct.Product.UnitInPack,
					SellingUnit:             cart.PharmacyProduct.Product.SellingUnit,
					SoldAmount:              cart.PharmacyProduct.Product.SoldAmount,
					Weight:                  cart.PharmacyProduct.Product.Weight,
					Height:                  cart.PharmacyProduct.Product.Height,
					Length:                  cart.PharmacyProduct.Product.Length,
					Width:                   cart.PharmacyProduct.Product.Width,
					ImageURL:                cart.PharmacyProduct.Product.ImageURL,
					IsActive:                cart.PharmacyProduct.Product.IsActive,
					CreatedAt:               cart.PharmacyProduct.Product.CreatedAt,
					UpdatedAt:               cart.PharmacyProduct.Product.UpdatedAt,
					DeletedAt:               cart.PharmacyProduct.Product.DeletedAt,
				},
			})
		}
		totalCount = int64(len(pharmacyKeys))
		for _, pharmacyID := range pharmacyKeys {
			pharmacyWithProducts := pharmacyMap[pharmacyID]
			responseCarts = append(responseCarts, cartDto.ResponseCart{
				UserId:             userId,
				TotalPrice:         totalCartPrice,
				PharmacyAndProduct: *pharmacyWithProducts,
				CreatedAt:          pharmacyWithProducts.Pharmacy.CreatedAt,
				UpdatedAt:          pharmacyWithProducts.Pharmacy.UpdatedAt,
			})
		}
		return nil
	})
	if err != nil {
		return nil, 0, err
	}
	start := offset
	end := offset + limit
	if start > len(responseCarts) {
		start = len(responseCarts)
	}
	if end > len(responseCarts) {
		end = len(responseCarts)
	}
	responseCarts = responseCarts[start:end]
	return responseCarts, totalCount, nil
}

func (c *cartUseCaseImpl) CreateCart(ctx context.Context, reqBody *cartDto.RequestCart, userId int64) error {
	return c.transactor.Atomic(ctx, func(ctxForTx context.Context) error {
		pharmacyProduct, err := c.cartRepo.FindPharmacyProductById(ctxForTx, reqBody.PharmacyProductId)
		if err != nil || pharmacyProduct.ID == 0 {
			return appErrorCart.NewPharmacyProductsIdError()
		}

		if !pharmacyProduct.IsActive {
			return appErrorCart.NewInactiveProductError()
		}

		exists, err := c.cartRepo.CartItemExists(ctxForTx, userId, reqBody.PharmacyProductId)
		if err != nil {
			return appErrorPkg.NewServerError(err)
		}
		if exists {
			cartExists, err := c.cartRepo.GetCartItem(ctxForTx, userId, reqBody.PharmacyProductId)
			if err != nil {
				return appErrorPkg.NewServerError(err)
			}
			if pharmacyProduct.StockQuantity < reqBody.Quantity+cartExists.Quantity {
				return appErrorCart.NewInsufficientStockError()
			}
			err = c.cartRepo.UpdateCartQuantity(ctxForTx, userId, reqBody.PharmacyProductId, (reqBody.Quantity + cartExists.Quantity))
			if err != nil {
				return appErrorPkg.NewServerError(err)
			}
			return nil
		}
		if pharmacyProduct.StockQuantity < reqBody.Quantity {
			return appErrorCart.NewInsufficientStockError()
		}
		err = c.cartRepo.CreateCart(ctxForTx, reqBody, userId)
		if err != nil {
			return appErrorPkg.NewServerError(err)
		}
		return nil
	})
}

func (c *cartUseCaseImpl) DeleteCart(ctx context.Context, pharmacyProductId int64, userId int64) error {
	return c.transactor.Atomic(ctx, func(ctxForTx context.Context) error {
		exists, err := c.cartRepo.CartItemExists(ctxForTx, userId, pharmacyProductId)
		if err != nil {
			return appErrorPkg.NewServerError(err)
		}
		if !exists {
			return appErrorCart.NewPharmacyProductsIdNotFoundError()
		}
		err = c.cartRepo.DeleteCart(ctxForTx, userId, pharmacyProductId)
		if err != nil {
			return appErrorPkg.NewServerError(err)
		}
		return nil
	})
}

func (c *cartUseCaseImpl) PutQuantityCart(ctx context.Context, reqBody *cartDto.RequestCart, userId int64) error {
	return c.transactor.Atomic(ctx, func(ctxForTx context.Context) error {
		pharmacyProduct, err := c.cartRepo.FindPharmacyProductById(ctxForTx, reqBody.PharmacyProductId)
		if err != nil || pharmacyProduct.ID == 0 {
			return appErrorCart.NewPharmacyProductsIdError()
		}
		exists, err := c.cartRepo.CartItemExists(ctxForTx, userId, reqBody.PharmacyProductId)
		if err != nil {
			return appErrorPkg.NewServerError(err)
		}
		if !exists {
			return appErrorCart.NewCartItemNotFoundError()
		}
		if pharmacyProduct.StockQuantity < reqBody.Quantity {
			return appErrorCart.NewInsufficientStockError()
		}
		err = c.cartRepo.UpdateCartQuantity(ctxForTx, userId, reqBody.PharmacyProductId, reqBody.Quantity)
		if err != nil {
			return appErrorPkg.NewServerError(err)
		}
		return nil
	})
}
