package repository

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"strconv"
	"strings"

	authAppError "healthcare-app/internal/auth/apperror"
	"healthcare-app/internal/auth/dto"
	"healthcare-app/internal/auth/entity"
	apperrorPkg "healthcare-app/pkg/apperror"
	"healthcare-app/pkg/database/transactor"
)

const iLike = "%%%v%%"

type AdminRepository interface {
	SearchUser(ctx context.Context, request *dto.SearchUserRequest) ([]*entity.UserOrAdmin, error)
	SearchPharmacist(ctx context.Context, request *dto.SearchPharmacistRequest) ([]*entity.UserPharmacist, error)
	CountAllAcount(ctx context.Context, query string, isAssign int, role int) (int64, error)
	GetAllAccount(ctx context.Context, query string, isAssign int, role int, sortBy string, sort string, limit int, offset int) ([]entity.UserWithDetail, error)
	FindByID(ctx context.Context, id int64) (*entity.UserDetail, error)
	UpdateAccount(ctx context.Context, pharmacist *entity.UserDetail) error
	IsPharmacistAssign(ctx context.Context, id int64) (bool, error)
	DeleteAccount(ctx context.Context, id int64) error
	GetPharmacistByID(ctx context.Context, pharmacistID int64) (*entity.UserWithDetail, error)
}

type adminRepositoryImpl struct {
	db *sql.DB
}

func NewAdminRepository(db *sql.DB) *adminRepositoryImpl {
	return &adminRepositoryImpl{
		db: db,
	}
}

func (r *adminRepositoryImpl) SearchUser(ctx context.Context, request *dto.SearchUserRequest) ([]*entity.UserOrAdmin, error) {
	tx := transactor.ExtractTx(ctx)

	query := `
		select distinct u.id, u.role, u.email, ud.full_name, ud.whatsapp_number, u.is_verified
		from users u
		left join user_details ud on u.id = ud.user_id
		where u.deleted_at is null
	`
	args := []any{}
	queryBuilder := strings.Builder{}
	queryBuilder.WriteString(query)

	if request.Name != "" {
		queryBuilder.WriteString(fmt.Sprintf(" and ud.full_name ilike $%v", len(args)+1))
		args = append(args, fmt.Sprintf(iLike, request.Name))
	}
	if len(request.Role) != 0 {
		queryBuilder.WriteString(fmt.Sprintf(" and u.role = any($%v)", len(args)+1))
		args = append(args, request.Role)
	}

	lastID, _ := strconv.Atoi(request.Last)
	queryBuilder.WriteString(fmt.Sprintf(" and u.id > $%v order by u.id limit $%v", len(args)+1, len(args)+2))
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

	users := []*entity.UserOrAdmin{}
	for rows.Next() {
		user := new(entity.UserOrAdmin)
		if err := rows.Scan(
			&user.ID,
			&user.Role,
			&user.Email,
			&user.Name,
			&user.WhatsappNumber,
			&user.IsVerified,
		); err != nil {
			return nil, err
		}
		users = append(users, user)
	}

	err = rows.Err()
	if err != nil {
		return nil, err
	}
	return users, nil
}

