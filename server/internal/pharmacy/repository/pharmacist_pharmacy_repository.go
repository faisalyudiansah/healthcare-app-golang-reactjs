package repository

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"strings"

	"healthcare-app/internal/pharmacy/dto"
	"healthcare-app/internal/pharmacy/entity"
	"healthcare-app/pkg/apperror"
	"healthcare-app/pkg/database/transactor"
)

type PharmacistPharmacyRepository interface {
	Search(ctx context.Context, request *dto.PharmacistSearchPharmacyRequest) ([]*entity.Pharmacy, error)
	FindByID(ctx context.Context, request *dto.PharmacistGetPharmacyRequest) (*entity.Pharmacy, error)
}

type pharmacistPharmacyRepositoryImpl struct {
	db *sql.DB
}

func NewPharmacistPharmacyRepository(db *sql.DB) *pharmacistPharmacyRepositoryImpl {
	return &pharmacistPharmacyRepositoryImpl{
		db: db,
	}
}

func (r *pharmacistPharmacyRepositoryImpl) Search(ctx context.Context, request *dto.PharmacistSearchPharmacyRequest) ([]*entity.Pharmacy, error) {
	tx := transactor.ExtractTx(ctx)

	query := `
		select
		u.id, ud.full_name, pa.id, pa.name, p.id, p.name, p.address, p.city, CONCAT(ST_X(p.location), ' ', ST_Y(p.location)), p.is_active
		from pharmacies p
		join pharmacy_partners pa on pa.id = p.partner_id
		left join users u on u.id = p.pharmacist_id
		join user_details ud on ud.user_id = u.id
		where pharmacist_id = $1
	`
	args := []any{request.PharmacistID}
	queryBuilder := strings.Builder{}
	queryBuilder.WriteString(query)

	if request.Name != "" {
		queryBuilder.WriteString(fmt.Sprintf(" and p.name ilike $%v", len(args)+1))
		args = append(args, fmt.Sprintf("%%%v%%", request.Name))
	}

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

	pharmacies := []*entity.Pharmacy{}
	for rows.Next() {
		pharmacy := new(entity.Pharmacy)
		if err := rows.Scan(
			&pharmacy.PharmacistID,
			&pharmacy.PharmacistName,
			&pharmacy.PartnerID,
			&pharmacy.PartnerName,
			&pharmacy.ID,
			&pharmacy.Name,
			&pharmacy.Address,
			&pharmacy.City,
			&pharmacy.Location,
			&pharmacy.IsActive,
		); err != nil {
			return nil, err
		}
		pharmacies = append(pharmacies, pharmacy)
	}

	err = rows.Err()
	if err != nil {
		return nil, err
	}
	return pharmacies, nil
}

func (r *pharmacistPharmacyRepositoryImpl) FindByID(ctx context.Context, request *dto.PharmacistGetPharmacyRequest) (*entity.Pharmacy, error) {
	query := `
		with pharmacy as (
			select id, pharmacist_id, partner_id, name, address, city, CONCAT(ST_X(location), ' ', ST_Y(location)) as location, is_active
			from pharmacies
			where id = $1 and pharmacist_id = $2
		)
		select u.id, ud.full_name, pa.id, pa.name, ph.name, ph.address, ph.city, ph.location, ph.is_active 
		from pharmacy ph
		join users u on u.id = ph.pharmacist_id
		join user_details ud on ud.user_id = u.id
		join pharmacy_partners pa on pa.id = ph.partner_id 
	`
	tx := transactor.ExtractTx(ctx)

	var (
		err      error
		rows     *sql.Rows
		pharmacy = &entity.Pharmacy{ID: request.ID}
	)
	if tx != nil {
		err = tx.QueryRowContext(ctx, query, request.ID, request.PharmacistID).Scan(
			&pharmacy.PharmacistID,
			&pharmacy.PharmacistName,
			&pharmacy.PartnerID,
			&pharmacy.PartnerName,
			&pharmacy.Name,
			&pharmacy.Address,
			&pharmacy.City,
			&pharmacy.Location,
			&pharmacy.IsActive,
		)
	} else {
		err = r.db.QueryRowContext(ctx, query, request.ID, request.PharmacistID).Scan(
			&pharmacy.PharmacistID,
			&pharmacy.PharmacistName,
			&pharmacy.PartnerID,
			&pharmacy.PartnerName,
			&pharmacy.Name,
			&pharmacy.Address,
			&pharmacy.City,
			&pharmacy.Location,
			&pharmacy.IsActive,
		)
	}

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, apperror.NewEntityNotFoundError("pharmacy")
		}
		return nil, err
	}

	query = `
		select l.id, l.code, l.service
		from logistics l
		join pharmacy_logistics pl on pl.logistic_id = l.id
		where pl.pharmacy_id = $1 
	`
	if tx != nil {
		rows, err = tx.QueryContext(ctx, query, request.ID)
	} else {
		rows, err = r.db.QueryContext(ctx, query, request.ID)
	}

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	logistics := []*entity.Logistic{}
	for rows.Next() {
		logistic := new(entity.Logistic)
		if err := rows.Scan(&logistic.ID, &logistic.Code, &logistic.Service); err != nil {
			return nil, err
		}
		logistics = append(logistics, logistic)
	}

	err = rows.Err()
	if err != nil {
		return nil, err
	}

	pharmacy.Logistics = logistics
	return pharmacy, nil
}
