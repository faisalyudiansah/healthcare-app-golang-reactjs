package smtputils

import (
	"embed"
)

//go:embed templates/*.html
var EmailHTMLTemplates embed.FS

const (
	ResetPasswordSubject = "[Favipiravir] Please reset your password"
	VerificationSubject  = "[Favipiravir] Verify your account"
	PharmacistSubject    = "[Favipiravir] Pharmacist account"
)

type emailTemplate string

const (
	ResetPasswordTemplate emailTemplate = "templates/forgot-password.html"
	VerificationTemplate  emailTemplate = "templates/verification.html"
	PharmacistTemplate    emailTemplate = "templates/pharmacist.html"
)
