// Country-specific validation rules and utilities

export interface CountryValidationRules {
  code: string
  name: string
  flag: string
  phoneCode: string
  phoneRegex: RegExp
  phoneFormat: string
  phoneExample: string
  documentTypes: {
    cedula?: { regex: RegExp; format: string; example: string }
    dni?: { regex: RegExp; format: string; example: string }
    pasaporte?: { regex: RegExp; format: string; example: string }
    licencia?: { regex: RegExp; format: string; example: string }
  }
  minAge: number
}

export const countryValidationRules: CountryValidationRules[] = [
  {
    code: "US",
    name: "Estados Unidos",
    flag: "🇺🇸",
    phoneCode: "+1",
    phoneRegex: /^\d{10}$/,
    phoneFormat: "(XXX) XXX-XXXX",
    phoneExample: "(555) 123-4567",
    documentTypes: {
      pasaporte: {
        regex: /^[A-Z0-9]{6,9}$/,
        format: "6-9 caracteres alfanuméricos",
        example: "AB1234567",
      },
      licencia: {
        regex: /^[A-Z0-9]{8,12}$/,
        format: "8-12 caracteres alfanuméricos",
        example: "D12345678",
      },
    },
    minAge: 18,
  },
  {
    code: "EC",
    name: "Ecuador",
    flag: "🇪🇨",
    phoneCode: "+593",
    phoneRegex: /^9\d{8}$/,
    phoneFormat: "9XXXXXXXX",
    phoneExample: "987654321",
    documentTypes: {
      cedula: {
        regex: /^\d{10}$/,
        format: "10 dígitos",
        example: "1234567890",
      },
      pasaporte: {
        regex: /^[A-Z]{2}\d{6}$/,
        format: "2 letras + 6 dígitos",
        example: "EC123456",
      },
    },
    minAge: 18,
  },
  {
    code: "CL",
    name: "Chile",
    flag: "🇨🇱",
    phoneCode: "+56",
    phoneRegex: /^9\d{8}$/,
    phoneFormat: "9XXXXXXXX",
    phoneExample: "987654321",
    documentTypes: {
      dni: {
        regex: /^\d{7,8}-[\dkK]$/,
        format: "7-8 dígitos + guión + dígito verificador",
        example: "12345678-9",
      },
      pasaporte: {
        regex: /^[A-Z]{2}\d{6}$/,
        format: "2 letras + 6 dígitos",
        example: "CL123456",
      },
    },
    minAge: 18,
  },
  {
    code: "CO",
    name: "Colombia",
    flag: "🇨🇴",
    phoneCode: "+57",
    phoneRegex: /^3\d{9}$/,
    phoneFormat: "3XXXXXXXXX",
    phoneExample: "3001234567",
    documentTypes: {
      cedula: {
        regex: /^\d{6,10}$/,
        format: "6-10 dígitos",
        example: "1234567890",
      },
      pasaporte: {
        regex: /^[A-Z]{2}\d{6}$/,
        format: "2 letras + 6 dígitos",
        example: "CO123456",
      },
    },
    minAge: 18,
  },
  {
    code: "PE",
    name: "Perú",
    flag: "🇵🇪",
    phoneCode: "+51",
    phoneRegex: /^9\d{8}$/,
    phoneFormat: "9XXXXXXXX",
    phoneExample: "987654321",
    documentTypes: {
      dni: {
        regex: /^\d{8}$/,
        format: "8 dígitos",
        example: "12345678",
      },
      pasaporte: {
        regex: /^[A-Z0-9]{9}$/,
        format: "9 caracteres alfanuméricos",
        example: "PE1234567",
      },
    },
    minAge: 18,
  },
  {
    code: "PA",
    name: "Panamá",
    flag: "🇵🇦",
    phoneCode: "+507",
    phoneRegex: /^[6-9]\d{7}$/,
    phoneFormat: "XXXXXXXX",
    phoneExample: "61234567",
    documentTypes: {
      cedula: {
        regex: /^\d{1,2}-\d{3,4}-\d{4,5}$/,
        format: "X-XXX-XXXX o XX-XXXX-XXXXX",
        example: "8-123-4567",
      },
      pasaporte: {
        regex: /^[A-Z]{2}\d{6}$/,
        format: "2 letras + 6 dígitos",
        example: "PA123456",
      },
    },
    minAge: 18,
  },
  {
    code: "VE",
    name: "Venezuela",
    flag: "🇻🇪",
    phoneCode: "+58",
    phoneRegex: /^4\d{9}$/,
    phoneFormat: "4XXXXXXXXX",
    phoneExample: "4121234567",
    documentTypes: {
      cedula: {
        regex: /^[VE]-?\d{7,9}$/i,
        format: "V o E + 7-9 dígitos",
        example: "V-12345678",
      },
      pasaporte: {
        regex: /^[A-Z]{2}\d{6}$/,
        format: "2 letras + 6 dígitos",
        example: "VE123456",
      },
    },
    minAge: 18,
  },
]

