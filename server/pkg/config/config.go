package config

import (
	"log"
	"os"
	"path/filepath"

	"github.com/spf13/viper"
)

type Config struct {
	App        *AppConfig
	HttpServer *HttpServerConfig
	Database   *DatabaseConfig
	Jwt        *JwtConfig
	SMTP       *SMTPConfig
	Redis      *RedisConfig
	ES         *ESConfig
	Logger     *LoggerConfig
	Google     *GoogleConfig
	RajaOngkir *RajaOngkirConfig
}

type AppConfig struct {
	Environment string `mapstructure:"APP_ENVIRONMENT"`
	BCryptCost  int    `mapstructure:"APP_BCRYPT_COST"`
}

type HttpServerConfig struct {
	SessionSecret        string `mapstructure:"HTTP_SERVER_SESSION_SECRET"`
	Host                 string `mapstructure:"HTTP_SERVER_HOST"`
	Port                 int    `mapstructure:"HTTP_SERVER_PORT"`
	SessionAge           int    `mapstructure:"HTTP_SERVER_SESSION_AGE"`
	GracePeriod          int    `mapstructure:"HTTP_SERVER_GRACE_PERIOD"`
	MaxRequestPerSecond  int    `mapstructure:"HTTP_SERVER_MAX_REQUEST_PER_SECOND"`
	RequestTimeoutPeriod int    `mapstructure:"HTTP_SERVER_REQUEST_TIMEOUT_PERIOD"`
}

type DatabaseConfig struct {
	Host                  string `mapstructure:"DB_HOST"`
	DbName                string `mapstructure:"DB_NAME"`
	Username              string `mapstructure:"DB_USER"`
	Password              string `mapstructure:"DB_PASSWORD"`
	Sslmode               string `mapstructure:"DB_SSL_MODE"`
	Port                  int    `mapstructure:"DB_PORT"`
	MaxIdleConn           int    `mapstructure:"DB_MAX_IDLE_CONN"`
	MaxOpenConn           int    `mapstructure:"DB_MAX_OPEN_CONN"`
	MaxConnLifetimeMinute int    `mapstructure:"DB_CONN_MAX_LIFETIME"`
}

type JwtConfig struct {
	AllowedAlgs     []string `mapstructure:"JWT_ALLOWED_ALGS"`
	Issuer          string   `mapstructure:"JWT_ISSUER"`
	SecretKey       string   `mapstructure:"JWT_SECRET_KEY"`
	TokenDuration   int      `mapstructure:"JWT_TOKEN_DURATION"`
	RefreshDuration int      `mapstructure:"JWT_REFRESH_DURATION"`
}

type SMTPConfig struct {
	Host        string `mapstructure:"SMTP_HOST"`
	Email       string `mapstructure:"SMTP_EMAIL"`
	AppPassword string `mapstructure:"SMTP_APP_PASSWORD"`
	Port        int    `mapstructure:"SMTP_PORT"`
}

type RedisConfig struct {
	Host              string `mapstructure:"REDIS_HOST"`
	Port              int    `mapstructure:"REDIS_PORT"`
	DefaultExpiration int    `mapstructure:"REDIS_DEFAULT_EXPIRATION"`
}

type RajaOngkirConfig struct {
	ApiKey  string `mapstructure:"RAJAONGKIR_API_KEY"`
	BaseURL string `mapstructure:"RAJAONGKIR_BASE_URL"`
}

type ESConfig struct {
	Addresses []string `mapstructure:"ES_ADDRESSES"`
}

type LoggerConfig struct {
	Level int `mapstructure:"LOGGER_LEVEL"`
}

type GoogleConfig struct {
	ClientID     string `mapstructure:"GOOGLE_CLIENT_ID"`
	ClientSecret string `mapstructure:"GOOGLE_CLIENT_SECRET"`
	CallbackURL  string `mapstructure:"GOOGLE_CALLBACK_URL"`
}

func InitConfig() *Config {
	configPath := parseConfigPath()
	viper.AddConfigPath(configPath)
	viper.SetConfigName(".env")
	viper.SetConfigType("env")

	if err := viper.ReadInConfig(); err != nil {
		log.Fatalf("error reading config file: %v", err)
	}

	os.Setenv("CLOUDINARY_URL", viper.GetString("CLOUDINARY_URL"))

	return &Config{
		App:        initAppConfig(),
		Database:   initDbConfig(),
		HttpServer: initHttpServerConfig(),
		Jwt:        initJwtConfig(),
		SMTP:       initSMTPConfig(),
		Redis:      initRedisConfig(),
		ES:         initESConfig(),
		Logger:     initLoggerConfig(),
		Google:     initGoogleConfig(),
		RajaOngkir: initRajaOngkirConfig(),
	}
}

func initLoggerConfig() *LoggerConfig {
	loggerConfig := &LoggerConfig{}

	if err := viper.Unmarshal(&loggerConfig); err != nil {
		log.Fatalf("error mapping logger config: %v", err)
	}

	return loggerConfig
}

func initJwtConfig() *JwtConfig {
	jwtConfig := &JwtConfig{}

	if err := viper.Unmarshal(&jwtConfig); err != nil {
		log.Fatalf("error mapping jwt config: %v", err)
	}

	return jwtConfig
}

func initSMTPConfig() *SMTPConfig {
	smtpConfig := &SMTPConfig{}

	if err := viper.Unmarshal(&smtpConfig); err != nil {
		log.Fatalf("error mapping smtp config: %v", err)
	}

	return smtpConfig
}

func initRedisConfig() *RedisConfig {
	redisConfig := &RedisConfig{}

	if err := viper.Unmarshal(&redisConfig); err != nil {
		log.Fatalf("error mapping redis config: %v", err)
	}

	return redisConfig
}

func initGoogleConfig() *GoogleConfig {
	googleConfig := &GoogleConfig{}

	if err := viper.Unmarshal(&googleConfig); err != nil {
		log.Fatalf("error mapping redis config: %v", err)
	}

	return googleConfig
}

func initRajaOngkirConfig() *RajaOngkirConfig {
	rajaOngkirConfig := &RajaOngkirConfig{}

	if err := viper.Unmarshal(&rajaOngkirConfig); err != nil {
		log.Fatalf("error mapping rajaongkir config: %v", err)
	}

	return rajaOngkirConfig
}

func initESConfig() *ESConfig {
	esConfig := &ESConfig{}

	if err := viper.Unmarshal(&esConfig); err != nil {
		log.Fatalf("error mapping elastic search config: %v", err)
	}

	return esConfig
}

func initDbConfig() *DatabaseConfig {
	dbConfig := &DatabaseConfig{}

	if err := viper.Unmarshal(&dbConfig); err != nil {
		log.Fatalf("error mapping database config: %v", err)
	}

	return dbConfig
}

func initHttpServerConfig() *HttpServerConfig {
	httpServerConfig := &HttpServerConfig{}

	if err := viper.Unmarshal(&httpServerConfig); err != nil {
		log.Fatalf("error mapping http server config: %v", err)
	}

	return httpServerConfig
}

func initAppConfig() *AppConfig {
	appConfig := &AppConfig{}

	if err := viper.Unmarshal(&appConfig); err != nil {
		log.Fatalf("error mapping app config: %v", err)
	}

	return appConfig
}

func parseConfigPath() string {
	wd, err := os.Getwd()
	if err != nil {
		panic(err)
	}

	return filepath.Join(wd, "configs", "envs")
}
