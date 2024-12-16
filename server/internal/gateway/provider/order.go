package provider

import (
	"healthcare-app/internal/order/controller"
	"healthcare-app/internal/order/repository"
	"healthcare-app/internal/order/route"
	"healthcare-app/internal/order/usecase"

	"github.com/gin-gonic/gin"
)

var (
	orderRepository           repository.OrderRepository
	orderPharmacistRepository repository.PharmacistOrderRepository
	orderUserRepository       repository.UserOrderRepository
)

var (
	orderAdminUseCase      usecase.AdminOrderUseCase
	orderPharmacistUseCase usecase.PharmacistOrderUseCase
	orderUserUseCase       usecase.UserOrderUseCase
)

var (
	orderAdminController      *controller.AdminOrderController
	orderPharmacistController *controller.PharmacistOrderController
	orderUserController       *controller.UserOrderController
)

func ProvideOrderModule(router *gin.Engine) {
	injectOrderModuleRepository()
	injectOrderModuleUseCase()
	injectOrderModuleController()

	route.AdminOrderControllerRoute(orderAdminController, router, authMiddleware)
	route.PharmacistOrderControllerRoute(orderPharmacistController, router, authMiddleware)
	route.UserOrderControllerRoute(orderUserController, router, authMiddleware)
}

func injectOrderModuleRepository() {
	orderRepository = repository.NewOrderRepository(db)
	orderPharmacistRepository = repository.NewPharmacistOrderRepository(db)
	orderUserRepository = repository.NewUserOrderRepository(db)
}

func injectOrderModuleUseCase() {
	orderAdminUseCase = usecase.NewAdminOrderUseCase(orderRepository)
	orderPharmacistUseCase = usecase.NewPharmacistOrderUseCase(orderTask, productRepository, pharmacyProductRepository, orderPharmacistRepository, store)
	orderUserUseCase = usecase.NewUserOrderUseCase(
		orderUserRepository,
		cartRepository,
		addressRepository,
		productRepository,
		pharmacyProductRepository,
		pharmacyRepository,
		logisticRepository,
		base64Encryptor,
		store,
		orderTask,
	)
}

func injectOrderModuleController() {
	orderAdminController = controller.NewAdminOrderController(orderAdminUseCase)
	orderPharmacistController = controller.NewPharmacistOrderController(orderPharmacistUseCase)
	orderUserController = controller.NewUserOrderController(orderUserUseCase)
}
