package tasks

import (
	"context"
	"encoding/json"
	"time"

	"healthcare-app/internal/queue/payload"

	"github.com/hibiken/asynq"
)

const (
	TypeOrderProcessed = "order:auto-processed"
	TypeOrderConfirmed = "order:auto-confirmed"
)

type OrderTask interface {
	QueueProcessOrder(ctx context.Context, payload *payload.ProcessOrderPayload) error
	QueueConfirmOrder(ctx context.Context, payload *payload.ConfirmOrderPayload) error
}

type orderTaskImpl struct {
	client *asynq.Client
}

func NewOrderTask(client *asynq.Client) *orderTaskImpl {
	return &orderTaskImpl{
		client: client,
	}
}

func (t *orderTaskImpl) QueueProcessOrder(ctx context.Context, payload *payload.ProcessOrderPayload) error {
	data, err := json.Marshal(payload)
	if err != nil {
		return err
	}

	task := asynq.NewTask(TypeOrderProcessed, data, asynq.ProcessIn(1*time.Minute), asynq.Timeout(25*time.Second), asynq.MaxRetry(20))
	_, err = t.client.EnqueueContext(ctx, task)

	return err
}

func (t *orderTaskImpl) QueueConfirmOrder(ctx context.Context, payload *payload.ConfirmOrderPayload) error {
	data, err := json.Marshal(payload)
	if err != nil {
		return err
	}

	task := asynq.NewTask(TypeOrderConfirmed, data, asynq.ProcessIn(60*24*7*time.Minute), asynq.Timeout(10*time.Second), asynq.MaxRetry(20))
	_, err = t.client.EnqueueContext(ctx, task)

	return err
}
