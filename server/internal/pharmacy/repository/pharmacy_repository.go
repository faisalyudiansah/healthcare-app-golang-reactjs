package repository

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"strconv"
	"strings"

	apperrorPharmacy "healthcare-app/internal/pharmacy/apperror"
	"healthcare-app/internal/pharmacy/dto"
	"healthcare-app/internal/pharmacy/entity"
	apperrorPkg "healthcare-app/pkg/apperror"
	"healthcare-app/pkg/database/transactor"

	"github.com/jackc/pgx/v5/pgconn"
)

type PharmacyRepository interface {
	CountOnGoingOrders(ctx context.Context, pharmacy *entity.Pharmacy) (int64, error)
	Search(ctx context.Context, request *dto.SearchPharmacyRequest) ([]*entity.Pharmacy, error)
	FindAllByProductID(ctx context.Context, request *dto.GetProductPharmacyRequest) ([]*entity.ProductPharmacy, error)
	FindAllProducts(ctx context.Context, id int64) ([]*entity.PharmacyProduct, error)
	FindByID(ctx context.Context, id int64) (*entity.Pharmacy, error)
	Save(ctx context.Context, pharmacy *entity.Pharmacy) error
	SaveLogisticPartners(ctx context.Context, pharmacy *entity.Pharmacy, logisticPartners []*entity.Logistic) error
	Update(ctx context.Context, pharmacy *entity.Pharmacy) error
	UpdateLogisticPartners(ctx context.Context, pharmacy *entity.Pharmacy, logisticPartners []*entity.Logistic) error
	DeleteByID(ctx context.Context, id int64) error
	InactiveRelatedProduct(ctx context.Context, pharmacy *entity.Pharmacy) error
}

type pharmacyRepositoryImpl struct {
	db *sql.DB
}

func NewPharmacyRepository(db *sql.DB) *pharmacyRepositoryImpl {
	return &pharmacyRepositoryImpl{
		db: db,
	}
}

func (r *pharmacyRepositoryImpl) CountOnGoingOrders(ctx context.Context, pharmacy *entity.Pharmacy) (int64, error) {
	query := `
		select count(o.id) from orders o
		join order_products op ON o.id = op.order_id
		join pharmacy_products pp ON op.pharmacy_product_id = pp.id
		join pharmacies p ON pp.pharmacy_id = p.id
		where p.id = $1 and o.order_status in ('PROCESSED', 'SENT')
	`
	tx := transactor.ExtractTx(ctx)

	var (
		err   error
		count int64
	)
	if tx != nil {
		err = tx.QueryRowContext(ctx, query, pharmacy.ID).Scan(&count)
	} else {
		err = r.db.QueryRowContext(ctx, query, pharmacy.ID).Scan(&count)
	}

	if err != nil {
		return 0, err
	}

	return count, err
}

