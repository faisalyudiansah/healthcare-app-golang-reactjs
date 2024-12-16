package usecase

import (
	"context"
	"strconv"
	"strings"

	apperrorAuth "healthcare-app/internal/auth/apperror"
	"healthcare-app/internal/auth/constant"
	dtoAuth "healthcare-app/internal/auth/dto"
	"healthcare-app/internal/auth/entity"
	"healthcare-app/internal/auth/repository"
	"healthcare-app/internal/auth/utils"
	"healthcare-app/internal/queue/payload"
	"healthcare-app/internal/queue/tasks"
	apperrorPkg "healthcare-app/pkg/apperror"
	"healthcare-app/pkg/database/transactor"
	dtoPkg "healthcare-app/pkg/dto"
	"healthcare-app/pkg/utils/encryptutils"
	"healthcare-app/pkg/utils/pageutils"
	"healthcare-app/pkg/utils/randutils"
	"healthcare-app/pkg/utils/smtputils"
)

type AdminUseCase interface {
	SearchUser(ctx context.Context, request *dtoAuth.SearchUserRequest) ([]*dtoAuth.UserOrAdminResponse, *dtoPkg.SeekPageMetaData, error)
	SearchPharmacist(ctx context.Context, request *dtoAuth.SearchPharmacistRequest) ([]*dtoAuth.UserPharmacistResponse, *dtoPkg.PageMetaData, error)
	CreateAccountPharmacist(ctx context.Context, reqBody *dtoAuth.RequestPharmacistCreateAccount, roleId int) error
	GetAllAccount(ctx context.Context, roleId int, query string, isAssign int, role int, sortBy string, sort string, limit int, offset int) ([]dtoAuth.ResponseUserWithDetail, int64, error)
	UpdateAccount(ctx context.Context, pharmacist *dtoAuth.RequestPharmacistUpdateAccount) (*dtoAuth.ResponsePharmacistUpdateAccount, error)
	DeleteAccount(ctx context.Context, pharmacist *dtoAuth.RequestPharmacistDeleteAccount) error
	GetPharmacistByID(ctx context.Context, pharmacistID int64) (*dtoAuth.ResponseUserWithDetail, error)
}

type adminUseCaseImpl struct {
	smtpUtil          smtputils.SMTPUtils
	passwordEncryptor encryptutils.PasswordEncryptor
	emailTask         tasks.EmailTask
	adminRepo         repository.AdminRepository
	transactor        transactor.Transactor
	userRepo          repository.UserRepository
}

func NewAdminUseCase(
	smtpUtil smtputils.SMTPUtils,
	passwordEncryptor encryptutils.PasswordEncryptor,
	emailTask tasks.EmailTask,
	adminRepo repository.AdminRepository,
	transactor transactor.Transactor,
	userRepo repository.UserRepository,
) *adminUseCaseImpl {
	return &adminUseCaseImpl{
		smtpUtil:          smtpUtil,
		passwordEncryptor: passwordEncryptor,
		emailTask:         emailTask,
		adminRepo:         adminRepo,
		transactor:        transactor,
		userRepo:          userRepo,
	}
}

func (u *adminUseCaseImpl) SearchUser(ctx context.Context, request *dtoAuth.SearchUserRequest) ([]*dtoAuth.UserOrAdminResponse, *dtoPkg.SeekPageMetaData, error) {
	users, err := u.adminRepo.SearchUser(ctx, request)
	if err != nil {
		return nil, nil, apperrorPkg.NewServerError(err)
	}
	itemLen := int64(len(users))
	if itemLen >= request.Limit {
		users = users[:request.Limit]
	}

	last := ""
	if len(users) != 0 {
		last = strconv.Itoa(int(users[len(users)-1].ID))
	}

	metaData := pageutils.CreateSeekMetaData(itemLen, request.Limit, last)
	return dtoAuth.ConvertToUserOrAdminResponses(users[:]), metaData, nil
}

