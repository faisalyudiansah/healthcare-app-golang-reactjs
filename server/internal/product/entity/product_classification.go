package entity

import "time"

type ProductClassification struct {
	CreatedAt time.Time
	UpdatedAt time.Time
	Name      string
	ID        int64
}
