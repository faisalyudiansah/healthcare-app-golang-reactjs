package route

import (
	"healthcare-app/internal/auth/constant"
	"healthcare-app/internal/order/controller"
	"healthcare-app/pkg/middleware"

	"github.com/gin-gonic/gin"
)

func AdminOrderControllerRoute(c *controller.AdminOrderController, r *gin.Engine, authMiddleware *middleware.AuthMiddleware) {
	g := r.Group("/admin/pharmacies", authMiddleware.Authorization(), authMiddleware.ProtectedRoles(constant.ADMIN))
	{
		g.GET("/orders", c.Search)
	}
}

func PharmacistOrderControllerRoute(c *controller.PharmacistOrderController, r *gin.Engine, authMiddleware *middleware.AuthMiddleware) {
	r.GET("/pharmacists/pharmacies/orders", authMiddleware.Authorization(), authMiddleware.ProtectedRoles(constant.PHARMACIST), c.GetAllOrders)

	g := r.Group("/pharmacists/pharmacies/:pharmacyId/orders", authMiddleware.Authorization(), authMiddleware.ProtectedRoles(constant.PHARMACIST))
	{
		g.GET("/:orderId", c.GetOrderById)
		g.PATCH("", c.SendOrder)
		g.DELETE("", c.CancelOrder)
	}
}

func UserOrderControllerRoute(c *controller.UserOrderController, r *gin.Engine, authMiddleware *middleware.AuthMiddleware) {
	r.GET("/orders/:orderId", authMiddleware.Authorization(), c.GetOrderByID)
	g := r.Group("/orders", authMiddleware.Authorization(), authMiddleware.ProtectedRoles(constant.USER))
	{
		g.GET("", c.GetMyOrders)
		g.POST("/checkout", c.PostNewOrder)
		g.POST("/payment/:orderId", c.PostUploadPaymentProof)
		g.PATCH("/confirm/:orderId", c.PatchStatusOrder)
	}
}
