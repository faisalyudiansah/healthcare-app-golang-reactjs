package usecase

import (
	"context"
	"time"

	apperrorAuth "healthcare-app/internal/auth/apperror"
	"healthcare-app/internal/auth/constant"
	"healthcare-app/internal/auth/dto"
	"healthcare-app/internal/auth/entity"
	"healthcare-app/internal/auth/repository"
	"healthcare-app/internal/auth/utils"
	"healthcare-app/internal/queue/payload"
	"healthcare-app/internal/queue/tasks"
	apperrorPkg "healthcare-app/pkg/apperror"
	constantPkg "healthcare-app/pkg/constant"
	"healthcare-app/pkg/database/transactor"
	"healthcare-app/pkg/utils/encryptutils"
	"healthcare-app/pkg/utils/jwtutils"
	"healthcare-app/pkg/utils/redisutils"

	"github.com/google/uuid"
)

type UserUseCase interface {
	Login(ctx context.Context, user *dto.RequestUserLogin) (*dto.ResponseLogin, error)
	Register(ctx context.Context, user *dto.RequestUserRegister) (*dto.ResponseRegister, error)
	SendVerification(ctx context.Context, user *dto.RequestUserSendVerification) error
	VerifyAccount(ctx context.Context, user *dto.RequestUserVerifyAccount) error
	ForgotPassword(ctx context.Context, user *dto.RequestUserForgotPassword) error
	ResetPassword(ctx context.Context, user *dto.RequestUserResetPassword) error
}

type userUseCaseImpl struct {
	redisUtil             redisutils.RedisUtil
	jwtUtil               jwtutils.JwtUtil
	passwordEncryptor     encryptutils.PasswordEncryptor
	base64Encryptor       encryptutils.Base64Encryptor
	emailTask             tasks.EmailTask
	userRepo              repository.UserRepository
	resetTokenRepo        repository.ResetTokenRepository
	refreshTokenRepo      repository.RefreshTokenRepository
	verificationTokenRepo repository.VerificationTokenRepository
	transactor            transactor.Transactor
}

func NewUserUseCase(
	redisUtil redisutils.RedisUtil,
	jwtUtil jwtutils.JwtUtil,
	passwordEncryptor encryptutils.PasswordEncryptor,
	base64Encryptor encryptutils.Base64Encryptor,
	emailTask tasks.EmailTask,
	userRepo repository.UserRepository,
	resetTokenRepo repository.ResetTokenRepository,
	refreshTokenRepo repository.RefreshTokenRepository,
	verificationTokenRepo repository.VerificationTokenRepository,
	transactor transactor.Transactor,
) *userUseCaseImpl {
	return &userUseCaseImpl{
		redisUtil:             redisUtil,
		jwtUtil:               jwtUtil,
		passwordEncryptor:     passwordEncryptor,
		base64Encryptor:       base64Encryptor,
		emailTask:             emailTask,
		userRepo:              userRepo,
		resetTokenRepo:        resetTokenRepo,
		refreshTokenRepo:      refreshTokenRepo,
		verificationTokenRepo: verificationTokenRepo,
		transactor:            transactor,
	}
}

func (u *userUseCaseImpl) Login(ctx context.Context, user *dto.RequestUserLogin) (*dto.ResponseLogin, error) {
	userDb, err := u.userRepo.FindByEmail(ctx, user.Email)
	if err != nil {
		return nil, apperrorPkg.NewServerError(err)
	}
	if userDb == nil || userDb.IsOauth {
		return nil, apperrorAuth.NewEmailNotExistsError()
	}

	isValid := u.passwordEncryptor.Check(user.Password, userDb.HashPassword)
	if !isValid {
		return nil, apperrorAuth.NewInvalidLoginCredentials(nil)
	}
	if !userDb.IsVerified {
		return nil, apperrorAuth.NewUnverifiedError()
	}

	if err := u.refreshTokenRepo.DeleteByUserID(ctx, userDb.ID); err != nil {
		return nil, apperrorPkg.NewServerError(err)
	}

	jti := uuid.NewString()
	token, err := u.jwtUtil.Sign(userDb.ID, userDb.Role, jti)
	if err != nil {
		return nil, apperrorAuth.NewInvalidLoginCredentials(err)
	}

	refreshToken, err := u.jwtUtil.SignRefresh()
	if err != nil {
		return nil, apperrorAuth.NewInvalidLoginCredentials(err)
	}

	if err := u.refreshTokenRepo.Save(
		ctx,
		&entity.RefreshToken{UserID: userDb.ID, RefreshToken: refreshToken, JTI: jti},
	); err != nil {
		return nil, apperrorPkg.NewServerError(err)
	}

	return &dto.ResponseLogin{AccessToken: token}, nil
}

