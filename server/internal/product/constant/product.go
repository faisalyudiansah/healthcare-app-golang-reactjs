package constant

const (
	OBAT_BEBAS          = 1
	OBAT_KERAS          = 2
	OBAT_BEBAS_TERBATAS = 3
	NON_OBAT            = 4
)

const (
	MAX_IMAGE_SIZE = 500 * 1024 // 500 kb
)

var (
	UserAllowedSorts = map[string]string{
		"price": "rfp.price",
	}
	AdminAllowedSorts = map[string]string{
		"date":  "p.created_at",
		"name":  "p.name",
		"usage": "total_usage",
	}
	PharmacistAllowedSorts = map[string]string{
		"date":  "pp.created_at",
		"name":  "p.name",
		"stock": "pp.stock_quantity",
	}
	AllowedOrderDir = map[string]struct{}{
		"asc":  {},
		"desc": {},
	}
)
