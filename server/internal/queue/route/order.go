package route

import (
	"healthcare-app/internal/queue/processor"
	"healthcare-app/internal/queue/tasks"

	"github.com/hibiken/asynq"
)

func OrderTaskRoute(mux *asynq.ServeMux, processor *processor.OrderTaskProcessor) {
	mux.HandleFunc(tasks.TypeOrderProcessed, processor.HandleProcessOrder)
	mux.HandleFunc(tasks.TypeOrderConfirmed, processor.HandleConfirmOrder)
}
