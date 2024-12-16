package dto

type QueryGetMyOrder struct {
	Limit  int64  `form:"limit" binding:"numeric,gte=1,lte=25"`
	Page   int64  `form:"page" binding:"numeric,gte=1"`
	Offset int64  `form:"offset"`
	Sort   string `form:"sort"`
	SortBy string `form:"sortBy"`
	Search string `form:"q"`
	Status int    `form:"status" binding:"numeric,gte=0,lte=5"`
}
