package route

import (
	"healthcare-app/internal/queue/processor"
	"healthcare-app/internal/queue/tasks"

	"github.com/hibiken/asynq"
)

func ProductTaskRoute(mux *asynq.ServeMux, processor *processor.ProductTaskProcessor) {
	mux.HandleFunc(tasks.TypeAdminCreateProduct, processor.HandleCreateProduct)
	mux.HandleFunc(tasks.TypeAdminUpdateProduct, processor.HandleUpdateProduct)
}
