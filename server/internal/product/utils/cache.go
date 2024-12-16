package utils

import "fmt"

func UserProductCacheKey(userID int64) string {
	return fmt.Sprintf("home-user:%v", userID)
}
