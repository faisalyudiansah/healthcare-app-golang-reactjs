package repository

import (
	"context"
	"database/sql"
	"errors"

	"healthcare-app/internal/auth/dto"
	"healthcare-app/internal/auth/entity"
	"healthcare-app/pkg/database/transactor"
)

type UserRepository interface {
	FindByID(ctx context.Context, id int64) (*entity.User, error)
	FindByIDWithCompleteData(ctx context.Context, id int64) (*entity.User, error)
	FindByEmail(ctx context.Context, email string) (*entity.User, error)
	FindBySIPA(ctx context.Context, sipa string) (int64, error)
	FindByWhatsappNumber(ctx context.Context, waNumber string) (int64, error)
	Save(ctx context.Context, reqBody dto.RequestUserRegister, hashPassword string, from string) (*entity.User, error)
	SaveOauth(ctx context.Context, entity *entity.User) error
	SaveUserDetail(ctx context.Context, userId int64, fullname string, sipaNumber string, whatsappNumber string, yoe int) (*entity.UserDetail, error)
	SaveUserDetailWithoutSipaNumber(ctx context.Context, userId int64, fullname string, whatsappNumber string) (*entity.UserDetail, error)
	UpdatePassword(ctx context.Context, user *entity.User) error
	UpdateIsVerified(ctx context.Context, user *entity.User) error
	GetUserDetailByUserID(ctx context.Context, userId int64) (*entity.UserDetail, error)
}

type userRepositoryImpl struct {
	db *sql.DB
}

func NewUserRepository(db *sql.DB) *userRepositoryImpl {
	return &userRepositoryImpl{
		db: db,
	}
}

func (r *userRepositoryImpl) FindByID(ctx context.Context, id int64) (*entity.User, error) {
	query := `
		select role, email, hash_password, is_verified, created_at 
		from users 
		where id = $1 and deleted_at is null
	`
	tx := transactor.ExtractTx(ctx)
	user := &entity.User{ID: id}

	var err error
	if tx != nil {
		err = tx.QueryRowContext(ctx, query, id).Scan(&user.Role, &user.Email, &user.HashPassword, &user.IsVerified, &user.CreatedAt)
	} else {
		err = r.db.QueryRowContext(ctx, query, id).Scan(&user.Role, &user.Email, &user.HashPassword, &user.IsVerified, &user.CreatedAt)
	}

	if err != nil {
		return nil, err
	}
	return user, nil
}

func (r *userRepositoryImpl) FindByIDWithCompleteData(ctx context.Context, id int64) (*entity.User, error) {
	query := `
		select id, role, email, is_verified, is_oauth, created_at, updated_at, deleted_at
		from users 
		where id = $1 and deleted_at is null
	`
	tx := transactor.ExtractTx(ctx)
	user := &entity.User{ID: id}

	var err error
	if tx != nil {
		err = tx.QueryRowContext(ctx, query, id).Scan(&user.ID, &user.Role, &user.Email, &user.IsVerified, &user.IsOauth, &user.CreatedAt, &user.UpdatedAt, &user.DeletedAt)
	} else {
		err = r.db.QueryRowContext(ctx, query, id).Scan(&user.ID, &user.Role, &user.Email, &user.IsVerified, &user.IsOauth, &user.CreatedAt, &user.UpdatedAt, &user.DeletedAt)
	}

	if err != nil {
		return nil, err
	}
	return user, nil
}

func (r *userRepositoryImpl) FindByEmail(ctx context.Context, email string) (*entity.User, error) {
	query := `
		select id, role, hash_password, is_verified, is_oauth, created_at 
		from users 
		where email = $1 and deleted_at is null
	`
	tx := transactor.ExtractTx(ctx)
	user := &entity.User{Email: email}

	var err error
	if tx != nil {
		err = tx.QueryRowContext(ctx, query, email).Scan(&user.ID, &user.Role, &user.HashPassword, &user.IsVerified, &user.IsOauth, &user.CreatedAt)
	} else {
		err = r.db.QueryRowContext(ctx, query, email).Scan(&user.ID, &user.Role, &user.HashPassword, &user.IsVerified, &user.IsOauth, &user.CreatedAt)
	}

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	return user, nil
}

func (r *userRepositoryImpl) FindBySIPA(ctx context.Context, sipa string) (int64, error) {
	query := `
		SELECT 
		id
		FROM user_details 
		WHERE sipa_number = $1 AND deleted_at IS NULL 
	`
	tx := transactor.ExtractTx(ctx)
	var id int64

	var err error
	if tx != nil {
		err = tx.QueryRowContext(ctx, query, sipa).Scan(&id)
	} else {
		err = r.db.QueryRowContext(ctx, query, sipa).Scan(&id)
	}

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return 0, nil
		}
		return 0, err
	}
	return id, nil
}

