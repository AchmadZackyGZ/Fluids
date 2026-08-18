package validator

import "github.com/go-playground/validator/v10"

var Validate = validator.New() // Validate adalah singleton instance validator untuk seluruh aplikasi

// ValidationErrors mengubah error validator mentah menjadi map[field]pesan_error
// Contoh output: {"email": "format email tidak valid", "password": "password minimal 8 karakter"}
func ValidationErrors(err error) map[string]string {
	out := make(map[string]string)
	if verrs, ok := err.(validator.ValidationErrors); ok {
		for _, fe := range verrs {
			out[fe.Field()] = friendlyMessage(fe)
		}
	}
	return out
}

// friendlyMessage menerjemahkan tag validasi validator menjadi pesan bahasa manusia yang ramah
func friendlyMessage(fe validator.FieldError) string {
	switch fe.Tag() {
	case "required":
		return fe.Field() + " wajib diisi"
	case "email":
		return "format email tidak valid"
	case "min":
		return fe.Field() + " minimal " + fe.Param() + " karakter"
	case "max":
		return fe.Field() + " maksimal " + fe.Param() + " karakter"
	case "alphanum":
		return fe.Field() + " hanya boleh berisi huruf dan angka"
	default:
		return fe.Field() + " tidak valid"
	}
}
