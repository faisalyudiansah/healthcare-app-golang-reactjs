package middleware

import (
	"context"
	"errors"
	"time"

	"strings"

	"healthcare-app/internal/auth/dto"
	"healthcare-app/internal/auth/usecase"
	"healthcare-app/internal/auth/utils"
	"healthcare-app/pkg/apperror"
	"healthcare-app/pkg/constant"
	"healthcare-app/pkg/utils/jwtutils"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

type AuthMiddleware struct {
	jwtUtil             jwtutils.JwtUtil
	refreshTokenUseCase usecase.RefreshTokenUseCase
}

func NewAuthMiddleware(
	jwtUtil jwtutils.JwtUtil,
	refreshTokenUseCase usecase.RefreshTokenUseCase,
) *AuthMiddleware {
	return &AuthMiddleware{
		jwtUtil:             jwtUtil,
		refreshTokenUseCase: refreshTokenUseCase,
	}
}

func (m *AuthMiddleware) Authorization() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		accessToken, err := m.parseAccessToken(ctx)
		if err != nil {
			ctx.Error(err)
			ctx.Abort()
			return
		}

		if err := m.refreshAccessToken(accessToken, ctx); err != nil {
			ctx.Error(err)
			ctx.Abort()
			return
		}

		ctx.Next()
	}
}

func (m *AuthMiddleware) ProtectedRoles(allowedRoles ...int) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		role := utils.GetValueRoleUserFromToken(ctx)

		allowed := false
		for _, allowedRole := range allowedRoles {
			if role == allowedRole {
				allowed = true
				break
			}
		}

		if !allowed {
			ctx.Error(apperror.NewForbiddenAccessError())
			ctx.Abort()
			return
		}

		ctx.Next()
	}
}

func (m *AuthMiddleware) parseAccessToken(ctx *gin.Context) (string, error) {
	accessToken := ctx.GetHeader("Authorization")
	if accessToken == "" || len(accessToken) == 0 {
		return "", apperror.NewUnauthorizedError()
	}

	splitToken := strings.Split(accessToken, " ")
	if len(splitToken) != 2 || splitToken[0] != "Bearer" {
		return "", apperror.NewUnauthorizedError()
	}
	return splitToken[1], nil
}

func (m *AuthMiddleware) refreshAccessToken(accessToken string, ctx *gin.Context) error {
	claims, err := m.jwtUtil.Parse(accessToken)
	if err != nil && !errors.Is(err, jwt.ErrTokenExpired) {
		return apperror.NewUnauthorizedError()
	}

	if errors.Is(err, jwt.ErrTokenExpired) {
		if err := m.isRefreshTokenValid(claims, ctx); err != nil {
			return err
		}

		newAccessToken, err := m.jwtUtil.Sign(claims.UserID, claims.Role, claims.ID)
		if err != nil {
			return err
		}
		ctx.SetCookie("access_token", newAccessToken, 604800, "/", "", false, false)
	}

	m.injectCtx(claims, ctx)

	return nil
}

func (m *AuthMiddleware) isRefreshTokenValid(claims *jwtutils.JWTClaims, ctx *gin.Context) error {
	refreshToken, err := m.refreshTokenUseCase.Get(ctx, &dto.GetRefreshTokenRequest{JTI: claims.ID})
	if err != nil {
		return err
	}
	if refreshToken == nil {
		return apperror.NewUnauthorizedError()
	}
	if time.Now().After(refreshToken.ExpiredAt) {
		if err := m.refreshTokenUseCase.Delete(ctx, &dto.DeleteRefreshTokenRequest{JTI: claims.ID}); err != nil {
			return err
		}
		return apperror.NewUnauthorizedError()
	}
	return nil
}

func (m *AuthMiddleware) injectCtx(claims *jwtutils.JWTClaims, ctx *gin.Context) {
	var userId constant.ID = "user_id"
	ctxId := context.WithValue(ctx.Request.Context(), userId, claims.UserID)
	ctx.Request = ctx.Request.WithContext(ctxId)

	var roleUser constant.Role = "role"
	ctxRole := context.WithValue(ctx.Request.Context(), roleUser, claims.Role)
	ctx.Request = ctx.Request.WithContext(ctxRole)

	var jti constant.JTI = "jti"
	ctx.Request = ctx.Request.WithContext(context.WithValue(ctx.Request.Context(), jti, claims.ID))
}
