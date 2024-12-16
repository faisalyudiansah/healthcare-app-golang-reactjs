package usecase

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"strconv"
	"strings"
	"sync"

	"healthcare-app/internal/order/constant"
	dtoPharmacy "healthcare-app/internal/pharmacy/dto"
	"healthcare-app/internal/pharmacy/entity"
	repositoryPharmacy "healthcare-app/internal/pharmacy/repository"
	"healthcare-app/internal/pharmacy/utils"
	repositoryProfile "healthcare-app/internal/profile/repository"
	apperrorPkg "healthcare-app/pkg/apperror"
	"healthcare-app/pkg/config"
	"healthcare-app/pkg/database/transactor"
	dtoPkg "healthcare-app/pkg/dto"
	"healthcare-app/pkg/utils/pageutils"
)

type UserUseCase interface {
	Search(ctx context.Context, request *dtoPharmacy.GetProductPharmacyRequest) ([]*dtoPharmacy.ProductPharmacyResponse, *dtoPkg.PageMetaData, error)
	Shipping(ctx context.Context, request *dtoPharmacy.RajaOngkirCostRequest) ([]*dtoPharmacy.ShippingResponse, error)
}

type userUseCaseImpl struct {
	rajaOngkirConfig   *config.RajaOngkirConfig
	addressRepository  repositoryProfile.AddressRepository
	logisticRepository repositoryPharmacy.LogisticRepository
	pharmacyRepository repositoryPharmacy.PharmacyRepository
	transactor         transactor.Transactor
}

func NewUserUseCase(
	rajaOngkirConfig *config.RajaOngkirConfig,
	addressRepository repositoryProfile.AddressRepository,
	logisticRepository repositoryPharmacy.LogisticRepository,
	pharmacyRepository repositoryPharmacy.PharmacyRepository,
	transactor transactor.Transactor,
) *userUseCaseImpl {
	return &userUseCaseImpl{
		rajaOngkirConfig:   rajaOngkirConfig,
		addressRepository:  addressRepository,
		logisticRepository: logisticRepository,
		pharmacyRepository: pharmacyRepository,
		transactor:         transactor,
	}
}

func (u *userUseCaseImpl) Search(ctx context.Context, request *dtoPharmacy.GetProductPharmacyRequest) ([]*dtoPharmacy.ProductPharmacyResponse, *dtoPkg.PageMetaData, error) {
	pharmacies, err := u.pharmacyRepository.FindAllByProductID(ctx, request)
	if err != nil {
		return nil, nil, apperrorPkg.NewServerError(err)
	}

	res, metaData := pageutils.CreateMetaData(pharmacies, request.Page, request.Limit)

	return dtoPharmacy.ConvertToProductPharmacyResponses(res), metaData, nil
}

func (u *userUseCaseImpl) Shipping(ctx context.Context, request *dtoPharmacy.RajaOngkirCostRequest) ([]*dtoPharmacy.ShippingResponse, error) {
	logistics, err := u.logisticRepository.FindAllByPharmacyID(ctx, request.PharmacyID)
	if err != nil {
		return nil, apperrorPkg.NewServerError(err)
	}

	address, err := u.addressRepository.FindAddressByIDandUserID(ctx, request.AddressID, request.UserID)
	if err != nil {
		return nil, apperrorPkg.NewServerError(err)
	}

	wg := new(sync.WaitGroup)
	codes := utils.GetAllCodes(logistics)

	responses := []*dtoPharmacy.ShippingResponse{}
	for code := range codes {
		if code != constant.OFFICIAL_CODE {
			wg.Add(1)
			go func(code string) {
				defer wg.Done()

				data := url.Values{}
				data.Set("origin", strconv.Itoa(int(request.Origin)))
				data.Set("destination", strconv.Itoa(int(request.Destination)))
				data.Set("weight", strconv.Itoa(int(request.Weight)))
				data.Set("courier", code)

				req, _ := http.NewRequest(http.MethodPost, fmt.Sprintf("%v/cost", u.rajaOngkirConfig.BaseURL), strings.NewReader(data.Encode()))

				req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
				req.Header.Set("key", u.rajaOngkirConfig.ApiKey)

				res, err := http.DefaultClient.Do(req)
				if err != nil {
					return
				}
				defer res.Body.Close()

				rajaOngkirRes := new(dtoPharmacy.RajaOngkirResponse)
				json.NewDecoder(res.Body).Decode(rajaOngkirRes)

				responses = append(responses, utils.FilterRajaOngkirResults(rajaOngkirRes, codes)...)
			}(code)
		}
	}

	for _, logistic := range logistics {
		if logistic.Code == constant.OFFICIAL_CODE {
			wg.Add(1)
			go func(logistic *entity.Logistic) {
				defer wg.Done()

				cost, err := u.logisticRepository.CalculateShipCost(ctx, &dtoPharmacy.CalculateOfficialCostRequest{
					AddressID:  address.ID,
					PharmacyID: request.PharmacyID,
					Logistic:   logistic,
				})
				if err != nil {
					return
				}

				responses = append(responses, &dtoPharmacy.ShippingResponse{
					Code:       logistic.Code,
					Service:    logistic.Service,
					Estimation: fmt.Sprintf("%v-%v Hari", logistic.MinDelivery, logistic.MaxDelivery),
					ShipCost:   cost,
				})
			}(logistic)
		}
	}

	wg.Wait()
	return responses, nil
}
