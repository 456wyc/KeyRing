export interface I18nMessages {
  // Common
  common: {
    save: string
    cancel: string
    delete: string
    edit: string
    close: string
    add: string
    search: string
    copy: string
    show: string
    hide: string
    confirm: string
    loading: string
  }

  // App
  app: {
    title: string
    lock: string
    unlock: string
  }

  // Login
  login: {
    title: string
    subtitle: string
    masterPassword: string
    unlock: string
    initialize: string
    createMasterPassword: string
    confirmPassword: string
    passwordMismatch: string
    invalidPassword: string
    setupComplete: string
    importantWarning: string
  }

  // Account Manager
  accountManager: {
    title: string
    searchPlaceholder: string
    addAccount: string
    addFirstAccount: string
    noAccounts: string
    noSearchResults: string
    cardView: string
    listView: string
  }

  // Account
  account: {
    name: string
    fields: string
    visible: string
    lastUpdated: string
    created: string
    updated: string
    addField: string
    removeField: string
    fieldName: string
    fieldValue: string
    fieldExists: string
    deleteConfirm: string
  }

  // Account Detail
  accountDetail: {
    title: string
    editAccount: string
    copyToClipboard: string
  }

  // Add Account Modal
  addAccountModal: {
    title: string
    accountName: string
    accountNamePlaceholder: string
    accountFields: string
    adding: string
    addAccount: string
  }

  // Password Generator
  passwordGenerator: {
    title: string
    generate: string
    copy: string
    length: string
    includeUppercase: string
    includeLowercase: string
    includeNumbers: string
    includeSymbols: string
    excludeAmbiguous: string
    customCharacters: string
    excludeCharacters: string
    usePassword: string
    generatedPassword: string
  }

  // Field List
  fieldList: {
    hiddenByDefault: string
    visibleByDefault: string
    generatePassword: string
    removeField: string
  }

  // Messages
  messages: {
    failedToAdd: string
    failedToUpdate: string
    failedToDelete: string
    copiedToClipboard: string
    initializationFailed: string
    unlockFailed: string
  }
}

export type SupportedLanguage = 'en' | 'zh'