func (r *userRepositoryImpl) FindByWhatsappNumber(ctx context.Context, waNumber string) (int64, error) {
	query := `
		SELECT 
		id
		FROM user_details 
		WHERE whatsapp_number = $1 AND deleted_at IS NULL 
	`
	tx := transactor.ExtractTx(ctx)
	var id int64

	var err error
	if tx != nil {
		err = tx.QueryRowContext(ctx, query, waNumber).Scan(&id)
	} else {
		err = r.db.QueryRowContext(ctx, query, waNumber).Scan(&id)
	}

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return 0, nil
		}
		return 0, err
	}
	return id, nil
}

func (r *userRepositoryImpl) Save(ctx context.Context, reqBody dto.RequestUserRegister, hashPassword string, from string) (*entity.User, error) {
	query := `
		INSERT INTO users (role, email, hash_password, is_verified, created_at, updated_at) VALUES 
		(1, $1, $2, false, NOW(), NOW())
		RETURNING id, role, email, hash_password, is_verified, created_at, updated_at, deleted_at;
	`
	if from == "admin" {
		query = `
		INSERT INTO users (role, email, hash_password, is_verified, created_at, updated_at) VALUES 
		(2, $1, $2, true, NOW(), NOW())
		RETURNING id, role, email, hash_password, is_verified, created_at, updated_at, deleted_at;
	`
	}
	var user entity.User
	var err error
	tx := transactor.ExtractTx(ctx)
	if tx != nil {
		err = tx.QueryRowContext(ctx, query, reqBody.Email, hashPassword).Scan(
			&user.ID,
			&user.Role,
			&user.Email,
			&user.HashPassword,
			&user.IsVerified,
			&user.CreatedAt,
			&user.UpdatedAt,
			&user.DeletedAt,
		)
	} else {
		err = r.db.QueryRowContext(ctx, query, reqBody.Email, hashPassword).Scan(
			&user.ID,
			&user.Role,
			&user.Email,
			&user.HashPassword,
			&user.IsVerified,
			&user.CreatedAt,
			&user.UpdatedAt,
			&user.DeletedAt,
		)
	}
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	return &user, nil
}

func (r *userRepositoryImpl) SaveOauth(ctx context.Context, entity *entity.User) error {
	query := `
		INSERT INTO users (role, email, is_verified, is_oauth) VALUES 
		(1, $1, true, true)
		RETURNING id, role, email, hash_password, is_verified, is_oauth, created_at, updated_at
	`
	tx := transactor.ExtractTx(ctx)

	var err error
	if tx != nil {
		err = tx.QueryRowContext(ctx, query, entity.Email).Scan(
			&entity.ID,
			&entity.Role,
			&entity.Email,
			&entity.HashPassword,
			&entity.IsVerified,
			&entity.IsOauth,
			&entity.CreatedAt,
			&entity.UpdatedAt,
		)
	} else {
		err = r.db.QueryRowContext(ctx, query, entity.Email).Scan(
			&entity.ID,
			&entity.Role,
			&entity.Email,
			&entity.HashPassword,
			&entity.IsVerified,
			&entity.IsOauth,
			&entity.CreatedAt,
			&entity.UpdatedAt,
		)
	}

	return err
}

func (r *userRepositoryImpl) UpdatePassword(ctx context.Context, user *entity.User) error {
	query := `
		update users set hash_password = $1, updated_at = now() where id = $2
	`
	tx := transactor.ExtractTx(ctx)

	var err error
	if tx != nil {
		_, err = tx.ExecContext(ctx, query, user.HashPassword, user.ID)
	} else {
		_, err = r.db.ExecContext(ctx, query, user.HashPassword, user.ID)
	}

	return err
}

func (r *userRepositoryImpl) UpdateIsVerified(ctx context.Context, user *entity.User) error {
	query := `
		update users set is_verified = $1, updated_at = now() where id = $2
	`
	tx := transactor.ExtractTx(ctx)

	var err error
	if tx != nil {
		_, err = tx.ExecContext(ctx, query, user.IsVerified, user.ID)
	} else {
		_, err = r.db.ExecContext(ctx, query, user.IsVerified, user.ID)
	}

	return err
}

