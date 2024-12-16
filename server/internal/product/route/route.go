package route

import (
	"healthcare-app/internal/auth/constant"
	"healthcare-app/internal/product/controller"
	middlewareProduct "healthcare-app/internal/product/middleware"
	"healthcare-app/pkg/middleware"
	"healthcare-app/pkg/utils/jwtutils"

	"github.com/gin-gonic/gin"
)

func UserProductControllerRoute(c *controller.UserProductController, r *gin.Engine, jwtUtil jwtutils.JwtUtil) {
	r.GET("/categories/:categoryId/products", c.List)

	g := r.Group("/products")
	{
		g.GET("", c.Search)
		g.GET("/home", middlewareProduct.Home(jwtUtil), c.Home)
		g.GET("/:productId", c.Get)
	}
}

func AdminProductControllerRoute(c *controller.AdminProductController, r *gin.Engine, authMiddleware *middleware.AuthMiddleware) {
	products := r.Group("/admin/products", authMiddleware.Authorization(), authMiddleware.ProtectedRoles(constant.ADMIN))
	{
		const productId = "/:productId"
		products.GET("", c.SearchProduct)
		products.POST("", c.CreateProduct)
		products.GET(productId, c.GetProduct)
		products.PUT(productId, c.UpdateProduct)
		products.DELETE(productId, c.DeleteProduct)
	}
}

func ProductCategoryControllerRoute(c *controller.ProductCategoryController, r *gin.Engine, authMiddleware *middleware.AuthMiddleware) {
	r.GET("/products/categories", c.GetAllCategories)

	g := r.Group("/products/categories", authMiddleware.Authorization(), authMiddleware.ProtectedRoles(constant.ADMIN, constant.PHARMACIST))
	{
		g.POST("", c.PostProductCategory)
		g.PUT(":categoryId", c.UpdateProductCategory)
		g.DELETE("/:categoryId", c.DeleteProductCategory)
	}
}

func PharmacistProductControllerRoute(c *controller.PharmacistProductController, r *gin.Engine, authMiddleware *middleware.AuthMiddleware) {
	g := r.Group("/pharmacists", authMiddleware.Authorization(), authMiddleware.ProtectedRoles(constant.PHARMACIST))

	g.GET("/products", c.SearchProduct)
	g.GET("/products/:productId", c.GetProductDetail)

	pharmacyProduct := g.Group("/pharmacies/:pharmacyId/products", authMiddleware.Authorization(), authMiddleware.ProtectedRoles(constant.PHARMACIST))
	{
		const pharmacyProductId = "/:pharmacyProductId"
		pharmacyProduct.GET("", c.Search)
		pharmacyProduct.POST("", c.Create)
		pharmacyProduct.GET(pharmacyProductId, c.Get)
		pharmacyProduct.PUT(pharmacyProductId, c.Update)
		pharmacyProduct.DELETE(pharmacyProductId, c.Delete)
	}
}

func ManufactureControllerRoute(c *controller.ManufactureController, r *gin.Engine, authMiddleware *middleware.AuthMiddleware) {
	manufactures := r.Group("/products/manufactures", authMiddleware.Authorization(), authMiddleware.ProtectedRoles(constant.ADMIN))
	{
		manufactures.GET("", c.Search)
	}
}

func ProductFormControllerRoute(c *controller.ProductFormController, r *gin.Engine, authMiddleware *middleware.AuthMiddleware) {
	manufactures := r.Group("/products/forms", authMiddleware.Authorization(), authMiddleware.ProtectedRoles(constant.ADMIN, constant.PHARMACIST))
	{
		manufactures.GET("", c.Search)
	}
}
