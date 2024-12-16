package payload

type VerificationEmailPayload struct {
	Email string `json:"email"`
	Token string `json:"token"`
}

type ForgotPasswordEmailPayload struct {
	Email string `json:"email"`
	Token string `json:"token"`
}

type PharmacistAccountEmailPayload struct {
	Email    string `json:"email"`
	Name     string `json:"name"`
	Sipa     string `json:"sipa"`
	Whatsapp string `json:"whatsapp"`
	Password string `json:"password"`
	Yoe      int    `json:"yoe"`
}
