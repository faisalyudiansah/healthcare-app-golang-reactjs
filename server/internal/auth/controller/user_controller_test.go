package controller_test

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	apperrorAuth "healthcare-app/internal/auth/apperror"
	constantAuth "healthcare-app/internal/auth/constant"
	"healthcare-app/internal/auth/controller"
	dtoAuth "healthcare-app/internal/auth/dto"
	"healthcare-app/internal/auth/mocks"
	"healthcare-app/internal/gateway/server"
	apperrorPkg "healthcare-app/pkg/apperror"
	constantPkg "healthcare-app/pkg/constant"
	dtoPkg "healthcare-app/pkg/dto"
	"healthcare-app/pkg/middleware"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

func TestUserControllerLogin(t *testing.T) {
	type fields struct {
		userUseCase *mocks.UserUseCase
	}

	tests := []struct {
		name     string
		body     *dtoAuth.RequestUserLogin
		wantRes  *dtoPkg.WebResponse[*dtoAuth.ResponseLogin]
		wantCode int
		mockFn   func(ctx *gin.Context, f fields)
	}{
		{
			name: "error all field is required",
			body: &dtoAuth.RequestUserLogin{},
			wantRes: &dtoPkg.WebResponse[*dtoAuth.ResponseLogin]{
				Message: constantPkg.ValidationErrorMessage,
				Errors: []dtoPkg.FieldError{
					{
						Field:   "email",
						Message: "email is required",
					},
					{
						Field:   "password",
						Message: "password is required",
					},
				},
			},
			wantCode: http.StatusBadRequest,
			mockFn:   func(ctx *gin.Context, f fields) {},
		},
		{
			name: "error invalid email format",
			body: &dtoAuth.RequestUserLogin{
				Email:    "habi",
				Password: "secret",
			},
			wantRes: &dtoPkg.WebResponse[*dtoAuth.ResponseLogin]{
				Message: constantPkg.ValidationErrorMessage,
				Errors: []dtoPkg.FieldError{
					{
						Field:   "email",
						Message: "email has invalid email format",
					},
				},
			},
			wantCode: http.StatusBadRequest,
			mockFn:   func(ctx *gin.Context, f fields) {},
		},
		{
			name: "error server",
			body: &dtoAuth.RequestUserLogin{
				Email:    "habi@gmail.com",
				Password: "secret",
			},
			wantRes: &dtoPkg.WebResponse[*dtoAuth.ResponseLogin]{
				Message: constantPkg.InternalServerErrorMessage,
			},
			wantCode: http.StatusInternalServerError,
			mockFn: func(ctx *gin.Context, f fields) {
				f.userUseCase.On("Login", ctx, mock.Anything).
					Return(nil, apperrorPkg.NewServerError(nil))
			},
		},
		{
			name: "error unverified account",
			body: &dtoAuth.RequestUserLogin{
				Email:    "habi@gmail.com",
				Password: "secret",
			},
			wantRes: &dtoPkg.WebResponse[*dtoAuth.ResponseLogin]{
				Message: constantAuth.UnverifiedErrorMessage,
			},
			wantCode: http.StatusForbidden,
			mockFn: func(ctx *gin.Context, f fields) {
				f.userUseCase.On("Login", ctx, mock.Anything).
					Return(nil, apperrorAuth.NewUnverifiedError())
			},
		},
		{
			name: "success login",
			body: &dtoAuth.RequestUserLogin{
				Email:    "habi@gmail.com",
				Password: "secret",
			},
			wantRes: &dtoPkg.WebResponse[*dtoAuth.ResponseLogin]{
				Message: constantPkg.ResponseSuccessMessage,
				Data: &dtoAuth.ResponseLogin{
					AccessToken: "ini token bro",
				},
			},
			wantCode: http.StatusOK,
			mockFn: func(ctx *gin.Context, f fields) {
				f.userUseCase.On("Login", ctx, mock.Anything).
					Return(&dtoAuth.ResponseLogin{
						AccessToken: "ini token bro",
					}, nil)
			},
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			gin.SetMode(gin.TestMode)
			server.RegisterValidators()
			mockDep := fields{
				userUseCase: mocks.NewUserUseCase(t),
			}
			userController := controller.NewUserController(mockDep.userUseCase)

			w := httptest.NewRecorder()
			ctx, _ := gin.CreateTestContext(w)
			bodyJson, _ := json.Marshal(tt.body)
			r := httptest.NewRequest(http.MethodPost, "/auth/login", strings.NewReader(string(bodyJson)))
			ctx.Request = r

			tt.mockFn(ctx, mockDep)
			userController.Login(ctx)
			middleware.ErrorHandler()(ctx)
			res := &dtoPkg.WebResponse[*dtoAuth.ResponseLogin]{}
			json.NewDecoder(w.Body).Decode(res)

			assert.Equal(t, tt.wantCode, w.Result().StatusCode)
			assert.Equal(t, tt.wantRes, res)
			mockDep.userUseCase.AssertExpectations(t)
		})
	}
}

