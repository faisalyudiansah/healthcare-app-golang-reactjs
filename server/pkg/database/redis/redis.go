package redis

import (
	"context"
	"fmt"
	"time"

	"healthcare-app/pkg/config"
	"healthcare-app/pkg/logger"

	"github.com/redis/go-redis/v9"
)

func InitRedis(cfg *config.RedisConfig) *redis.Client {
	rdb := redis.NewClient(&redis.Options{
		Addr: fmt.Sprintf("%v:%v", cfg.Host, cfg.Port),
	})

	ctx := context.Background()
	for {
		err := rdb.Ping(ctx).Err()
		if err == nil {
			break
		}
		logger.Log.Info("waiting for redis to be ready...")
		time.Sleep(1 * time.Second)
	}
	logger.Log.Info("redis is ready...")

	return rdb
}
