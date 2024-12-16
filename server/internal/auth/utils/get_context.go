package utils

import (
	"context"

	"healthcare-app/pkg/constant"
)

func GetValueUserIdFromToken(c context.Context) int64 {
	var key constant.ID = "user_id"
	if userId, ok := c.Value(key).(int64); ok {
		return userId
	}
	return 0
}

func GetValueRoleUserFromToken(c context.Context) int {
	var key constant.Role = "role"
	if role, ok := c.Value(key).(int); ok {
		return role
	}
	return 0
}

func GetJTIFromToken(c context.Context) string {
	var key constant.JTI = "jti"
	if key, ok := c.Value(key).(string); ok {
		return key
	}
	return ""
}
