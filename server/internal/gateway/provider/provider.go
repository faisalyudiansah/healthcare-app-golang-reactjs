package provider

import (
	"database/sql"

	gatewayController "healthcare-app/internal/gateway/controller"

	"healthcare-app/pkg/config"
	"healthcare-app/pkg/database/postgres"
	"healthcare-app/pkg/database/redis"

	"github.com/RediSearch/redisearch-go/redisearch"
	"github.com/gin-gonic/gin"
	"github.com/hibiken/asynq"
	redisV9 "github.com/redis/go-redis/v9"
)

var (
	db  *sql.DB
	rdb *redisV9.Client
	rds *redisearch.Client
)

func InitProvider(cfg *config.Config) {
	db = postgres.InitStdLib(cfg)
	rdb = redis.InitRedis(cfg.Redis)
	rds = redis.InitRedisSearch(cfg.Redis)
	ProvideUtils(cfg, db, rdb)
}

func ProvideHttpDependency(cfg *config.Config, router *gin.Engine) {
	ProvideGatewayModule(router)
	ProvideAuthModule(router)
	ProvidePharmacyModule(cfg, router)
	ProvideProductModule(router)
	ProvideCartModule(router)
	ProvideOrderModule(router)
	ProvideReportModule(router)
	cronJob.Start()
}

func ProvideQueueDependency(client *asynq.Client, mux *asynq.ServeMux) {
	ProvideQueueModule(client, mux)
}

func ProvideGatewayModule(router *gin.Engine) {
	appController := gatewayController.NewAppController()
	appController.Route(router)
}