func (u *userUseCaseImpl) Register(ctx context.Context, reqBody *dto.RequestUserRegister) (*dto.ResponseRegister, error) {
	entityUser := new(entity.User)
	err := u.transactor.Atomic(ctx, func(cForTx context.Context) error {
		checkEmail, err := u.userRepo.FindByEmail(cForTx, reqBody.Email)
		if err != nil {
			return apperrorPkg.NewServerError(err)
		}
		if checkEmail != nil {
			return apperrorAuth.NewInvalidEmailAlreadyExists(nil)
		}
		hashPassword, err := u.passwordEncryptor.Hash(reqBody.Password)
		if err != nil {
			return apperrorPkg.NewServerError(err)
		}
		user, err := u.userRepo.Save(cForTx, *reqBody, hashPassword, "user")
		if err != nil {
			return apperrorPkg.NewServerError(err)
		}
		entityUser.ID = user.ID
		entityUser.Role = user.Role
		entityUser.Email = user.Email
		entityUser.HashPassword = user.HashPassword
		entityUser.IsVerified = user.IsVerified
		entityUser.CreatedAt = user.CreatedAt
		entityUser.UpdatedAt = user.UpdatedAt
		entityUser.DeletedAt = user.DeletedAt
		return nil
	})
	if err != nil {
		return nil, err
	}
	return &dto.ResponseRegister{
		ID:         entityUser.ID,
		Email:      entityUser.Email,
		IsVerified: entityUser.IsVerified,
		RoleId:     entityUser.Role,
		Role:       utils.SpecifyRole(entityUser.Role),
		CreatedAt:  entityUser.CreatedAt,
	}, nil
}

func (u *userUseCaseImpl) SendVerification(ctx context.Context, user *dto.RequestUserSendVerification) error {
	cachedToken := new(entity.VerificationToken)
	if err := u.redisUtil.GetWithScanJSON(ctx, utils.VerificationTokenCacheKey(user.Email), cachedToken); err == nil {
		if time.Since(cachedToken.CreatedAt) < constant.VerificationTokenCooldownDuration {
			return apperrorAuth.NewTokenAlreadyExistsError()
		}
	}

	verificationTokenDb := new(entity.VerificationToken)
	err := u.transactor.Atomic(ctx, func(txCtx context.Context) error {
		userDb, err := u.userRepo.FindByEmail(txCtx, user.Email)
		if err != nil {
			return apperrorPkg.NewServerError(err)
		}
		if userDb == nil || userDb.IsOauth {
			return apperrorAuth.NewEmailNotExistsError()
		}
		if err := u.verificationTokenRepo.DeleteByUserID(txCtx, userDb.ID); err != nil {
			return apperrorPkg.NewServerError(err)
		}

		verificationTokenDb.UserID = userDb.ID
		verificationTokenDb.VerificationToken = uuid.NewString()
		if err := u.verificationTokenRepo.Save(txCtx, verificationTokenDb); err != nil {
			return apperrorPkg.NewServerError(err)
		}
		return nil
	})

	if err != nil {
		return err
	}
	if err := u.redisUtil.SetJSON(
		ctx,
		utils.VerificationTokenCacheKey(user.Email), verificationTokenDb, constant.VerificationTokenCooldownDuration,
	); err != nil {
		return apperrorPkg.NewServerError(err)
	}

	return u.emailTask.QueueVerificationEmail(ctx, &payload.VerificationEmailPayload{
		Email: user.Email,
		Token: verificationTokenDb.VerificationToken,
	})
}

func (u *userUseCaseImpl) VerifyAccount(ctx context.Context, user *dto.RequestUserVerifyAccount) error {
	email, err := u.base64Encryptor.DecodeURL(user.Email)
	if err != nil {
		return apperrorAuth.NewInvalidTokenCredentials()
	}
	verificationToken, err := u.base64Encryptor.DecodeURL(user.VerificationToken)
	if err != nil {
		return apperrorAuth.NewInvalidTokenCredentials()
	}

	err = u.transactor.Atomic(ctx, func(txCtx context.Context) error {
		userDb, err := u.userRepo.FindByEmail(txCtx, email)
		if err != nil {
			return apperrorPkg.NewServerError(err)
		}
		if userDb == nil || userDb.IsOauth {
			return apperrorAuth.NewInvalidLoginCredentials(nil)
		}
		if userDb.IsVerified {
			return apperrorAuth.NewVerifiedError()
		}

		verificationTokenDb, err := u.verificationTokenRepo.FindByVerificationToken(txCtx, verificationToken)
		if err != nil {
			return apperrorPkg.NewServerError(err)
		}
		if verificationTokenDb == nil {
			return apperrorAuth.NewInvalidTokenCredentials()
		}
		if time.Now().After(verificationTokenDb.CreatedAt.Add(constant.VerificationTokenExpireDuration - constantPkg.WIB)) {
			return apperrorAuth.NewExpiredTokenError()
		}

		if ok := u.passwordEncryptor.Check(user.Password, userDb.HashPassword); !ok {
			return apperrorAuth.NewInvalidLoginCredentials(nil)
		}

		userDb.IsVerified = true
		if err := u.userRepo.UpdateIsVerified(txCtx, userDb); err != nil {
			return apperrorPkg.NewServerError(err)
		}
		if err := u.verificationTokenRepo.DeleteByUserID(txCtx, userDb.ID); err != nil {
			return apperrorPkg.NewServerError(err)
		}
		return nil
	})

	return err
}

