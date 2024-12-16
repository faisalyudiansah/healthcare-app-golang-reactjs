package middleware

import (
	"context"
	"time"

	"healthcare-app/pkg/apperror"
	"healthcare-app/pkg/config"

	"github.com/gin-gonic/gin"
)

func RequestTimeout(cfg *config.Config) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		timeoutCtx, cancel := context.WithTimeout(
			ctx.Request.Context(),
			time.Duration(cfg.HttpServer.RequestTimeoutPeriod)*time.Second,
		)
		defer cancel()

		done := make(chan struct{})
		ctx.Request = ctx.Request.WithContext(timeoutCtx)

		go next(ctx, done)

		select {
		case <-timeoutCtx.Done():
			ctx.Error(apperror.NewTimeoutError())
			ctx.Abort()
		case <-done:
		}
	}
}

func next(ctx *gin.Context, done chan struct{}) {
	defer func() {
		close(done)
		if err, ok := recover().(error); ok && err != nil {
			ctx.Error(err)
			ctx.Abort()
		}
	}()

	ctx.Next()
}
