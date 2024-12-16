package repository

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"math"
	"strconv"
	"strings"

	"healthcare-app/internal/pharmacy/dto"
	"healthcare-app/internal/pharmacy/entity"
	"healthcare-app/pkg/database/transactor"

	"github.com/shopspring/decimal"
)

type LogisticRepository interface {
	CalculateShipCost(ctx context.Context, request *dto.CalculateOfficialCostRequest) (decimal.Decimal, error)
	Search(ctx context.Context, request *dto.SearchLogisticRequest) ([]*entity.Logistic, error)
	FindAllByPharmacyID(ctx context.Context, pharmacyID int64) ([]*entity.Logistic, error)
	FindByID(ctx context.Context, id int64) (*entity.Logistic, error)
}

type logisticRepositoryImpl struct {
	db *sql.DB
}

func NewLogisticRepository(db *sql.DB) *logisticRepositoryImpl {
	return &logisticRepositoryImpl{
		db: db,
	}
}

func (r *logisticRepositoryImpl) CalculateShipCost(ctx context.Context, request *dto.CalculateOfficialCostRequest) (decimal.Decimal, error) {
	query := `
		with pharmacy_location as(
			select location from pharmacies where id = $1
		), user_location as (
			select location from user_addresses where id = $2
		)
		select
			CEILING(ST_Distance(
				(select location FROM pharmacy_location),
				(select location FROM user_location)
			) / 1000) AS distance_km
	`
	tx := transactor.ExtractTx(ctx)

	var (
		err      error
		distance int64 = 0
	)
	if tx != nil {
		err = tx.QueryRowContext(ctx, query, request.AddressID, request.PharmacyID).Scan(&distance)
	} else {
		err = r.db.QueryRowContext(ctx, query, request.AddressID, request.PharmacyID).Scan(&distance)
	}

	if err != nil {
		return decimal.Decimal{}, nil
	}

	return request.Logistic.PricePerKM.Mul(decimal.NewFromFloat(math.Max(float64(distance), 1))), nil
}

func (r *logisticRepositoryImpl) Search(ctx context.Context, request *dto.SearchLogisticRequest) ([]*entity.Logistic, error) {
	tx := transactor.ExtractTx(ctx)

	query := `
		select id, code, service, min_delivery, max_delivery, price_per_km, created_at, updated_at
		from logistics
	`
	args := []any{}
	queryBuilder := strings.Builder{}
	queryBuilder.WriteString(query)

	whereAdded := false
	addCondition := func(condition string, arg any) {
		if whereAdded {
			queryBuilder.WriteString(" and ")
		} else {
			queryBuilder.WriteString(" where ")
			whereAdded = true
		}
		queryBuilder.WriteString(condition)
		args = append(args, arg)
	}

	if request.Name != "" {
		addCondition(fmt.Sprintf("name ilike $%d", len(args)+1), fmt.Sprintf("%%%s%%", request.Name))
	}

	lastID, _ := strconv.Atoi(request.Last)
	queryBuilder.WriteString(fmt.Sprintf(" and id > $%v order by id limit $%v", len(args)+1, len(args)+2))
	args = append(args, lastID, request.Limit+1)

	var (
		err  error
		rows *sql.Rows
	)
	if tx != nil {
		rows, err = tx.QueryContext(ctx, queryBuilder.String(), args...)
	} else {
		rows, err = r.db.QueryContext(ctx, queryBuilder.String(), args...)
	}

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	logistics := []*entity.Logistic{}
	for rows.Next() {
		logistic := new(entity.Logistic)
		if err := rows.Scan(&logistic.ID, &logistic.Code, &logistic.Service, &logistic.MinDelivery, &logistic.MaxDelivery, &logistic.PricePerKM, &logistic.CreatedAt, &logistic.UpdatedAt); err != nil {
			return nil, err
		}
		logistics = append(logistics, logistic)
	}

	err = rows.Err()
	if err != nil {
		return nil, err
	}
	return logistics, nil
}

func (r *logisticRepositoryImpl) FindAllByPharmacyID(ctx context.Context, pharmacyID int64) ([]*entity.Logistic, error) {
	query := `
	select l.id, l.code, l.service, l.min_delivery, l.max_delivery, l.price_per_km
	from logistics l
	join pharmacy_logistics pl on pl.logistic_id = l.id
	where pl.pharmacy_id = $1 
	`
	tx := transactor.ExtractTx(ctx)

	var (
		err  error
		rows *sql.Rows
	)
	if tx != nil {
		rows, err = tx.QueryContext(ctx, query, pharmacyID)
	} else {
		rows, err = r.db.QueryContext(ctx, query, pharmacyID)
	}

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	logistics := []*entity.Logistic{}
	for rows.Next() {
		logistic := new(entity.Logistic)
		if err := rows.Scan(&logistic.ID, &logistic.Code, &logistic.Service, &logistic.MinDelivery, &logistic.MaxDelivery, &logistic.PricePerKM); err != nil {
			return nil, err
		}
		logistics = append(logistics, logistic)
	}

	err = rows.Err()
	if err != nil {
		return nil, err
	}
	return logistics, nil
}

func (r *logisticRepositoryImpl) FindByID(ctx context.Context, id int64) (*entity.Logistic, error) {
	tx := transactor.ExtractTx(ctx)

	query := `
		select code, service, min_delivery, max_delivery, price_per_km, created_at, updated_at
		from logistics where id = $1
	`

	var (
		err      error
		logistic = &entity.Logistic{ID: id}
	)
	if tx != nil {
		err = tx.QueryRowContext(ctx, query, id).Scan(&logistic.Code, &logistic.Service, &logistic.MinDelivery, &logistic.MaxDelivery, &logistic.PricePerKM, &logistic.CreatedAt, &logistic.UpdatedAt)
	} else {
		err = r.db.QueryRowContext(ctx, query, id).Scan(&logistic.Code, &logistic.Service, &logistic.MinDelivery, &logistic.MaxDelivery, &logistic.PricePerKM, &logistic.CreatedAt, &logistic.UpdatedAt)
	}

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}

	return logistic, nil
}
