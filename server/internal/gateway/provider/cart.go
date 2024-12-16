package provider

import (
	"healthcare-app/internal/cart/controller"
	"healthcare-app/internal/cart/repository"
	"healthcare-app/internal/cart/route"
	"healthcare-app/internal/cart/usecase"

	"github.com/gin-gonic/gin"
)

var (
	cartRepository repository.CartRepository
)

var (
	cartUseCase usecase.CartUseCase
)

var (
	cartController *controller.CartController
)

func ProvideCartModule(router *gin.Engine) {
	injectCartModuleRepository()
	injectCartModuleUseCase()
	injectCartModuleController()

	route.CartControllerRoute(cartController, router, authMiddleware)
}

func injectCartModuleRepository() {
	cartRepository = repository.NewCartRepository(db)
}

func injectCartModuleUseCase() {
	cartUseCase = usecase.NewCartUseCase(cartRepository, authUserRepository, store)
}

func injectCartModuleController() {
	cartController = controller.NewCartController(cartUseCase)
}
