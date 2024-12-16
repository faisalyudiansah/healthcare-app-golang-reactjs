package usecase

import (
	"context"

	appErrorAuth "healthcare-app/internal/auth/apperror"
	authRepo "healthcare-app/internal/auth/repository"
	appErrorProfile "healthcare-app/internal/profile/apperror"
	dtoProfile "healthcare-app/internal/profile/dto"
	entityProfile "healthcare-app/internal/profile/entity"
	profileRepo "healthcare-app/internal/profile/repository"
	appErrorPkg "healthcare-app/pkg/apperror"
	"healthcare-app/pkg/database/transactor"
)

type AddressUseCase interface {
	PostNewAddress(ctx context.Context, reqBody *dtoProfile.RequestCreateAddress, userId int64) (*dtoProfile.ResponseAddress, error)
	PatchAddressActive(ctx context.Context, idAddress int64, userId int64) (*dtoProfile.ResponseAddress, error)
	GetAllMyAddress(ctx context.Context, userId int64) ([]*dtoProfile.ResponseAddress, error)
	SoftDeleteAddress(ctx context.Context, idAddress int64, userId int64) error
	PutMyAddress(ctx context.Context, reqBody *dtoProfile.RequestPutAddress, idAddress int64, userId int64) (*dtoProfile.ResponseAddress, error)
}

type addressUseCaseImpl struct {
	addressRepo profileRepo.AddressRepository
	userRepo    authRepo.UserRepository
	transactor  transactor.Transactor
}

func NewAddressUseCase(
	addressRepo profileRepo.AddressRepository,
	userRepo authRepo.UserRepository,
	transactor transactor.Transactor,
) *addressUseCaseImpl {
	return &addressUseCaseImpl{
		addressRepo: addressRepo,
		userRepo:    userRepo,
		transactor:  transactor,
	}
}

func (au *addressUseCaseImpl) PostNewAddress(ctx context.Context, reqBody *dtoProfile.RequestCreateAddress, userId int64) (*dtoProfile.ResponseAddress, error) {
	entityAddress := new(entityProfile.Address)
	err := au.transactor.Atomic(ctx, func(cForTx context.Context) error {
		userDb, err := au.userRepo.FindByID(cForTx, userId)
		if err != nil || userDb.ID == 0 {
			return appErrorAuth.NewInvalidUserIdError()
		}
		totalCount, err := au.addressRepo.CountAddressUser(cForTx, userDb.ID)
		if err != nil {
			return appErrorPkg.NewServerError(err)
		}
		if totalCount == 3 {
			return appErrorProfile.NewUserReachMaximumNumberOfAddress()
		}

		existingAddresses, err := au.addressRepo.GetAllAddressesByUserId(cForTx, userDb.ID)
		if err != nil {
			return appErrorPkg.NewServerError(err)
		}
		addressIsUnique := true
		for _, addr := range existingAddresses {
			if addr.Address == reqBody.Address {
				addressIsUnique = false
				break
			}
			if addr.Address == reqBody.Address && (addr.Province == reqBody.Province &&
				addr.City == reqBody.City &&
				addr.District == reqBody.District &&
				addr.SubDistrict == reqBody.SubDistrict) {
				addressIsUnique = false
				break
			}
		}
		if !addressIsUnique {
			return appErrorProfile.NewInvalidAddressAlreadyExistsError()
		}
		dataAddress, err := au.addressRepo.PostNewAddress(cForTx, *reqBody, userId)
		if err != nil {
			return err
		}
		entityAddress = dataAddress
		return nil
	})
	if err != nil {
		return nil, err
	}
	return dtoProfile.ConvertToAddressResponse(entityAddress), nil
}

