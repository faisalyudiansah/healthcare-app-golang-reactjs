package controller_test

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"healthcare-app/internal/auth/controller"
	dtoAuth "healthcare-app/internal/auth/dto"
	"healthcare-app/internal/auth/mocks"
	utilPkg "healthcare-app/internal/auth/utils"
	"healthcare-app/internal/gateway/server"
	constantPkg "healthcare-app/pkg/constant"
	dtoPkg "healthcare-app/pkg/dto"
	"healthcare-app/pkg/middleware"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

func TestAdminControllerCreateAccountPharmacist(t *testing.T) {
	type fields struct {
		adminUseCase *mocks.AdminUseCase
	}
	tests := []struct {
		name     string
		body     *dtoAuth.RequestPharmacistCreateAccount
		wantRes  *dtoPkg.WebResponse[*dtoAuth.ResponsePharmacistCreateAccount]
		wantCode int
		mockFn   func(ctx *gin.Context, f fields)
	}{
		{
			name: "success register pharmacist account",
			body: &dtoAuth.RequestPharmacistCreateAccount{
				Email:             "pawrmaesi32@gmail.com",
				Fullname:          "abang frieren",
				SipaNumber:        "akakakak",
				WhatsappNumber:    "0892020290403",
				YearsOfExperience: 2,
			},
			wantRes: &dtoPkg.WebResponse[*dtoAuth.ResponsePharmacistCreateAccount]{
				Message: constantPkg.ResponseSuccessMessage,
				Data: &dtoAuth.ResponsePharmacistCreateAccount{
					Email:      "pawrmaesi32@gmail.com",
					RoleId:     2,
					Role:       "pharmacist",
					Fullname:   "abang frieren",
					SipaNumber: "akakakak",
					ImageUrl:   "akakakak",
					CreatedAt:  time.Time{},
				},
			},
			wantCode: http.StatusCreated,
			mockFn: func(ctx *gin.Context, f fields) {
				f.adminUseCase.On("CreateAccountPharmacist", ctx, mock.Anything, utilPkg.GetValueRoleUserFromToken(ctx)).
					Return(&dtoAuth.ResponsePharmacistCreateAccount{
						Email:      "pawrmaesi32@gmail.com",
						RoleId:     2,
						Role:       "pharmacist",
						Fullname:   "abang frieren",
						SipaNumber: "akakakak",
						ImageUrl:   "akakakak",
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
				adminUseCase: mocks.NewAdminUseCase(t),
			}
			adminController := controller.NewAdminController(mockDep.adminUseCase)

			w := httptest.NewRecorder()
			ctx, _ := gin.CreateTestContext(w)
			bodyJson, _ := json.Marshal(tt.body)
			r := httptest.NewRequest(http.MethodPost, "/auth/admin/pharmacists", strings.NewReader(string(bodyJson)))
			ctx.Request = r

			tt.mockFn(ctx, mockDep)
			adminController.CreateAccount(ctx)
			middleware.ErrorHandler()(ctx)
			res := &dtoPkg.WebResponse[*dtoAuth.ResponsePharmacistCreateAccount]{}
			json.NewDecoder(w.Body).Decode(res)

			assert.Equal(t, tt.wantCode, w.Result().StatusCode)
			assert.Equal(t, tt.wantRes, res)
			mockDep.adminUseCase.AssertExpectations(t)
		})
	}
}
