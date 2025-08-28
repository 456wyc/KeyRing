import * as fs from 'fs/promises'
import * as path from 'path'
import * as os from 'os'
import * as crypto from 'crypto'
import CryptoJS from 'crypto-js'
import { Account } from './preload'

export class DataStorage {
  private dataDir: string
  private dataFile: string
  private unlocked = false
  private masterPasswordHash?: string
  private encryptionKey?: string
  private accounts: Account[] = []

  constructor() {
    this.dataDir = path.join(os.homedir(), '.keyring')
    this.dataFile = path.join(this.dataDir, 'accounts.encrypted')
  }

  async initialize(masterPassword: string): Promise<boolean> {
    try {
      await fs.mkdir(this.dataDir, { recursive: true })
      
      const salt = crypto.randomBytes(32)
      this.masterPasswordHash = this.hashPassword(masterPassword, salt)
      this.encryptionKey = this.deriveKey(masterPassword, salt)
      
      const config = {
        version: '1.0',
        salt: salt.toString('hex'),
        hash: this.masterPasswordHash,
        createdAt: new Date().toISOString()
      }
      
      await fs.writeFile(
        path.join(this.dataDir, 'config.json'),
        JSON.stringify(config, null, 2)
      )
      
      this.accounts = []
      await this.saveAccounts()
      
      this.unlocked = true
      
      return true
    } catch (error) {
      console.error('Failed to initialize storage:', error)
      return false
    }
  }

  async unlock(masterPassword: string): Promise<boolean> {
    try {
      const configFile = path.join(this.dataDir, 'config.json')
      const configData = await fs.readFile(configFile, 'utf8')
      const config = JSON.parse(configData)
      
      const salt = Buffer.from(config.salt, 'hex')
      const passwordHash = this.hashPassword(masterPassword, salt)
      
      if (passwordHash !== config.hash) {
        return false
      }
      
      this.masterPasswordHash = passwordHash
      this.encryptionKey = this.deriveKey(masterPassword, salt)
      
      await this.loadAccounts()
      
      this.unlocked = true
      
      return true
    } catch (error) {
      console.error('Failed to unlock storage:', error)
      return false
    }
  }

  lock(): void {
    this.unlocked = false
    this.encryptionKey = undefined
    this.accounts = []
  }

  isUnlocked(): boolean {
    return this.unlocked
  }

  async isInitialized(): Promise<boolean> {
    try {
      const configFile = path.join(this.dataDir, 'config.json')
      await fs.access(configFile)
      return true
    } catch {
      return false
    }
  }

  async getAccounts(): Promise<Account[]> {
    if (!this.unlocked) {
      throw new Error('Storage is locked')
    }
    return [...this.accounts]
  }

  async addAccount(accountData: Omit<Account, 'id' | 'createdAt' | 'updatedAt'>): Promise<Account> {
    if (!this.unlocked) {
      throw new Error('Storage is locked')
    }
    
    const account: Account = {
      id: crypto.randomUUID(),
      ...accountData,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    this.accounts.push(account)
    await this.saveAccounts()
    
    return account
  }

  async updateAccount(id: string, updates: Partial<Account>): Promise<Account> {
    if (!this.unlocked) {
      throw new Error('Storage is locked')
    }
    
    const index = this.accounts.findIndex(acc => acc.id === id)
    if (index === -1) {
      throw new Error('Account not found')
    }
    
    this.accounts[index] = {
      ...this.accounts[index],
      ...updates,
      updatedAt: new Date()
    }
    
    await this.saveAccounts()
    
    return this.accounts[index]
  }

  async deleteAccount(id: string): Promise<boolean> {
    if (!this.unlocked) {
      throw new Error('Storage is locked')
    }
    
    const initialLength = this.accounts.length
    this.accounts = this.accounts.filter(acc => acc.id !== id)
    
    if (this.accounts.length < initialLength) {
      await this.saveAccounts()
      return true
    }
    
    return false
  }

  private async loadAccounts(): Promise<void> {
    try {
      const encryptedData = await fs.readFile(this.dataFile, 'utf8')
      if (encryptedData && this.encryptionKey) {
        const decryptedData = CryptoJS.AES.decrypt(encryptedData, this.encryptionKey).toString(CryptoJS.enc.Utf8)
        this.accounts = JSON.parse(decryptedData || '[]').map((acc: any) => {
          // Migrate old field format to new format
          const migratedFields: { [key: string]: { value: string, hidden: boolean } } = {}
          
          for (const [key, value] of Object.entries(acc.fields || {})) {
            if (typeof value === 'string') {
              // Old format: field is just a string
              const isPasswordField = ['password', 'pwd', 'pass', 'pin', 'secret', 'key'].some(keyword => 
                key.toLowerCase().includes(keyword)
              )
              migratedFields[key] = {
                value: value as string,
                hidden: isPasswordField
              }
            } else {
              // New format: field is already an object
              migratedFields[key] = value as { value: string, hidden: boolean }
            }
          }
          
          return {
            ...acc,
            fields: migratedFields,
            fieldOrder: acc.fieldOrder || Object.keys(migratedFields),
            createdAt: new Date(acc.createdAt),
            updatedAt: new Date(acc.updatedAt)
          }
        })
      } else {
        this.accounts = []
      }
    } catch (error) {
      this.accounts = []
    }
  }

  private async saveAccounts(): Promise<void> {
    if (!this.encryptionKey) {
      throw new Error('No encryption key available')
    }
    
    const dataToEncrypt = JSON.stringify(this.accounts)
    const encryptedData = CryptoJS.AES.encrypt(dataToEncrypt, this.encryptionKey).toString()
    
    await fs.writeFile(this.dataFile, encryptedData)
  }

  private hashPassword(password: string, salt: Buffer): string {
    return crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha256').toString('hex')
  }

  private deriveKey(password: string, salt: Buffer): string {
    return crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha256').toString('hex')
  }
}