func (au *addressUseCaseImpl) PatchAddressActive(ctx context.Context, idAddress int64, userId int64) (*dtoProfile.ResponseAddress, error) {
	var updatedAddress *entityProfile.Address

	err := au.transactor.Atomic(ctx, func(cForTx context.Context) error {
		userDb, err := au.userRepo.FindByID(cForTx, userId)
		if err != nil || userDb.ID == 0 {
			return appErrorPkg.NewForbiddenAccessError()
		}
		address, err := au.addressRepo.FindAddressByID(cForTx, idAddress)
		if err != nil || address.ID == 0 {
			return appErrorProfile.NewInvalidIdAddressError()
		}
		if address.UserId != userId {
			return appErrorPkg.NewForbiddenAccessError()
		}
		err = au.addressRepo.PutAllAddressesInactive(cForTx, userId)
		if err != nil {
			return appErrorPkg.NewServerError(err)
		}
		updatedAddress, err = au.addressRepo.PatchAddressActive(cForTx, idAddress)
		if err != nil {
			return appErrorPkg.NewServerError(err)
		}
		return nil
	})

	if err != nil {
		return nil, err
	}

	return dtoProfile.ConvertToAddressResponse(updatedAddress), nil
}

func (au *addressUseCaseImpl) GetAllMyAddress(ctx context.Context, userId int64) ([]*dtoProfile.ResponseAddress, error) {
	var addresses = []*entityProfile.Address{}

	err := au.transactor.Atomic(ctx, func(cForTx context.Context) error {
		userDb, err := au.userRepo.FindByID(cForTx, userId)
		if err != nil || userDb.ID == 0 {
			return appErrorPkg.NewForbiddenAccessError()
		}

		dataAddresses, err := au.addressRepo.GetAllAddressesByUserId(cForTx, userId)
		if err != nil {
			return appErrorPkg.NewServerError(err)
		}

		addresses = dataAddresses
		return nil
	})

	if err != nil {
		return nil, err
	}

	return dtoProfile.ConvertToAddressResponses(addresses), nil
}

func (au *addressUseCaseImpl) SoftDeleteAddress(ctx context.Context, idAddress int64, userId int64) error {
	return au.transactor.Atomic(ctx, func(cForTx context.Context) error {
		userDb, err := au.userRepo.FindByID(cForTx, userId)
		if err != nil || userDb.ID == 0 {
			return appErrorPkg.NewForbiddenAccessError()
		}
		address, err := au.addressRepo.FindAddressByID(cForTx, idAddress)
		if err != nil || address.ID == 0 {
			return appErrorProfile.NewInvalidIdAddressError()
		}
		if address.UserId != userId {
			return appErrorPkg.NewForbiddenAccessError()
		}
		err = au.addressRepo.SoftDeleteAddressByID(cForTx, idAddress)
		if err != nil {
			return appErrorProfile.NewInvalidAddressNotFoundError()
		}
		return nil
	})
}

func (au *addressUseCaseImpl) PutMyAddress(ctx context.Context, reqBody *dtoProfile.RequestPutAddress, idAddress int64, userId int64) (*dtoProfile.ResponseAddress, error) {
	var updatedAddress *entityProfile.Address
	err := au.transactor.Atomic(ctx, func(cForTx context.Context) error {
		userDb, err := au.userRepo.FindByID(cForTx, userId)
		if err != nil || userDb.ID == 0 {
			return appErrorPkg.NewForbiddenAccessError()
		}
		address, err := au.addressRepo.FindAddressByID(cForTx, idAddress)
		if err != nil || address.ID == 0 {
			return appErrorProfile.NewInvalidIdAddressError()
		}
		if address.UserId != userId {
			return appErrorPkg.NewForbiddenAccessError()
		}
		existingAddresses, err := au.addressRepo.GetAllAddressesByUserId(cForTx, userDb.ID)
		if err != nil {
			return appErrorPkg.NewServerError(err)
		}
		addressIsUnique := true
		for _, addr := range existingAddresses {
			if idAddress != addr.ID {
				if addr.Address == reqBody.Address &&
					addr.Province == reqBody.Province &&
					addr.City == reqBody.City &&
					addr.District == reqBody.District &&
					addr.SubDistrict == reqBody.SubDistrict {
					addressIsUnique = false
				}
			}
		}
		if !addressIsUnique {
			return appErrorProfile.NewInvalidAddressAlreadyExistsError()
		}
		updatedAddress, err = au.addressRepo.PutMyAddress(cForTx, reqBody, idAddress)
		if err != nil {
			return appErrorPkg.NewServerError(err)
		}

		return nil
	})

	if err != nil {
		return nil, err
	}

	return dtoProfile.ConvertToAddressResponse(updatedAddress), nil
}
