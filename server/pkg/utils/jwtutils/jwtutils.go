package jwtutils

import (
	"errors"
	"time"

	"healthcare-app/pkg/config"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
)

type JwtUtil interface {
	Sign(userID int64, role int, jti string) (string, error)
	SignRefresh() (string, error)
	Parse(tokenString string) (*JWTClaims, error)
}

type jwtUtil struct {
	config *config.JwtConfig
}

func NewJwtUtil(jwtConfig *config.JwtConfig) *jwtUtil {
	return &jwtUtil{
		config: jwtConfig,
	}
}

type JWTClaims struct {
	jwt.RegisteredClaims
	UserID int64 `json:"user_id"`
	Role   int   `json:"role"`
}

func (h *jwtUtil) Sign(userID int64, role int, jti string) (string, error) {
	currentTime := time.Now()

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, JWTClaims{
		UserID: userID,
		Role:   role,
		RegisteredClaims: jwt.RegisteredClaims{
			ID:        jti,
			IssuedAt:  jwt.NewNumericDate(currentTime),
			ExpiresAt: jwt.NewNumericDate(currentTime.Add(time.Duration(h.config.TokenDuration) * time.Minute)),
			Issuer:    h.config.Issuer,
		},
	})

	s, err := token.SignedString([]byte(h.config.SecretKey))
	if err != nil {
		return "", err
	}

	return s, nil
}

func (h *jwtUtil) SignRefresh() (string, error) {
	currentTime := time.Now()

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, JWTClaims{
		RegisteredClaims: jwt.RegisteredClaims{
			ID:        uuid.NewString(),
			IssuedAt:  jwt.NewNumericDate(currentTime),
			ExpiresAt: jwt.NewNumericDate(currentTime.Add(time.Duration(h.config.RefreshDuration) * time.Minute)),
			Issuer:    h.config.Issuer,
		},
	})

	s, err := token.SignedString([]byte(h.config.SecretKey))
	if err != nil {
		return "", err
	}

	return s, nil
}

func (h *jwtUtil) Parse(tokenString string) (*JWTClaims, error) {
	parser := jwt.NewParser(
		jwt.WithValidMethods(h.config.AllowedAlgs),
		jwt.WithIssuer(h.config.Issuer),
		jwt.WithIssuedAt(),
	)

	return h.parseClaims(parser, tokenString)
}

func (h *jwtUtil) parseClaims(parser *jwt.Parser, tokenString string) (*JWTClaims, error) {
	token, err := parser.ParseWithClaims(tokenString, &JWTClaims{}, func(t *jwt.Token) (interface{}, error) {
		return []byte(h.config.SecretKey), nil
	})
	if err != nil && !errors.Is(err, jwt.ErrTokenExpired) {
		return nil, err
	}

	if errors.Is(err, jwt.ErrTokenExpired) {
		if claims, ok := token.Claims.(*JWTClaims); ok {
			return claims, nil
		}
	}

	if claims, ok := token.Claims.(*JWTClaims); ok && token.Valid {
		return claims, nil
	}
	return nil, errors.New("token not valid")
}
