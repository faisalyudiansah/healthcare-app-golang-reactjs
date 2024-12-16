package provider

import (
	"context"
	"database/sql"

	"healthcare-app/internal/pharmacy/controller"
	"healthcare-app/internal/pharmacy/repository"
	"healthcare-app/internal/pharmacy/route"
	"healthcare-app/internal/pharmacy/usecase"
	"healthcare-app/pkg/config"
	"healthcare-app/pkg/logger"

	"github.com/gin-gonic/gin"
)

var (
	logisticRepository           repository.LogisticRepository
	partnerRepository            repository.PartnerRepository
	pharmacyRepository           repository.PharmacyRepository
	partnerChangeRepository      repository.PartnerChangeRepository
	pharmacistPharmacyRepository repository.PharmacistPharmacyRepository
)

var (
	logisticUseCase           usecase.LogisticUseCase
	partnerChangeUseCase      usecase.PartnerChangeUseCase
	partnerUseCase            usecase.PartnerUseCase
	pharmacyPharmacistUseCase usecase.PharmacistUseCase
	pharmacyUseCase           usecase.PharmacyUseCase
	pharmacyUserUseCase       usecase.UserUseCase
)

var (
	logisticController           *controller.LogisticController
	pharmacyAdminController      *controller.AdminController
	pharmacyPharmacistController *controller.PharmacistController
	pharmacyUserController       *controller.UserController
)

func ProvidePharmacyModule(cfg *config.Config, router *gin.Engine) {
	injectPharmacyModuleRepository(db)
	injectPharmacyModuleUseCase(cfg)
	injectPharmacyModuleController()

	route.LogisticControllerRoute(logisticController, router, authMiddleware)
	route.UserControllerRoute(pharmacyUserController, router, authMiddleware)
	route.AdminControllerRoute(pharmacyAdminController, router, authMiddleware)
	route.PharmacistControllerRoute(pharmacyPharmacistController, router, authMiddleware)

	cronJob.AddFunc("@midnight", func() {
		err := partnerChangeUseCase.ApplyChanges(context.Background())
		if err != nil {
			logger.Log.Error("error applying partner changes:", err)
		} else {
			logger.Log.Info("success applying partner changes:")
		}
	})
}

func injectPharmacyModuleRepository(db *sql.DB) {
	logisticRepository = repository.NewLogisticRepository(db)
	partnerRepository = repository.NewPartnerRepository(db)
	pharmacyRepository = repository.NewPharmacyRepository(db)
	partnerChangeRepository = repository.NewPartnerChangeRepository(db)
	pharmacistPharmacyRepository = repository.NewPharmacistPharmacyRepository(db)
}

func injectPharmacyModuleUseCase(cfg *config.Config) {
	logisticUseCase = usecase.NewLogisticUseCase(logisticRepository, store)
	partnerChangeUseCase = usecase.NewPartnerChangeUseCase(partnerChangeRepository, partnerRepository, store)
	partnerUseCase = usecase.NewPartnerUseCase(cloudinaryUtil, partnerChangeRepository, partnerRepository, store)
	pharmacyPharmacistUseCase = usecase.NewPharmacistUseCase(pharmacyRepository, pharmacistPharmacyRepository, store)
	pharmacyUseCase = usecase.NewPharmacyUseCase(pharmacyRepository, store)
	pharmacyUserUseCase = usecase.NewUserUseCase(cfg.RajaOngkir, addressRepository, logisticRepository, pharmacyRepository, store)
}

func injectPharmacyModuleController() {
	logisticController = controller.NewLogisticController(logisticUseCase)
	pharmacyAdminController = controller.NewAdminController(partnerUseCase, pharmacyUseCase)
	pharmacyPharmacistController = controller.NewPharmacistController(pharmacyPharmacistUseCase)
	pharmacyUserController = controller.NewUserController(pharmacyUserUseCase)
}