func TestUserControllerRegister(t *testing.T) {
	type fields struct {
		userUseCase *mocks.UserUseCase
	}
	tests := []struct {
		name     string
		body     *dtoAuth.RequestUserRegister
		wantRes  *dtoPkg.WebResponse[*dtoAuth.ResponseRegister]
		wantCode int
		mockFn   func(ctx *gin.Context, f fields)
	}{
		{
			name: "error all field is required",
			body: &dtoAuth.RequestUserRegister{},
			wantRes: &dtoPkg.WebResponse[*dtoAuth.ResponseRegister]{
				Message: constantPkg.ValidationErrorMessage,
				Errors: []dtoPkg.FieldError{
					{
						Field:   "email",
						Message: "email is required",
					},
					{
						Field:   "password",
						Message: "password is required",
					},
				},
			},
			wantCode: http.StatusBadRequest,
			mockFn:   func(ctx *gin.Context, f fields) {},
		},
		{
			name: "error invalid email format",
			body: &dtoAuth.RequestUserRegister{
				Email:    "habi",
				Password: "secret",
			},
			wantRes: &dtoPkg.WebResponse[*dtoAuth.ResponseRegister]{
				Message: constantPkg.ValidationErrorMessage,
				Errors: []dtoPkg.FieldError{
					{
						Field:   "email",
						Message: "email has invalid email format",
					},
					{
						Field:   "password",
						Message: "password must contain at least 8 characters including 1 number, 1 special character, and 1 capital letter excluding whitespaces",
					},
				},
			},
			wantCode: http.StatusBadRequest,
			mockFn:   func(ctx *gin.Context, f fields) {},
		},
		{
			name: "error server",
			body: &dtoAuth.RequestUserRegister{
				Email:    "habi@gmail.com",
				Password: "LAOAOecret3636$$kek1010",
			},
			wantRes: &dtoPkg.WebResponse[*dtoAuth.ResponseRegister]{
				Message: constantPkg.InternalServerErrorMessage,
			},
			wantCode: http.StatusInternalServerError,
			mockFn: func(ctx *gin.Context, f fields) {
				f.userUseCase.On("Register", ctx, mock.Anything).
					Return(nil, apperrorPkg.NewServerError(nil))
			},
		},
		{
			name: "success register",
			body: &dtoAuth.RequestUserRegister{
				Email:    "habi@gmail.com",
				Password: "LAOAOecret3636$$kek1010",
			},
			wantRes: &dtoPkg.WebResponse[*dtoAuth.ResponseRegister]{
				Message: constantPkg.ResponseSuccessMessage,
				Data: &dtoAuth.ResponseRegister{
					Email:      "habi@gmail.com",
					IsVerified: false,
					RoleId:     1,
					Role:       "user",
					CreatedAt:  time.Time{},
				},
			},
			wantCode: http.StatusCreated,
			mockFn: func(ctx *gin.Context, f fields) {
				f.userUseCase.On("Register", ctx, mock.Anything).
					Return(&dtoAuth.ResponseRegister{
						Email:      "habi@gmail.com",
						IsVerified: false,
						RoleId:     1,
						Role:       "user",
						CreatedAt:  time.Time{},
					}, nil)
			},
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			gin.SetMode(gin.TestMode)
			server.RegisterValidators()
			mockDep := fields{
				userUseCase: mocks.NewUserUseCase(t),
			}
			userController := controller.NewUserController(mockDep.userUseCase)

			w := httptest.NewRecorder()
			ctx, _ := gin.CreateTestContext(w)
			bodyJson, _ := json.Marshal(tt.body)
			r := httptest.NewRequest(http.MethodPost, "/auth/register", strings.NewReader(string(bodyJson)))
			ctx.Request = r

			tt.mockFn(ctx, mockDep)
			userController.Register(ctx)
			middleware.ErrorHandler()(ctx)
			res := &dtoPkg.WebResponse[*dtoAuth.ResponseRegister]{}
			json.NewDecoder(w.Body).Decode(res)

			assert.Equal(t, tt.wantCode, w.Result().StatusCode)
			assert.Equal(t, tt.wantRes, res)
			mockDep.userUseCase.AssertExpectations(t)
		})
	}
}
