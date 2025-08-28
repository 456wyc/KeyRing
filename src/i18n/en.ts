import { I18nMessages } from './types'

export const enMessages: I18nMessages = {
  common: {
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    close: 'Close',
    add: 'Add',
    search: 'Search',
    copy: 'Copy',
    show: 'Show',
    hide: 'Hide',
    confirm: 'Confirm',
    loading: 'Loading...'
  },

  app: {
    title: 'Key Ring',
    lock: 'Lock',
    unlock: 'Unlock'
  },

  login: {
    title: 'Key Ring',
    subtitle: 'Secure Password Manager',
    masterPassword: 'Master Password',
    unlock: 'Unlock',
    initialize: 'Initialize',
    createMasterPassword: 'Create Master Password',
    confirmPassword: 'Confirm Password',
    passwordMismatch: 'Passwords do not match',
    invalidPassword: 'Invalid master password',
    setupComplete: 'Setup complete! You can now add your accounts.',
    importantWarning: 'Important: Remember your master password. It cannot be recovered if lost.'
  },

  accountManager: {
    title: 'Key Ring',
    searchPlaceholder: 'Search accounts...',
    addAccount: 'Add Account',
    addFirstAccount: 'Add your first account',
    noAccounts: 'No accounts yet.',
    noSearchResults: 'No accounts found matching your search.',
    cardView: 'Card View',
    listView: 'List View'
  },

  account: {
    name: 'Account Name',
    fields: 'Fields',
    visible: 'Visible',
    lastUpdated: 'Last Updated',
    created: 'Created',
    updated: 'Updated',
    addField: 'Add Field',
    removeField: 'Remove Field',
    fieldName: 'Field Name',
    fieldValue: 'Field Value',
    fieldExists: 'Field name already exists!',
    deleteConfirm: 'Are you sure you want to delete'
  },

  accountDetail: {
    title: 'Account Details',
    editAccount: 'Edit Account',
    copyToClipboard: 'Copy to clipboard'
  },

  addAccountModal: {
    title: 'Add New Account',
    accountName: 'Account Name',
    accountNamePlaceholder: 'e.g., Gmail, GitHub, Bank Account',
    accountFields: 'Account Fields',
    adding: 'Adding...',
    addAccount: 'Add Account'
  },

  passwordGenerator: {
    title: 'Password Generator',
    generate: 'Generate',
    copy: 'Copy',
    length: 'Length',
    includeUppercase: 'Include Uppercase',
    includeLowercase: 'Include Lowercase',
    includeNumbers: 'Include Numbers',
    includeSymbols: 'Include Symbols',
    excludeAmbiguous: 'Exclude Ambiguous Characters',
    customCharacters: 'Custom Characters',
    excludeCharacters: 'Exclude Characters',
    usePassword: 'Use This Password',
    generatedPassword: 'Generated Password'
  },

  fieldList: {
    hiddenByDefault: 'Field is hidden by default',
    visibleByDefault: 'Field is visible by default',
    generatePassword: 'Generate password',
    removeField: 'Remove field'
  },

  messages: {
    failedToAdd: 'Failed to add account',
    failedToUpdate: 'Failed to update account',
    failedToDelete: 'Failed to delete account',
    copiedToClipboard: 'Copied to clipboard',
    initializationFailed: 'Failed to initialize storage',
    unlockFailed: 'Failed to unlock storage'
  }
}