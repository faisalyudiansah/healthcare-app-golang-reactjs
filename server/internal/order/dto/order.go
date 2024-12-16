package dto

import (
	"mime/multipart"
	"time"

	cartDto "healthcare-app/internal/cart/dto"
	"healthcare-app/internal/order/constant"
	orderEntity "healthcare-app/internal/order/entity"

	"github.com/shopspring/decimal"
)

type OrderResponse struct {
	ID                int64                 `json:"id"`
	OrderStatus       string                `json:"order_status"`
	VoiceNumber       string                `json:"voice_number"`
	Customer          string                `json:"customer"`
	PaymentImgURL     *string               `json:"payment_url"`
	TotalProductPrice decimal.Decimal       `json:"total_product_price"`
	ShipCost          decimal.Decimal       `json:"ship_cost"`
	TotalPayment      decimal.Decimal       `json:"total_payment"`
	Description       *string               `json:"description"`
	Detail            *OrderProductResponse `json:"detail"`
	CreatedAt         time.Time             `json:"created_at"`
}

type RequestOrderID struct {
	OrderID      []int64 `json:"order_id" binding:"required,dive,numeric,gte=1"`
	PharmacyID   int64   `json:"pharmacy_id" binding:"required"`
	PharmacistID int64   `json:"-"`
}

type OrderStatusResponse struct {
	ID                int64                 `json:"id"`
	UserID            int64                 `json:"user_id"`
	OrderStatus       string                `json:"order_status"`
	VoiceNumber       string                `json:"voice_number"`
	PaymentImgURL     string                `json:"payment_url"`
	TotalProductPrice string                `json:"total_product_price"`
	ShipCost          decimal.Decimal       `json:"ship_cost"`
	TotalPayment      decimal.Decimal       `json:"total_payment"`
	Description       string                `json:"description"`
	CreatedAt         time.Time             `json:"created_at"`
	Detail            *OrderProductResponse `json:"detail"`
}

type RequestOrder struct {
	AddressID     int64                     `json:"address_id" binding:"required,gte=1,numeric"`
	PharmacyID    int64                     `json:"pharmacy_id" binding:"required,gte=1,numeric"`
	Description   *string                   `json:"description" binding:"required"`
	OrderProducts []RequestListOrderProduct `json:"order_products" binding:"required"`
	ShipCost      decimal.Decimal           `json:"ship_cost" binding:"required"`
}

type RequestListOrderProduct struct {
	PharmacyProductId int64 `json:"pharmacy_product_id" binding:"required,gte=1,numeric"`
	Quantity          int   `json:"quantity" binding:"required,gte=1,numeric"`
	Price             int64 `json:"price" binding:"required,gte=1,numeric"`
}

type GetOrderRequest struct {
	ID           int64 `json:"-"`
	PharmacyID   int64 `json:"-"`
	PharmacistID int64 `json:"-"`
}

type AdminGetOrderRequest struct {
	Pharmacy []int64 `form:"pharmacy" binding:"max=5,dive,numeric,gte=1"`
	Limit    int64   `form:"limit" binding:"numeric,gte=1,lte=25"`
	Page     int64   `form:"page" binding:"numeric,gte=1"`
}

type PharmacistGetOrderRequest struct {
	Pharmacy []int64 `form:"pharmacy" binding:"max=5,dive,numeric,gte=1"`
	Limit    int64   `form:"limit" binding:"numeric,gte=1,lte=25"`
	Page     int64   `form:"page" binding:"numeric,gte=1"`
	Status   int64   `form:"status" binding:"numeric,lte=5"`
}

type RequestUploadPaymentProof struct {
	PaymentProof *multipart.FileHeader `form:"payment_proof" binding:"required"`
}

