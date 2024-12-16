package controller

import (
	"healthcare-app/internal/auth/dto"
	"healthcare-app/internal/auth/usecase"
	"healthcare-app/pkg/utils/ginutils"

	"github.com/gin-gonic/gin"
)

type UserController struct {
	userUseCase usecase.UserUseCase
}

func NewUserController(userUseCase usecase.UserUseCase) *UserController {
	return &UserController{
		userUseCase: userUseCase,
	}
}

func (c *UserController) Login(ctx *gin.Context) {
	req := new(dto.RequestUserLogin)
	if err := ctx.ShouldBindJSON(req); err != nil {
		ctx.Error(err)
		return
	}

	res, err := c.userUseCase.Login(ctx, req)
	if err != nil {
		ctx.Error(err)
		return
	}

	ginutils.ResponseOK(ctx, res)
}

func (c *UserController) Register(ctx *gin.Context) {
	req := new(dto.RequestUserRegister)
	if err := ctx.ShouldBindJSON(req); err != nil {
		ctx.Error(err)
		return
	}
	res, err := c.userUseCase.Register(ctx, req)
	if err != nil {
		ctx.Error(err)
		return
	}
	if err := c.userUseCase.SendVerification(ctx, &dto.RequestUserSendVerification{Email: res.Email}); err != nil {
		ctx.Error(err)
		return
	}

	ginutils.ResponseCreated(ctx, res)
}

func (c *UserController) SendVerification(ctx *gin.Context) {
	req := new(dto.RequestUserSendVerification)
	if err := ctx.ShouldBindJSON(req); err != nil {
		ctx.Error(err)
		return
	}

	if err := c.userUseCase.SendVerification(ctx, req); err != nil {
		ctx.Error(err)
		return
	}

	ginutils.ResponseOKPlain(ctx)
}

func (c *UserController) VerifyAccount(ctx *gin.Context) {
	req := new(dto.RequestUserVerifyAccount)
	if err := ctx.ShouldBindJSON(req); err != nil {
		ctx.Error(err)
		return
	}

	if err := c.userUseCase.VerifyAccount(ctx, req); err != nil {
		ctx.Error(err)
		return
	}

	ginutils.ResponseOKPlain(ctx)
}

func (c *UserController) ForgotPassword(ctx *gin.Context) {
	req := new(dto.RequestUserForgotPassword)
	if err := ctx.ShouldBindJSON(req); err != nil {
		ctx.Error(err)
		return
	}

	if err := c.userUseCase.ForgotPassword(ctx, req); err != nil {
		ctx.Error(err)
		return
	}

	ginutils.ResponseCreatedPlain(ctx)
}

func (c *UserController) ResetPassword(ctx *gin.Context) {
	req := new(dto.RequestUserResetPassword)
	if err := ctx.ShouldBindJSON(req); err != nil {
		ctx.Error(err)
		return
	}

	if err := c.userUseCase.ResetPassword(ctx, req); err != nil {
		ctx.Error(err)
		return
	}

	ginutils.ResponseOKPlain(ctx)
}
