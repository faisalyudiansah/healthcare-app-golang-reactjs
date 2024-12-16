package dto

import (
	"sort"
	"sync"

	"healthcare-app/internal/report/entity"

	"github.com/shopspring/decimal"
)

type SalesResponse struct {
	Pharmacy pharmacy `json:"pharmacy"`
	Product  product  `json:"products"`
}

type pharmacy struct {
	ID   int64  `json:"id"`
	Name string `json:"name"`
}

type product struct {
	Categories      []*productCategory       `json:"categories"`
	Classifications []*productClassification `json:"classifications"`
}

type productCategory struct {
	Name        string          `json:"name"`
	TotalAmount decimal.Decimal `json:"total_product_price"`
	TotalItem   int64           `json:"total_item"`
}

type productClassification struct {
	Name        string          `json:"name"`
	TotalAmount decimal.Decimal `json:"total_product_price"`
	TotalItem   int64           `json:"total_item"`
}

type SearchSalesRequest struct {
	ProductCategory       []int64 `form:"product-category" binding:"dive,numeric,gte=1"`
	ProductClassification []int64 `form:"product-classification" binding:"dive,numeric,gte=1"`
	Pharmacy              []int64 `form:"pharmacy" binding:"dive,numeric,gte=1"`
	Product               []int64 `form:"product" binding:"dive,numeric,gte=1"`
	StartDate             string  `form:"start-date" binding:"required,time_format=02-01-2006"`
	EndDate               string  `form:"end-date" binding:"required,time_format=02-01-2006"`
	Sort                  string  `form:"sort"`
	Limit                 int64   `form:"limit" binding:"numeric,gte=1,lte=25"`
	Page                  int64   `form:"page" binding:"numeric,gte=1"`
}

func SortSalesResponses(responses []*SalesResponse, order string) {
	wg := new(sync.WaitGroup)
	for _, response := range responses {
		categories := response.Product.Categories
		classifications := response.Product.Classifications

		wg.Add(2)
		go func() {
			defer wg.Done()

			sort.Slice(categories, func(i, j int) bool {
				if order == "desc" {
					return categories[i].TotalAmount.GreaterThanOrEqual(categories[j].TotalAmount)
				}
				return categories[i].TotalAmount.LessThanOrEqual(categories[j].TotalAmount)
			})
		}()
		go func() {
			defer wg.Done()

			sort.Slice(classifications, func(i, j int) bool {
				if order == "desc" {
					return classifications[i].TotalAmount.GreaterThanOrEqual(classifications[j].TotalAmount)
				}
				return classifications[i].TotalAmount.LessThanOrEqual(classifications[j].TotalAmount)
			})
		}()
		wg.Wait()
	}
}

func ConvertToSalesResponses(categorySales []*entity.CategorySales, classificationSales []*entity.ClassificationSales) []*SalesResponse {
	var mu sync.Mutex
	wg := new(sync.WaitGroup)
	salesMap := map[int]*SalesResponse{}
	responses := []*SalesResponse{}

	wg.Add(2)
	go func() {
		defer wg.Done()

		for _, category := range categorySales {
			mu.Lock()

			if res, exists := salesMap[int(category.PharmacyID)]; exists {
				res.Product.Categories = append(res.Product.Categories, convertToProductCategory(category))
			} else {
				res := &SalesResponse{
					Pharmacy: pharmacy{
						ID:   category.PharmacyID,
						Name: category.PharmacyName,
					},
					Product: product{
						Categories: []*productCategory{
							convertToProductCategory(category),
						},
						Classifications: []*productClassification{},
					},
				}
				salesMap[int(category.PharmacyID)] = res
				responses = append(responses, res)
			}

			mu.Unlock()
		}
	}()

	go func() {
		defer wg.Done()

		for _, classification := range classificationSales {
			mu.Lock()
			if res, exists := salesMap[int(classification.PharmacyID)]; exists {
				res.Product.Classifications = append(res.Product.Classifications, convertToProductClassification(classification))
			} else {
				res := &SalesResponse{
					Pharmacy: pharmacy{
						ID:   classification.PharmacyID,
						Name: classification.PharmacyName,
					},
					Product: product{
						Categories: []*productCategory{},
						Classifications: []*productClassification{
							convertToProductClassification(classification),
						},
					},
				}
				salesMap[int(classification.PharmacyID)] = res
				responses = append(responses, res)
			}
			mu.Unlock()
		}
	}()

	wg.Wait()
	return responses
}

func convertToProductCategory(entity *entity.CategorySales) *productCategory {
	return &productCategory{
		Name:        entity.CategoryName,
		TotalAmount: entity.TotalAmount,
		TotalItem:   entity.TotalItem,
	}
}

func convertToProductClassification(entity *entity.ClassificationSales) *productClassification {
	return &productClassification{
		Name:        entity.ClassificationName,
		TotalAmount: entity.TotalAmount,
		TotalItem:   entity.TotalItem,
	}
}