func (u *adminUseCaseImpl) SearchPharmacist(ctx context.Context, request *dtoAuth.SearchPharmacistRequest) ([]*dtoAuth.UserPharmacistResponse, *dtoPkg.PageMetaData, error) {
	allowedSort := []string{}
	allowedDir := []string{}
	for i, s := range request.SortBy {
		ord, ok := constant.AdminAllowedSorts[strings.ToLower(s)]
		if !ok {
			continue
		}

		dir := ""
		if len(request.Sort) > i {
			dir = request.Sort[i]
		}
		_, ok = constant.AllowedOrderDir[strings.ToLower(dir)]
		if !ok {
			dir = "asc"
		}
		allowedSort = append(allowedSort, ord)
		allowedDir = append(allowedDir, dir)
	}
	if len(request.SortBy) == 0 {
		allowedSort = append(allowedSort, "u.created_at")
		allowedDir = append(allowedDir, "desc")
	}
	request.Sort = allowedDir
	request.SortBy = allowedSort

	pharmacists, err := u.adminRepo.SearchPharmacist(ctx, request)
	if err != nil {
		return nil, nil, apperrorPkg.NewServerError(err)
	}

	res, metaData := pageutils.CreateMetaData(pharmacists, request.Page, request.Limit)
	return dtoAuth.ConvertToUserPharmacistResponses(res), metaData, nil
}

func (u *adminUseCaseImpl) CreateAccountPharmacist(ctx context.Context, reqBody *dtoAuth.RequestPharmacistCreateAccount, roleId int) error {
	entityUser := new(entity.User)
	entityUserDetail := new(entity.UserDetail)

	password := randutils.GenerateRandomString(12)
	err := u.transactor.Atomic(ctx, func(cForTx context.Context) error {
		checkEmail, err := u.userRepo.FindByEmail(cForTx, reqBody.Email)
		if err != nil {
			return apperrorPkg.NewServerError(err)
		}
		if checkEmail != nil {
			return apperrorAuth.NewInvalidEmailAlreadyExists(nil)
		}
		checkSipa, err := u.userRepo.FindBySIPA(cForTx, reqBody.SipaNumber)
		if err != nil {
			return apperrorAuth.NewInvalidSipaNumberAlreadyExists()
		}
		if checkSipa != 0 {
			return apperrorAuth.NewInvalidSipaNumberAlreadyExists()
		}
		checkWaNumber, err := u.userRepo.FindByWhatsappNumber(cForTx, reqBody.WhatsappNumber)
		if err != nil {
			return apperrorAuth.NewInvalidWaNumberAlreadyExists()
		}
		if checkWaNumber != 0 {
			return apperrorAuth.NewInvalidWaNumberAlreadyExists()
		}

		hashPassword, err := u.passwordEncryptor.Hash(password)
		if err != nil {
			return apperrorPkg.NewServerError(err)
		}
		dataToUserRepo := dtoAuth.RequestUserRegister{
			Email:    reqBody.Email,
			Password: password,
		}
		user, err := u.userRepo.Save(cForTx, dataToUserRepo, hashPassword, "admin")
		if err != nil {
			return apperrorPkg.NewServerError(err)
		}
		userDetail, err := u.userRepo.SaveUserDetail(cForTx, user.ID, reqBody.Fullname, reqBody.SipaNumber, reqBody.WhatsappNumber, reqBody.YearsOfExperience)
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
		entityUserDetail.ID = userDetail.ID
		entityUserDetail.UserId = userDetail.UserId
		entityUserDetail.Fullname = userDetail.Fullname
		entityUserDetail.SipaNumber = userDetail.SipaNumber
		entityUserDetail.WhatsappNumber = userDetail.WhatsappNumber
		entityUserDetail.YearsOfExperience = userDetail.YearsOfExperience
		entityUserDetail.ImageUrl = userDetail.ImageUrl
		entityUserDetail.CreatedAt = userDetail.CreatedAt
		entityUserDetail.UpdatedAt = userDetail.UpdatedAt
		entityUserDetail.DeletedAt = userDetail.DeletedAt
		return nil
	})
	if err != nil {
		return err
	}

	return u.emailTask.QueuePharmacistAccountEmail(ctx, &payload.PharmacistAccountEmailPayload{
		Name:     *entityUserDetail.Fullname,
		Sipa:     *entityUserDetail.SipaNumber,
		Whatsapp: *entityUserDetail.WhatsappNumber,
		Yoe:      *entityUserDetail.YearsOfExperience,
		Email:    entityUser.Email,
		Password: password,
	})
}

