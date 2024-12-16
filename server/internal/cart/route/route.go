package route

import (
	"healthcare-app/internal/auth/constant"
	"healthcare-app/internal/cart/controller"
	"healthcare-app/pkg/middleware"

	"github.com/gin-gonic/gin"
)

func CartControllerRoute(c *controller.CartController, r *gin.Engine, authMiddleware *middleware.AuthMiddleware) {
	g := r.Group("/users/me", authMiddleware.Authorization(), authMiddleware.ProtectedRoles(constant.USER))
	{
		g.GET("/cart", c.GetMyCart)
		g.POST("/cart", c.CreateCart)
		g.DELETE("/cart/:PharmacyProductId", c.DeleteCart)
		g.PUT("/cart", c.PutQuantityCart)
		g.GET("/cart/count", c.CountCart)
	}
}
