package provider

import (
	controllerAuth "healthcare-app/internal/auth/controller"
	repositoryAuth "healthcare-app/internal/auth/repository"
	routeAuth "healthcare-app/internal/auth/route"
	usecaseAuth "healthcare-app/internal/auth/usecase"
	controllerProfile "healthcare-app/internal/profile/controller"
	repositoryProfile "healthcare-app/internal/profile/repository"
	routeProfile "healthcare-app/internal/profile/route"
	usecaseProfile "healthcare-app/internal/profile/usecase"

	"github.com/gin-gonic/gin"
)

var (
	authUserRepository              repositoryAuth.UserRepository
	authAdminRepository             repositoryAuth.AdminRepository
	authResetTokenRepository        repositoryAuth.ResetTokenRepository
	authVerificationTokenRepository repositoryAuth.VerificationTokenRepository
	addressRepository               repositoryProfile.AddressRepository
	clusterRepository               repositoryProfile.ClusterRepository
	profileRepository               repositoryProfile.ProfileRepository
)

var (
	authUserUseCase  usecaseAuth.UserUseCase
	authAdminUseCase usecaseAuth.AdminUseCase
	oauthUseCase     usecaseAuth.OauthUseCase
	clusterUseCase   usecaseProfile.ClusterUseCase
	addressUseCase   usecaseProfile.AddressUseCase
	profileUseCase   usecaseProfile.ProfileUseCase
)

var (
	authUserController     *controllerAuth.UserController
	authAdminController    *controllerAuth.AdminController
	oauthController        *controllerAuth.OauthController
	refreshTokenController *controllerAuth.RefreshTokenController
	addressController      *controllerProfile.AddressController
	profileController      *controllerProfile.ProfileController
	clusterController      *controllerProfile.ClusterController
)

func ProvideAuthModule(router *gin.Engine) {
	injectAuthModuleRepository()
	injectAuthModuleUseCase()
	injectAuthModuleController()

	routeAuth.UserControllerRoute(authUserController, router)
	routeAuth.AdminControllerRoute(authAdminController, router, authMiddleware)
	routeAuth.OauthControllerRoute(oauthController, router)
	routeAuth.RefreshTokenControllRoute(refreshTokenController, router, authMiddleware)
	routeProfile.AddressControllerRoute(addressController, router, authMiddleware)
	routeProfile.ProfileControllerRoute(profileController, router, authMiddleware)
	routeProfile.ClusterControllerRoute(clusterController, router)
}

func injectAuthModuleRepository() {
	authUserRepository = repositoryAuth.NewUserRepository(db)
	authAdminRepository = repositoryAuth.NewAdminRepository(db)
	authResetTokenRepository = repositoryAuth.NewResetTokenRepository(db)
	authVerificationTokenRepository = repositoryAuth.NewVerificationTokenRepository(db)
	addressRepository = repositoryProfile.NewAddressRepository(db)
	clusterRepository = repositoryProfile.NewClusterRepository(db)
	profileRepository = repositoryProfile.NewProfileRepository(db)
}

func injectAuthModuleUseCase() {
	authUserUseCase = usecaseAuth.NewUserUseCase(
		redisUtil,
		jwtUtil,
		passwordEncryptor,
		base64Encryptor,
		emailTask,
		authUserRepository,
		authResetTokenRepository,
		refreshTokenRepository,
		authVerificationTokenRepository,
		store,
	)
	authAdminUseCase = usecaseAuth.NewAdminUseCase(
		smtpUtil,
		passwordEncryptor,
		emailTask,
		authAdminRepository,
		store,
		authUserRepository,
	)
	oauthUseCase = usecaseAuth.NewOauthUseCase(jwtUtil, authUserRepository, refreshTokenRepository, store)
	clusterUseCase = usecaseProfile.NewClusterUseCase(clusterRepository)
	addressUseCase = usecaseProfile.NewAddressUseCase(addressRepository, authUserRepository, store)
	profileUseCase = usecaseProfile.NewProfileUseCase(profileRepository, addressRepository, authUserRepository, store, cloudinaryUtil)
}

func injectAuthModuleController() {
	authUserController = controllerAuth.NewUserController(authUserUseCase)
	authAdminController = controllerAuth.NewAdminController(authAdminUseCase)
	oauthController = controllerAuth.NewOauthController(oauthUseCase, refreshTokenUseCase)
	refreshTokenController = controllerAuth.NewRefreshTokenController(refreshTokenUseCase)
	clusterController = controllerProfile.NewClusterController(clusterUseCase)
	addressController = controllerProfile.NewAddressController(addressUseCase)
	profileController = controllerProfile.NewProfileController(profileUseCase)
}
