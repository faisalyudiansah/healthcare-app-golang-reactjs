package route

import (
	"fmt"

	"healthcare-app/internal/auth/constant"
	"healthcare-app/internal/pharmacy/controller"
	"healthcare-app/pkg/middleware"

	"github.com/gin-gonic/gin"
)

const pharmacyId = "/:pharmacyId"

func UserControllerRoute(c *controller.UserController, r *gin.Engine, authMiddleware *middleware.AuthMiddleware) {
	pharmacies := r.Group("/pharmacies")
	{
		pharmacies.GET("", c.Search)
		pharmacies.POST("/cost", authMiddleware.Authorization(), authMiddleware.ProtectedRoles(constant.USER), c.Shipping)
	}
}

func LogisticControllerRoute(c *controller.LogisticController, r *gin.Engine, authMiddleware *middleware.AuthMiddleware) {
	logistics := r.Group("/logistics", authMiddleware.Authorization(), authMiddleware.ProtectedRoles(constant.ADMIN, constant.PHARMACIST))
	{
		logistics.GET("", c.Search)
	}
}

func AdminControllerRoute(c *controller.AdminController, r *gin.Engine, authMiddleware *middleware.AuthMiddleware) {
	partners := r.Group("/admin/partners", authMiddleware.Authorization(), authMiddleware.ProtectedRoles(constant.ADMIN))
	{
		const partnerId = "/:partnerId"
		partners.GET("", c.GetAllPartner)
		partners.POST("", c.CreatePartner)
		partners.GET(partnerId, c.GetPartner)
		partners.PUT(partnerId, c.UpdatePartner)
		partners.DELETE(partnerId, c.DeletePartner)
	}

	pharmacies := r.Group("/admin/pharmacies", authMiddleware.Authorization(), authMiddleware.ProtectedRoles(constant.ADMIN))
	{
		pharmacies.GET("", c.SearchPharmacy)
		pharmacies.POST("", c.CreatePharmacy)
		pharmacies.GET(pharmacyId, c.GetPharmacy)
		pharmacies.PUT(pharmacyId, c.UpdatePharmacy)
		pharmacies.DELETE(pharmacyId, c.DeletePharmacy)
		pharmacies.GET(fmt.Sprintf("%v/products/export", pharmacyId), c.DownloadPharmacyMedicines)
	}
}

func PharmacistControllerRoute(c *controller.PharmacistController, r *gin.Engine, authMiddleware *middleware.AuthMiddleware) {
	pharmacies := r.Group("/pharmacists/pharmacies", authMiddleware.Authorization(), authMiddleware.ProtectedRoles(constant.PHARMACIST))
	{
		pharmacies.GET("", c.SearchPharmacy)
		pharmacies.GET(pharmacyId, c.GetPharmacy)
		pharmacies.PUT(pharmacyId, c.UpdatePharmacy)
	}
}
