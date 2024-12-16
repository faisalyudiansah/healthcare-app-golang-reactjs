package usecase

import (
	"context"

	"healthcare-app/internal/pharmacy/entity"
	"healthcare-app/internal/pharmacy/repository"
	"healthcare-app/pkg/apperror"
	"healthcare-app/pkg/database/transactor"
)

type PartnerChangeUseCase interface {
	ApplyChanges(ctx context.Context) error
}

type partnerChangeUseCaseImpl struct {
	partnerChangeRepo repository.PartnerChangeRepository
	partnerRepo       repository.PartnerRepository
	transactor        transactor.Transactor
}

func NewPartnerChangeUseCase(
	partnerChangeRepo repository.PartnerChangeRepository,
	partnerRepo repository.PartnerRepository,
	transactor transactor.Transactor,
) *partnerChangeUseCaseImpl {
	return &partnerChangeUseCaseImpl{
		partnerChangeRepo: partnerChangeRepo,
		partnerRepo:       partnerRepo,
		transactor:        transactor,
	}
}

func (u *partnerChangeUseCaseImpl) ApplyChanges(ctx context.Context) error {
	err := u.transactor.Atomic(ctx, func(txCtx context.Context) error {
		changes, err := u.partnerChangeRepo.FindAll(txCtx)
		if err != nil {
			return apperror.NewServerError(err)
		}

		for _, change := range changes {
			if err := u.partnerRepo.UpdateOperational(txCtx, &entity.Partner{ID: change.PartnerID, ActiveDays: change.ActiveDays, StartOpt: change.StartOpt, EndOpt: change.EndOpt}); err != nil {
				return err
			}
		}

		if err := u.partnerChangeRepo.DeleteAll(txCtx); err != nil {
			return apperror.NewServerError(err)
		}
		return nil
	})

	return err
}
