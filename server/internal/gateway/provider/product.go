package provider

import (
	"context"
	"time"

	"healthcare-app/internal/product/controller"
	"healthcare-app/internal/product/repository"
	"healthcare-app/internal/product/route"
	"healthcare-app/internal/product/usecase"
	"healthcare-app/pkg/logger"
	"healthcare-app/pkg/utils/redisutils"

	"github.com/gin-gonic/gin"
)

var (
	manufactureRepository           repository.ManufactureRepository
	productClassificationRepository repository.ProductClassificationRepository
	productFormRepository           repository.ProductFormRepository
	productRepository               repository.ProductRepository
	productCategoryRepository       repository.ProductCategoryRepository
	pharmacyProductRepository       repository.PharmacyProductRepository
	productUserRepository           repository.UserProductRepository
)

var (
	productAdminUseCase      usecase.AdminProductUseCase
	productCategoryUseCase   usecase.ProductCategoryUseCase
	manufactureUseCase       usecase.ManufactureUseCase
	productFormUseCase       usecase.ProductFormUseCase
	productPharmacistUseCase usecase.PharmacistProductUseCase
	productUserUseCase       usecase.UserProductUseCase
)

var (
	productAdminController      *controller.AdminProductController
	productCategoryController   *controller.ProductCategoryController
	manufactureController       *controller.ManufactureController
	productFormController       *controller.ProductFormController
	productPharmacistController *controller.PharmacistProductController
	productUserController       *controller.UserProductController
)

func ProvideProductModule(router *gin.Engine) {
	injectProductModuleRepository()
	injectProductModuleUseCase()
	injectProductModuleController()

	route.UserProductControllerRoute(productUserController, router, jwtUtil)
	route.AdminProductControllerRoute(productAdminController, router, authMiddleware)
	route.ProductCategoryControllerRoute(productCategoryController, router, authMiddleware)
	route.ManufactureControllerRoute(manufactureController, router, authMiddleware)
	route.ProductFormControllerRoute(productFormController, router, authMiddleware)
	route.PharmacistProductControllerRoute(productPharmacistController, router, authMiddleware)

	cronJob.AddFunc("*/5 * * * *", func() {
		err := productUserUseCase.RefreshView(context.Background())
		if err != nil {
			logger.Log.Error("error refreshing most bought views:", err)
		}
	})
}

func injectProductModuleRepository() {
	manufactureRepository = repository.NewManufactureRepository(db)
	productClassificationRepository = repository.NewProductClassificationRepository(db)
	productFormRepository = repository.NewProductFormRepository(db)
	productRepository = repository.NewProductRepository(db)
	productCategoryRepository = repository.NewProductCategoryRepository(db)
	pharmacyProductRepository = repository.NewPharmacyProductRepository(db)
	productUserRepository = repository.NewUserProductRepository(db)
}

func injectProductModuleUseCase() {
	redisUtilsLRU := redisutils.NewRedisUtilsLRU(rdb, 1000, 5*time.Minute)

	productAdminUseCase = usecase.NewAdminProductUseCase(base64Encryptor, cloudinaryUtil, productTask, manufactureRepository, productClassificationRepository, productFormRepository, productRepository, store)
	productCategoryUseCase = usecase.NewProductCategoryUseCase(productCategoryRepository, store)
	manufactureUseCase = usecase.NewManufactureUseCase(manufactureRepository)
	productFormUseCase = usecase.NewProductFormUseCase(productFormRepository)
	productPharmacistUseCase = usecase.NewPharmacistProductUseCase(productRepository, pharmacyProductRepository, store)
	productUserUseCase = usecase.NewUserProductUseCase(redisUtilsLRU, addressRepository, productRepository, productUserRepository)
}

func injectProductModuleController() {
	productAdminController = controller.NewAdminProductController(productAdminUseCase)
	productCategoryController = controller.NewProductCategoryController(productCategoryUseCase)
	manufactureController = controller.NewManufactureController(manufactureUseCase)
	productFormController = controller.NewProductFormController(productFormUseCase)
	productPharmacistController = controller.NewPharmacistProductController(productPharmacistUseCase, productAdminUseCase)
	productUserController = controller.NewUserProductController(productUserUseCase)
}