func (u *adminUseCaseImpl) GetAllAccount(ctx context.Context, roleId int, query string, isAssign int, role int, sortBy string, sort string, limit int, offset int) ([]dtoAuth.ResponseUserWithDetail, int64, error) {
	var dataCollect []dtoAuth.ResponseUserWithDetail
	var totalCount int64
	err := u.transactor.Atomic(ctx, func(cForTx context.Context) error {
		totalData, err := u.adminRepo.CountAllAcount(cForTx, query, isAssign, role)
		if err != nil {
			return err
		}
		totalCount = totalData
		dataUsers, err := u.adminRepo.GetAllAccount(cForTx, query, isAssign, role, sortBy, sort, limit, offset)
		if err != nil {
			return err
		}
		for _, data := range dataUsers {
			var userDetail *dtoAuth.ResponseUserDetail
			if data.UserDetail != nil {
				userDetail = &dtoAuth.ResponseUserDetail{
					Id:                *data.UserDetail.ID,
					UserId:            *data.UserDetail.UserId,
					Fullname:          *data.UserDetail.Fullname,
					SipaNumber:        data.UserDetail.SipaNumber,
					WhatsappNumber:    data.UserDetail.WhatsappNumber,
					YearsOfExperience: data.UserDetail.YearsOfExperience,
					ImageUrl:          *data.UserDetail.ImageUrl,
					CreatedAt:         *data.UserDetail.CreatedAt,
					UpdatedAt:         *data.UserDetail.UpdatedAt,
					DeletedAt:         data.UserDetail.DeletedAt,
				}
			}
			responseData := dtoAuth.ResponseUserWithDetail{
				ID:         data.User.ID,
				RoleId:     data.User.Role,
				Role:       utils.SpecifyRole(data.User.Role),
				Email:      data.User.Email,
				IsVerified: data.User.IsVerified,
				CreatedAt:  data.User.CreatedAt,
				UpdatedAt:  data.User.UpdatedAt,
				DeletedAt:  data.User.DeletedAt,
				UserDetail: userDetail,
			}
			dataCollect = append(dataCollect, responseData)
		}
		return nil
	})
	if err != nil {
		return nil, 0, err
	}
	return dataCollect, totalCount, nil
}

func (u *adminUseCaseImpl) UpdateAccount(ctx context.Context, pharmacist *dtoAuth.RequestPharmacistUpdateAccount) (*dtoAuth.ResponsePharmacistUpdateAccount, error) {
	var updatedAccount *entity.UserDetail

	err := u.transactor.Atomic(ctx, func(ctx context.Context) error {
		pharmacistDb, err := u.adminRepo.FindByID(ctx, pharmacist.PharmacistID)
		if err != nil {
			return apperrorPkg.NewServerError(err)
		}
		if pharmacistDb == nil {
			return apperrorPkg.NewEntityNotFoundError("pharmacist ID")
		}

		if pharmacist.WhatsappNumber != nil {
			pharmacistDb.WhatsappNumber = pharmacist.WhatsappNumber
		}
		if pharmacist.YearsOfExperience != nil {
			pharmacistDb.YearsOfExperience = pharmacist.YearsOfExperience
		}

		checkWaNumber, err := u.userRepo.FindByWhatsappNumber(ctx, *pharmacistDb.WhatsappNumber)
		if checkWaNumber != 0 && checkWaNumber != *pharmacistDb.UserId {
			return apperrorAuth.NewInvalidWaNumberAlreadyExists()
		}
		if err != nil {
			return apperrorPkg.NewServerError(err)
		}

		err = u.adminRepo.UpdateAccount(ctx, pharmacistDb)
		if err != nil {
			return apperrorPkg.NewServerError(err)
		}

		updatedAccount = pharmacistDb

		return nil
	})

	if err != nil {
		return nil, err
	}

	return &dtoAuth.ResponsePharmacistUpdateAccount{
		PharmacistID:      *updatedAccount.UserId,
		Fullname:          *updatedAccount.Fullname,
		SipaNumber:        *updatedAccount.SipaNumber,
		WhatsappNumber:    *updatedAccount.WhatsappNumber,
		YearsOfExperience: *updatedAccount.YearsOfExperience,
	}, nil
}

