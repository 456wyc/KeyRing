import { contextBridge, ipcRenderer } from 'electron'

export interface Account {
  id: string
  name: string
  fields: { [key: string]: string }
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

export interface ElectronAPI {
  storage: {
    init: (masterPassword: string) => Promise<boolean>
    unlock: (masterPassword: string) => Promise<boolean>
    lock: () => Promise<boolean>
    isUnlocked: () => Promise<boolean>
    isInitialized: () => Promise<boolean>
    getAccounts: () => Promise<Account[]>
    addAccount: (account: Omit<Account, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Account>
    updateAccount: (id: string, account: Partial<Account>) => Promise<Account>
    deleteAccount: (id: string) => Promise<boolean>
  }
  clipboard: {
    write: (text: string) => Promise<boolean>
  }
  dialog: {
    showError: (message: string) => Promise<void>
  }
  crypto: {
    encrypt: (data: string, password: string) => Promise<string>
    decrypt: (encryptedData: string, password: string) => Promise<string>
  }
}

const electronAPI: ElectronAPI = {
  storage: {
    init: (masterPassword: string) => ipcRenderer.invoke('storage:init', masterPassword),
    unlock: (masterPassword: string) => ipcRenderer.invoke('storage:unlock', masterPassword),
    lock: () => ipcRenderer.invoke('storage:lock'),
    isUnlocked: () => ipcRenderer.invoke('storage:isUnlocked'),
    isInitialized: () => ipcRenderer.invoke('storage:isInitialized'),
    getAccounts: () => ipcRenderer.invoke('storage:getAccounts'),
    addAccount: (account) => ipcRenderer.invoke('storage:addAccount', account),
    updateAccount: (id, account) => ipcRenderer.invoke('storage:updateAccount', id, account),
    deleteAccount: (id) => ipcRenderer.invoke('storage:deleteAccount', id)
  },
  clipboard: {
    write: (text: string) => ipcRenderer.invoke('clipboard:write', text)
  },
  dialog: {
    showError: (message: string) => ipcRenderer.invoke('dialog:showError', message)
  },
  crypto: {
    encrypt: (data: string, password: string) => ipcRenderer.invoke('crypto:encrypt', data, password),
    decrypt: (encryptedData: string, password: string) => ipcRenderer.invoke('crypto:decrypt', encryptedData, password)
  }
}

contextBridge.exposeInMainWorld('electronAPI', electronAPI)

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}