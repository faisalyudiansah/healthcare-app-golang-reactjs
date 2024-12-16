package constant

const (
	ProductImageErrorMessage                 = "the image must be in .png format and must not exceed %v in size"
	ProductAlreadyExistsErrorMessage         = "product already exists"
	ProductClassificationErrorMessage        = "product form, selling unit, and unit in pack are required"
	NoNearbyPharmaciesErrorMessage           = "there are no pharmacies within 25 km of your location, please consider updating your location"
	PharmacyProductAlreadyExistsErrorMessage = "pharmacy product already exists"
	PharmacistProductErrorMessage            = "pharmacist doesn't belong to the pharmacy"
	PharmacyProductDeletionErrorMessage      = "product has already been purchased, deletion is not allowed"
	PharmacyProductStockErrorMessage         = "stock can only be updated once per day"
	PharmacyProductPharmacyInactiveError     = "pharmacy is inactive"
	InvalidCategoryAlreadyExists             = "category name already exists"
	InvalidCategoryIdDoesNotExists           = "category id does not exists"
	InvalidCategoryNameAtLeast3char          = "category name must be at least 3 characters long"
)
