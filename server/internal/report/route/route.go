package route

import (
	"healthcare-app/internal/auth/constant"
	"healthcare-app/internal/report/controller"
	"healthcare-app/pkg/middleware"

	"github.com/gin-gonic/gin"
)

func AdminReportControllerRoute(c *controller.AdminReportController, r *gin.Engine, authMiddleware *middleware.AuthMiddleware) {
	g := r.Group("/admin/reports", authMiddleware.Authorization(), authMiddleware.ProtectedRoles(constant.ADMIN))
	{
		g.GET("/sales", c.SearchSalesReport)
	}
}
