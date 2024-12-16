package usecase

import (
	"context"

	dtoOrder "healthcare-app/internal/order/dto"
	"healthcare-app/internal/order/repository"
	"healthcare-app/pkg/apperror"
	dtoPkg "healthcare-app/pkg/dto"
	"healthcare-app/pkg/utils/pageutils"
)

type AdminOrderUseCase interface {
	Search(ctx context.Context, request *dtoOrder.AdminGetOrderRequest) ([]*dtoOrder.OrderResponse, *dtoPkg.PageMetaData, error)
}

type adminOrderUseCaseImpl struct {
	orderRepo repository.OrderRepository
}

func NewAdminOrderUseCase(
	orderRepo repository.OrderRepository,
) *adminOrderUseCaseImpl {
	return &adminOrderUseCaseImpl{
		orderRepo: orderRepo,
	}
}

func (u *adminOrderUseCaseImpl) Search(ctx context.Context, request *dtoOrder.AdminGetOrderRequest) ([]*dtoOrder.OrderResponse, *dtoPkg.PageMetaData, error) {
	orders, err := u.orderRepo.FindAllByPharmacy(ctx, request)
	if err != nil {
		return nil, nil, apperror.NewServerError(err)
	}

	res, metaData := pageutils.CreateMetaData(dtoOrder.ConvertToOrderResponses(orders), request.Page, request.Limit)
	return res, metaData, nil
}
