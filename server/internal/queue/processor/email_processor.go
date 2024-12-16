package processor

import (
	"context"
	"encoding/json"
	"fmt"

	"healthcare-app/internal/queue/payload"
	"healthcare-app/pkg/utils/encryptutils"
	"healthcare-app/pkg/utils/smtputils"

	"github.com/hibiken/asynq"
)

type EmailTaskProcessor struct {
	base64Encryptor encryptutils.Base64Encryptor
	smtpUtil        smtputils.SMTPUtils
}

func NewEmailTaskProcessor(
	base64Encryptor encryptutils.Base64Encryptor,
	smtpUtil smtputils.SMTPUtils,
) *EmailTaskProcessor {
	return &EmailTaskProcessor{
		base64Encryptor: base64Encryptor,
		smtpUtil:        smtpUtil,
	}
}

func (p *EmailTaskProcessor) HandleVerificationEmail(ctx context.Context, t *asynq.Task) error {
	payload := new(payload.VerificationEmailPayload)
	if err := json.Unmarshal(t.Payload(), payload); err != nil {
		return err
	}

	encodedEmail := p.base64Encryptor.EncodeURL(payload.Email)
	encodedToken := p.base64Encryptor.EncodeURL(payload.Token)
	err := p.smtpUtil.SendMailHTMLContext(
		ctx,
		payload.Email,
		smtputils.VerificationSubject,
		smtputils.VerificationTemplate,
		map[string]any{
			"Link": fmt.Sprintf("http://localhost:5173/verify-account?token=%v&email=%v", encodedToken, encodedEmail),
		},
	)

	return err
}

func (p *EmailTaskProcessor) HandleForgotPasswordEmail(ctx context.Context, t *asynq.Task) error {
	payload := new(payload.ForgotPasswordEmailPayload)
	if err := json.Unmarshal(t.Payload(), payload); err != nil {
		return err
	}

	encodedEmail := p.base64Encryptor.EncodeURL(payload.Email)
	encodedToken := p.base64Encryptor.EncodeURL(payload.Token)
	err := p.smtpUtil.SendMailHTMLContext(
		ctx,
		payload.Email,
		smtputils.ResetPasswordSubject,
		smtputils.ResetPasswordTemplate,
		map[string]any{"Link": fmt.Sprintf("http://localhost:5173/reset-password?token=%v&email=%v", encodedToken, encodedEmail)},
	)

	return err
}

func (p *EmailTaskProcessor) HandlePharmacistAccountEmail(ctx context.Context, t *asynq.Task) error {
	payload := new(payload.PharmacistAccountEmailPayload)
	if err := json.Unmarshal(t.Payload(), payload); err != nil {
		return err
	}

	err := p.smtpUtil.SendMailHTMLContext(
		ctx,
		payload.Email,
		smtputils.PharmacistSubject, smtputils.PharmacistTemplate, map[string]any{
			"Name":     payload.Name,
			"Sipa":     payload.Sipa,
			"Whatsapp": payload.Whatsapp,
			"Yoe":      payload.Yoe,
			"Email":    payload.Email,
			"Password": payload.Password,
		},
	)

	return err
}
