package dto

import "healthcare-app/internal/profile/entity"

type ProvinceResponse struct {
	ID   int64  `json:"id"`
	Name string `json:"name"`
}

type CityResponse struct {
	ID     int64  `json:"id"`
	CityID int64  `json:"city_id"`
	Name   string `json:"name"`
}

type DistrictResponse struct {
	ID   int64  `json:"id"`
	Name string `json:"name"`
}

type SubDistrictResponse struct {
	ID   int64  `json:"id"`
	Name string `json:"name"`
}

type GetProvinceRequest struct {
	Limit int64 `form:"limit" binding:"numeric,gte=1,lte=25"`
	Page  int64 `form:"page" binding:"numeric,gte=1"`
}

type GetCityRequest struct {
	Province string `form:"province" binding:"required"`
	Limit    int64  `form:"limit" binding:"numeric,gte=1,lte=25"`
	Page     int64  `form:"page" binding:"numeric,gte=1"`
}

type GetDistrictRequest struct {
	Province string `form:"province" binding:"required"`
	City     string `form:"city" binding:"required"`
	Limit    int64  `form:"limit" binding:"numeric,gte=1,lte=25"`
	Page     int64  `form:"page" binding:"numeric,gte=1"`
}

type GetSubDistrictRequest struct {
	Province string `form:"province" binding:"required"`
	City     string `form:"city" binding:"required"`
	District string `form:"district" binding:"required"`
	Limit    int64  `form:"limit" binding:"numeric,gte=1,lte=25"`
	Page     int64  `form:"page" binding:"numeric,gte=1"`
}

type SearchCityRequest struct {
	Name string `form:"name" binding:"required"`
}

func ConvertToProvinceResponses(provinces []*entity.Cluster) []*ProvinceResponse {
	responses := []*ProvinceResponse{}
	for _, province := range provinces {
		responses = append(responses, &ProvinceResponse{ID: province.ID, Name: province.Province})
	}
	return responses
}

func ConvertToCityResponses(cities []*entity.Cluster) []*CityResponse {
	responses := []*CityResponse{}
	for _, city := range cities {
		responses = append(responses, &CityResponse{ID: city.ID, CityID: city.CityID, Name: city.City})
	}
	return responses
}

func ConvertToDistrictResponses(districts []*entity.Cluster) []*DistrictResponse {
	responses := []*DistrictResponse{}
	for _, district := range districts {
		responses = append(responses, &DistrictResponse{ID: district.ID, Name: district.District})
	}
	return responses
}

func ConvertToSubDistrictResponses(subDistricts []*entity.Cluster) []*SubDistrictResponse {
	responses := []*SubDistrictResponse{}
	for _, subDistrict := range subDistricts {
		responses = append(responses, &SubDistrictResponse{ID: subDistrict.ID, Name: subDistrict.SubDistrict})
	}
	return responses
}
