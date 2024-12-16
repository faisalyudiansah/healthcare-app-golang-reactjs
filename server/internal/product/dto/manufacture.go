package dto

import (
	"healthcare-app/internal/product/entity"
)

type ManufactureResponse struct {
	ID   int64  `json:"id"`
	Name string `json:"name"`
}

type SearchManufactureRequest struct {
	Q     string `form:"q" binding:"omitempty"`
	Limit int64  `form:"limit" binding:"numeric,gte=1,lte=25"`
	Page  int64  `form:"page" binding:"numeric,gte=1"`
}

func ConvertToManufactureResponses(manufactures []*entity.Manufacture) []*ManufactureResponse {
	res := []*ManufactureResponse{}
	for _, manufacture := range manufactures {
		res = append(res, ConvertToManufactureResponse(manufacture))
	}
	return res
}

func ConvertToManufactureResponse(manufacture *entity.Manufacture) *ManufactureResponse {
	return &ManufactureResponse{
		ID:   manufacture.ID,
		Name: manufacture.Name,
	}
}
