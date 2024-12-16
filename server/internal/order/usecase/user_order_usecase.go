package usecase

import (
	"context"
	"path/filepath"
	"strings"

	appErrorCart "healthcare-app/internal/cart/apperror"
	cartDto "healthcare-app/internal/cart/dto"
	cartRepository "healthcare-app/internal/cart/repository"
	appErrorOrder "healthcare-app/internal/order/apperror"
	"healthcare-app/internal/order/constant"
	orderDto "healthcare-app/internal/order/dto"
	"healthcare-app/internal/order/entity"
	orderRepository "healthcare-app/internal/order/repository"
	"healthcare-app/internal/order/utils"
	pharmacyRepo "healthcare-app/internal/pharmacy/repository"
	productConstant "healthcare-app/internal/product/constant"
	entityProduct "healthcare-app/internal/product/entity"
	productRepository "healthcare-app/internal/product/repository"
	appErrorProfile "healthcare-app/internal/profile/apperror"
	profileRepo "healthcare-app/internal/profile/repository"
	"healthcare-app/internal/queue/payload"
	"healthcare-app/internal/queue/tasks"
	appErrorPkg "healthcare-app/pkg/apperror"
	"healthcare-app/pkg/database/transactor"
	pkgDTO "healthcare-app/pkg/dto"
	"healthcare-app/pkg/utils/encryptutils"
	"healthcare-app/pkg/utils/pageutils"
)

type UserOrderUseCase interface {
	PostNewOrder(ctx context.Context, req *orderDto.RequestOrder, userId int64) (*orderDto.ResponseOrder, error)
	GetMyOrders(ctx context.Context, req *orderDto.QueryGetMyOrder, userId int64) ([]orderDto.ResponseOrder, *pkgDTO.PageMetaData, error)
	GetOrderByID(ctx context.Context, orderId int64, userId int64) (*orderDto.ResponseOrder, error)
	PostUploadPaymentProof(ctx context.Context, req *orderDto.RequestUploadPaymentProof, orderId int64, userId int64) error
	PatchStatusOrder(ctx context.Context, status string, orderId int64, userId int64) (*orderDto.ResponseOrder, error)
}

type userOrderUseCaseImpl struct {
	userOrderRepository orderRepository.UserOrderRepository
	cartRepo            cartRepository.CartRepository
	addressRepo         profileRepo.AddressRepository
	productRepo         productRepository.ProductRepository
	pharmacyProductRepo productRepository.PharmacyProductRepository
	pharmacyRepo        pharmacyRepo.PharmacyRepository
	logisticRepo        pharmacyRepo.LogisticRepository
	base64Encryptor     encryptutils.Base64Encryptor
	transactor          transactor.Transactor
	orderTask           tasks.OrderTask
}

func NewUserOrderUseCase(
	userOrderRepository orderRepository.UserOrderRepository,
	cartRepo cartRepository.CartRepository,
	addressRepo profileRepo.AddressRepository,
	productRepo productRepository.ProductRepository,
	pharmacyProductRepo productRepository.PharmacyProductRepository,
	pharmacyRepo pharmacyRepo.PharmacyRepository,
	logisticRepo pharmacyRepo.LogisticRepository,
	base64Encryptor encryptutils.Base64Encryptor,
	transactor transactor.Transactor,
	orderTask tasks.OrderTask,
) *userOrderUseCaseImpl {
	return &userOrderUseCaseImpl{
		userOrderRepository: userOrderRepository,
		cartRepo:            cartRepo,
		addressRepo:         addressRepo,
		productRepo:         productRepo,
		pharmacyProductRepo: pharmacyProductRepo,
		pharmacyRepo:        pharmacyRepo,
		logisticRepo:        logisticRepo,
		base64Encryptor:     base64Encryptor,
		transactor:          transactor,
		orderTask:           orderTask,
	}
}

