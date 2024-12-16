package usecase

import (
	"context"
	"sync"

	"healthcare-app/internal/report/constant"
	dtoReport "healthcare-app/internal/report/dto"
	"healthcare-app/internal/report/entity"
	"healthcare-app/internal/report/repository"
	apperrorPkg "healthcare-app/pkg/apperror"
	dtoPkg "healthcare-app/pkg/dto"
	"healthcare-app/pkg/utils/pageutils"
)

type AdminReportUseCase interface {
	GetSalesReport(ctx context.Context, request *dtoReport.SearchSalesRequest) ([]*dtoReport.SalesResponse, *dtoPkg.PageMetaData, error)
}

type adminReportUseCaseImpl struct {
	salesRepoitory repository.SalesRepository
}

func NewAdminReportUseCase(
	salesRepoitory repository.SalesRepository,
) *adminReportUseCaseImpl {
	return &adminReportUseCaseImpl{
		salesRepoitory: salesRepoitory,
	}
}

func (u *adminReportUseCaseImpl) GetSalesReport(ctx context.Context, request *dtoReport.SearchSalesRequest) ([]*dtoReport.SalesResponse, *dtoPkg.PageMetaData, error) {
	wg := new(sync.WaitGroup)
	chErr := make(chan error, 2)
	categorySales := []*entity.CategorySales{}
	classificationSales := []*entity.ClassificationSales{}

	if _, ok := constant.AllowedOrderDir[request.Sort]; !ok {
		request.Sort = "desc"
	}

	wg.Add(2)
	go func() {
		defer wg.Done()
		sales, err := u.salesRepoitory.FindAllCategorySales(ctx, request)
		if err != nil {
			chErr <- apperrorPkg.NewServerError(err)
		}
		categorySales = sales
	}()

	go func() {
		defer wg.Done()
		sales, err := u.salesRepoitory.FindAllClassificationSales(ctx, request)
		if err != nil {
			chErr <- apperrorPkg.NewServerError(err)
		}
		classificationSales = sales
	}()

	wg.Wait()
	close(chErr)

	if err := <-chErr; err != nil {
		return nil, nil, err
	}

	sales := dtoReport.ConvertToSalesResponses(categorySales, classificationSales)
	dtoReport.SortSalesResponses(sales, request.Sort)

	res, metaData := pageutils.CreateMetaData(sales, request.Page, request.Limit)

	return res, metaData, nil
}
