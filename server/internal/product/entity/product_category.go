package entity

import "time"

type ProductCategory struct {
	ID        int64
	Name      string
	CreatedAt time.Time
	UpdatedAt time.Time
}
