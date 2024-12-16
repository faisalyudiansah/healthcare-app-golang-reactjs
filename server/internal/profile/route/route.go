package route

import (
	"healthcare-app/internal/auth/constant"
	"healthcare-app/internal/profile/controller"
	"healthcare-app/pkg/middleware"

	"github.com/gin-gonic/gin"
)

func ClusterControllerRoute(c *controller.ClusterController, r *gin.Engine) {
	g := r.Group("/clusters")
	{
		g.GET("/provinces", c.ListProvince)
		g.GET("/cities", c.ListCity)
		g.GET("/cities/search", c.SearchCity)
		g.GET("/districts", c.ListDistrict)
		g.GET("/sub-districts", c.ListSubDistrict)
	}
}

func AddressControllerRoute(c *controller.AddressController, r *gin.Engine, authMiddleware *middleware.AuthMiddleware) {
	g := r.Group("/users/me", authMiddleware.Authorization())
	g.POST("/addresses", c.PostNewAddress)
	g.GET("/addresses", c.GetAllMyAddress)
	g.PATCH("/addresses/:idAddress", c.PatchAddressActive)
	g.DELETE("/addresses/:idAddress", c.DeleteMyAddress)
	g.PUT("/addresses/:idAddress", c.PutMyAddress)
}

func ProfileControllerRoute(c *controller.ProfileController, r *gin.Engine, authMiddleware *middleware.AuthMiddleware) {
	g := r.Group("/users/", authMiddleware.Authorization())
	g.GET("/me", c.GetMyProfile)
	g.PUT("/me", c.PutMyProfile)
	g.GET("/:userId", authMiddleware.ProtectedRoles(constant.ADMIN), c.GetProfileById)
}
