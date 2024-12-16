package middleware

import (
	"context"

	"strings"

	"healthcare-app/pkg/constant"
	"healthcare-app/pkg/utils/jwtutils"

	"github.com/gin-gonic/gin"
)

func Home(jwtUtil jwtutils.JwtUtil) gin.HandlerFunc {
	return func(c *gin.Context) {
		reqToken := c.GetHeader("Authorization")
		if reqToken == "" || len(reqToken) == 0 {
			return
		}

		splitToken := strings.Split(reqToken, " ")
		if len(splitToken) != 2 || splitToken[0] != "Bearer" {
			return
		}

		result, err := jwtUtil.Parse(splitToken[1])
		if err != nil {
			return
		}

		var userId constant.ID = "user_id"
		ctxId := context.WithValue(c.Request.Context(), userId, result.UserID)
		c.Request = c.Request.WithContext(ctxId)

		c.Next()
	}
}
