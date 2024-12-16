package utils

import "time"

func CoalesceInt64(value *int64) int64 {
	if value == nil {
		return 0
	}
	return *value
}

func CoalesceString(value *string) string {
	if value == nil {
		return ""
	}
	return *value
}

func CoalesceInt(value *int) int {
	if value == nil {
		return 0
	}
	return *value
}

func CoalesceTime(value *time.Time) time.Time {
	if value == nil {
		return time.Time{}
	}
	return *value
}
