package processor

import (
	"context"
	"encoding/json"
	"strings"

	"healthcare-app/internal/order/repository"
	"healthcare-app/internal/order/utils"
	"healthcare-app/internal/queue/payload"
	"healthcare-app/pkg/database/transactor"
	"healthcare-app/pkg/utils/cloudinaryutils"

	"github.com/cloudinary/cloudinary-go/v2/api"
	"github.com/cloudinary/cloudinary-go/v2/api/uploader"
	"github.com/hibiken/asynq"
)

type OrderTaskProcessor struct {
	cloudinaryUtil            cloudinaryutils.CloudinaryUtil
	userOrderRepository       repository.UserOrderRepository
	pharmacistOrderRepository repository.PharmacistOrderRepository
	transactor                transactor.Transactor
}

func NewOrderTaskProcessor(
	cloudinaryUtil cloudinaryutils.CloudinaryUtil,
	userOrderRepository repository.UserOrderRepository,
	pharmacistOrderRepository repository.PharmacistOrderRepository,
	transactor transactor.Transactor,
) *OrderTaskProcessor {
	return &OrderTaskProcessor{
		cloudinaryUtil:            cloudinaryUtil,
		userOrderRepository:       userOrderRepository,
		pharmacistOrderRepository: pharmacistOrderRepository,
		transactor:                transactor,
	}
}

func (p *OrderTaskProcessor) HandleProcessOrder(ctx context.Context, t *asynq.Task) error {
	payload := new(payload.ProcessOrderPayload)
	if err := json.Unmarshal(t.Payload(), payload); err != nil {
		return err
	}

	imgUrl, err := p.cloudinaryUtil.UploadImage(ctx, payload.Image, uploader.UploadParams{
		PublicID:       strings.ToLower(strings.ReplaceAll(utils.GeneratePaymentProofTitle(payload.ID), " ", "-")),
		UniqueFilename: api.Bool(true),
		Overwrite:      api.Bool(true),
		Invalidate:     api.Bool(true),
	})
	if err != nil {
		return err
	}

	err = p.userOrderRepository.PostUploadPaymentProof(ctx, imgUrl, payload.ID, payload.UserID)
	if err != nil {
		return err
	}

	return p.userOrderRepository.ProcessOrder(ctx, payload.ID)
}

func (p *OrderTaskProcessor) HandleConfirmOrder(ctx context.Context, t *asynq.Task) error {
	payload := new(payload.ConfirmOrderPayload)
	if err := json.Unmarshal(t.Payload(), payload); err != nil {
		return err
	}

	return p.pharmacistOrderRepository.ConfirmOrderStatus(ctx, payload.IDs)
}
