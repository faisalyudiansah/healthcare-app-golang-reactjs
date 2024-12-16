package controller

import (
	"strconv"

	"healthcare-app/internal/auth/utils"
	"healthcare-app/internal/pharmacy/dto"
	appErrorProfile "healthcare-app/internal/profile/apperror"
	dtoProfile "healthcare-app/internal/profile/dto"
	"healthcare-app/internal/profile/usecase"
	"healthcare-app/pkg/utils/ginutils"

	"github.com/gin-gonic/gin"
)

type ProfileController struct {
	profileUseCase usecase.ProfileUseCase
}

func NewProfileController(
	profileUseCase usecase.ProfileUseCase,
) *ProfileController {
	return &ProfileController{
		profileUseCase: profileUseCase,
	}
}

func (pc *ProfileController) GetMyProfile(ctx *gin.Context) {
	myProfile, err := pc.profileUseCase.GetProfile(ctx, utils.GetValueUserIdFromToken(ctx), "all")
	if err != nil {
		ctx.Error(err)
		return
	}
	ginutils.ResponseOK(ctx, myProfile)
}

func (pc *ProfileController) PutMyProfile(ctx *gin.Context) {
	req := new(dtoProfile.RequestPutMyProfile)
	if err := ctx.ShouldBind(req); err != nil {
		ctx.Error(err)
		return
	}
	myProfile, err := pc.profileUseCase.PutMyProfile(ctx, req, utils.GetValueUserIdFromToken(ctx), int64(utils.GetValueRoleUserFromToken(ctx)))
	if err != nil {
		ctx.Error(err)
		return
	}

	ginutils.ResponseOK(ctx, myProfile)
}

func (pc *ProfileController) GetProfileById(ctx *gin.Context) {
	userId, err := strconv.Atoi(ctx.Param("userId"))
	if err != nil || userId <= 0 {
		ctx.Error(appErrorProfile.NewInvalidIdUserProfileError())
		return
	}
	req := &dto.RequestDeletePharmacy{ID: int64(userId)}
	myProfile, err := pc.profileUseCase.GetProfile(ctx, req.ID, "byId")
	if err != nil {
		ctx.Error(err)
		return
	}
	ginutils.ResponseOK(ctx, myProfile)
}
