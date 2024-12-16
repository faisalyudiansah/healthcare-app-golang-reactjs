package controller

import (
	"healthcare-app/internal/auth/dto"
	"healthcare-app/internal/auth/usecase"
	"healthcare-app/internal/auth/utils"
	"healthcare-app/pkg/utils/ginutils"

	"github.com/gin-gonic/gin"
)

type RefreshTokenController struct {
	refreshTokenUseCase usecase.RefreshTokenUseCase
}

func NewRefreshTokenController(refreshTokenUseCase usecase.RefreshTokenUseCase) *RefreshTokenController {
	return &RefreshTokenController{
		refreshTokenUseCase: refreshTokenUseCase,
	}
}

func (c *RefreshTokenController) Logout(ctx *gin.Context) {
	req := &dto.DeleteRefreshTokenRequest{JTI: utils.GetJTIFromToken(ctx)}
	if err := c.refreshTokenUseCase.Delete(ctx, req); err != nil {
		ctx.Error(err)
		return
	}
	ginutils.ResponseOKPlain(ctx)
}
