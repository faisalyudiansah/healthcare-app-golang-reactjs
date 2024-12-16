package repository

import (
	"context"
	"database/sql"

	"healthcare-app/internal/pharmacy/entity"
	"healthcare-app/pkg/database/transactor"
)

type PartnerChangeRepository interface {
	FindAll(ctx context.Context) ([]*entity.PartnerChange, error)
	Save(ctx context.Context, entity *entity.PartnerChange) error
	DeleteAll(ctx context.Context) error
	DeleteByPartnerID(ctx context.Context, id int64) error
}

type partnerChangeRepositoryImpl struct {
	db *sql.DB
}

func NewPartnerChangeRepository(db *sql.DB) *partnerChangeRepositoryImpl {
	return &partnerChangeRepositoryImpl{
		db: db,
	}
}

func (r *partnerChangeRepositoryImpl) FindAll(ctx context.Context) ([]*entity.PartnerChange, error) {
	query := `
		select id, partner_id, active_days, start_opt, end_opt, created_at from pharmacy_partner_changes
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

	entities := []*entity.PartnerChange{}
	for rows.Next() {
		entity := new(entity.PartnerChange)
		if err := rows.Scan(&entity.ID, &entity.PartnerID, &entity.ActiveDays, &entity.StartOpt, &entity.EndOpt, &entity.CreatedAt); err != nil {
			return nil, err
		}
		entities = append(entities, entity)
	}

	err = rows.Err()
	if err != nil {
		return nil, err
	}
	return entities, nil
}

func (r *partnerChangeRepositoryImpl) Save(ctx context.Context, entity *entity.PartnerChange) error {
	query := `
		insert into pharmacy_partner_changes(partner_id, active_days, start_opt, end_opt)
		values ($1, $2, $3, $4) returning created_at
	`
	tx := transactor.ExtractTx(ctx)

	var err error
	if tx != nil {
		err = tx.QueryRowContext(ctx, query, entity.PartnerID, entity.ActiveDays, entity.StartOpt, entity.EndOpt).Scan(&entity.CreatedAt)
	} else {
		err = r.db.QueryRowContext(ctx, query, entity.PartnerID, entity.ActiveDays, entity.StartOpt, entity.EndOpt).Scan(&entity.CreatedAt)
	}

	return err
}

func (r *partnerChangeRepositoryImpl) DeleteAll(ctx context.Context) error {
	query := `
		delete from pharmacy_partner_changes
	`
	tx := transactor.ExtractTx(ctx)

	var err error
	if tx != nil {
		_, err = tx.ExecContext(ctx, query)
	} else {
		_, err = r.db.ExecContext(ctx, query)
	}

	return err
}

func (r *partnerChangeRepositoryImpl) DeleteByPartnerID(ctx context.Context, id int64) error {
	query := `
		delete from pharmacy_partner_changes where partner_id = $1
	`
	tx := transactor.ExtractTx(ctx)

	var err error
	if tx != nil {
		_, err = tx.ExecContext(ctx, query, id)
	} else {
		_, err = r.db.ExecContext(ctx, query, id)
	}

	return err
}
