package util

func VerifyRole(userRole, requiredRole string) bool {
	return userRole == requiredRole
}

func IsAdmin(userRole string) bool {
	return VerifyRole(userRole, "admin")
}
func IsViewer(userRole string) bool {
	return VerifyRole(userRole, "viewer")
}

func ValidateRole(role string) bool {
	validRoles := map[string]bool{
		"admin":  true,
		"viewer": true,
	}

	return validRoles[role]
	// Se a role for válida, retorna true; caso contrário, retorna false
}
