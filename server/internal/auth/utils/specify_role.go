package utils

func SpecifyRole(roleId int) string {
	switch roleId {
	case 1:
		return "user"
	case 2:
		return "pharmacist"
	case 3:
		return "admin"
	default:
		return "unknown"
	}
}