func (u *userUseCaseImpl) ForgotPassword(ctx context.Context, user *dto.RequestUserForgotPassword) error {
	cachedToken := new(entity.ResetToken)
	if err := u.redisUtil.GetWithScanJSON(ctx, utils.ResetTokenCacheKey(user.Email), cachedToken); err == nil {
		if time.Since(cachedToken.CreatedAt) < constant.ResetTokenCooldownDuration {
			return apperrorAuth.NewTokenAlreadyExistsError()
		}
	}

	resetTokenDb := new(entity.ResetToken)
	err := u.transactor.Atomic(ctx, func(txCtx context.Context) error {
		userDb, err := u.userRepo.FindByEmail(txCtx, user.Email)
		if err != nil {
			return apperrorPkg.NewServerError(err)
		}
		if userDb == nil || userDb.IsOauth {
			return apperrorAuth.NewEmailNotExistsError()
		}
		if err := u.resetTokenRepo.DeleteByUserID(txCtx, userDb.ID); err != nil {
			return apperrorPkg.NewServerError(err)
		}

		resetTokenDb.UserID = int64(userDb.ID)
		resetTokenDb.ResetToken = uuid.NewString()
		if err := u.resetTokenRepo.Save(txCtx, resetTokenDb); err != nil {
			return apperrorPkg.NewServerError(err)
		}
		return nil
	})

	if err != nil {
		return err
	}
	if err := u.redisUtil.SetJSON(
		ctx,
		utils.ResetTokenCacheKey(user.Email), resetTokenDb, constant.ResetTokenCooldownDuration,
	); err != nil {
		return apperrorPkg.NewServerError(err)
	}

	return u.emailTask.QueueForgotPasswordEmail(ctx, &payload.ForgotPasswordEmailPayload{
		Email: user.Email,
		Token: resetTokenDb.ResetToken,
	})
}

func (u *userUseCaseImpl) ResetPassword(ctx context.Context, user *dto.RequestUserResetPassword) error {
	email, err := u.base64Encryptor.DecodeURL(user.Email)
	if err != nil {
		return apperrorAuth.NewInvalidTokenCredentials()
	}
	resetToken, err := u.base64Encryptor.DecodeURL(user.ResetToken)
	if err != nil {
		return apperrorAuth.NewInvalidTokenCredentials()
	}

	err = u.transactor.Atomic(ctx, func(txCtx context.Context) error {
		userDb, err := u.userRepo.FindByEmail(txCtx, email)
		if err != nil {
			return apperrorPkg.NewServerError(err)
		}
		if userDb == nil || userDb.IsOauth {
			return apperrorAuth.NewEmailNotExistsError()
		}

		resetTokenDb, err := u.resetTokenRepo.FindByResetToken(txCtx, resetToken)
		if err != nil {
			return apperrorPkg.NewServerError(err)
		}
		if resetTokenDb == nil {
			return apperrorAuth.NewInvalidTokenCredentials()
		}
		if time.Now().After(resetTokenDb.CreatedAt.Add(constant.ResetTokenExpireDuration - constantPkg.WIB)) {
			return apperrorAuth.NewExpiredTokenError()
		}

		hashPassword, err := u.passwordEncryptor.Hash(user.Password)
		if err != nil {
			return apperrorPkg.NewServerError(err)
		}

		userDb.HashPassword = hashPassword
		if err := u.userRepo.UpdatePassword(txCtx, userDb); err != nil {
			return apperrorPkg.NewServerError(err)
		}
		if err := u.resetTokenRepo.DeleteByUserID(txCtx, userDb.ID); err != nil {
			return apperrorPkg.NewServerError(err)
		}

		return nil
	})

	return err
}