func (r *adminRepositoryImpl) SearchPharmacist(ctx context.Context, request *dto.SearchPharmacistRequest) ([]*entity.UserPharmacist, error) {
	tx := transactor.ExtractTx(ctx)

	query := `
		select distinct u.id, u.role, u.email, u.hash_password, u.is_verified, ud.full_name, ud.sipa_number, ud.whatsapp_number, ud.years_of_experience, ud.image_url, (case when p.pharmacist_id is not null then true else false end) as is_assigned, u.created_at, u.updated_at
		from users u
		join user_details ud on u.id = ud.user_id
		left join pharmacies p on p.pharmacist_id = u.id
		where u.deleted_at is null and u.role = 2
	`
	args := []any{}
	queryBuilder := strings.Builder{}
	queryBuilder.WriteString(query)

	if request.Name != "" {
		queryBuilder.WriteString(fmt.Sprintf(" and ud.full_name ilike $%v", len(args)+1))
		args = append(args, fmt.Sprintf(iLike, request.Name))
	}
	if request.Email != "" {
		queryBuilder.WriteString(fmt.Sprintf(" and u.email ilike $%v", len(args)+1))
		args = append(args, fmt.Sprintf(iLike, request.Email))
	}
	if request.Sipa != "" {
		queryBuilder.WriteString(fmt.Sprintf(" and ud.sipa_number ilike $%v", len(args)+1))
		args = append(args, fmt.Sprintf(iLike, request.Sipa))
	}
	if request.Whatsapp != "" {
		queryBuilder.WriteString(fmt.Sprintf(" and ud.whatsapp_number ilike $%v", len(args)+1))
		args = append(args, fmt.Sprintf(iLike, request.Whatsapp))
	}
	if request.MinYoe != 0 && request.MaxYoe != 0 {
		queryBuilder.WriteString(fmt.Sprintf(" and ud.years_of_experience >= $%v and ud.years_of_experience <= $%v", len(args)+1, len(args)+2))
		args = append(args, request.MinYoe, request.MaxYoe)
	}

	if len(request.SortBy) > 0 {
		queryBuilder.WriteString(" order by ")
		for i, ord := range request.SortBy {
			if i > 0 {
				queryBuilder.WriteString(", ")
			}
			queryBuilder.WriteString(fmt.Sprintf("%s %s", ord, request.Sort[i]))
		}
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

	pharmacists := []*entity.UserPharmacist{}
	for rows.Next() {
		pharmacist := new(entity.UserPharmacist)
		if err := rows.Scan(
			&pharmacist.ID,
			&pharmacist.Role,
			&pharmacist.Email,
			&pharmacist.HashPassword,
			&pharmacist.IsVerified,
			&pharmacist.Fullname,
			&pharmacist.SipaNumber,
			&pharmacist.WhatsappNumber,
			&pharmacist.YearsOfExperience,
			&pharmacist.ImageUrl,
			&pharmacist.IsAssigned,
			&pharmacist.CreatedAt,
			&pharmacist.UpdatedAt,
		); err != nil {
			return nil, err
		}
		pharmacists = append(pharmacists, pharmacist)
	}

	err = rows.Err()
	if err != nil {
		return nil, err
	}
	return pharmacists, nil
}

func (ar *adminRepositoryImpl) CountAllAcount(ctx context.Context, query string, isAssign int, role int) (int64, error) {
	if (isAssign == 1 || isAssign == 2) && (role == 1 || role == 3) {
		return 0, authAppError.NewInvalidQueryisAssignAndRoleError()
	}
	querySql := `
		SELECT DISTINCT
			COUNT(u.id)
		FROM users u 
		LEFT JOIN user_details ud ON ud.user_id = u.id 
		WHERE u.deleted_at IS NULL
		AND (
			u.email ILIKE '%' || $1 || '%' OR
			ud.full_name ILIKE '%' || $1 || '%' OR
			ud.sipa_number LIKE '%' || $1 || '%' OR
			ud.whatsapp_number LIKE '%' || $1 || '%'
		)
	`
	if isAssign == 1 {
		querySql = `
			SELECT 
				COUNT(DISTINCT u.id)
			FROM users u 
			LEFT JOIN user_details ud ON ud.user_id = u.id 
			JOIN pharmacies p ON p.pharmacist_id = u.id 
			WHERE u.deleted_at IS NULL
			AND (
				u.email ILIKE '%' || $1 || '%' OR
				ud.full_name ILIKE '%' || $1 || '%' OR
				ud.sipa_number LIKE '%' || $1 || '%' OR
				ud.whatsapp_number LIKE '%' || $1 || '%'
			)
		`
	} else if isAssign == 2 {
		querySql = `
			SELECT DISTINCT
				COUNT(u.id)
			FROM users u 
			LEFT JOIN user_details ud ON ud.user_id = u.id 
			LEFT JOIN pharmacies p ON p.pharmacist_id = u.id 
			WHERE u.deleted_at IS NULL
			AND (
				u.email ILIKE '%' || $1 || '%' OR
				ud.full_name ILIKE '%' || $1 || '%' OR
				ud.sipa_number LIKE '%' || $1 || '%' OR
				ud.whatsapp_number LIKE '%' || $1 || '%'
			)
		`
	}
	if role != 0 {
		querySql += fmt.Sprintf("  AND u.role = %d", role)
	}
	if isAssign == 2 && role == 2 {
		querySql += "  AND p.pharmacist_id IS NULL"
	} else if isAssign == 1 && role == 2 {
		querySql += "  AND p.pharmacist_id IS NOT NULL"
	}
	searchKey := "%" + query + "%"
	tx := transactor.ExtractTx(ctx)
	var totalCount int64
	var err error
	if tx != nil {
		err = tx.QueryRowContext(ctx, querySql, searchKey).Scan(&totalCount)
	} else {
		err = ar.db.QueryRowContext(ctx, querySql, searchKey).Scan(&totalCount)
	}
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return 0, nil
		}
		return 0, apperrorPkg.NewServerError(err)
	}
	return totalCount, nil
}

