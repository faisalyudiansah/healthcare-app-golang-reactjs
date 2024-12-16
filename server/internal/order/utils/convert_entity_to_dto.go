package utils

import (
	cartDTO "healthcare-app/internal/cart/dto"
	orderDTO "healthcare-app/internal/order/dto"
	orderEntity "healthcare-app/internal/order/entity"
	pharmacyDTO "healthcare-app/internal/pharmacy/dto"
	pharmacyEntity "healthcare-app/internal/pharmacy/entity"
)

func ConvertOrderToResponseOrder(order orderEntity.OrderCheckout, pharmacy cartDTO.ResponsePharmacy, products []orderDTO.ResponseOrderProduct) *orderDTO.ResponseOrder {
	return &orderDTO.ResponseOrder{
		ID:                order.ID,
		UserID:            order.UserID,
		OrderStatus:       order.OrderStatus,
		VoiceNumber:       order.VoiceNumber,
		PaymentImgURL:     order.PaymentImgURL,
		TotalProductPrice: order.TotalProductPrice,
		ShipCost:          order.ShipCost,
		TotalPayment:      order.TotalPayment,
		Description:       order.Description,
		Address:           order.Address,
		Pharmacy:          pharmacy,
		Product:           products,
		CreatedAt:         order.CreatedAt,
		UpdatedAt:         order.UpdatedAt,
		DeletedAt:         order.DeletedAt,
	}
}

func ConvertProductToResponseProduct(orderProduct *orderEntity.OrderProductCheckout, product cartDTO.ResponseProduct) orderDTO.ResponseOrderProduct {
	return orderDTO.ResponseOrderProduct{
		ID:                orderProduct.ID,
		OrderID:           orderProduct.OrderID,
		PharmacyProductID: orderProduct.PharmacyProductID,
		Quantity:          orderProduct.Quantity,
		Price:             orderProduct.Price,
		Product:           product,
		CreatedAt:         orderProduct.CreatedAt,
		UpdatedAt:         orderProduct.UpdatedAt,
	}
}

func ConvertPharmacyToResponsePharmacy(pharmacyWithPartner *pharmacyEntity.PharmacyForCart) cartDTO.ResponsePharmacy {
	return cartDTO.ResponsePharmacy{
		ID:           pharmacyWithPartner.ID,
		PharmacistID: pharmacyWithPartner.PharmacistID,
		PartnerID:    pharmacyWithPartner.PartnerID,
		Partner: pharmacyDTO.ResponsePartner{
			ID:          pharmacyWithPartner.Partner.ID,
			Name:        pharmacyWithPartner.Partner.Name,
			LogoURL:     pharmacyWithPartner.Partner.LogoURL,
			YearFounded: pharmacyWithPartner.Partner.YearFounded,
			ActiveDays:  pharmacyWithPartner.Partner.ActiveDays,
			StartOpt:    pharmacyWithPartner.Partner.StartOpt,
			EndOpt:      pharmacyWithPartner.Partner.EndOpt,
			IsActive:    pharmacyWithPartner.Partner.IsActive,
			CreatedAt:   pharmacyWithPartner.Partner.CreatedAt,
			UpdatedAt:   pharmacyWithPartner.Partner.UpdatedAt,
		},
		Name:      pharmacyWithPartner.Name,
		Address:   pharmacyWithPartner.Address,
		City:      pharmacyWithPartner.City,
		Latitude:  pharmacyWithPartner.Latitude,
		Longitude: pharmacyWithPartner.Longitude,
		IsActive:  pharmacyWithPartner.IsActive,
		CreatedAt: pharmacyWithPartner.CreatedAt,
		UpdatedAt: pharmacyWithPartner.UpdatedAt,
	}
}