func (u *adminUseCaseImpl) DeleteAccount(ctx context.Context, pharmacist *dtoAuth.RequestPharmacistDeleteAccount) error {
	err := u.transactor.Atomic(ctx, func(ctx context.Context) error {
		pharmacistDb, err := u.adminRepo.FindByID(ctx, pharmacist.PharmacistID)
		if err != nil {
			return apperrorPkg.NewServerError(err)
		}

		if pharmacistDb == nil {
			return apperrorPkg.NewEntityNotFoundError("pharmacist ID")
		}

		isAssigned, err := u.adminRepo.IsPharmacistAssign(ctx, *pharmacistDb.UserId)
		if err != nil {
			return apperrorPkg.NewServerError(err)
		}

		if isAssigned {
			return apperrorAuth.NewPharmacistAssignedError()
		}

		err = u.adminRepo.DeleteAccount(ctx, *pharmacistDb.UserId)
		if err != nil {
			return apperrorPkg.NewServerError(err)
		}

		return nil
	})

	if err != nil {
		return err
	}

	return nil
}

func (u *adminUseCaseImpl) GetPharmacistByID(ctx context.Context, pharmacistID int64) (*dtoAuth.ResponseUserWithDetail, error) {
	var res *dtoAuth.ResponseUserWithDetail
	err := u.transactor.Atomic(ctx, func(cForTx context.Context) error {
		dataUser, err := u.adminRepo.GetPharmacistByID(cForTx, pharmacistID)
		if err != nil {
			return apperrorPkg.NewServerError(err)
		}
		if dataUser == nil {
			return apperrorAuth.NewInvalidPharmacistIdDoesNotExistsError(pharmacistID)
		}
		var userDetail *dtoAuth.ResponseUserDetail
		if dataUser.UserDetail != nil {
			userDetail = &dtoAuth.ResponseUserDetail{
				Id:                *dataUser.UserDetail.ID,
				UserId:            *dataUser.UserDetail.UserId,
				Fullname:          *dataUser.UserDetail.Fullname,
				SipaNumber:        dataUser.UserDetail.SipaNumber,
				WhatsappNumber:    dataUser.UserDetail.WhatsappNumber,
				YearsOfExperience: dataUser.UserDetail.YearsOfExperience,
				ImageUrl:          *dataUser.UserDetail.ImageUrl,
				CreatedAt:         *dataUser.UserDetail.CreatedAt,
				UpdatedAt:         *dataUser.UserDetail.UpdatedAt,
				DeletedAt:         dataUser.UserDetail.DeletedAt,
			}
		}
		res = &dtoAuth.ResponseUserWithDetail{
			ID:         dataUser.User.ID,
			RoleId:     dataUser.User.Role,
			Role:       utils.SpecifyRole(dataUser.User.Role),
			Email:      dataUser.User.Email,
			IsVerified: dataUser.User.IsVerified,
			CreatedAt:  dataUser.User.CreatedAt,
			UpdatedAt:  dataUser.User.UpdatedAt,
			DeletedAt:  dataUser.User.DeletedAt,
			UserDetail: userDetail,
		}
		return nil
	})
	if err != nil {
		return nil, err
	}

	return res, nil
}