export function getCountryRules(countryCode: string): CountryValidationRules | undefined {
  return countryValidationRules.find((c) => c.code === countryCode)
}

export function validatePhoneNumber(phone: string, countryCode: string): { valid: boolean; error?: string } {
  const rules = getCountryRules(countryCode)
  if (!rules) {
    return { valid: false, error: "País no soportado" }
  }

  // Remove spaces and special characters
  const cleanPhone = phone.replace(/[\s\-()]/g, "")

  if (!rules.phoneRegex.test(cleanPhone)) {
    return {
      valid: false,
      error: `Formato inválido. Debe ser ${rules.phoneFormat}. Ejemplo: ${rules.phoneExample}`,
    }
  }

  return { valid: true }
}

export function validateDocumentNumber(
  documentNumber: string,
  documentType: "cedula" | "dni" | "pasaporte" | "licencia",
  countryCode: string,
): { valid: boolean; error?: string } {
  const rules = getCountryRules(countryCode)
  if (!rules) {
    return { valid: false, error: "País no soportado" }
  }

  const docRules = rules.documentTypes[documentType]
  if (!docRules) {
    return {
      valid: false,
      error: `El tipo de documento ${documentType} no está disponible para ${rules.name}`,
    }
  }

  if (!docRules.regex.test(documentNumber)) {
    return {
      valid: false,
      error: `Formato inválido. Debe ser ${docRules.format}. Ejemplo: ${docRules.example}`,
    }
  }

  return { valid: true }
}

export function validateAge(dateOfBirth: string, minAge = 18): { valid: boolean; error?: string } {
  const dob = new Date(dateOfBirth)
  const today = new Date()

  if (isNaN(dob.getTime())) {
    return { valid: false, error: "Fecha de nacimiento inválida" }
  }

  if (dob > today) {
    return { valid: false, error: "La fecha de nacimiento no puede ser en el futuro" }
  }

  let age = today.getFullYear() - dob.getFullYear()
  const monthDiff = today.getMonth() - dob.getMonth()

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--
  }

  if (age < minAge) {
    return { valid: false, error: `Debes tener al menos ${minAge} años para registrarte` }
  }

  return { valid: true }
}

export function validateName(name: string, type: "firstName" | "lastName"): { valid: boolean; error?: string } {
  // Remove extra spaces and trim
  const cleanName = name.trim().replace(/\s+/g, " ")

  if (cleanName.length < 2) {
    return {
      valid: false,
      error: `El ${type === "firstName" ? "nombre" : "apellido"} debe tener al menos 2 caracteres`,
    }
  }

  if (cleanName.length > 50) {
    return { valid: false, error: `El ${type === "firstName" ? "nombre" : "apellido"} no puede exceder 50 caracteres` }
  }

  // Only allow letters, spaces, hyphens, and apostrophes
  const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]+$/
  if (!nameRegex.test(cleanName)) {
    return {
      valid: false,
      error: `El ${type === "firstName" ? "nombre" : "apellido"} solo puede contener letras, espacios, guiones y apóstrofes`,
    }
  }

  // Must not start or end with space, hyphen, or apostrophe
  if (/^[\s'-]|[\s'-]$/.test(cleanName)) {
    return {
      valid: false,
      error: `El ${type === "firstName" ? "nombre" : "apellido"} no puede comenzar o terminar con espacios o caracteres especiales`,
    }
  }

  // Must not have consecutive special characters
  if (/[\s'-]{2,}/.test(cleanName)) {
    return { valid: false, error: "No se permiten caracteres especiales consecutivos" }
  }

  return { valid: true }
}

export function getAvailableDocumentTypes(countryCode: string): Array<{ value: string; label: string }> {
  const rules = getCountryRules(countryCode)
  if (!rules) return []

  const typeLabels: Record<string, string> = {
    cedula: "Cédula de Identidad",
    dni: "DNI",
    pasaporte: "Pasaporte",
    licencia: "Licencia de Conducir",
  }

  return Object.keys(rules.documentTypes).map((type) => ({
    value: type,
    label: typeLabels[type] || type,
  }))
}

export function formatPhoneNumber(phone: string, countryCode: string): string {
  const rules = getCountryRules(countryCode)
  if (!rules) return phone

  const cleanPhone = phone.replace(/[\s\-()]/g, "")

  // Format based on country
  if (countryCode === "US" && cleanPhone.length === 10) {
    return `(${cleanPhone.slice(0, 3)}) ${cleanPhone.slice(3, 6)}-${cleanPhone.slice(6)}`
  }

  return cleanPhone
}