func (u *userOrderUseCaseImpl) PostNewOrder(ctx context.Context, req *orderDto.RequestOrder, userId int64) (*orderDto.ResponseOrder, error) {
	var responseNewOrderProduct []orderDto.ResponseOrderProduct
	var response *orderDto.ResponseOrder
	err := u.transactor.Atomic(ctx, func(cForTx context.Context) error {
		pharmacy, err := u.pharmacyRepo.FindByID(cForTx, req.PharmacyID)
		if err != nil {
			return err
		}

		if !pharmacy.IsActive {
			return appErrorOrder.NewInvalidOrderPharmacy()
		}

		addressDb, err := u.addressRepo.FindAddressByIDandUserID(cForTx, req.AddressID, userId)
		if err != nil || addressDb == nil {
			return appErrorProfile.NewInvalidAddressNotFoundError()
		}

		pharmacyWithPartner, err := u.userOrderRepository.GetPharmacyAndPartner(cForTx, req.PharmacyID)

		if err != nil {
			return appErrorPkg.NewServerError(err)
		}

		newOrder, err := u.userOrderRepository.PostNewOrderUser(cForTx, *req, *addressDb, userId)
		if err != nil {
			return appErrorPkg.NewServerError(err)
		}
		for _, orderProduct := range req.OrderProducts {
			cartItem, err := u.cartRepo.GetCartItemWithPharmacyId(cForTx, userId, orderProduct.PharmacyProductId, req.PharmacyID)
			if err != nil {
				return appErrorPkg.NewServerError(err)
			}
			if cartItem == nil || cartItem.ID == 0 {
				return appErrorCart.NewCartItemNotFoundError()
			}
			if cartItem.Quantity < int64(orderProduct.Quantity) {
				return appErrorCart.NewInsufficientStockOnCartError()
			}
			checkProduct, err := u.productRepo.CheckActiveAndQuantityProduct(cForTx, orderProduct.PharmacyProductId)
			if err != nil {
				return appErrorPkg.NewServerError(err)
			}
			if !checkProduct.IsActive {
				return appErrorOrder.NewInvalidProductIsNotActiveError()
			}
			if checkProduct.StockQuantity < orderProduct.Quantity {
				return appErrorCart.NewInsufficientStockError()
			}
			newOrderProduct, err := u.userOrderRepository.PostNewOrderProductUser(cForTx, newOrder.ID, orderProduct)
			if err != nil {
				return appErrorPkg.NewServerError(err)
			}
			err = u.pharmacyProductRepo.UpdateStockAndSoldAmount(cForTx, orderProduct.Quantity, checkProduct.PharmacyProductID, req.PharmacyID, checkProduct.StockQuantity, checkProduct.SoldAmount)
			if err != nil {
				return appErrorPkg.NewServerError(err)
			}
			if err := u.productRepo.UpdateSoldAmountByPharmacyProductID(cForTx, &entityProduct.Product{SoldAmount: int64(orderProduct.Quantity)}, checkProduct.PharmacyProductID); err != nil {
				return appErrorPkg.NewServerError(err)
			}
			responseProduct := cartDto.ResponseProduct(cartItem.Product)
			responseNewOrderProduct = append(responseNewOrderProduct, utils.ConvertProductToResponseProduct(newOrderProduct, responseProduct))
			err = u.cartRepo.DeleteCart(cForTx, userId, orderProduct.PharmacyProductId)
			if err != nil {
				return appErrorPkg.NewServerError(err)
			}
		}
		responsePharmacy := utils.ConvertPharmacyToResponsePharmacy(pharmacyWithPartner)
		response = utils.ConvertOrderToResponseOrder(*newOrder, responsePharmacy, responseNewOrderProduct)
		return nil
	})
	if err != nil {
		return nil, err
	}
	return response, nil
}

