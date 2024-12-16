package constant

const (
	PartnerImageErrorMessage          = "the image must be in .png format and must not exceed %v in size"
	PartnerDependencyErrorMessage     = "there are existing pharmacies associated with this partner"
	PartnerAlreadyExistsErrorMessage  = "partner with %v name already exists"
	PharmacyActivationErrorMessage    = "a pharmacist must be assigned before activation"
	PharmacyDependencyErrorMessage    = "there are pharmacist assigned or ongoing orders associated with this pharmacy"
	PharmacyAlreadyExistsErrorMessage = "pharmacy already exists"
	PharmacistModifyErrorMessage      = "can't modify the pharmacy, pharmacist doesn't belong to the pharmacy"
)
