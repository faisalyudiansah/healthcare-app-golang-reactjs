package utils

import (
	"strings"

	"healthcare-app/internal/pharmacy/dto"
	"healthcare-app/internal/pharmacy/entity"

	"github.com/shopspring/decimal"
)

func FilterRajaOngkirResults(response *dto.RajaOngkirResponse, availableCodes map[string][]string) []*dto.ShippingResponse {
	responses := []*dto.ShippingResponse{}
	for _, result := range response.RajaOngkir.Results {
		if services, ok := availableCodes[result.Code]; ok {
			for _, cost := range result.Costs {
				if IsServiceAvailable(cost.Service, services) {
					if len(cost.Cost) == 0 {
						continue
					}

					responses = append(responses, &dto.ShippingResponse{
						Code:       result.Code,
						Service:    cost.Service,
						Estimation: cost.Cost[0].ETD,
						ShipCost:   decimal.NewFromInt(int64(cost.Cost[0].Value)),
					})
				}
			}
		}
	}
	return responses
}

func IsServiceAvailable(service string, availableServices []string) bool {
	for _, availableService := range availableServices {
		if strings.EqualFold(service, availableService) {
			return true
		}
	}
	return false
}

func GetAllCodes(logistics []*entity.Logistic) map[string][]string {
	codes := map[string][]string{}

	for _, logistic := range logistics {
		if _, ok := codes[logistic.Code]; !ok {
			codes[logistic.Code] = []string{logistic.Service}
			continue
		}
		codes[logistic.Code] = append(codes[logistic.Code], logistic.Service)
	}
	return codes
}
