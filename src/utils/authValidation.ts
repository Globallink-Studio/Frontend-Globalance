export type AccountType = 'personal' | 'business'

export type SignupFormValues = {
  firstName: string
  lastName: string
  legalName: string
  document: string
  phone: string
  email: string
  password: string
  confirmPassword: string
}

export type SignupFieldName = keyof SignupFormValues

export type SigninFormValues = {
  email: string
  password: string
}

export type SigninFieldName = keyof SigninFormValues

const EMAIL_REGEX = /^\S+@\S+\.\S+$/
const MIN_PASSWORD_LENGTH = 6

export function validateSignupField(
  field: SignupFieldName,
  values: SignupFormValues,
  accountType: AccountType | null,
): string | undefined {
  switch (field) {
    case 'email': {
      const value = values.email.trim()
      if (!value) return 'El correo electrónico es obligatorio.'
      if (!EMAIL_REGEX.test(value)) return 'Ingresá un correo electrónico válido.'
      return undefined
    }
    case 'password': {
      if (!values.password) return 'La contraseña es obligatoria.'
      if (values.password.length < MIN_PASSWORD_LENGTH) {
        return `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`
      }
      return undefined
    }
    case 'confirmPassword': {
      if (!values.confirmPassword) return 'Confirmá tu contraseña.'
      if (values.confirmPassword !== values.password) return 'Las contraseñas no coinciden.'
      return undefined
    }
    case 'firstName':
      if (accountType === 'personal' && !values.firstName.trim()) return 'Ingresá tu nombre.'
      return undefined
    case 'lastName':
      if (accountType === 'personal' && !values.lastName.trim()) return 'Ingresá tu apellido.'
      return undefined
    case 'legalName':
      if (accountType === 'business' && !values.legalName.trim()) return 'Ingresá la razón social.'
      return undefined
    case 'document':
      if (!values.document.trim()) return 'Ingresá tu documento.'
      return undefined
    case 'phone':
      return undefined
  }
}

export function validateSignupForm(
  values: SignupFormValues,
  accountType: AccountType | null,
): Partial<Record<SignupFieldName, string>> {
  const fields: SignupFieldName[] = [
    'firstName',
    'lastName',
    'legalName',
    'document',
    'phone',
    'email',
    'password',
    'confirmPassword',
  ]

  return fields.reduce<Partial<Record<SignupFieldName, string>>>((acc, field) => {
    const error = validateSignupField(field, values, accountType)
    if (error) acc[field] = error
    return acc
  }, {})
}

export function validateSigninField(
  field: SigninFieldName,
  values: SigninFormValues,
): string | undefined {
  switch (field) {
    case 'email': {
      const value = values.email.trim()
      if (!value) return 'El correo electrónico es obligatorio.'
      if (!EMAIL_REGEX.test(value)) return 'Ingresá un correo electrónico válido.'
      return undefined
    }
    case 'password':
      if (!values.password) return 'La contraseña es obligatoria.'
      if (values.password.length < MIN_PASSWORD_LENGTH) {
        return `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`
      }
      return undefined
  }
}

export function validateSigninForm(
  values: SigninFormValues,
): Partial<Record<SigninFieldName, string>> {
  const fields: SigninFieldName[] = ['email', 'password']

  return fields.reduce<Partial<Record<SigninFieldName, string>>>((acc, field) => {
    const error = validateSigninField(field, values)
    if (error) acc[field] = error
    return acc
  }, {})
}