func (ar *adminRepositoryImpl) GetAllAccount(ctx context.Context, query string, isAssign int, role int, sortBy string, sort string, limit int, offset int) ([]entity.UserWithDetail, error) {
	if (isAssign == 1 || isAssign == 2) && (role == 1 || role == 3) {
		return nil, authAppError.NewInvalidQueryisAssignAndRoleError()
	}
	querySql := `
		SELECT DISTINCT
			u.id, u.role, u.email, u.hash_password, u.is_verified, u.created_at, u.updated_at, u.deleted_at,
			ud.id, ud.user_id, ud.full_name, ud.sipa_number, ud.whatsapp_number, ud.years_of_experience, ud.image_url, ud.created_at, ud.updated_at, ud.deleted_at
		FROM users u
		LEFT JOIN user_details ud ON ud.user_id = u.id
		LEFT JOIN pharmacies p ON p.pharmacist_id = u.id 
		WHERE u.deleted_at IS NULL
		AND (
			u.email ILIKE '%' || $1 || '%' OR
			ud.full_name ILIKE '%' || $1 || '%' OR
			ud.sipa_number LIKE '%' || $1 || '%' OR
			ud.whatsapp_number LIKE '%' || $1 || '%'
		)
	`
	if isAssign == 2 {
		querySql = `
		SELECT DISTINCT
			u.id, u.role, u.email, u.hash_password, u.is_verified, u.created_at, u.updated_at, u.deleted_at,
			ud.id, ud.user_id, ud.full_name, ud.sipa_number, ud.whatsapp_number, ud.years_of_experience, ud.image_url, ud.created_at, ud.updated_at, ud.deleted_at
		FROM users u
		LEFT JOIN user_details ud ON ud.user_id = u.id
		LEFT JOIN pharmacies p ON p.pharmacist_id = u.id 
		WHERE u.deleted_at IS NULL
		AND (
			u.email ILIKE '%' || $1 || '%' OR
			ud.full_name ILIKE '%' || $1 || '%' OR
			ud.sipa_number LIKE '%' || $1 || '%' OR
			ud.whatsapp_number LIKE '%' || $1 || '%'
		)
	`
	} else if isAssign == 1 {
		querySql = `
			SELECT DISTINCT
				u.id, u.role, u.email, u.hash_password, u.is_verified, u.created_at, u.updated_at, u.deleted_at,
				ud.id, ud.user_id, ud.full_name, ud.sipa_number, ud.whatsapp_number, ud.years_of_experience, ud.image_url, ud.created_at, ud.updated_at, ud.deleted_at
			FROM users u
			LEFT JOIN user_details ud ON ud.user_id = u.id
			JOIN pharmacies p ON p.pharmacist_id = u.id 
			WHERE u.deleted_at IS NULL
			AND (
				u.email ILIKE '%' || $1 || '%' OR
				ud.full_name ILIKE '%' || $1 || '%' OR
				ud.sipa_number LIKE '%' || $1 || '%' OR
				ud.whatsapp_number LIKE '%' || $1 || '%'
			)
		`
	}
	if role != 0 {
		querySql += fmt.Sprintf("  AND u.role = %d", role)
	}
	if isAssign == 2 && role == 2 {
		querySql += "  AND p.pharmacist_id IS NULL"
	} else if isAssign == 1 && role == 2 {
		querySql += "  AND p.pharmacist_id IS NOT NULL"
	}
	querySql += fmt.Sprintf(" ORDER BY u.%s %s LIMIT $2 OFFSET $3", sortBy, sort)
	searchKey := "%" + query + "%"
	tx := transactor.ExtractTx(ctx)
	var err error
	var rows *sql.Rows
	if tx != nil {
		rows, err = tx.QueryContext(ctx, querySql, searchKey, limit, offset)
	} else {
		rows, err = ar.db.QueryContext(ctx, querySql, searchKey, limit, offset)
	}
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		return nil, apperrorPkg.NewServerError(err)
	}
	defer rows.Close()
	var userWithDetail []entity.UserWithDetail = []entity.UserWithDetail{}
	for rows.Next() {
		var user entity.User
		var userDetail entity.UserDetail
		err := rows.Scan(
			&user.ID, &user.Role, &user.Email, &user.HashPassword, &user.IsVerified, &user.CreatedAt, &user.UpdatedAt, &user.DeletedAt,
			&userDetail.ID, &userDetail.UserId, &userDetail.Fullname, &userDetail.SipaNumber, &userDetail.WhatsappNumber, &userDetail.YearsOfExperience, &userDetail.ImageUrl, &userDetail.CreatedAt, &userDetail.UpdatedAt, &userDetail.DeletedAt,
		)
		if err != nil {
			if errors.Is(err, sql.ErrNoRows) {
				return userWithDetail, nil
			}
			return nil, apperrorPkg.NewServerError(err)
		}
		if userDetail.ID == nil && userDetail.UserId == nil && userDetail.Fullname == nil && userDetail.SipaNumber == nil && userDetail.WhatsappNumber == nil && userDetail.YearsOfExperience == nil && userDetail.ImageUrl == nil && userDetail.CreatedAt == nil && userDetail.UpdatedAt == nil {
			userWithDetail = append(userWithDetail, entity.UserWithDetail{
				User:       user,
				UserDetail: nil,
			})
		} else {
			userWithDetail = append(userWithDetail, entity.UserWithDetail{
				User:       user,
				UserDetail: &userDetail,
			})
		}
	}
	return userWithDetail, nil
}