func (r *userRepositoryImpl) SaveUserDetail(ctx context.Context, userId int64, fullname string, sipaNumber string, whatsappNumber string, yoe int) (*entity.UserDetail, error) {
	query := `
		INSERT INTO user_details (user_id, full_name, sipa_number, whatsapp_number, years_of_experience, image_url, created_at, updated_at) VALUES 
		($1, $2, $3, $4, $5, $6, NOW(), NOW())
		RETURNING id, user_id, full_name, sipa_number, whatsapp_number, years_of_experience, image_url, created_at, updated_at, deleted_at;
	`
	defaultImgUrl := "https://www.kindpng.com/picc/m/24-248253_user-profile-default-image-png-clipart-png-download.png"
	var userDetail entity.UserDetail
	var err error
	tx := transactor.ExtractTx(ctx)
	if tx != nil {
		err = tx.QueryRowContext(ctx, query, userId, fullname, sipaNumber, whatsappNumber, yoe, defaultImgUrl).Scan(
			&userDetail.ID,
			&userDetail.UserId,
			&userDetail.Fullname,
			&userDetail.SipaNumber,
			&userDetail.WhatsappNumber,
			&userDetail.YearsOfExperience,
			&userDetail.ImageUrl,
			&userDetail.CreatedAt,
			&userDetail.UpdatedAt,
			&userDetail.DeletedAt,
		)
	} else {
		err = r.db.QueryRowContext(ctx, query, userId, fullname, sipaNumber, whatsappNumber, yoe, defaultImgUrl).Scan(
			&userDetail.ID,
			&userDetail.UserId,
			&userDetail.Fullname,
			&userDetail.SipaNumber,
			&userDetail.WhatsappNumber,
			&userDetail.YearsOfExperience,
			&userDetail.ImageUrl,
			&userDetail.CreatedAt,
			&userDetail.UpdatedAt,
			&userDetail.DeletedAt,
		)
	}
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	return &userDetail, nil
}

func (r *userRepositoryImpl) SaveUserDetailWithoutSipaNumber(ctx context.Context, userId int64, fullname string, whatsappNumber string) (*entity.UserDetail, error) {
	query := `
		INSERT INTO user_details (user_id, full_name, sipa_number, whatsapp_number, years_of_experience, image_url, created_at, updated_at)
		VALUES ($1, $2, NULL, $3, NULL, $4, NOW(), NOW())
		RETURNING id, user_id, full_name, sipa_number, whatsapp_number, years_of_experience, image_url, created_at, updated_at, deleted_at;
	`
	defaultImgUrl := "https://www.kindpng.com/picc/m/24-248253_user-profile-default-image-png-clipart-png-download.png"
	var userDetail entity.UserDetail
	var err error
	tx := transactor.ExtractTx(ctx)
	if tx != nil {
		err = tx.QueryRowContext(ctx, query, userId, fullname, whatsappNumber, defaultImgUrl).Scan(
			&userDetail.ID,
			&userDetail.UserId,
			&userDetail.Fullname,
			&userDetail.SipaNumber,
			&userDetail.WhatsappNumber,
			&userDetail.YearsOfExperience,
			&userDetail.ImageUrl,
			&userDetail.CreatedAt,
			&userDetail.UpdatedAt,
			&userDetail.DeletedAt,
		)
	} else {
		err = r.db.QueryRowContext(ctx, query, userId, fullname, whatsappNumber, defaultImgUrl).Scan(
			&userDetail.ID,
			&userDetail.UserId,
			&userDetail.Fullname,
			&userDetail.SipaNumber,
			&userDetail.WhatsappNumber,
			&userDetail.YearsOfExperience,
			&userDetail.ImageUrl,
			&userDetail.CreatedAt,
			&userDetail.UpdatedAt,
			&userDetail.DeletedAt,
		)
	}
	if err != nil {
		return nil, err
	}
	return &userDetail, nil
}

func (r *userRepositoryImpl) GetUserDetailByUserID(ctx context.Context, userId int64) (*entity.UserDetail, error) {
	query := `
		SELECT id, user_id, full_name, sipa_number, whatsapp_number, years_of_experience, image_url, created_at, updated_at, deleted_at
		FROM user_details
		WHERE user_id = $1 AND deleted_at IS NULL
	`
	tx := transactor.ExtractTx(ctx)
	var userDetail entity.UserDetail

	var err error
	if tx != nil {
		err = tx.QueryRowContext(ctx, query, userId).Scan(
			&userDetail.ID,
			&userDetail.UserId,
			&userDetail.Fullname,
			&userDetail.SipaNumber,
			&userDetail.WhatsappNumber,
			&userDetail.YearsOfExperience,
			&userDetail.ImageUrl,
			&userDetail.CreatedAt,
			&userDetail.UpdatedAt,
			&userDetail.DeletedAt,
		)
	} else {
		err = r.db.QueryRowContext(ctx, query, userId).Scan(
			&userDetail.ID,
			&userDetail.UserId,
			&userDetail.Fullname,
			&userDetail.SipaNumber,
			&userDetail.WhatsappNumber,
			&userDetail.YearsOfExperience,
			&userDetail.ImageUrl,
			&userDetail.CreatedAt,
			&userDetail.UpdatedAt,
			&userDetail.DeletedAt,
		)
	}

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}

	return &userDetail, nil
}
