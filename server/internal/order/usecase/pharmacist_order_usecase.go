package usecase

import (
	"context"

	apperrorOrder "healthcare-app/internal/order/apperror"
	"healthcare-app/internal/order/constant"
	dtoOrder "healthcare-app/internal/order/dto"
	repositoryOrder "healthcare-app/internal/order/repository"
	"healthcare-app/internal/product/entity"
	repositoryProduct "healthcare-app/internal/product/repository"
	"healthcare-app/internal/queue/payload"
	"healthcare-app/internal/queue/tasks"
	appErrorPkg "healthcare-app/pkg/apperror"
	"healthcare-app/pkg/database/transactor"
	dtoPkg "healthcare-app/pkg/dto"
	"healthcare-app/pkg/utils/pageutils"
)

type PharmacistOrderUseCase interface {
	GetOrderById(ctx context.Context, order *dtoOrder.GetOrderRequest) (*dtoOrder.OrderResponse, error)
	GetAllOrders(ctx context.Context, request *dtoOrder.PharmacistGetOrderRequest, userId int64) ([]*dtoOrder.OrderResponse, *dtoPkg.PageMetaData, error)
	SendOrder(ctx context.Context, order *dtoOrder.RequestOrderID) error
	CancelOrder(ctx context.Context, order *dtoOrder.RequestOrderID) error
}

type pharmacistOrderUseCaseImpl struct {
	orderTask                 tasks.OrderTask
	productRepository         repositoryProduct.ProductRepository
	pharmacyProductRepository repositoryProduct.PharmacyProductRepository
	pharmacistOrderRepository repositoryOrder.PharmacistOrderRepository
	transactor                transactor.Transactor
}

func NewPharmacistOrderUseCase(
	orderTask tasks.OrderTask,
	productRepository repositoryProduct.ProductRepository,
	pharmacyProductRepository repositoryProduct.PharmacyProductRepository,
	pharmacistOrderRepository repositoryOrder.PharmacistOrderRepository,
	transactor transactor.Transactor,
) *pharmacistOrderUseCaseImpl {
	return &pharmacistOrderUseCaseImpl{
		orderTask:                 orderTask,
		productRepository:         productRepository,
		pharmacyProductRepository: pharmacyProductRepository,
		pharmacistOrderRepository: pharmacistOrderRepository,
		transactor:                transactor,
	}
}

func (u *pharmacistOrderUseCaseImpl) GetOrderById(ctx context.Context, order *dtoOrder.GetOrderRequest) (*dtoOrder.OrderResponse, error) {
	ok, err := u.pharmacistOrderRepository.IsPharmacistAssign(ctx, order.PharmacyID, order.PharmacistID)
	if err != nil {
		return nil, appErrorPkg.NewServerError(err)
	}

	if !ok {
		return nil, appErrorPkg.NewForbiddenAccessError()
	}

	orders, err := u.pharmacistOrderRepository.FindByID(ctx, order)
	if err != nil {
		return nil, err
	}

	return dtoOrder.ConvertToOrderResponse(orders), nil
}

func (u *pharmacistOrderUseCaseImpl) GetAllOrders(ctx context.Context, request *dtoOrder.PharmacistGetOrderRequest, userId int64) ([]*dtoOrder.OrderResponse, *dtoPkg.PageMetaData, error) {
	orders, err := u.pharmacistOrderRepository.GetAllOrderFromPharmacist(ctx, request, userId)
	if err != nil {
		return nil, nil, appErrorPkg.NewServerError(err)
	}

	res, metaData := pageutils.CreateMetaData(dtoOrder.ConvertToOrderResponses(orders), request.Page, request.Limit)

	return res, metaData, nil
}

func (u *pharmacistOrderUseCaseImpl) SendOrder(ctx context.Context, orders *dtoOrder.RequestOrderID) error {
	ok, err := u.pharmacistOrderRepository.IsPharmacistAssign(ctx, orders.PharmacyID, orders.PharmacistID)
	if err != nil {
		return appErrorPkg.NewServerError(err)
	}

	if !ok {
		return appErrorPkg.NewForbiddenAccessError()
	}

	err = u.transactor.Atomic(ctx, func(ctx context.Context) error {
		if len(orders.OrderID) <= 0 {
			return appErrorPkg.NewEntityNotFoundError("order")
		}

		orderDB, err := u.pharmacistOrderRepository.GetOrderById(ctx, orders)
		if err != nil {
			return appErrorPkg.NewServerError(err)
		}
		OrderResponse := dtoOrder.ConvertToOrderResponses(orderDB, constant.STATUS_PROCESSED)

		if len(OrderResponse) <= 0 {
			return apperrorOrder.NewInvalidSentOrder()
		}

		err = u.pharmacistOrderRepository.SendOrderStatus(ctx, OrderResponse)
		if err != nil {
			return appErrorPkg.NewServerError(err)
		}

		return u.orderTask.QueueConfirmOrder(ctx, &payload.ConfirmOrderPayload{IDs: orders.OrderID})
	})

	if err != nil {
		return err
	}

	return nil
}

func (u *pharmacistOrderUseCaseImpl) CancelOrder(ctx context.Context, orders *dtoOrder.RequestOrderID) error {
	ok, err := u.pharmacistOrderRepository.IsPharmacistAssign(ctx, orders.PharmacyID, orders.PharmacistID)
	if err != nil {
		return appErrorPkg.NewServerError(err)
	}

	if !ok {
		return appErrorPkg.NewForbiddenAccessError()
	}

	err = u.transactor.Atomic(ctx, func(ctx context.Context) error {
		if len(orders.OrderID) <= 0 {
			return appErrorPkg.NewEntityNotFoundError("order")
		}

		orderDB, err := u.pharmacistOrderRepository.GetOrderById(ctx, orders)
		if err != nil {
			return appErrorPkg.NewServerError(err)
		}
		OrderResponse := dtoOrder.ConvertToOrderResponses(orderDB, constant.STATUS_PROCESSED, constant.STATUS_WAITING)

		if len(OrderResponse) <= 0 {
			return appErrorPkg.NewEntityNotFoundError("order")
		}

		err = u.pharmacistOrderRepository.CancelOrderStatus(ctx, OrderResponse)
		if err != nil {
			return appErrorPkg.NewServerError(err)
		}

		for _, order := range OrderResponse {
			for _, product := range order.Detail.Products {
				if err := u.pharmacistOrderRepository.ReturnStockOnCanceledOrder(ctx, product.ID, product.Quantity); err != nil {
					return appErrorPkg.NewServerError(err)
				}

				if err := u.productRepository.UpdateSoldAmountByPharmacyProductID(ctx, &entity.Product{SoldAmount: -product.Quantity}, product.ID); err != nil {
					return appErrorPkg.NewServerError(err)
				}

				if err := u.pharmacyProductRepository.UpdateSoldAmount(ctx, &entity.PharmacyProduct{ID: product.ID, SoldAmount: -product.Quantity}); err != nil {
					return appErrorPkg.NewServerError(err)
				}
			}
		}

		return nil
	})

	if err != nil {
		return err
	}

	return nil
}
