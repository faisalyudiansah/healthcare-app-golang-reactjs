package redis

import (
	"fmt"

	"healthcare-app/pkg/config"
	"healthcare-app/pkg/logger"

	"github.com/RediSearch/redisearch-go/redisearch"
)

func InitRedisSearch(cfg *config.RedisConfig) *redisearch.Client {
	rds := redisearch.NewClient(fmt.Sprintf("%v:%v", cfg.Host, cfg.Port), "favipiravirIndex")

	if err := rds.Drop(); err != nil {
		logger.Log.Info("no existing index...")
	}
	logger.Log.Info("redisearch is ready...")

	return rds
}
