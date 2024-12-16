package tasks

import (
	"context"
	"encoding/json"
	"time"

	"healthcare-app/internal/queue/payload"

	"github.com/hibiken/asynq"
)

const (
	TypeAdminCreateProduct = "product:admin-create"
	TypeAdminUpdateProduct = "product:admin-update"
)

type ProductTask interface {
	QueueCreateProduct(ctx context.Context, payload *payload.ProductPayload) error
	QueueUpdateProduct(ctx context.Context, payload *payload.ProductPayload) error
}

type productTaskImpl struct {
	client *asynq.Client
}

func NewProductTask(client *asynq.Client) *productTaskImpl {
	return &productTaskImpl{
		client: client,
	}
}

func (t *productTaskImpl) QueueCreateProduct(ctx context.Context, payload *payload.ProductPayload) error {
	data, err := json.Marshal(payload)
	if err != nil {
		return err
	}

	task := asynq.NewTask(TypeAdminCreateProduct, data, asynq.Timeout(25*time.Second), asynq.MaxRetry(20))
	_, err = t.client.EnqueueContext(ctx, task)

	return err
}

func (t *productTaskImpl) QueueUpdateProduct(ctx context.Context, payload *payload.ProductPayload) error {
	data, err := json.Marshal(payload)
	if err != nil {
		return err
	}

	task := asynq.NewTask(TypeAdminUpdateProduct, data, asynq.Timeout(25*time.Second), asynq.MaxRetry(20))
	_, err = t.client.EnqueueContext(ctx, task)

	return err
}
