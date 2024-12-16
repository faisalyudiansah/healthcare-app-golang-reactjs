package provider

import (
	"database/sql"
	"log"
	"time"

	"healthcare-app/internal/auth/repository"
	"healthcare-app/internal/auth/usecase"
	"healthcare-app/pkg/config"
	"healthcare-app/pkg/database/transactor"
	"healthcare-app/pkg/middleware"
	"healthcare-app/pkg/utils/cloudinaryutils"
	"healthcare-app/pkg/utils/encryptutils"
	"healthcare-app/pkg/utils/jwtutils"
	"healthcare-app/pkg/utils/redisutils"
	"healthcare-app/pkg/utils/smtputils"

	"github.com/redis/go-redis/v9"
	"github.com/robfig/cron/v3"
)

var (
	refreshTokenRepository repository.RefreshTokenRepository
)

var (
	refreshTokenUseCase usecase.RefreshTokenUseCase
)

var (
	cloudinaryUtil    cloudinaryutils.CloudinaryUtil
	jwtUtil           jwtutils.JwtUtil
	smtpUtil          smtputils.SMTPUtils
	redisUtil         redisutils.RedisUtil
	passwordEncryptor encryptutils.PasswordEncryptor
	base64Encryptor   encryptutils.Base64Encryptor
	store             transactor.Transactor
	authMiddleware    *middleware.AuthMiddleware
	cronJob           *cron.Cron
)

func ProvideUtils(cfg *config.Config, db *sql.DB, rdb *redis.Client) {
	cloudinaryUtil = cloudinaryutils.NewCloudinaryUtil()
	jwtUtil = jwtutils.NewJwtUtil(cfg.Jwt)
	smtpUtil = smtputils.NewSMTPUtils(cfg.SMTP)
	passwordEncryptor = encryptutils.NewBcryptPasswordEncryptor(cfg.App.BCryptCost)
	base64Encryptor = encryptutils.NewBase64Encryptor()
	redisUtil = redisutils.NewRedisUtils(cfg.Redis, rdb)
	store = transactor.NewTransactor(db)

	refreshTokenRepository = repository.NewRefreshTokenRepository(db)
	refreshTokenUseCase = usecase.NewRefreshTokenUseCase(cfg.Jwt, redisUtil, jwtUtil, refreshTokenRepository, store)
	authMiddleware = middleware.NewAuthMiddleware(jwtUtil, refreshTokenUseCase)

	wib, err := time.LoadLocation("Asia/Jakarta")
	if err != nil {
		log.Fatalf("Failed to load WIB timezone: %v", err)
	}
	cronJob = cron.New(cron.WithLocation(wib))
}
