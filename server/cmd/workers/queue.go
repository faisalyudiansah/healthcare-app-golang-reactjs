package workers

import (
	"context"

	"healthcare-app/internal/gateway/server"
)

func runQueueWorker(ctx context.Context) {
	srv := server.NewQueueServer(cfg)
	go srv.Start()

	<-ctx.Done()
	srv.Shutdown()
}
