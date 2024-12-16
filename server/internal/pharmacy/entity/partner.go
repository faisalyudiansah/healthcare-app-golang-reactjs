package entity

import "time"

type Partner struct {
	CreatedAt   time.Time
	UpdatedAt   time.Time
	Name        string
	LogoURL     string
	YearFounded string
	ActiveDays  string
	StartOpt    string
	EndOpt      string
	ID          int64
	IsActive    bool
}
