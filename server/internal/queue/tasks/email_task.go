package tasks

import (
	"context"
	"encoding/json"
	"time"

	"healthcare-app/internal/queue/payload"

	"github.com/hibiken/asynq"
)

const (
	TypeEmailVerification      = "email:verification"
	TypeEmailForgotPassword    = "email:forgot-password"
	TypeEmailPharmacistAccount = "email:pharmacist-account"
)

type EmailTask interface {
	QueueVerificationEmail(ctx context.Context, payload *payload.VerificationEmailPayload) error
	QueueForgotPasswordEmail(ctx context.Context, payload *payload.ForgotPasswordEmailPayload) error
	QueuePharmacistAccountEmail(ctx context.Context, payload *payload.PharmacistAccountEmailPayload) error
}

type emailTaskImpl struct {
	client *asynq.Client
}

func NewEmailTask(client *asynq.Client) *emailTaskImpl {
	return &emailTaskImpl{
		client: client,
	}
}

func (t *emailTaskImpl) QueueVerificationEmail(ctx context.Context, payload *payload.VerificationEmailPayload) error {
	data, err := json.Marshal(payload)
	if err != nil {
		return err
	}

	task := asynq.NewTask(TypeEmailVerification, data, asynq.Timeout(5*time.Second), asynq.MaxRetry(10))
	_, err = t.client.EnqueueContext(ctx, task)

	return err
}

func (t *emailTaskImpl) QueueForgotPasswordEmail(ctx context.Context, payload *payload.ForgotPasswordEmailPayload) error {
	data, err := json.Marshal(payload)
	if err != nil {
		return err
	}

	task := asynq.NewTask(TypeEmailForgotPassword, data, asynq.Timeout(5*time.Second), asynq.MaxRetry(10))
	_, err = t.client.EnqueueContext(ctx, task)

	return err
}

func (t *emailTaskImpl) QueuePharmacistAccountEmail(ctx context.Context, payload *payload.PharmacistAccountEmailPayload) error {
	data, err := json.Marshal(payload)
	if err != nil {
		return err
	}

	task := asynq.NewTask(TypeEmailPharmacistAccount, data, asynq.Timeout(5*time.Second), asynq.MaxRetry(10))
	_, err = t.client.EnqueueContext(ctx, task)

	return err
}
