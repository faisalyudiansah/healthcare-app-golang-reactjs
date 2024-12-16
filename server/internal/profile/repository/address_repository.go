package repository

import (
	"context"
	"database/sql"
	"errors"

	apperrorProfile "healthcare-app/internal/profile/apperror"
	dtoProfile "healthcare-app/internal/profile/dto"
	entityProfile "healthcare-app/internal/profile/entity"
	"healthcare-app/pkg/database/transactor"
	"healthcare-app/pkg/utils/geoutils"

	"github.com/jackc/pgx/v5/pgconn"
)

type AddressRepository interface {
	CountAddressUser(ctx context.Context, userId int64) (int, error)
	PostNewAddress(ctx context.Context, reqBody dtoProfile.RequestCreateAddress, userId int64) (*entityProfile.Address, error)
	FindAddressByID(ctx context.Context, idAddress int64) (*entityProfile.Address, error)
	PutAllAddressesInactive(ctx context.Context, userId int64) error
	PatchAddressActive(ctx context.Context, idAddress int64) (*entityProfile.Address, error)
	GetAllAddressesByUserId(ctx context.Context, userId int64) ([]*entityProfile.Address, error)
	SoftDeleteAddressByID(ctx context.Context, idAddress int64) error
	PutMyAddress(ctx context.Context, reqBody *dtoProfile.RequestPutAddress, idAddress int64) (*entityProfile.Address, error)
	FindAddressByIDAndActive(ctx context.Context, userId int64) (*entityProfile.Address, error)
	FindAddressByIDandUserID(ctx context.Context, idAddress int64, userId int64) (*entityProfile.Address, error)
}

type addressRepositoryImpl struct {
	db *sql.DB
}

func NewAddressRepository(db *sql.DB) *addressRepositoryImpl {
	return &addressRepositoryImpl{
		db: db,
	}
}

func (ar *addressRepositoryImpl) CountAddressUser(ctx context.Context, userId int64) (int, error) {
	querySql := `
		SELECT 
			COUNT(*)
		FROM user_addresses ua
		LEFT JOIN users u ON ua.user_id  = u.id
		WHERE u.id = $1 AND ua.deleted_at IS NULL
	`
	tx := transactor.ExtractTx(ctx)
	var totalCount int
	var err error
	if tx != nil {
		err = tx.QueryRowContext(ctx, querySql, userId).Scan(&totalCount)
	} else {
		err = ar.db.QueryRowContext(ctx, querySql, userId).Scan(&totalCount)
	}
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return 0, nil
		}
		return 0, err
	}
	return totalCount, nil
}

func (r *addressRepositoryImpl) PostNewAddress(ctx context.Context, reqBody dtoProfile.RequestCreateAddress, userId int64) (*entityProfile.Address, error) {
	query := `
		INSERT INTO user_addresses (user_id, is_active, address, province, city_id, city, district, sub_district, contact_name, contact_phone_number, location) VALUES 
		($1, false, $2, $3, $4, $5, $6, $7, $8, $9, $10)
		RETURNING id, user_id, is_active, address, province, city_id, city, district, sub_district, CONCAT(ST_X(location), ' ', ST_Y(location)), contact_name, contact_phone_number, created_at, updated_at, deleted_at;
	`
	var address entityProfile.Address
	var err error
	tx := transactor.ExtractTx(ctx)
	if tx != nil {
		err = tx.QueryRowContext(ctx, query, userId, reqBody.Address, reqBody.Province, reqBody.CityID, reqBody.City, reqBody.District, reqBody.SubDistrict, reqBody.ContactName, reqBody.ContactPhoneNumber, geoutils.GeoFromText(reqBody.Longitude, reqBody.Latitude)).Scan(
			&address.ID,
			&address.UserId,
			&address.IsActive,
			&address.Address,
			&address.Province,
			&address.CityID,
			&address.City,
			&address.District,
			&address.SubDistrict,
			&address.Location,
			&address.ContactName,
			&address.ContactPhoneNumber,
			&address.CreatedAt,
			&address.UpdatedAt,
			&address.DeletedAt,
		)
	} else {
		err = r.db.QueryRowContext(ctx, query, userId, reqBody.Address, reqBody.Province, reqBody.CityID, reqBody.City, reqBody.District, reqBody.SubDistrict, reqBody.ContactName, reqBody.ContactPhoneNumber, geoutils.GeoFromText(reqBody.Longitude, reqBody.Latitude)).Scan(
			&address.ID,
			&address.UserId,
			&address.IsActive,
			&address.Address,
			&address.Province,
			&reqBody.CityID,
			&address.City,
			&address.District,
			&address.SubDistrict,
			&address.Location,
			&address.ContactName,
			&address.ContactPhoneNumber,
			&address.CreatedAt,
			&address.UpdatedAt,
			&address.DeletedAt,
		)
	}

	if err, ok := err.(*pgconn.PgError); ok {
		if err.SQLState() == "23505" {
			return nil, apperrorProfile.NewInvalidAddressAlreadyExistsError()
		}
	}

	if err != nil {
		return nil, err
	}
	return &address, nil
}

