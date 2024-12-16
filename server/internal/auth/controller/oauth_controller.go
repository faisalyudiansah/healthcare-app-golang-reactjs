package controller

import (
	"net/http"

	"healthcare-app/internal/auth/dto"
	"healthcare-app/internal/auth/usecase"
	"healthcare-app/internal/auth/utils"
	"healthcare-app/pkg/utils/ginutils"

	"github.com/gin-gonic/gin"
	"github.com/markbates/goth/gothic"
)

type OauthController struct {
	oauthUseCase        usecase.OauthUseCase
	refreshTokenUseCase usecase.RefreshTokenUseCase
}

func NewOauthController(
	oauthUseCase usecase.OauthUseCase,
	refreshTokenUseCase usecase.RefreshTokenUseCase,
) *OauthController {
	return &OauthController{
		oauthUseCase:        oauthUseCase,
		refreshTokenUseCase: refreshTokenUseCase,
	}
}

func (c *OauthController) Login(ctx *gin.Context) {
	provider := ctx.Param("provider")

	q := ctx.Request.URL.Query()
	q.Add("provider", provider)
	ctx.Request.URL.RawQuery = q.Encode()

	gothic.BeginAuthHandler(ctx.Writer, ctx.Request)
}

func (c *OauthController) Callback(ctx *gin.Context) {
	user, err := gothic.CompleteUserAuth(ctx.Writer, ctx.Request)
	if err != nil {
		ctx.Error(err)
		return
	}

	res, err := c.oauthUseCase.Login(ctx, &user)
	if err != nil {
		ctx.Error(err)
		return
	}

	ctx.SetCookie("access_token", res.AccessToken, 604800, "/", "", false, false)
	ctx.Redirect(http.StatusFound, "http://localhost:5173/")
}

func (c *OauthController) Logout(ctx *gin.Context) {
	provider := ctx.Param("provider")

	q := ctx.Request.URL.Query()
	q.Add("provider", provider)
	ctx.Request.URL.RawQuery = q.Encode()

	if err := gothic.Logout(ctx.Writer, ctx.Request); err != nil {
		ctx.Error(err)
		return
	}

	if err := c.refreshTokenUseCase.Delete(ctx, &dto.DeleteRefreshTokenRequest{JTI: utils.GetJTIFromToken(ctx)}); err != nil {
		ctx.Error(err)
		return
	}
	ginutils.ResponseOKPlain(ctx)
}
