package repository

import (
	"context"
	"database/sql"
	"errors"
	"fmt"

	apperrorPharmacy "healthcare-app/internal/pharmacy/apperror"
	"healthcare-app/internal/pharmacy/dto"
	"healthcare-app/internal/pharmacy/entity"
	apperrorPkg "healthcare-app/pkg/apperror"
	"healthcare-app/pkg/database/transactor"

	"github.com/jackc/pgx/v5/pgconn"
)

type PartnerRepository interface {
	CountRelatedPharmacy(ctx context.Context, id int64) (int64, error)
	IsExistsByName(ctx context.Context, name string) bool
	Search(ctx context.Context, request *dto.AdminSearchPartnerRequest) ([]*entity.Partner, error)
	FindByID(ctx context.Context, id int64) (*entity.Partner, error)
	Save(ctx context.Context, partner *entity.Partner) error
	Update(ctx context.Context, partner *entity.Partner) error
	UpdateOperational(ctx context.Context, partner *entity.Partner) error
	UpdateIsActiveRelatedPharmacy(ctx context.Context, partner *entity.Partner) error
	DeleteByID(ctx context.Context, id int64) error
}

type partnerRepositoryImpl struct {
	db *sql.DB
}

func NewPartnerRepository(db *sql.DB) *partnerRepositoryImpl {
	return &partnerRepositoryImpl{
		db: db,
	}
}

func (r *partnerRepositoryImpl) CountRelatedPharmacy(ctx context.Context, id int64) (int64, error) {
	query := `
		select count(id) from pharmacies where partner_id = $1 
	`
	tx := transactor.ExtractTx(ctx)

	var (
		err   error
		count int64
	)

	if tx != nil {
		err = tx.QueryRowContext(ctx, query, id).Scan(&count)
	} else {
		err = r.db.QueryRowContext(ctx, query, id).Scan(&count)
	}

	if err != nil {
		return 0, nil
	}
	return count, nil
}

func (r *partnerRepositoryImpl) IsExistsByName(ctx context.Context, name string) bool {
	query := `
		select exists(select 1 from pharmacy_partners where name = $1);
	`
	tx := transactor.ExtractTx(ctx)

	var (
		err   error
		exist bool
	)
	if tx != nil {
		err = tx.QueryRowContext(ctx, query, name).Scan(&exist)
	} else {
		err = r.db.QueryRowContext(ctx, query, name).Scan(&exist)
	}

	if err != nil {
		return false
	}

	return exist
}

func (r *partnerRepositoryImpl) Search(ctx context.Context, request *dto.AdminSearchPartnerRequest) ([]*entity.Partner, error) {
	query := `
		select id, name, logo_url, year_founded, active_days, start_opt, end_opt, is_active, created_at, updated_at
		from pharmacy_partners
	`
	tx := transactor.ExtractTx(ctx)

	args := []any{}
	if request.Q != "" {
		query = fmt.Sprintf("%v where name ilike $1", query)
		args = append(args, fmt.Sprintf("%%%v%%", request.Q))
	}

	var (
		rows *sql.Rows
		err  error
	)
	if tx != nil {
		rows, err = tx.QueryContext(ctx, query, args...)
	} else {
		rows, err = r.db.QueryContext(ctx, query, args...)
	}

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	partners := []*entity.Partner{}
	for rows.Next() {
		partner := new(entity.Partner)

		if err := rows.Scan(
			&partner.ID,
			&partner.Name,
			&partner.LogoURL,
			&partner.YearFounded,
			&partner.ActiveDays,
			&partner.StartOpt,
			&partner.EndOpt,
			&partner.IsActive,
			&partner.CreatedAt,
			&partner.UpdatedAt,
		); err != nil {
			return nil, err
		}
		partners = append(partners, partner)
	}

	err = rows.Err()
	if err != nil {
		return nil, err
	}

	return partners, nil
}

func (r *partnerRepositoryImpl) FindByID(ctx context.Context, id int64) (*entity.Partner, error) {
	query := `
		select name, logo_url, year_founded, active_days, start_opt, end_opt, is_active, created_at, updated_at
		from pharmacy_partners
		where id = $1
	`
	tx := transactor.ExtractTx(ctx)

	var (
		err     error
		partner = &entity.Partner{ID: id}
	)
	if tx != nil {
		err = tx.QueryRowContext(ctx, query, id).Scan(
			&partner.Name,
			&partner.LogoURL,
			&partner.YearFounded,
			&partner.ActiveDays,
			&partner.StartOpt,
			&partner.EndOpt,
			&partner.IsActive,
			&partner.CreatedAt,
			&partner.UpdatedAt,
		)
	} else {
		err = r.db.QueryRowContext(ctx, query, id).Scan(
			&partner.Name,
			&partner.LogoURL,
			&partner.YearFounded,
			&partner.ActiveDays,
			&partner.StartOpt,
			&partner.EndOpt,
			&partner.IsActive,
			&partner.CreatedAt,
			&partner.UpdatedAt,
		)
	}

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, apperrorPkg.NewEntityNotFoundError("partner")
		}
		return nil, err
	}

	return partner, nil
}