func (ar *addressRepositoryImpl) FindAddressByID(ctx context.Context, idAddress int64) (*entityProfile.Address, error) {
	query := `
        SELECT id, user_id, is_active, address, province, city_id, city, district, sub_district, CONCAT(ST_X(location), ' ', ST_Y(location)), contact_name, contact_phone_number, created_at, updated_at, deleted_at
        FROM user_addresses
        WHERE id = $1 AND deleted_at IS NULL
    `
	var address entityProfile.Address
	tx := transactor.ExtractTx(ctx)
	var err error

	if tx != nil {
		err = tx.QueryRowContext(ctx, query, idAddress).Scan(
			&address.ID,
			&address.UserId,
			&address.IsActive,
			&address.Address,
			&address.Province,
			&address.CityID,
			&address.City,
			&address.District,
			&address.SubDistrict,
			&address.Location,
			&address.ContactName,
			&address.ContactPhoneNumber,
			&address.CreatedAt,
			&address.UpdatedAt,
			&address.DeletedAt,
		)
	} else {
		err = ar.db.QueryRowContext(ctx, query, idAddress).Scan(
			&address.ID,
			&address.UserId,
			&address.IsActive,
			&address.Address,
			&address.Province,
			&address.CityID,
			&address.City,
			&address.District,
			&address.SubDistrict,
			&address.Location,
			&address.ContactName,
			&address.ContactPhoneNumber,
			&address.CreatedAt,
			&address.UpdatedAt,
			&address.DeletedAt,
		)
	}

	if err != nil {
		return nil, err
	}

	return &address, nil
}

func (ar *addressRepositoryImpl) PutAllAddressesInactive(ctx context.Context, userId int64) error {
	query := `
        UPDATE user_addresses
        SET is_active = false, updated_at = NOW()
        WHERE user_id = $1
    `
	tx := transactor.ExtractTx(ctx)
	var err error

	if tx != nil {
		_, err = tx.ExecContext(ctx, query, userId)
	} else {
		_, err = ar.db.ExecContext(ctx, query, userId)
	}

	return err
}

func (ar *addressRepositoryImpl) PatchAddressActive(ctx context.Context, idAddress int64) (*entityProfile.Address, error) {
	query := `
        UPDATE user_addresses
        SET is_active = true, updated_at = NOW()
        WHERE id = $1
        RETURNING id, user_id, is_active, address, province, city_id, city, district, sub_district, CONCAT(ST_X(location), ' ', ST_Y(location)), contact_name, contact_phone_number, created_at, updated_at, deleted_at
    `
	var address entityProfile.Address
	tx := transactor.ExtractTx(ctx)
	var err error

	if tx != nil {
		err = tx.QueryRowContext(ctx, query, idAddress).Scan(
			&address.ID,
			&address.UserId,
			&address.IsActive,
			&address.Address,
			&address.Province,
			&address.CityID,
			&address.City,
			&address.District,
			&address.SubDistrict,
			&address.Location,
			&address.ContactName,
			&address.ContactPhoneNumber,
			&address.CreatedAt,
			&address.UpdatedAt,
			&address.DeletedAt,
		)
	} else {
		err = ar.db.QueryRowContext(ctx, query, idAddress).Scan(
			&address.ID,
			&address.UserId,
			&address.IsActive,
			&address.Address,
			&address.Province,
			&address.CityID,
			&address.City,
			&address.District,
			&address.SubDistrict,
			&address.Location,
			&address.ContactName,
			&address.ContactPhoneNumber,
			&address.CreatedAt,
			&address.UpdatedAt,
			&address.DeletedAt,
		)
	}

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}

	return &address, nil
}