func (u *userOrderUseCaseImpl) GetMyOrders(ctx context.Context, req *orderDto.QueryGetMyOrder, userId int64) ([]orderDto.ResponseOrder, *pkgDTO.PageMetaData, error) {
	if _, ok := constant.UserAllowedSorts[strings.ToLower(req.SortBy)]; !ok {
		req.SortBy = "o.created_at"
	} else {
		req.SortBy = constant.UserAllowedSorts[strings.ToLower(req.SortBy)]
	}
	if _, ok := constant.AllowedOrderDir[strings.ToLower(req.Sort)]; !ok {
		req.Sort = "desc"
	}

	var response []orderDto.ResponseOrder
	err := u.transactor.Atomic(ctx, func(cForTx context.Context) error {
		orders, err := u.userOrderRepository.GetMyOrders(cForTx, req, userId)
		if err != nil {
			return appErrorPkg.NewServerError(err)
		}
		orderResponses := make(map[int64]*orderDto.ResponseOrder)
		for _, orderData := range orders {
			productResponse := cartDto.ResponseProduct(orderData.OrderProduct.PharmacyProduct.Product)
			orderProductResponse := utils.ConvertProductToResponseProduct(&entity.OrderProductCheckout{
				ID:                orderData.OrderProduct.ID,
				OrderID:           orderData.OrderProduct.OrderID,
				PharmacyProductID: orderData.OrderProduct.PharmacyProductID,
				Quantity:          orderData.OrderProduct.Quantity,
				Price:             orderData.OrderProduct.Price,
				CreatedAt:         orderData.OrderProduct.CreatedAt,
				UpdatedAt:         orderData.OrderProduct.UpdatedAt,
			}, productResponse)
			if _, exists := orderResponses[orderData.ID]; !exists {
				pharmacyResponse := utils.ConvertPharmacyToResponsePharmacy(&orderData.OrderProduct.PharmacyProduct.Pharmacy)
				orderResponse := utils.ConvertOrderToResponseOrder(entity.OrderCheckout{
					ID:                orderData.ID,
					UserID:            orderData.UserID,
					OrderStatus:       orderData.OrderStatus,
					VoiceNumber:       orderData.VoiceNumber,
					PaymentImgURL:     orderData.PaymentImgURL,
					TotalProductPrice: orderData.TotalProductPrice,
					TotalPayment:      orderData.TotalPayment,
					ShipCost:          orderData.ShipCost,
					Description:       orderData.Description,
					Address:           orderData.Address,
					CreatedAt:         orderData.CreatedAt,
					UpdatedAt:         orderData.UpdatedAt,
					DeletedAt:         orderData.DeletedAt,
				}, pharmacyResponse, nil)
				orderResponses[orderData.ID] = orderResponse
			}
			orderResponses[orderData.ID].Product = append(orderResponses[orderData.ID].Product, orderProductResponse)
		}
		for _, orderResponse := range orderResponses {
			response = append(response, *orderResponse)
		}
		return nil
	})
	if err != nil {
		return nil, nil, err
	}
	res, metaData := pageutils.CreateMetaData(response, req.Page, req.Limit)
	return res, metaData, nil
}

func (u *userOrderUseCaseImpl) GetOrderByID(ctx context.Context, orderId int64, userId int64) (*orderDto.ResponseOrder, error) {
	var response *orderDto.ResponseOrder
	err := u.transactor.Atomic(ctx, func(cForTx context.Context) error {
		orders, err := u.userOrderRepository.GetOrderByID(cForTx, orderId, userId)
		if err != nil {
			return appErrorPkg.NewServerError(err)
		}
		if len(orders) == 0 {
			return appErrorOrder.NewInvalidOrderNotFound()
		}
		for _, orderData := range orders {
			productResponse := cartDto.ResponseProduct(orderData.OrderProduct.PharmacyProduct.Product)
			orderProductResponse := utils.ConvertProductToResponseProduct(&entity.OrderProductCheckout{
				ID:                orderData.OrderProduct.ID,
				OrderID:           orderData.OrderProduct.OrderID,
				PharmacyProductID: orderData.OrderProduct.PharmacyProductID,
				Quantity:          orderData.OrderProduct.Quantity,
				Price:             orderData.OrderProduct.Price,
				CreatedAt:         orderData.OrderProduct.CreatedAt,
				UpdatedAt:         orderData.OrderProduct.UpdatedAt,
			}, productResponse)
			pharmacyResponse := utils.ConvertPharmacyToResponsePharmacy(&orderData.OrderProduct.PharmacyProduct.Pharmacy)
			if response == nil {
				response = utils.ConvertOrderToResponseOrder(entity.OrderCheckout{
					ID:                orderData.ID,
					UserID:            orderData.UserID,
					OrderStatus:       orderData.OrderStatus,
					VoiceNumber:       orderData.VoiceNumber,
					PaymentImgURL:     orderData.PaymentImgURL,
					TotalProductPrice: orderData.TotalProductPrice,
					TotalPayment:      orderData.TotalPayment,
					ShipCost:          orderData.ShipCost,
					Description:       orderData.Description,
					Address:           orderData.Address,
					CreatedAt:         orderData.CreatedAt,
					UpdatedAt:         orderData.UpdatedAt,
					DeletedAt:         orderData.DeletedAt,
				}, pharmacyResponse, nil)
			}
			response.Product = append(response.Product, orderProductResponse)
		}
		return nil
	})
	if err != nil {
		return nil, err
	}
	return response, nil
}

