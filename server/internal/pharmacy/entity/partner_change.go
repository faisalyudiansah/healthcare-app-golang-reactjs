package entity

import "time"

type PartnerChange struct {
	CreatedAt  time.Time
	ActiveDays string
	StartOpt   string
	EndOpt     string
	ID         int64
	PartnerID  int64
}