func ConvertToOrderResponses(orders []*orderEntity.Order, FilterStatus ...string) []*OrderResponse {
	orderMap := map[int64]*OrderResponse{}
	responses := []*OrderResponse{}

	status := map[string]bool{}
	if len(FilterStatus) > 0 {
		for _, val := range FilterStatus {
			status[val] = true
		}
	} else {
		status[constant.STATUS_CANCELLED] = true
		status[constant.STATUS_CONFIRMED] = true
		status[constant.STATUS_SENT] = true
		status[constant.STATUS_PROCESSED] = true
		status[constant.STATUS_WAITING] = true
	}

	for _, order := range orders {
		if _, filtered := status[order.OrderStatus]; filtered {

			ord, ok := orderMap[order.ID]

			if !ok {
				res := &OrderResponse{
					ID:                order.ID,
					OrderStatus:       order.OrderStatus,
					VoiceNumber:       order.VoiceNumber,
					Customer:          order.UserEmail,
					PaymentImgURL:     order.PaymentImgURL,
					TotalProductPrice: order.TotalProductPrice,
					ShipCost:          order.ShipCost,
					TotalPayment:      order.TotalPayment,
					Description:       order.Description,
					Detail: &OrderProductResponse{
						Pharmacy: pharmacy{
							ID:   order.OrderProduct.PharmacyID,
							Name: order.OrderProduct.PharmacyName,
						},
						Products: []product{
							{
								ID:           order.OrderProduct.ProductID,
								Name:         order.OrderProduct.ProductName,
								Quantity:     order.OrderProduct.Quantity,
								Price:        order.OrderProduct.Price,
								ThumbnailURL: order.OrderProduct.ProductThumbnailURL,
							},
						},
					},
					CreatedAt: order.CreatedAt,
				}
				orderMap[order.ID] = res
				responses = append(responses, res)
				continue
			}
			ord.Detail.Products = append(ord.Detail.Products, product{
				ID:           order.OrderProduct.ProductID,
				Name:         order.OrderProduct.ProductName,
				Quantity:     order.OrderProduct.Quantity,
				Price:        order.OrderProduct.Price,
				ThumbnailURL: order.OrderProduct.ProductThumbnailURL,
			})
		}
	}

	return responses
}

func ConvertToOrderResponse(orders []*orderEntity.Order) *OrderResponse {
	orderMap := map[int64]*OrderResponse{}
	response := &OrderResponse{}

	for _, order := range orders {
		ord, ok := orderMap[order.ID]

		if !ok {
			res := &OrderResponse{
				ID:                order.ID,
				OrderStatus:       order.OrderStatus,
				VoiceNumber:       order.VoiceNumber,
				Customer:          order.UserEmail,
				PaymentImgURL:     order.PaymentImgURL,
				TotalProductPrice: order.TotalProductPrice,
				ShipCost:          order.ShipCost,
				TotalPayment:      order.TotalPayment,
				Description:       order.Description,
				Detail: &OrderProductResponse{
					Pharmacy: pharmacy{
						ID:   order.OrderProduct.PharmacyID,
						Name: order.OrderProduct.PharmacyName,
					},
					Products: []product{
						{
							ID:           order.OrderProduct.ProductID,
							Name:         order.OrderProduct.ProductName,
							Quantity:     order.OrderProduct.Quantity,
							Price:        order.OrderProduct.Price,
							ThumbnailURL: order.OrderProduct.ProductThumbnailURL,
						},
					},
				},
				CreatedAt: order.CreatedAt,
			}
			orderMap[order.ID] = res
			response = res
			continue
		}
		ord.Detail.Products = append(ord.Detail.Products, product{
			ID:           order.OrderProduct.ProductID,
			Name:         order.OrderProduct.ProductName,
			Quantity:     order.OrderProduct.Quantity,
			Price:        order.OrderProduct.Price,
			ThumbnailURL: order.OrderProduct.ProductThumbnailURL,
		})

	}

	return response
}

type ResponseOrder struct {
	ID                int64                    `json:"id"`
	UserID            int64                    `json:"user_id"`
	OrderStatus       string                   `json:"order_status"`
	VoiceNumber       string                   `json:"voice_number"`
	PaymentImgURL     *string                  `json:"payment_img_url"`
	TotalProductPrice decimal.Decimal          `json:"total_product_price"`
	ShipCost          decimal.Decimal          `json:"ship_cost"`
	TotalPayment      decimal.Decimal          `json:"total_payment"`
	Description       *string                  `json:"description"`
	Address           string                   `json:"address"`
	Pharmacy          cartDto.ResponsePharmacy `json:"pharmacy_info"`
	Product           []ResponseOrderProduct   `json:"product_info"`
	CreatedAt         time.Time                `json:"created_at"`
	UpdatedAt         time.Time                `json:"updated_at"`
	DeletedAt         *time.Time               `json:"deleted_at"`
}

type ResponseOrderProduct struct {
	ID                int64                   `json:"id"`
	OrderID           int64                   `json:"order_id"`
	PharmacyProductID int64                   `json:"pharmacy_product_id"`
	Quantity          int                     `json:"quantity"`
	Price             decimal.Decimal         `json:"price"`
	Product           cartDto.ResponseProduct `json:"product"`
	CreatedAt         time.Time               `json:"created_at"`
	UpdatedAt         time.Time               `json:"updated_at"`
}
