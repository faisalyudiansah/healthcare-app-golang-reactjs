package usecase

import (
	"context"
	"fmt"
	"os"
	"strconv"

	apperrorPharmacy "healthcare-app/internal/pharmacy/apperror"
	dtoPharmacy "healthcare-app/internal/pharmacy/dto"
	"healthcare-app/internal/pharmacy/entity"
	"healthcare-app/internal/pharmacy/repository"
	apperrorPkg "healthcare-app/pkg/apperror"
	"healthcare-app/pkg/database/transactor"
	dtoPkg "healthcare-app/pkg/dto"
	"healthcare-app/pkg/utils/csvutils"
	"healthcare-app/pkg/utils/pageutils"
)

type PharmacyUseCase interface {
	Search(ctx context.Context, request *dtoPharmacy.SearchPharmacyRequest) ([]*dtoPharmacy.ResponsePharmacy, *dtoPkg.SeekPageMetaData, error)
	Get(ctx context.Context, request *dtoPharmacy.GetPharmacyRequest) (*dtoPharmacy.PharmacyDetailResponse, error)
	Create(ctx context.Context, request *dtoPharmacy.RequestCreatePharmacy) (*dtoPharmacy.ResponsePharmacy, error)
	Update(ctx context.Context, request *dtoPharmacy.RequestUpdatePharmacy) (*dtoPharmacy.ResponsePharmacy, error)
	Delete(ctx context.Context, request *dtoPharmacy.RequestDeletePharmacy) error
	DownloadMedicines(ctx context.Context, request *dtoPharmacy.DownloadMedicineRequest) (*os.File, error)
}

type pharmacyUseCaseImpl struct {
	pharmacyRepo repository.PharmacyRepository
	transactor   transactor.Transactor
}

func NewPharmacyUseCase(
	pharmacyRepo repository.PharmacyRepository,
	transactor transactor.Transactor,
) *pharmacyUseCaseImpl {
	return &pharmacyUseCaseImpl{
		pharmacyRepo: pharmacyRepo,
		transactor:   transactor,
	}
}

func (u *pharmacyUseCaseImpl) Search(ctx context.Context, request *dtoPharmacy.SearchPharmacyRequest) ([]*dtoPharmacy.ResponsePharmacy, *dtoPkg.SeekPageMetaData, error) {
	pharmacies, err := u.pharmacyRepo.Search(ctx, request)
	if err != nil {
		return nil, nil, apperrorPkg.NewServerError(err)
	}
	itemLen := int64(len(pharmacies))
	if itemLen >= request.Limit {
		pharmacies = pharmacies[:request.Limit]
	}

	last := ""
	if len(pharmacies) != 0 {
		last = strconv.Itoa(int(pharmacies[len(pharmacies)-1].ID))
	}
	metaData := pageutils.CreateSeekMetaData(itemLen, request.Limit, last)

	return dtoPharmacy.ConvertToPharmacyResponses(pharmacies), metaData, nil
}

func (u *pharmacyUseCaseImpl) Get(ctx context.Context, request *dtoPharmacy.GetPharmacyRequest) (*dtoPharmacy.PharmacyDetailResponse, error) {
	pharmacy, err := u.pharmacyRepo.FindByID(ctx, request.ID)
	if err != nil {
		return nil, err
	}
	return dtoPharmacy.ConvertToPharmacyDetailResponse(pharmacy), nil
}

func (u *pharmacyUseCaseImpl) Create(ctx context.Context, request *dtoPharmacy.RequestCreatePharmacy) (*dtoPharmacy.ResponsePharmacy, error) {
	pharmacy := dtoPharmacy.RequestCreateToPharmacyEntity(request)
	err := u.transactor.Atomic(ctx, func(txCtx context.Context) error {
		if (request.PharmacistID == nil || *request.PharmacistID == 0) && request.IsActive {
			return apperrorPharmacy.NewPharmacyActivationError()
		}
		if err := u.pharmacyRepo.Save(txCtx, pharmacy); err != nil {
			return err
		}

		logisticPartners := []*entity.Logistic{}
		for _, id := range request.LogisticPartners {
			logisticPartners = append(logisticPartners, &entity.Logistic{ID: id})
		}
		if err := u.pharmacyRepo.SaveLogisticPartners(txCtx, pharmacy, logisticPartners); err != nil {
			return apperrorPkg.NewServerError(err)
		}
		return nil
	})

	if err != nil {
		return nil, err
	}
	return dtoPharmacy.ConvertToPharmacyResponse(pharmacy), nil
}

