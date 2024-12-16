package utils

import "healthcare-app/internal/order/constant"

var validStatusTransitions = map[string][]string{
	constant.STATUS_WAITING:   {constant.STATUS_PROCESSED},
	constant.STATUS_PROCESSED: {constant.STATUS_WAITING, constant.STATUS_SENT},
	constant.STATUS_SENT:      {constant.STATUS_PROCESSED, constant.STATUS_CONFIRMED},
	constant.STATUS_CONFIRMED: {constant.STATUS_SENT},
	constant.STATUS_CANCELLED: {},
}

func IsValidStatusTransition(currentStatus, newStatus string) bool {
	validNextStatuses, exists := validStatusTransitions[currentStatus]
	if !exists {
		return false
	}
	for _, status := range validNextStatuses {
		if status == newStatus {
			return true
		}
	}
	return false
}
