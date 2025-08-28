export interface FieldConfig {
  value: string
  hidden: boolean
}

export interface Account {
  id: string
  name: string
  fields: { [key: string]: FieldConfig }
  fieldOrder?: string[]
  passwordRules?: PasswordRules
  createdAt: Date
  updatedAt: Date
}

export interface PasswordRules {
  length: number
  includeUppercase: boolean
  includeLowercase: boolean
  includeNumbers: boolean
  includeSymbols: boolean
  excludeAmbiguous: boolean
  customCharacters?: string
  excludeCharacters?: string
}

export interface NewAccount {
  name: string
  fields: { [key: string]: FieldConfig }
  fieldOrder?: string[]
  passwordRules?: PasswordRules
}