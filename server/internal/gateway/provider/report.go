package provider

import (
	"healthcare-app/internal/report/controller"
	"healthcare-app/internal/report/repository"
	"healthcare-app/internal/report/route"
	"healthcare-app/internal/report/usecase"

	"github.com/gin-gonic/gin"
)

var (
	salesRepository repository.SalesRepository
)

var (
	reportAdminUseCase usecase.AdminReportUseCase
)

var (
	reportAdminController *controller.AdminReportController
)

func ProvideReportModule(router *gin.Engine) {
	injectReportModuleRepository()
	injectReportModuleUseCase()
	injectReportModuleController()

	route.AdminReportControllerRoute(reportAdminController, router, authMiddleware)
}

func injectReportModuleRepository() {
	salesRepository = repository.NewSalesRepository(db)
}

func injectReportModuleUseCase() {
	reportAdminUseCase = usecase.NewAdminReportUseCase(salesRepository)

}

func injectReportModuleController() {
	reportAdminController = controller.NewAdminReportController(reportAdminUseCase)
}
