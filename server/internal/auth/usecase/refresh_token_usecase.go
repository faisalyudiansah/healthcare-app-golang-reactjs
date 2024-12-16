package usecase

import (
	"context"
	"time"

	"healthcare-app/internal/auth/dto"
	"healthcare-app/internal/auth/entity"
	"healthcare-app/internal/auth/repository"
	apperrorPkg "healthcare-app/pkg/apperror"
	"healthcare-app/pkg/config"
	"healthcare-app/pkg/database/transactor"
	"healthcare-app/pkg/utils/jwtutils"
	"healthcare-app/pkg/utils/redisutils"
)

type RefreshTokenUseCase interface {
	Get(ctx context.Context, request *dto.GetRefreshTokenRequest) (*dto.RefreshTokenResponse, error)
	Save(ctx context.Context, request *dto.CreateRefreshTokenRequest) error
	Delete(ctx context.Context, request *dto.DeleteRefreshTokenRequest) error
}

type refreshTokenUseCaseImpl struct {
	cfg                    *config.JwtConfig
	redisUtil              redisutils.RedisUtil
	jwtUtil                jwtutils.JwtUtil
	refreshTokenRepository repository.RefreshTokenRepository
	transactor             transactor.Transactor
}

func NewRefreshTokenUseCase(
	cfg *config.JwtConfig,
	redisUtil redisutils.RedisUtil,
	jwtUtil jwtutils.JwtUtil,
	refreshTokenRepository repository.RefreshTokenRepository,
	transactor transactor.Transactor,
) *refreshTokenUseCaseImpl {
	return &refreshTokenUseCaseImpl{
		cfg:                    cfg,
		redisUtil:              redisUtil,
		jwtUtil:                jwtUtil,
		refreshTokenRepository: refreshTokenRepository,
		transactor:             transactor,
	}
}

func (u *refreshTokenUseCaseImpl) Get(ctx context.Context, request *dto.GetRefreshTokenRequest) (*dto.RefreshTokenResponse, error) {
	res := new(dto.RefreshTokenResponse)
	if err := u.redisUtil.GetWithScanJSON(ctx, request.JTI, res); err != nil {
		return nil, apperrorPkg.NewServerError(err)
	}
	if res.RefreshToken != "" {
		return res, nil
	}

	refreshToken, err := u.refreshTokenRepository.FindByJTI(ctx, request.JTI)
	if err != nil {
		return nil, err
	}

	res = &dto.RefreshTokenResponse{
		ExpiredAt:    refreshToken.CreatedAt.Add(time.Duration(u.cfg.RefreshDuration) * time.Minute),
		RefreshToken: refreshToken.RefreshToken,
		UserID:       refreshToken.UserID,
	}
	if err := u.redisUtil.SetJSON(ctx, request.JTI, res, time.Duration(u.cfg.RefreshDuration)*time.Minute); err != nil {
		return nil, apperrorPkg.NewServerError(err)
	}

	return res, nil
}

func (u *refreshTokenUseCaseImpl) Save(ctx context.Context, request *dto.CreateRefreshTokenRequest) error {
	token, err := u.jwtUtil.SignRefresh()
	if err != nil {
		return apperrorPkg.NewServerError(err)
	}

	return u.refreshTokenRepository.Save(ctx, &entity.RefreshToken{
		UserID:       request.UserID,
		RefreshToken: token,
		JTI:          request.JTI,
	})
}

func (u *refreshTokenUseCaseImpl) Delete(ctx context.Context, request *dto.DeleteRefreshTokenRequest) error {
	return u.transactor.Atomic(ctx, func(txCtx context.Context) error {
		refreshToken, err := u.refreshTokenRepository.FindByJTI(txCtx, request.JTI)
		if err != nil {
			return err
		}
		if refreshToken == nil {
			return apperrorPkg.NewUnauthorizedError()
		}

		if err := u.redisUtil.Delete(txCtx, request.JTI); err != nil {
			return apperrorPkg.NewServerError(err)
		}
		return u.refreshTokenRepository.DeleteByJTI(ctx, request.JTI)
	})
}