func (r *adminRepositoryImpl) FindByID(ctx context.Context, id int64) (*entity.UserDetail, error) {
	query := `
		select ud.user_id, ud.full_name, ud.sipa_number, ud.whatsapp_number, ud.years_of_experience, ud.image_url
		from users u 
		right join user_details ud on u.id = ud.user_id
		where user_id = $1 and sipa_number is not null and u.deleted_at is null 
	`
	tx := transactor.ExtractTx(ctx)
	pharmacist := &entity.UserDetail{}
	var err error
	if tx != nil {
		err = tx.QueryRowContext(ctx, query, id).Scan(&pharmacist.UserId, &pharmacist.Fullname, &pharmacist.SipaNumber, &pharmacist.WhatsappNumber, &pharmacist.YearsOfExperience, &pharmacist.ImageUrl)
	} else {
		err = r.db.QueryRowContext(ctx, query, id).Scan(&pharmacist.UserId, &pharmacist.Fullname, &pharmacist.SipaNumber, &pharmacist.WhatsappNumber, &pharmacist.YearsOfExperience, &pharmacist.ImageUrl)
	}

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	return pharmacist, nil
}

func (r *adminRepositoryImpl) UpdateAccount(ctx context.Context, pharmacist *entity.UserDetail) error {
	query := `
		update user_details set whatsapp_number = $1, years_of_experience = $2, updated_at = NOW()
		where sipa_number = $3
	`
	tx := transactor.ExtractTx(ctx)

	var err error
	if tx != nil {
		_, err = tx.ExecContext(ctx, query, &pharmacist.WhatsappNumber, &pharmacist.YearsOfExperience, &pharmacist.SipaNumber)
	} else {
		_, err = r.db.ExecContext(ctx, query, &pharmacist.WhatsappNumber, &pharmacist.YearsOfExperience, &pharmacist.SipaNumber)
	}

	if err != nil {
		return err
	}
	return nil
}