func (r *pharmacyRepositoryImpl) Search(ctx context.Context, request *dto.SearchPharmacyRequest) ([]*entity.Pharmacy, error) {
	tx := transactor.ExtractTx(ctx)

	query := `
		select
		u.id, ud.full_name, pa.id, pa.name, p.id, p.name, p.address, p.city, CONCAT(ST_X(p.location), ' ', ST_Y(p.location)), p.is_active
		from pharmacies p
		join pharmacy_partners pa on pa.id = p.partner_id
		left join users u on u.id = p.pharmacist_id
		join user_details ud on ud.user_id = u.id
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
		addCondition(fmt.Sprintf("p.name ilike $%d", len(args)+1), fmt.Sprintf("%%%s%%", request.Name))
	}
	if request.IsActive != "" {
		addCondition(fmt.Sprintf("p.is_active = $%d", len(args)+1), request.IsActive)
	}
	if len(request.Partner) != 0 {
		addCondition(fmt.Sprintf("p.partner_id = any($%v)", len(args)+1), request.Partner)
	}
	if len(request.Pharmacist) != 0 {
		addCondition(fmt.Sprintf("p.pharmacist_id = any($%v)", len(args)+1), request.Pharmacist)
	}

	lastID, _ := strconv.Atoi(request.Last)
	queryBuilder.WriteString(fmt.Sprintf(" and p.id > $%v order by p.id limit $%v", len(args)+1, len(args)+2))
	args = append(args, lastID, request.Limit+1)

	var (
		rows *sql.Rows
		err  error
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

func (r *pharmacyRepositoryImpl) FindAllByProductID(ctx context.Context, request *dto.GetProductPharmacyRequest) ([]*entity.ProductPharmacy, error) {
	tx := transactor.ExtractTx(ctx)

	query := `
		select
			u.id, ud.full_name, ud.sipa_number, pa.id, pa.name, p.id, p.name, p.address, p.city, CONCAT(ST_X(p.location), ' ', ST_Y(p.location)), p.is_active, pp.id, pp.stock_quantity, pp.price
		from pharmacies p
		join pharmacy_products pp on p.id = pp.pharmacy_id
		join pharmacy_partners pa on pa.id = p.partner_id
		left join users u on u.id = p.pharmacist_id
		join user_details ud on ud.user_id = u.id
		where 
			CURRENT_TIME BETWEEN pa.start_opt AND pa.end_opt
			and p.is_active = true 
			and pp.product_id = $1 
			and pp.is_active = true 
			and pp.deleted_at is null
	`
	var (
		rows *sql.Rows
		err  error
	)
	if tx != nil {
		rows, err = tx.QueryContext(ctx, query, request.ProductID)
	} else {
		rows, err = r.db.QueryContext(ctx, query, request.ProductID)
	}

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	pharmacies := []*entity.ProductPharmacy{}
	for rows.Next() {
		pharmacy := new(entity.ProductPharmacy)
		if err := rows.Scan(
			&pharmacy.PharmacistID,
			&pharmacy.PharmacistName,
			&pharmacy.PharmacistSipaNumber,
			&pharmacy.PartnerID,
			&pharmacy.PartnerName,
			&pharmacy.ID,
			&pharmacy.Name,
			&pharmacy.Address,
			&pharmacy.City,
			&pharmacy.Location,
			&pharmacy.IsActive,
			&pharmacy.PharmacyProductID,
			&pharmacy.StockQuantity,
			&pharmacy.Price,
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

func (r *pharmacyRepositoryImpl) FindAllProducts(ctx context.Context, id int64) ([]*entity.PharmacyProduct, error) {
	query := `
		select pp.id, p.name, pp.stock_quantity, pp.price, pp.sold_amount, pp.created_at, pp.updated_at
		from pharmacy_products pp join products p on pp.product_id = p.id
		where pp.deleted_at is null and pp.pharmacy_id = $1
	`
	tx := transactor.ExtractTx(ctx)

	var (
		err  error
		rows *sql.Rows
	)
	if tx != nil {
		rows, err = tx.QueryContext(ctx, query, id)
	} else {
		rows, err = r.db.QueryContext(ctx, query, id)
	}

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	entities := []*entity.PharmacyProduct{}
	for rows.Next() {
		entity := new(entity.PharmacyProduct)
		if err := rows.Scan(
			&entity.ID,
			&entity.Name,
			&entity.StockQuantity,
			&entity.Price,
			&entity.SoldAmount,
			&entity.CreatedAt,
			&entity.UpdatedAt,
		); err != nil {
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

func (r *pharmacyRepositoryImpl) FindByID(ctx context.Context, id int64) (*entity.Pharmacy, error) {
	query := `
		WITH pharmacy AS (
			SELECT id, pharmacist_id, partner_id, name, address, city, CONCAT(ST_X(location), ' ', ST_Y(location)) AS location, is_active
			FROM pharmacies
			WHERE id = $1
		)
		SELECT ph.id, u.id AS pharmacist_id, ud.full_name, pa.id AS partner_id, 
			pa.name AS partner_name, ph.name, ph.address, ph.city, 
			ph.location, ph.is_active
		FROM pharmacy ph
		LEFT JOIN users u ON u.id = ph.pharmacist_id
		LEFT JOIN user_details ud ON ud.user_id = u.id
		JOIN pharmacy_partners pa ON pa.id = ph.partner_id;
		
	`
	tx := transactor.ExtractTx(ctx)

	var (
		err            error
		pharmacistID   sql.NullInt64
		pharmacistName sql.NullString
		pharmacy       = &entity.Pharmacy{ID: id}
		rows           *sql.Rows
	)

	if tx != nil {
		err = tx.QueryRowContext(ctx, query, id).Scan(
			&pharmacy.ID,
			&pharmacistID,
			&pharmacistName,
			&pharmacy.PartnerID,
			&pharmacy.PartnerName,
			&pharmacy.Name,
			&pharmacy.Address,
			&pharmacy.City,
			&pharmacy.Location,
			&pharmacy.IsActive,
		)
	} else {
		err = r.db.QueryRowContext(ctx, query, id).Scan(
			&pharmacy.ID,
			&pharmacistID,
			&pharmacistName,
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
			return nil, apperrorPkg.NewEntityNotFoundError("pharmacy")
		}
		return nil, err
	}

	if pharmacistID.Valid {
		pharmacy.PharmacistID = &pharmacistID.Int64
	}
	if pharmacistName.Valid {
		pharmacy.PharmacistName = pharmacistName.String
	}

	query = `
		select l.id, l.code, l.service
		from logistics l
		join pharmacy_logistics pl on pl.logistic_id = l.id
		where pl.pharmacy_id = $1 
	`

	if tx != nil {
		rows, err = tx.QueryContext(ctx, query, id)
	} else {
		rows, err = r.db.QueryContext(ctx, query, id)
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

func (r *pharmacyRepositoryImpl) Save(ctx context.Context, pharmacy *entity.Pharmacy) error {
	query := `
		insert into pharmacies(pharmacist_id, partner_id, name, address, city, location, is_active)
		values($1, $2, $3, $4, $5, $6, $7)
		returning id, CONCAT(ST_X(location), ' ', ST_Y(location))
	`
	tx := transactor.ExtractTx(ctx)

	var err error
	if tx != nil {
		err = tx.QueryRowContext(
			ctx,
			query,
			pharmacy.PharmacistID,
			pharmacy.PartnerID,
			pharmacy.Name,
			pharmacy.Address,
			pharmacy.City,
			pharmacy.Location,
			pharmacy.IsActive,
		).Scan(&pharmacy.ID, &pharmacy.Location)
	} else {
		err = r.db.QueryRowContext(
			ctx,
			query,
			pharmacy.PharmacistID,
			pharmacy.PartnerID,
			pharmacy.Name,
			pharmacy.Address,
			pharmacy.City,
			pharmacy.Location,
			pharmacy.IsActive,
		).Scan(&pharmacy.ID, &pharmacy.Location)
	}

	if err, ok := err.(*pgconn.PgError); ok {
		if err.SQLState() == "23505" {
			return apperrorPharmacy.NewPharmacyAlreadyExistsError()
		}
	}

	return err
}

func (r *pharmacyRepositoryImpl) SaveLogisticPartners(ctx context.Context, pharmacy *entity.Pharmacy, logisticPartners []*entity.Logistic) error {
	tx := transactor.ExtractTx(ctx)

	var params []string
	var args []any
	for i := 0; i < len(logisticPartners); i++ {
		params = append(params, fmt.Sprintf("($%d, $%d)", i*2+1, i*2+2))
		args = append(args, pharmacy.ID)
		args = append(args, logisticPartners[i].ID)
	}
	query := fmt.Sprintf("insert into pharmacy_logistics(pharmacy_id, logistic_id) values %s", strings.Join(params, ","))

	var err error
	if tx != nil {
		_, err = tx.ExecContext(ctx, query, args...)
	} else {
		_, err = r.db.ExecContext(ctx, query, args...)
	}

	return err
}

func (r *pharmacyRepositoryImpl) Update(ctx context.Context, pharmacy *entity.Pharmacy) error {
	if pharmacy.PharmacistID == nil && pharmacy.IsActive {
		return nil
	}

	query := `
	UPDATE pharmacies
	SET pharmacist_id = $2,  name = $3, partner_id = $4, address = $5, city = $6, 
		location = $7, is_active = $8, updated_at = now()
	WHERE id = $1
	RETURNING 
		CONCAT(ST_X(location), ' ', ST_Y(location)) AS location,
		(SELECT ud.full_name FROM user_details ud WHERE ud.user_id = $2) AS pharmacist_name,
		(SELECT pp.name FROM pharmacy_partners pp WHERE pp.id = $4) AS partner_name;
	`

	tx := transactor.ExtractTx(ctx)

	var (
		err            error
		pharmacistName sql.NullString
		partnerName    sql.NullString
	)

	if tx != nil {
		err = tx.QueryRowContext(
			ctx,
			query,
			pharmacy.ID,
			pharmacy.PharmacistID,
			pharmacy.Name,
			pharmacy.PartnerID,
			pharmacy.Address,
			pharmacy.City,
			pharmacy.Location,
			pharmacy.IsActive,
		).Scan(&pharmacy.Location, &pharmacistName, &partnerName)
	} else {
		err = r.db.QueryRowContext(
			ctx,
			query,
			pharmacy.ID,
			pharmacy.PharmacistID,
			pharmacy.PharmacistName,
			pharmacy.PartnerID,
			pharmacy.Name,
			pharmacy.Address,
			pharmacy.City,
			pharmacy.Location,
			pharmacy.IsActive,
		).Scan(&pharmacy.Location, &pharmacy.PharmacistName, &pharmacy.PartnerName)
	}

	if pharmacistName.Valid {
		pharmacy.PharmacistName = pharmacistName.String
	} else {
		pharmacy.PharmacistName = ""
	}

	if partnerName.Valid {
		pharmacy.PartnerName = partnerName.String
	} else {
		pharmacy.PartnerName = ""
	}

	if err, ok := err.(*pgconn.PgError); ok {
		if err.SQLState() == "23505" {
			return apperrorPharmacy.NewPharmacyAlreadyExistsError()
		}
	}

	return err
}

func (r *pharmacyRepositoryImpl) DeleteByID(ctx context.Context, id int64) error {
	query := `
		delete from pharmacies where id = $1
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
		return apperrorPkg.NewEntityNotFoundError("pharmacy")
	}

	return err
}

func (r *pharmacyRepositoryImpl) UpdateLogisticPartners(ctx context.Context, pharmacy *entity.Pharmacy, logisticPartners []*entity.Logistic) error {
	tx := transactor.ExtractTx(ctx)

	query := "delete from pharmacy_logistics where pharmacy_id = $1"

	var err error
	if tx != nil {
		_, err = tx.ExecContext(ctx, query, pharmacy.ID)
	} else {
		_, err = r.db.ExecContext(ctx, query, pharmacy.ID)
	}

	if err != nil {
		return err
	}

	return r.SaveLogisticPartners(ctx, pharmacy, logisticPartners)
}

func (r *pharmacyRepositoryImpl) InactiveRelatedProduct(ctx context.Context, pharmacy *entity.Pharmacy) error {
	query := `
		update pharmacy_products set is_active = false where pharmacy_id = $1
	`
	tx := transactor.ExtractTx(ctx)

	var err error
	if tx != nil {
		_, err = tx.ExecContext(ctx, query, pharmacy.ID)
	} else {
		_, err = r.db.ExecContext(ctx, query, pharmacy.ID)
	}

	return err
}
