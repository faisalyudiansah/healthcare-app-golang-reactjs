package repository

import (
	"context"
	"database/sql"
	"errors"

	"healthcare-app/internal/profile/dto"
	"healthcare-app/internal/profile/entity"
	"healthcare-app/pkg/database/transactor"
)

type ClusterRepository interface {
	FindAllProvince(ctx context.Context) ([]*entity.Cluster, error)
	FindAllCity(ctx context.Context, request *dto.GetCityRequest) ([]*entity.Cluster, error)
	FindAllDistrict(ctx context.Context, request *dto.GetDistrictRequest) ([]*entity.Cluster, error)
	FindAllSubDistrict(ctx context.Context, request *dto.GetSubDistrictRequest) ([]*entity.Cluster, error)
	FindCityByName(ctx context.Context, request *dto.SearchCityRequest) (*entity.Cluster, error)
}

type clusterRepositoryImpl struct {
	db *sql.DB
}

func NewClusterRepository(db *sql.DB) *clusterRepositoryImpl {
	return &clusterRepositoryImpl{
		db: db,
	}
}

func (r *clusterRepositoryImpl) FindAllProvince(ctx context.Context) ([]*entity.Cluster, error) {
	query := `
		select distinct on(province) id, province from clusters
	`
	tx := transactor.ExtractTx(ctx)

	var (
		err  error
		rows *sql.Rows
	)
	if tx != nil {
		rows, err = tx.QueryContext(ctx, query)
	} else {
		rows, err = r.db.QueryContext(ctx, query)
	}

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	provinces := []*entity.Cluster{}
	for rows.Next() {
		province := new(entity.Cluster)
		if err := rows.Scan(&province.ID, &province.Province); err != nil {
			return nil, err
		}
		provinces = append(provinces, province)
	}

	return provinces, nil
}

func (r *clusterRepositoryImpl) FindAllCity(ctx context.Context, request *dto.GetCityRequest) ([]*entity.Cluster, error) {
	query := `
		select distinct on(city) id, city_id, city from clusters where province ilike '%'|| $1 || '%'
	`
	tx := transactor.ExtractTx(ctx)

	var (
		err  error
		rows *sql.Rows
	)
	if tx != nil {
		rows, err = tx.QueryContext(ctx, query, request.Province)
	} else {
		rows, err = r.db.QueryContext(ctx, query, request.Province)
	}

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	cities := []*entity.Cluster{}
	for rows.Next() {
		city := new(entity.Cluster)
		if err := rows.Scan(&city.ID, &city.CityID, &city.City); err != nil {
			return nil, err
		}
		cities = append(cities, city)
	}

	return cities, nil
}

func (r *clusterRepositoryImpl) FindAllDistrict(ctx context.Context, request *dto.GetDistrictRequest) ([]*entity.Cluster, error) {
	query := `
		select distinct on(district) id, district from clusters where province ilike '%'|| $1 || '%' and city ilike '%'|| $2 || '%' 
	`
	tx := transactor.ExtractTx(ctx)

	var (
		err  error
		rows *sql.Rows
	)
	if tx != nil {
		rows, err = tx.QueryContext(ctx, query, request.Province, request.City)
	} else {
		rows, err = r.db.QueryContext(ctx, query, request.Province, request.City)
	}

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	districts := []*entity.Cluster{}
	for rows.Next() {
		district := new(entity.Cluster)
		if err := rows.Scan(&district.ID, &district.District); err != nil {
			return nil, err
		}
		districts = append(districts, district)
	}

	return districts, nil
}

func (r *clusterRepositoryImpl) FindAllSubDistrict(ctx context.Context, request *dto.GetSubDistrictRequest) ([]*entity.Cluster, error) {
	query := `
		select distinct on(district) id, district from clusters where province ilike '%'|| $1 || '%' and city ilike '%'|| $2 || '%' and district ilike '%'|| $3 || '%' 
	`
	tx := transactor.ExtractTx(ctx)

	var (
		err  error
		rows *sql.Rows
	)
	if tx != nil {
		rows, err = tx.QueryContext(ctx, query, request.Province, request.City, request.District)
	} else {
		rows, err = r.db.QueryContext(ctx, query, request.Province, request.City, request.District)
	}

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	subDistricts := []*entity.Cluster{}
	for rows.Next() {
		subDistrict := new(entity.Cluster)
		if err := rows.Scan(&subDistrict.ID, &subDistrict.SubDistrict); err != nil {
			return nil, err
		}
		subDistricts = append(subDistricts, subDistrict)
	}

	return subDistricts, nil
}

func (r *clusterRepositoryImpl) FindCityByName(ctx context.Context, request *dto.SearchCityRequest) (*entity.Cluster, error) {
	query := `
		select distinct on(city) id, city_id, city from clusters where city ilike '%'|| $1 || '%' limit 1
	`
	tx := transactor.ExtractTx(ctx)

	var (
		err  error
		city = &entity.Cluster{}
	)
	if tx != nil {
		err = tx.QueryRowContext(ctx, query, request.Name).Scan(&city.ID, &city.CityID, &city.City)
	} else {
		err = r.db.QueryRowContext(ctx, query, request.Name).Scan(&city.ID, &city.CityID, &city.City)
	}

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}

	return city, nil
}