func (ar *addressRepositoryImpl) GetAllAddressesByUserId(ctx context.Context, userId int64) ([]*entityProfile.Address, error) {
	querySql := `
		SELECT id, user_id, is_active, address, province, city_id, city, district, sub_district, CONCAT(ST_X(location), ' ', ST_Y(location)), contact_name, contact_phone_number, created_at, updated_at, deleted_at
		FROM user_addresses
		WHERE user_id = $1 AND deleted_at IS NULL
		ORDER BY created_at DESC;
	`
	tx := transactor.ExtractTx(ctx)
	var rows *sql.Rows
	var err error
	if tx != nil {
		rows, err = tx.QueryContext(ctx, querySql, userId)
	} else {
		rows, err = ar.db.QueryContext(ctx, querySql, userId)
	}
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var addresses []*entityProfile.Address
	for rows.Next() {
		address := new(entityProfile.Address)
		err := rows.Scan(
			&address.ID,
			&address.UserId,
			&address.IsActive,
			&address.Address,
			&address.Province,
			&address.CityID,
			&address.City,
			&address.District,
			&address.SubDistrict,
			&address.Location,
			&address.ContactName,
			&address.ContactPhoneNumber,
			&address.CreatedAt,
			&address.UpdatedAt,
			&address.DeletedAt,
		)

		if err != nil {
			return nil, err
		}
		addresses = append(addresses, address)
	}

	return addresses, nil
}

func (r *addressRepositoryImpl) SoftDeleteAddressByID(ctx context.Context, idAddress int64) error {
	query := `
        delete from user_addresses WHERE id = $1
    `
	tx := transactor.ExtractTx(ctx)
	var result sql.Result
	var err error
	if tx != nil {
		result, err = tx.ExecContext(ctx, query, idAddress)
	} else {
		result, err = r.db.ExecContext(ctx, query, idAddress)

	}
	if err != nil {
		return err
	}
	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}
	if rowsAffected == 0 {
		return err
	}
	return nil
}

func (ar *addressRepositoryImpl) PutMyAddress(ctx context.Context, reqBody *dtoProfile.RequestPutAddress, idAddress int64) (*entityProfile.Address, error) {
	var location *string
	if reqBody.Latitude != "" && reqBody.Longitude != "" {
		geo := geoutils.GeoFromText(reqBody.Longitude, reqBody.Latitude)
		location = &geo
	}

	query := `
		UPDATE user_addresses
		SET address = COALESCE(NULLIF($1, ''), address),
			province = COALESCE(NULLIF($2, ''), province),
			city_id = COALESCE($3, city_id),
			city = COALESCE(NULLIF($4, ''), city),
			district = COALESCE(NULLIF($5, ''), district),
			sub_district = COALESCE(NULLIF($6, ''), sub_district),
			location = COALESCE($7, location),
			contact_name = COALESCE(NULLIF($8, ''), contact_name),
			contact_phone_number = COALESCE(NULLIF($9, ''), contact_phone_number),
			updated_at = NOW()
		WHERE id = $10
		RETURNING id, user_id, is_active, address, province, city_id, city, district, sub_district, CONCAT(ST_X(location), ' ', ST_Y(location)), contact_name, contact_phone_number, created_at, updated_at, deleted_at;
	`
	tx := transactor.ExtractTx(ctx)
	var updatedAddress entityProfile.Address
	var err error
	if tx != nil {
		err = tx.QueryRowContext(ctx, query, reqBody.Address, reqBody.Province, reqBody.CityID, reqBody.City, reqBody.District, reqBody.SubDistrict, location, reqBody.ContactName, reqBody.ContactPhoneNumber, idAddress).Scan(
			&updatedAddress.ID,
			&updatedAddress.UserId,
			&updatedAddress.IsActive,
			&updatedAddress.Address,
			&updatedAddress.Province,
			&updatedAddress.CityID,
			&updatedAddress.City,
			&updatedAddress.District,
			&updatedAddress.SubDistrict,
			&updatedAddress.Location,
			&updatedAddress.ContactName,
			&updatedAddress.ContactPhoneNumber,
			&updatedAddress.CreatedAt,
			&updatedAddress.UpdatedAt,
			&updatedAddress.DeletedAt,
		)
	} else {
		err = ar.db.QueryRowContext(ctx, query, reqBody.Address, reqBody.Province, reqBody.CityID, reqBody.City, reqBody.District, reqBody.SubDistrict, location, idAddress).Scan(
			&updatedAddress.ID,
			&updatedAddress.UserId,
			&updatedAddress.IsActive,
			&updatedAddress.Address,
			&updatedAddress.Province,
			&updatedAddress.CityID,
			&updatedAddress.City,
			&updatedAddress.District,
			&updatedAddress.SubDistrict,
			&updatedAddress.Location,
			&updatedAddress.ContactName,
			&updatedAddress.ContactPhoneNumber,
			&updatedAddress.CreatedAt,
			&updatedAddress.UpdatedAt,
			&updatedAddress.DeletedAt,
		)

	}
	if err != nil {
		return nil, err
	}

	return &updatedAddress, nil
}

