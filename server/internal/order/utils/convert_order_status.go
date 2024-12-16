package utils

import "healthcare-app/internal/order/constant"

func ConvertOrderStatus(orderStatus int64) string {
	switch orderStatus {
	case 1:
		return constant.STATUS_WAITING
	case 2:
		return constant.STATUS_PROCESSED
	case 3:
		return constant.STATUS_SENT
	case 4:
		return constant.STATUS_CONFIRMED
	case 5:
		return constant.STATUS_CANCELLED
	}
	return ""
}
