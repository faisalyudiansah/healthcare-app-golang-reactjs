package controller

import (
	"net/http"

	"healthcare-app/pkg/dto"

	"github.com/gin-contrib/pprof"
	"github.com/gin-gonic/gin"
	"github.com/prometheus/client_golang/prometheus/promhttp"
)

type AppController struct {
}

func NewAppController() *AppController {
	return &AppController{}
}

func (c *AppController) Route(r *gin.Engine) {
	r.NoRoute(c.RouteNotFound)
	r.NoMethod(c.MethodNotAllowed)
	r.GET("", c.Root)
	r.GET("/metrics", gin.WrapH(promhttp.Handler()))
	pprof.Register(r)
}

func (c *AppController) Root(ctx *gin.Context) {
	ctx.JSON(http.StatusOK, dto.WebResponse[any]{
		Message: "welcome to favipiravir healthcare API",
	})
}

func (c *AppController) RouteNotFound(ctx *gin.Context) {
	ctx.JSON(http.StatusNotFound, dto.WebResponse[any]{
		Message: "route not found",
	})
}

func (c *AppController) MethodNotAllowed(ctx *gin.Context) {
	ctx.JSON(http.StatusMethodNotAllowed, dto.WebResponse[any]{
		Message: "method not allowed",
	})
}
