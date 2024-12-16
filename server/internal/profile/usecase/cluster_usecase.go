package usecase

import (
	"context"

	dtoProfile "healthcare-app/internal/profile/dto"
	"healthcare-app/internal/profile/repository"
	"healthcare-app/pkg/apperror"
	dtoPkg "healthcare-app/pkg/dto"
	"healthcare-app/pkg/utils/pageutils"
)

type ClusterUseCase interface {
	ListProvince(ctx context.Context, request *dtoProfile.GetProvinceRequest) ([]*dtoProfile.ProvinceResponse, *dtoPkg.PageMetaData, error)
	SearchCity(ctx context.Context, request *dtoProfile.SearchCityRequest) (*dtoProfile.CityResponse, error)
	ListCity(ctx context.Context, request *dtoProfile.GetCityRequest) ([]*dtoProfile.CityResponse, *dtoPkg.PageMetaData, error)
	ListDistrict(ctx context.Context, request *dtoProfile.GetDistrictRequest) ([]*dtoProfile.DistrictResponse, *dtoPkg.PageMetaData, error)
	ListSubDistrict(ctx context.Context, request *dtoProfile.GetSubDistrictRequest) ([]*dtoProfile.SubDistrictResponse, *dtoPkg.PageMetaData, error)
}

type clusterUseCaseImpl struct {
	clusterRepository repository.ClusterRepository
}

func NewClusterUseCase(clusterRepository repository.ClusterRepository) *clusterUseCaseImpl {
	return &clusterUseCaseImpl{
		clusterRepository: clusterRepository,
	}
}

func (u *clusterUseCaseImpl) ListProvince(ctx context.Context, request *dtoProfile.GetProvinceRequest) ([]*dtoProfile.ProvinceResponse, *dtoPkg.PageMetaData, error) {
	provinces, err := u.clusterRepository.FindAllProvince(ctx)
	if err != nil {
		return nil, nil, apperror.NewServerError(err)
	}

	res, metaData := pageutils.CreateMetaData(provinces, request.Page, request.Limit)
	return dtoProfile.ConvertToProvinceResponses(res), metaData, nil
}

func (u *clusterUseCaseImpl) SearchCity(ctx context.Context, request *dtoProfile.SearchCityRequest) (*dtoProfile.CityResponse, error) {
	city, err := u.clusterRepository.FindCityByName(ctx, request)
	if err != nil {
		return nil, apperror.NewServerError(err)
	}
	if city == nil {
		return nil, apperror.NewEntityNotFoundError("city")
	}

	return &dtoProfile.CityResponse{ID: city.ID, CityID: city.CityID, Name: city.City}, nil
}

func (u *clusterUseCaseImpl) ListCity(ctx context.Context, request *dtoProfile.GetCityRequest) ([]*dtoProfile.CityResponse, *dtoPkg.PageMetaData, error) {
	cities, err := u.clusterRepository.FindAllCity(ctx, request)
	if err != nil {
		return nil, nil, apperror.NewServerError(err)
	}

	res, metaData := pageutils.CreateMetaData(cities, request.Page, request.Limit)
	return dtoProfile.ConvertToCityResponses(res), metaData, nil
}

func (u *clusterUseCaseImpl) ListDistrict(ctx context.Context, request *dtoProfile.GetDistrictRequest) ([]*dtoProfile.DistrictResponse, *dtoPkg.PageMetaData, error) {
	districts, err := u.clusterRepository.FindAllDistrict(ctx, request)
	if err != nil {
		return nil, nil, apperror.NewServerError(err)
	}

	res, metaData := pageutils.CreateMetaData(districts, request.Page, request.Limit)
	return dtoProfile.ConvertToDistrictResponses(res), metaData, nil
}

func (u *clusterUseCaseImpl) ListSubDistrict(ctx context.Context, request *dtoProfile.GetSubDistrictRequest) ([]*dtoProfile.SubDistrictResponse, *dtoPkg.PageMetaData, error) {
	subDistricts, err := u.clusterRepository.FindAllSubDistrict(ctx, request)
	if err != nil {
		return nil, nil, apperror.NewServerError(err)
	}

	res, metaData := pageutils.CreateMetaData(subDistricts, request.Page, request.Limit)
	return dtoProfile.ConvertToSubDistrictResponses(res), metaData, nil
}