func (r *partnerRepositoryImpl) Save(ctx context.Context, partner *entity.Partner) error {
	query := `
		insert into pharmacy_partners(name, logo_url, year_founded, active_days, start_opt, end_opt, is_active)
		values ($1, $2, $3, $4, $5, $6, $7)
		returning id, created_at, updated_at
	`
	tx := transactor.ExtractTx(ctx)

	var err error
	if tx != nil {
		err = tx.QueryRowContext(
			ctx,
			query,
			partner.Name,
			partner.LogoURL,
			partner.YearFounded,
			partner.ActiveDays,
			partner.StartOpt,
			partner.EndOpt,
			partner.IsActive,
		).Scan(&partner.ID, &partner.CreatedAt, &partner.UpdatedAt)
	} else {
		err = r.db.QueryRowContext(
			ctx,
			query,
			partner.Name,
			partner.LogoURL,
			partner.YearFounded,
			partner.ActiveDays,
			partner.StartOpt,
			partner.EndOpt,
			partner.IsActive,
		).Scan(&partner.ID, &partner.CreatedAt, &partner.UpdatedAt)
	}

	if err, ok := err.(*pgconn.PgError); ok {
		if err.SQLState() == "23505" {
			return apperrorPharmacy.NewPartnerAlreadyExistsError(partner.Name)
		}
	}

	return err
}

func (r *partnerRepositoryImpl) Update(ctx context.Context, partner *entity.Partner) error {
	query := `
		update pharmacy_partners set 
		name = $2, logo_url = $3, year_founded = $4, active_days = $5, start_opt = $6, end_opt = $7, is_active=$8, updated_at = now()
		where id = $1
	`
	tx := transactor.ExtractTx(ctx)

	var err error
	if tx != nil {
		_, err = tx.ExecContext(
			ctx,
			query,
			partner.ID,
			partner.Name,
			partner.LogoURL,
			partner.YearFounded,
			partner.ActiveDays,
			partner.StartOpt,
			partner.EndOpt,
			partner.IsActive,
		)
	} else {
		_, err = r.db.ExecContext(
			ctx,
			query,
			partner.ID,
			partner.Name,
			partner.LogoURL,
			partner.YearFounded,
			partner.ActiveDays,
			partner.StartOpt,
			partner.EndOpt,
			partner.IsActive,
		)
	}

	return err
}

func (r *partnerRepositoryImpl) UpdateOperational(ctx context.Context, partner *entity.Partner) error {
	query := `
		update pharmacy_partners set 
		active_days = $2, start_opt = $3, end_opt = $4, updated_at = now()
		where id = $1
	`
	tx := transactor.ExtractTx(ctx)

	var err error
	if tx != nil {
		_, err = tx.ExecContext(
			ctx,
			query,
			partner.ID,
			partner.ActiveDays,
			partner.StartOpt,
			partner.EndOpt,
		)
	} else {
		_, err = r.db.ExecContext(
			ctx,
			query,
			partner.ID,
			partner.ActiveDays,
			partner.StartOpt,
			partner.EndOpt,
		)
	}

	return err
}

func (r *partnerRepositoryImpl) UpdateIsActiveRelatedPharmacy(ctx context.Context, partner *entity.Partner) error {
	query := `
		update pharmacies set is_active = $2, updated_at = now() where partner_id = $1
	`
	tx := transactor.ExtractTx(ctx)

	var err error
	if tx != nil {
		_, err = tx.ExecContext(ctx, query, partner.ID, partner.IsActive)
	} else {
		_, err = r.db.ExecContext(ctx, query, partner.ID, partner.IsActive)
	}

	return err
}

func (r *partnerRepositoryImpl) DeleteByID(ctx context.Context, id int64) error {
	query := `
		delete from pharmacy_partners where id = $1
	`
	tx := transactor.ExtractTx(ctx)

	var (
		err error
		res sql.Result
	)
	if tx != nil {
		res, err = tx.ExecContext(ctx, query, id)
	} else {
		res, err = r.db.ExecContext(ctx, query, id)
	}

	rowsAffected, _ := res.RowsAffected()
	if rowsAffected == 0 {
		return apperrorPkg.NewEntityNotFoundError("partner")
	}

	return err
}