func (u *userOrderUseCaseImpl) PostUploadPaymentProof(ctx context.Context, req *orderDto.RequestUploadPaymentProof, orderId int64, userId int64) error {
	if filepath.Ext(req.PaymentProof.Filename) != ".png" && filepath.Ext(req.PaymentProof.Filename) != ".jpg" && filepath.Ext(req.PaymentProof.Filename) != ".jpeg" {
		return appErrorOrder.NewInvalidImageErrorMessagePaymentProofError()
	}
	if req.PaymentProof.Size > productConstant.MAX_IMAGE_SIZE {
		return appErrorOrder.NewInvalidPhotoMaxSizeError()
	}

	err := u.transactor.Atomic(ctx, func(cForTx context.Context) error {
		orderDb, err := u.userOrderRepository.GetOrderByIDWithSingleData(cForTx, orderId, userId)
		if err != nil || orderDb == nil {
			return appErrorOrder.NewInvalidOrderNotFound()
		}
		if orderDb.PaymentImgURL != nil {
			return appErrorOrder.NewInvalidPaymentAlreadyUpload()
		}

		orders, err := u.userOrderRepository.GetOrderByID(cForTx, orderId, userId)
		if err != nil {
			return appErrorPkg.NewServerError(err)
		}
		if len(orders) == 0 {
			return appErrorOrder.NewInvalidOrderNotFound()
		}

		return u.orderTask.QueueProcessOrder(cForTx, payload.ConvertToProcessOrderPayload(orderId, userId, req.PaymentProof, u.base64Encryptor))
	})

	return err
}

func (u *userOrderUseCaseImpl) PatchStatusOrder(ctx context.Context, status string, orderId int64, userId int64) (*orderDto.ResponseOrder, error) {
	var response *orderDto.ResponseOrder
	err := u.transactor.Atomic(ctx, func(cForTx context.Context) error {
		orderDb, err := u.userOrderRepository.GetOrderByIDWithSingleData(cForTx, orderId, userId)
		if err != nil || orderDb == nil {
			return appErrorOrder.NewInvalidOrderNotFound()
		}
		if orderDb.OrderStatus == status {
			return appErrorOrder.NewInvalidStatusAlreadyConfirmedError()
		}
		if !utils.IsValidStatusTransition(orderDb.OrderStatus, status) {
			return appErrorOrder.NewInvalidStatusChangesError()
		}
		if orderDb.PaymentImgURL == nil {
			return appErrorOrder.NewInvalidStatusPhotoPaymentProofNull()
		}
		err = u.userOrderRepository.PatchStatusOrder(cForTx, status, orderId, userId)
		if err != nil {
			return appErrorPkg.NewServerError(err)
		}
		orders, err := u.userOrderRepository.GetOrderByID(cForTx, orderId, userId)
		if err != nil {
			return appErrorPkg.NewServerError(err)
		}
		if len(orders) == 0 {
			return appErrorOrder.NewInvalidOrderNotFound()
		}
		for _, orderData := range orders {
			productResponse := cartDto.ResponseProduct(orderData.OrderProduct.PharmacyProduct.Product)
			orderProductResponse := utils.ConvertProductToResponseProduct(&entity.OrderProductCheckout{
				ID:                orderData.OrderProduct.ID,
				OrderID:           orderData.OrderProduct.OrderID,
				PharmacyProductID: orderData.OrderProduct.PharmacyProductID,
				Quantity:          orderData.OrderProduct.Quantity,
				Price:             orderData.OrderProduct.Price,
				CreatedAt:         orderData.OrderProduct.CreatedAt,
				UpdatedAt:         orderData.OrderProduct.UpdatedAt,
			}, productResponse)
			pharmacyResponse := utils.ConvertPharmacyToResponsePharmacy(&orderData.OrderProduct.PharmacyProduct.Pharmacy)
			if response == nil {
				response = utils.ConvertOrderToResponseOrder(entity.OrderCheckout{
					ID:                orderData.ID,
					UserID:            orderData.UserID,
					OrderStatus:       orderData.OrderStatus,
					VoiceNumber:       orderData.VoiceNumber,
					PaymentImgURL:     orderData.PaymentImgURL,
					TotalProductPrice: orderData.TotalProductPrice,
					ShipCost:          orderData.ShipCost,
					TotalPayment:      orderData.TotalPayment,
					Description:       orderData.Description,
					Address:           orderData.Address,
					CreatedAt:         orderData.CreatedAt,
					UpdatedAt:         orderData.UpdatedAt,
					DeletedAt:         orderData.DeletedAt,
				}, pharmacyResponse, nil)
			}
			response.Product = append(response.Product, orderProductResponse)
		}
		return nil
	})
	if err != nil {
		return nil, err
	}
	return response, nil
}