func (r *adminRepositoryImpl) IsPharmacistAssign(ctx context.Context, id int64) (bool, error) {
	query := `
		select pharmacist_id
		from pharmacies
		where pharmacist_id = $1
	`
	tx := transactor.ExtractTx(ctx)

	var err error
	if tx != nil {
		err = tx.QueryRowContext(ctx, query, id).Scan(&id)
	} else {
		err = r.db.QueryRowContext(ctx, query, id).Scan(&id)
	}

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return false, nil
		}
		return true, err
	}
	return true, nil
}

func (r *adminRepositoryImpl) DeleteAccount(ctx context.Context, id int64) error {
	query := `
		update users set deleted_at = NOW()
		where id = $1
	`
	tx := transactor.ExtractTx(ctx)

	var err error
	if tx != nil {
		_, err = tx.ExecContext(ctx, query, &id)
	} else {
		_, err = r.db.ExecContext(ctx, query, &id)
	}

	if err != nil {
		return err
	}

	return nil
}

func (ar *adminRepositoryImpl) GetPharmacistByID(ctx context.Context, pharmacistID int64) (*entity.UserWithDetail, error) {
	querySql := `
		SELECT
			u.id, u.role, u.email, u.hash_password, u.is_verified, u.created_at, u.updated_at, u.deleted_at,
			ud.id, ud.user_id, ud.full_name, ud.sipa_number, ud.whatsapp_number, ud.years_of_experience, ud.image_url, ud.created_at, ud.updated_at, ud.deleted_at
		FROM users u
		LEFT JOIN user_details ud ON ud.user_id = u.id
		WHERE u.deleted_at IS NULL AND u.id = $1 and u.role = 2
	`
	tx := transactor.ExtractTx(ctx)
	var err error
	var user entity.User
	var userDetail entity.UserDetail
	if tx != nil {
		err = tx.QueryRowContext(ctx, querySql, pharmacistID).Scan(
			&user.ID, &user.Role, &user.Email, &user.HashPassword, &user.IsVerified, &user.CreatedAt, &user.UpdatedAt, &user.DeletedAt,
			&userDetail.ID, &userDetail.UserId, &userDetail.Fullname, &userDetail.SipaNumber, &userDetail.WhatsappNumber, &userDetail.YearsOfExperience, &userDetail.ImageUrl, &userDetail.CreatedAt, &userDetail.UpdatedAt, &userDetail.DeletedAt,
		)
	} else {
		err = ar.db.QueryRowContext(ctx, querySql, pharmacistID).Scan(
			&user.ID, &user.Role, &user.Email, &user.HashPassword, &user.IsVerified, &user.CreatedAt, &user.UpdatedAt, &user.DeletedAt,
			&userDetail.ID, &userDetail.UserId, &userDetail.Fullname, &userDetail.SipaNumber, &userDetail.WhatsappNumber, &userDetail.YearsOfExperience, &userDetail.ImageUrl, &userDetail.CreatedAt, &userDetail.UpdatedAt, &userDetail.DeletedAt,
		)
	}
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	return &entity.UserWithDetail{
		User:       user,
		UserDetail: &userDetail,
	}, nil
}
