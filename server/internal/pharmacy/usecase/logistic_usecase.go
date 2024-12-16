package usecase

import (
	"context"
	"strconv"

	dtoPharmacy "healthcare-app/internal/pharmacy/dto"
	"healthcare-app/internal/pharmacy/repository"
	apperrorPkg "healthcare-app/pkg/apperror"
	"healthcare-app/pkg/database/transactor"
	dtoPkg "healthcare-app/pkg/dto"
	"healthcare-app/pkg/utils/pageutils"
)

type LogisticUseCase interface {
	Search(ctx context.Context, request *dtoPharmacy.SearchLogisticRequest) ([]*dtoPharmacy.LogisticResponse, *dtoPkg.SeekPageMetaData, error)
	Get(ctx context.Context, request *dtoPharmacy.GetLogisticRequest) (*dtoPharmacy.LogisticResponse, error)
}

type logisticUseCaseImpl struct {
	logisticRepository repository.LogisticRepository
	transactor         transactor.Transactor
}

func NewLogisticUseCase(
	logisticRepository repository.LogisticRepository,
	transactor transactor.Transactor,
) *logisticUseCaseImpl {
	return &logisticUseCaseImpl{
		logisticRepository: logisticRepository,
		transactor:         transactor,
	}
}

func (u *logisticUseCaseImpl) Search(ctx context.Context, request *dtoPharmacy.SearchLogisticRequest) ([]*dtoPharmacy.LogisticResponse, *dtoPkg.SeekPageMetaData, error) {
	logistics, err := u.logisticRepository.Search(ctx, request)
	if err != nil {
		return nil, nil, apperrorPkg.NewServerError(err)
	}
	itemLen := int64(len(logistics))
	if itemLen >= request.Limit {
		logistics = logistics[:request.Limit]
	}

	last := ""
	if len(logistics) != 0 {
		last = strconv.Itoa(int(logistics[len(logistics)-1].ID))
	}
	metaData := pageutils.CreateSeekMetaData(itemLen, request.Limit, last)

	return dtoPharmacy.ConvertToLogisticResponses(logistics), metaData, nil
}

func (u *logisticUseCaseImpl) Get(ctx context.Context, request *dtoPharmacy.GetLogisticRequest) (*dtoPharmacy.LogisticResponse, error) {
	logistic, err := u.logisticRepository.FindByID(ctx, request.ID)
	if err != nil || logistic == nil {
		return nil, err
	}
	return dtoPharmacy.ConvertToLogisticResponse(logistic), nil
}
