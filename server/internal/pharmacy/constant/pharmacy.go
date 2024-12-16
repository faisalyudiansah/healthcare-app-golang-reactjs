package constant

var (
	AdminAllowedSorts = map[string]string{
		"date": "p.created_at",
		"name": "p.name",
	}
	AllowedOrderDir = map[string]struct{}{
		"asc":  {},
		"desc": {},
	}
)
