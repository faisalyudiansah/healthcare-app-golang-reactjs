package payload

import (
	"io"
	"mime/multipart"
	"sync"

	"healthcare-app/internal/product/dto"
	"healthcare-app/internal/product/entity"
	"healthcare-app/internal/queue/constant"
	"healthcare-app/pkg/utils/encryptutils"

	"github.com/shopspring/decimal"
)

type ProductPayload struct {
	ID                      int64            `json:"id"`
	ManufactureID           int64            `json:"manufacture_id"`
	ProductClassificationID int64            `form:"product_classification_id"`
	ProductFormID           *int64           `form:"product_form_id"`
	Name                    string           `json:"name"`
	GenericName             string           `form:"generic_name"`
	Description             string           `form:"description"`
	UnitInPack              *string          `form:"unit_in_pack"`
	SellingUnit             *string          `form:"selling_unit"`
	Weight                  *decimal.Decimal `form:"weight"`
	Height                  *decimal.Decimal `form:"height"`
	Length                  *decimal.Decimal `form:"length"`
	Width                   *decimal.Decimal `form:"width"`
	IsActive                bool             `form:"is_active"`
	Image                   string           `json:"image"`
	Thumbnail               string           `json:"thumbnail"`
	SecondaryImage          string           `json:"secondary_image"`
	TertiaryImage           string           `json:"tertiary_image"`
	ProductCategories       []int64          `json:"product_categories"`
}

func CreateRequestToProductPayload(
	base64Encryptor encryptutils.Base64Encryptor,
	entity *entity.Product,
	request *dto.CreateProductRequest,
) *ProductPayload {
	var mutex sync.Mutex
	images := map[string]string{}
	wg := new(sync.WaitGroup)

	wg.Add(4)
	for key, image := range map[string]*multipart.FileHeader{
		constant.IMAGE_URL:           request.Image,
		constant.THUMBNAIL_URL:       request.Thumbnail,
		constant.SECONDARY_IMAGE_URL: request.SecondaryImage,
		constant.TERTIARY_IMAGE_URL:  request.TertiaryImage,
	} {
		go func(key string, image *multipart.FileHeader) {
			defer wg.Done()
			defer mutex.Unlock()
			mutex.Lock()
			images[key] = convertImageToBase64(base64Encryptor, image)
		}(key, image)
	}
	wg.Wait()

	return &ProductPayload{
		ID:                entity.ID,
		ManufactureID:     entity.Manufacture.ID,
		Name:              entity.Name,
		Image:             images[constant.IMAGE_URL],
		Thumbnail:         images[constant.THUMBNAIL_URL],
		SecondaryImage:    images[constant.SECONDARY_IMAGE_URL],
		TertiaryImage:     images[constant.TERTIARY_IMAGE_URL],
		ProductCategories: request.ProductCategories,
	}
}

func UpdateRequestToProductPayload(
	base64Encryptor encryptutils.Base64Encryptor,
	entity *entity.Product,
	request *dto.UpdateProductRequest,
) *ProductPayload {
	var mutex sync.Mutex
	images := map[string]string{}
	wg := new(sync.WaitGroup)

	wg.Add(4)
	for key, image := range map[string]*multipart.FileHeader{
		constant.IMAGE_URL:           request.Image,
		constant.THUMBNAIL_URL:       request.Thumbnail,
		constant.SECONDARY_IMAGE_URL: request.SecondaryImage,
		constant.TERTIARY_IMAGE_URL:  request.TertiaryImage,
	} {
		go func(key string, image *multipart.FileHeader) {
			defer wg.Done()
			defer mutex.Unlock()
			mutex.Lock()
			images[key] = convertImageToBase64(base64Encryptor, image)
		}(key, image)
	}
	wg.Wait()

	return &ProductPayload{
		ID:                      entity.ID,
		ManufactureID:           entity.Manufacture.ID,
		ProductClassificationID: request.ProductClassificationID,
		ProductFormID:           request.ProductFormID,
		Name:                    entity.Name,
		GenericName:             request.GenericName,
		Description:             request.Description,
		UnitInPack:              request.UnitInPack,
		SellingUnit:             request.SellingUnit,
		Weight:                  request.Weight,
		Height:                  request.Height,
		Length:                  request.Length,
		Width:                   request.Width,
		IsActive:                request.IsActive,
		Image:                   images[constant.IMAGE_URL],
		Thumbnail:               images[constant.THUMBNAIL_URL],
		SecondaryImage:          images[constant.SECONDARY_IMAGE_URL],
		TertiaryImage:           images[constant.TERTIARY_IMAGE_URL],
		ProductCategories:       request.ProductCategories,
	}
}

func convertImageToBase64(
	base64Encryptor encryptutils.Base64Encryptor,
	image *multipart.FileHeader,
) string {
	if image == nil {
		return ""
	}

	f, err := image.Open()
	if err != nil {
		return ""
	}

	bytes, err := io.ReadAll(f)
	if err != nil {
		return ""
	}

	return "data:image/png;base64," + base64Encryptor.EncodeStd(string(bytes))
}
