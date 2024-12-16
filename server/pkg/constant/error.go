package constant

const (
	EntityNotFoundErrorMessage        = "%s not found"
	RequestTimeoutErrorMessage        = "failed to process request in time, please try again"
	UnauthorizedErrorMessage          = "unauthorized"
	EOFErrorMessage                   = "missing body request"
	StrConvSyntaxErrorMessage         = "invalid syntax for %s"
	ForbiddenAccessErrorMessage       = "you do not have permission to access this resource"
	TooManyRequestsErrorMessage       = "the server is experiencing high load, please try again later"
	InternalServerErrorMessage        = "currently our server is facing unexpected error, please try again later"
	ResetPasswordErrorMessage         = "please try again later"
	ValidationErrorMessage            = "input validation error"
	InvalidJsonUnmarshallErrorMessage = "invalid JSON format"
	JsonSyntaxErrorMessage            = "invalid JSON syntax"
	InvalidJsonValueTypeErrorMessage  = "invalid value for %s"
	InvalidIDErrorMessage             = "expected a numeric value"
)