func (ar *addressRepositoryImpl) FindAddressByIDAndActive(ctx context.Context, userId int64) (*entityProfile.Address, error) {
	query := `
	SELECT id, user_id, is_active, address, province, city_id, city, district, sub_district, CONCAT(ST_X(location), ' ', ST_Y(location)), contact_name, contact_phone_number, created_at, updated_at, deleted_at
        FROM user_addresses
        WHERE user_id = $1 AND deleted_at IS NULL AND is_active = true
    `
	var address entityProfile.Address
	tx := transactor.ExtractTx(ctx)
	var err error
	if tx != nil {
		err = tx.QueryRowContext(ctx, query, userId).Scan(
			&address.ID,
			&address.UserId,
			&address.IsActive,
			&address.Address,
			&address.Province,
			&address.CityID,
			&address.City,
			&address.District,
			&address.SubDistrict,
			&address.Location,
			&address.ContactName,
			&address.ContactPhoneNumber,
			&address.CreatedAt,
			&address.UpdatedAt,
			&address.DeletedAt,
		)
	} else {
		err = ar.db.QueryRowContext(ctx, query, userId).Scan(
			&address.ID,
			&address.UserId,
			&address.IsActive,
			&address.Address,
			&address.Province,
			&address.CityID,
			&address.City,
			&address.District,
			&address.SubDistrict,
			&address.Location,
			&address.ContactName,
			&address.ContactPhoneNumber,
			&address.CreatedAt,
			&address.UpdatedAt,
			&address.DeletedAt,
		)
	}
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	return &address, nil
}

func (ar *addressRepositoryImpl) FindAddressByIDandUserID(ctx context.Context, idAddress int64, userId int64) (*entityProfile.Address, error) {
	query := `
        SELECT id, user_id, is_active, address, province, city_id, city, district, sub_district, CONCAT(ST_X(location), ' ', ST_Y(location)), contact_name, contact_phone_number, created_at, updated_at, deleted_at
        FROM user_addresses
        WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL
    `
	var address entityProfile.Address
	tx := transactor.ExtractTx(ctx)
	var err error

	if tx != nil {
		err = tx.QueryRowContext(ctx, query, idAddress, userId).Scan(
			&address.ID,
			&address.UserId,
			&address.IsActive,
			&address.Address,
			&address.Province,
			&address.CityID,
			&address.City,
			&address.District,
			&address.SubDistrict,
			&address.Location,
			&address.ContactName,
			&address.ContactPhoneNumber,
			&address.CreatedAt,
			&address.UpdatedAt,
			&address.DeletedAt,
		)
	} else {
		err = ar.db.QueryRowContext(ctx, query, idAddress, userId).Scan(
			&address.ID,
			&address.UserId,
			&address.IsActive,
			&address.Address,
			&address.Province,
			&address.CityID,
			&address.City,
			&address.District,
			&address.SubDistrict,
			&address.Location,
			&address.ContactName,
			&address.ContactPhoneNumber,
			&address.CreatedAt,
			&address.UpdatedAt,
			&address.DeletedAt,
		)
	}

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}

	return &address, nil
}
