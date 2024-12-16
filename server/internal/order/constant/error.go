package constant

const (
	InvalidOrderPharmacyErrorMessage     = "can't create order on inactive pharmacy"
	InvalidOrderSentErrorMessage         = "user still hasn't done the payment yet"
	InvalidProductIsNotActiveError       = "the product is not currently for sale"
	InvalidQueryStatus                   = "invalid query status"
	InvalidIdOrder                       = "invalid id order"
	InvalidOrderNotFound                 = "order not found"
	InvalidImageErrorMessagePaymentProof = "the image must be in .png/.jpg/.jpeg format"
	InvalidAlreadyUploadPaymentProof     = "you already upload the payment proof"
	InvalidPhotoMaxSize                  = "max size photo is %v"
	InvalidStatusAlreadyConfirmed        = "status already confirmed"
	InvalidStatusPhotoPaymentProofNull   = "you haven't uploaded proof of payment"
	InvalidStatusChanges                 = "invalid status changes"
)
