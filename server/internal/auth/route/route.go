package route

import (
	"healthcare-app/internal/auth/constant"
	"healthcare-app/internal/auth/controller"
	"healthcare-app/pkg/middleware"

	"github.com/gin-gonic/gin"
)

const pharmacistId = "/:pharmacistId"

func RefreshTokenControllRoute(c *controller.RefreshTokenController, r *gin.Engine, authMiddleware *middleware.AuthMiddleware) {
	g := r.Group("/auth")
	{
		g.POST("/logout", authMiddleware.Authorization(), c.Logout)
	}
}

func OauthControllerRoute(c *controller.OauthController, r *gin.Engine) {
	g := r.Group("/auth")
	{
		g.GET("/:provider/login", c.Login)
		g.GET("/:provider/callback", c.Callback)
		g.GET("/:provider/logout", c.Logout)
	}
}

func UserControllerRoute(c *controller.UserController, r *gin.Engine) {
	g := r.Group("/auth")
	{
		g.POST("/login", c.Login)
		g.POST("/register", c.Register)
		g.POST("/forgot-password", c.ForgotPassword)
		g.POST("/reset-password", c.ResetPassword)
		g.POST("/send-verification", c.SendVerification)
		g.POST("/verify-email", c.VerifyAccount)
	}
}

func AdminControllerRoute(c *controller.AdminController, r *gin.Engine, authMiddleware *middleware.AuthMiddleware) {
	r.GET("/admin/users", c.SearchUser)

	g := r.Group("/admin/pharmacists", authMiddleware.Authorization(), authMiddleware.ProtectedRoles(constant.ADMIN))
	{
		g.GET("", c.SearchPharmacist)
		g.POST("", c.CreateAccount)
		g.GET(pharmacistId, c.GetPharmacistByID)
		g.PUT(pharmacistId, c.UpdateAccount)
		g.DELETE(pharmacistId, c.DeleteAccount)
	}
}
