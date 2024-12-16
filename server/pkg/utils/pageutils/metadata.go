package pageutils

import (
	"math"

	"healthcare-app/pkg/dto"
)

func CreateMetaData[T any](items []T, page, limit int64) ([]T, *dto.PageMetaData) {
	totalItems := int64(len(items))
	totalPage := int64(math.Ceil(float64(totalItems) / float64(limit)))

	switch {
	case totalItems > page*limit:
		items = items[limit*(page-1) : limit*page]
	case totalItems > (page-1)*limit:
		items = items[limit*(page-1):]
	default:
		items = []T{}
	}

	return items, &dto.PageMetaData{
		Page:      page,
		Size:      limit,
		TotalItem: totalItems,
		TotalPage: totalPage,
	}
}

func CreateSeekMetaData(itemLen, limit int64, last string) *dto.SeekPageMetaData {
	return &dto.SeekPageMetaData{
		Size: limit,
		Last: last,
		Next: itemLen > limit,
	}
}
