package dto

import "healthcare-app/internal/pharmacy/entity"

type LogisticResponse struct {
	ID      int64  `json:"id"`
	Code    string `json:"code"`
	Service string `json:"service"`
}

type GetLogisticRequest struct {
	ID int64 `json:"-"`
}

type SearchLogisticRequest struct {
	Name  string `form:"name"`
	Last  string `form:"last" binding:"omitempty,numeric,gte=0"`
	Limit int64  `form:"limit" binding:"numeric,gte=1,lte=25"`
}

func ConvertToLogisticResponses(logistics []*entity.Logistic) []*LogisticResponse {
	responses := []*LogisticResponse{}
	for _, logistic := range logistics {
		responses = append(responses, ConvertToLogisticResponse(logistic))
	}
	return responses
}

func ConvertToLogisticResponse(logistic *entity.Logistic) *LogisticResponse {
	return &LogisticResponse{
		ID:      logistic.ID,
		Code:    logistic.Code,
		Service: logistic.Service,
	}
}