func (u *pharmacyUseCaseImpl) Update(ctx context.Context, request *dtoPharmacy.RequestUpdatePharmacy) (*dtoPharmacy.ResponsePharmacy, error) {
	if (request.PharmacistID == nil || *request.PharmacistID == 0) && request.IsActive {
		return nil, apperrorPharmacy.NewPharmacyActivationError()
	}

	pharmacy := dtoPharmacy.RequestUpdateToPharmacyEntity(request)

	err := u.transactor.Atomic(ctx, func(txCtx context.Context) error {

		entityPharmacy, err := u.pharmacyRepo.FindByID(txCtx, request.ID)
		if err != nil {
			return err
		}

		if request.IsActive && entityPharmacy.PharmacistID == nil && request.PharmacistID == nil {
			return apperrorPharmacy.NewPharmacyActivationError()
		}

		if err := u.pharmacyRepo.Update(txCtx, pharmacy); err != nil {
			return err
		}

		logisticPartners := []*entity.Logistic{}
		for _, id := range request.LogisticPartners {
			logisticPartners = append(logisticPartners, &entity.Logistic{ID: id})
		}
		if err := u.pharmacyRepo.UpdateLogisticPartners(txCtx, pharmacy, logisticPartners); err != nil {
			return err
		}
		if err := u.pharmacyRepo.InactiveRelatedProduct(txCtx, pharmacy); err != nil {
			return err
		}

		return nil
	})

	if err != nil {
		return nil, err
	}
	return dtoPharmacy.ConvertToPharmacyResponse(pharmacy), nil
}

func (u *pharmacyUseCaseImpl) Delete(ctx context.Context, request *dtoPharmacy.RequestDeletePharmacy) error {
	err := u.transactor.Atomic(ctx, func(txCtx context.Context) error {
		pharmacy, err := u.pharmacyRepo.FindByID(txCtx, request.ID)
		if err != nil {
			return err
		}
		if pharmacy.PharmacistID != nil {
			return apperrorPharmacy.NewPharmacyDependencyError()
		}

		count, err := u.pharmacyRepo.CountOnGoingOrders(txCtx, pharmacy)
		if err != nil {
			apperrorPkg.NewServerError(err)
		}
		if count != 0 {
			return apperrorPharmacy.NewPharmacyDependencyError()
		}

		return u.pharmacyRepo.DeleteByID(txCtx, pharmacy.ID)
	})

	return err
}

func (u *pharmacyUseCaseImpl) DownloadMedicines(ctx context.Context, request *dtoPharmacy.DownloadMedicineRequest) (*os.File, error) {
	products, err := u.pharmacyRepo.FindAllProducts(ctx, request.ID)
	if err != nil {
		return nil, err
	}

	f, writer, err := csvutils.OpenCsvWriter("medicines.csv")
	if err != nil {
		return nil, err
	}
	defer writer.Flush()

	if err := writer.Write([]string{"id", "name", "stock_quantity", "price", "sold_amount", "created_at", "updated_at"}); err != nil {
		return nil, err
	}
	for i, product := range products {
		if err := writer.Write([]string{fmt.Sprint(product.ID), product.Name, fmt.Sprint(product.StockQuantity), fmt.Sprintf("Rp.%v", product.Price), fmt.Sprint(product.SoldAmount), product.CreatedAt.String(), product.UpdatedAt.String()}); err != nil {
			return nil, err
		}

		if i%100 == 0 {
			writer.Flush()
		}
	}

	return f, nil
}
