package processor

import (
	"context"
	"encoding/json"
	"fmt"
	"strings"
	"sync"

	"healthcare-app/internal/product/entity"
	"healthcare-app/internal/product/repository"
	"healthcare-app/internal/queue/constant"
	"healthcare-app/internal/queue/payload"
	"healthcare-app/pkg/apperror"
	"healthcare-app/pkg/database/transactor"
	"healthcare-app/pkg/utils/cloudinaryutils"

	"github.com/cloudinary/cloudinary-go/v2/api"
	"github.com/cloudinary/cloudinary-go/v2/api/uploader"
	"github.com/hibiken/asynq"
)

type uploadResult struct {
	key string
	url *string
	err error
}

type ProductTaskProcessor struct {
	cloudinaryUtil    cloudinaryutils.CloudinaryUtil
	productRepository repository.ProductRepository
	transactor        transactor.Transactor
}

func NewProductTaskProcessor(
	cloudinaryUtil cloudinaryutils.CloudinaryUtil,
	productRepository repository.ProductRepository,
	transactor transactor.Transactor,
) *ProductTaskProcessor {
	return &ProductTaskProcessor{
		cloudinaryUtil:    cloudinaryUtil,
		productRepository: productRepository,
		transactor:        transactor,
	}
}

func (p *ProductTaskProcessor) HandleCreateProduct(ctx context.Context, t *asynq.Task) error {
	payload := new(payload.ProductPayload)
	if err := json.Unmarshal(t.Payload(), payload); err != nil {
		return err
	}

	return p.transactor.Atomic(ctx, func(txCtx context.Context) error {
		product := &entity.Product{ID: payload.ID}
		resultChan := p.uploadImages(txCtx, payload)

		images := map[string]*string{}
		var mu sync.Mutex

		for i := 0; i < 4; i++ {
			result := <-resultChan
			if result.err != nil {
				return result.err
			}

			mu.Lock()
			images[result.key] = result.url
			mu.Unlock()
		}
		close(resultChan)

		product.ImageURL = images[constant.IMAGE_URL]
		product.ThumbnailURL = images[constant.THUMBNAIL_URL]
		product.SecondaryImageURL = images[constant.SECONDARY_IMAGE_URL]
		product.TertiaryImageURL = images[constant.TERTIARY_IMAGE_URL]
		if err := p.productRepository.SaveImages(txCtx, product); err != nil {
			return err
		}

		categories := []*entity.ProductCategory{}
		for _, category := range payload.ProductCategories {
			categories = append(categories, &entity.ProductCategory{ID: category})
		}
		if err := p.productRepository.SaveProductCategories(txCtx, product, categories); err != nil {
			return err
		}
		return nil
	})
}

func (p *ProductTaskProcessor) HandleUpdateProduct(ctx context.Context, t *asynq.Task) error {
	payload := new(payload.ProductPayload)
	if err := json.Unmarshal(t.Payload(), payload); err != nil {
		return err
	}

	return p.transactor.Atomic(ctx, func(txCtx context.Context) error {
		product := &entity.Product{ID: payload.ID, Manufacture: entity.Manufacture{ID: payload.ManufactureID}, ProductClassification: entity.ProductClassification{ID: payload.ProductClassificationID}, ProductForm: &entity.ProductForm{ID: payload.ProductFormID}, Name: payload.Name, GenericName: payload.GenericName, Description: payload.Description, UnitInPack: payload.UnitInPack, SellingUnit: payload.SellingUnit, Height: *payload.Height, Weight: *payload.Weight, Length: *payload.Length, Width: *payload.Width, IsActive: payload.IsActive}
		resultChan := p.uploadImages(txCtx, payload)

		images := map[string]*string{}
		var mu sync.Mutex

		for i := 0; i < 4; i++ {
			result := <-resultChan
			if result.err != nil {
				return result.err
			}

			mu.Lock()
			images[result.key] = result.url
			mu.Unlock()
		}
		close(resultChan)

		product.ImageURL = images[constant.IMAGE_URL]
		product.ThumbnailURL = images[constant.THUMBNAIL_URL]
		product.SecondaryImageURL = images[constant.SECONDARY_IMAGE_URL]
		product.TertiaryImageURL = images[constant.TERTIARY_IMAGE_URL]
		if err := p.productRepository.SaveImages(txCtx, product); err != nil {
			return err
		}

		if err := p.productRepository.Update(ctx, product); err != nil {
			return err
		}

		categories := []*entity.ProductCategory{}
		for _, category := range payload.ProductCategories {
			categories = append(categories, &entity.ProductCategory{ID: category})
		}
		if err := p.productRepository.UpdateProductCategories(txCtx, product, categories); err != nil {
			return err
		}

		if err := p.productRepository.InactiveRelatedProduct(txCtx, product); err != nil {
			return err
		}
		return nil
	})
}

func (p *ProductTaskProcessor) uploadImages(ctx context.Context, payload *payload.ProductPayload) chan uploadResult {
	resultChan := make(chan uploadResult, 4)

	for key, image := range map[string]string{
		constant.IMAGE_URL:           payload.Image,
		constant.THUMBNAIL_URL:       payload.Thumbnail,
		constant.SECONDARY_IMAGE_URL: payload.SecondaryImage,
		constant.TERTIARY_IMAGE_URL:  payload.TertiaryImage,
	} {
		if image == "" {
			resultChan <- uploadResult{key: key, url: nil, err: nil}
			continue
		}

		k := key
		img := image
		go func(key string, image string) {
			name := fmt.Sprintf("%v-%v-%v", key, strings.ToLower(strings.ReplaceAll(payload.Name, " ", "-")), payload.ManufactureID)
			if len(name) > 128 {
				name = name[:128]
			}

			imgUrl, err := p.cloudinaryUtil.UploadImage(ctx, image, uploader.UploadParams{
				PublicID:       name,
				UniqueFilename: api.Bool(true),
				Overwrite:      api.Bool(true),
				Invalidate:     api.Bool(true),
			})

			if err != nil {
				resultChan <- uploadResult{key: key, url: nil, err: apperror.NewServerError(err)}
				return
			}

			resultChan <- uploadResult{key: key, url: &imgUrl, err: nil}
		}(k, img)
	}

	return resultChan
}
