package constant

const (
	STATUS_WAITING   = "WAITING"
	STATUS_PROCESSED = "PROCESSED"
	STATUS_SENT      = "SENT"
	STATUS_CONFIRMED = "CONFIRMED"
	STATUS_CANCELLED = "CANCELLED"
)

const (
	MAX_IMAGE_SIZE = 500 * 1024 // 500 kb
)

const (
	OFFICIAL_CODE = "official"
)

var (
	UserAllowedSorts = map[string]string{
		"date":   "created_at",
		"amount": "total_payment",
	}
	AllowedOrderDir = map[string]struct{}{
		"asc":  {},
		"desc": {},
	}
)
