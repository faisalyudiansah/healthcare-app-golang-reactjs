package provider

import (
	repositoryOrder "healthcare-app/internal/order/repository"
	repositoryProduct "healthcare-app/internal/product/repository"
	"healthcare-app/internal/queue/processor"
	"healthcare-app/internal/queue/route"
	"healthcare-app/internal/queue/tasks"

	"github.com/hibiken/asynq"
)

var (
	emailTask   tasks.EmailTask
	productTask tasks.ProductTask
	orderTask   tasks.OrderTask
)

var (
	emailTaskProcessor   *processor.EmailTaskProcessor
	productTaskProcessor *processor.ProductTaskProcessor
	orderTaskProcessor   *processor.OrderTaskProcessor
)

func ProvideQueueModule(client *asynq.Client, mux *asynq.ServeMux) {
	injectQueueModuleTask(client)
	injectQueueModuleProcessor()

	route.EmailTaskRoute(mux, emailTaskProcessor)
	route.ProductTaskRoute(mux, productTaskProcessor)
	route.OrderTaskRoute(mux, orderTaskProcessor)
}

func injectQueueModuleTask(client *asynq.Client) {
	emailTask = tasks.NewEmailTask(client)
	productTask = tasks.NewProductTask(client)
	orderTask = tasks.NewOrderTask(client)
}

func injectQueueModuleProcessor() {
	productRepository := repositoryProduct.NewProductRepository(db)
	userOrderRepository := repositoryOrder.NewUserOrderRepository(db)
	pharmacistOrderRepository := repositoryOrder.NewPharmacistOrderRepository(db)

	emailTaskProcessor = processor.NewEmailTaskProcessor(base64Encryptor, smtpUtil)
	productTaskProcessor = processor.NewProductTaskProcessor(cloudinaryUtil, productRepository, store)
	orderTaskProcessor = processor.NewOrderTaskProcessor(cloudinaryUtil, userOrderRepository, pharmacistOrderRepository, store)
}
