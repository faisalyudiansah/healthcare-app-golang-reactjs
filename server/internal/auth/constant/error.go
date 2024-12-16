package constant

const (
	InvalidLoginCredentialsErrorMessage  = "invalid combination of email or password"
	InvalidResetPasswordCodeErrorMessage = "invalid reset password code"
	InvalidTokenCredentialsErrorMessage  = "invalid combination of token or email"
	UnverifiedErrorMessage               = "your account is not verified"
	EmailNotExistsErrorMessage           = "email doesn't exists"
	InvalidEmailAlreadyExists            = "email already exists"
	TokenAlreadyExistsErrorMessage       = "a token was recently generated, please wait before requesting a new one"
	AlreadyVerifiedErrorMessage          = "your account has been verified"
	ExpiredTokenErrorMessage             = "the token has expired, please request a new one"
	InvalidQueryLimit                    = "invalid query limit"
	InvalidQueryPage                     = "invalid query page"
	InvalidQueryRole                     = "invalid query role"
	InvalidQueryIsAssign                 = "invalid query is_assign"
	InvalidUserId                        = "invalid user id or user id does not exists"
	InvalidSipaNumberAlreadyExists       = "sipa number already exists"
	InvalidWhatsappNumberAlreadyExists   = "whatsapp number already exists"
	InvalidPharmacistAssigned            = "pharmacist is assigned"
	InvalidPharmacistId                  = "invalid pharmacist id"
	InvalidPharmacistIdDoesNotExists     = "pharmacist id does not exists : %v"
	InvalidQueryisAssignAndRole          = "you cannot choose role 1 or 3 with is_assign 1 or 2"
)
