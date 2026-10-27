import * as fs from 'fs/promises'
import * as path from 'path'
import * as os from 'os'
import * as crypto from 'crypto'
import CryptoJS from 'crypto-js'
import { Account } from './preload'

export class DataStorage {
  // 无主密码模式使用的固定密钥：数据仍走同一套加解密流程，但不具备机密性
  private static readonly NO_PASSWORD_KEY = 'keyring::no-master-password::v1'

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

  private get configFile(): string {
    return path.join(this.dataDir, 'config.json')
  }

  private async readConfig(): Promise<any | null> {
    try {
      const configData = await fs.readFile(this.configFile, 'utf8')
      return JSON.parse(configData)
    } catch {
      return null
    }
  }

  private async writeConfig(config: any): Promise<void> {
    const tempConfigFile = `${this.configFile}.tmp`
    await fs.writeFile(tempConfigFile, JSON.stringify(config, null, 2))
    await fs.rename(tempConfigFile, this.configFile)
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
      const config = await this.readConfig()
      if (!config) {
        return false
      }

      // 无主密码模式：无需校验，直接使用固定密钥
      if (config.passwordEnabled === false) {
        this.masterPasswordHash = undefined
        this.encryptionKey = DataStorage.NO_PASSWORD_KEY

        await this.loadAccounts()

        this.unlocked = true
        return true
      }

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

  async changeMasterPassword(currentPassword: string, newPassword: string): Promise<boolean> {
    if (!this.unlocked || !this.encryptionKey) {
      throw new Error('Storage is locked')
    }

    if (!newPassword) {
      throw new Error('New password is required')
    }

    const config = await this.readConfig()
    if (!config) {
      throw new Error('Storage is not initialized')
    }

    if (config.passwordEnabled === false) {
      throw new Error('Master password is disabled')
    }

    const salt = Buffer.from(config.salt, 'hex')
    const currentHash = this.hashPassword(currentPassword, salt)

    if (currentHash !== config.hash) {
      return false
    }

    const newSalt = crypto.randomBytes(32)
    const newHash = this.hashPassword(newPassword, newSalt)
    const newKey = this.deriveKey(newPassword, newSalt)

    const newConfig = {
      ...config,
      salt: newSalt.toString('hex'),
      hash: newHash,
      updatedAt: new Date().toISOString()
    }

    const previousKey = this.encryptionKey
    const previousHash = this.masterPasswordHash

    this.encryptionKey = newKey

    try {
      // 用新密钥重新加密已加载的账户数据，再更新配置
      await this.saveAccounts()

      await this.writeConfig(newConfig)

      this.masterPasswordHash = newHash
      return true
    } catch (error) {
      // 回滚：恢复旧密钥与旧密文，避免出现无法解密的数据
      this.encryptionKey = previousKey
      this.masterPasswordHash = previousHash
      try {
        await this.saveAccounts()
      } catch (rollbackError) {
        console.error('Failed to rollback account encryption:', rollbackError)
      }
      console.error('Failed to change master password:', error)
      throw error
    }
  }

  async isPasswordEnabled(): Promise<boolean> {
    const config = await this.readConfig()
    if (!config) {
      return true
    }
    return config.passwordEnabled !== false
  }

  // 取消主密码：校验当前密码后用固定密钥重新加密数据
  async removeMasterPassword(currentPassword: string): Promise<boolean> {
    if (!this.unlocked || !this.encryptionKey) {
      throw new Error('Storage is locked')
    }

    const config = await this.readConfig()
    if (!config) {
      throw new Error('Storage is not initialized')
    }

    if (config.passwordEnabled === false) {
      return true
    }

    const salt = Buffer.from(config.salt, 'hex')
    const currentHash = this.hashPassword(currentPassword, salt)

    if (currentHash !== config.hash) {
      return false
    }

    const previousKey = this.encryptionKey
    const previousHash = this.masterPasswordHash

    this.encryptionKey = DataStorage.NO_PASSWORD_KEY

    try {
      await this.saveAccounts()

      await this.writeConfig({
        version: config.version || '1.0',
        passwordEnabled: false,
        createdAt: config.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })

      this.masterPasswordHash = undefined
      return true
    } catch (error) {
      this.encryptionKey = previousKey
      this.masterPasswordHash = previousHash
      try {
        await this.saveAccounts()
      } catch (rollbackError) {
        console.error('Failed to rollback account encryption:', rollbackError)
      }
      console.error('Failed to remove master password:', error)
      throw error
    }
  }

  // 重新启用主密码（当前处于无主密码模式）
  async setMasterPassword(newPassword: string): Promise<boolean> {
    if (!this.unlocked || !this.encryptionKey) {
      throw new Error('Storage is locked')
    }

    if (!newPassword) {
      throw new Error('New password is required')
    }

    const config = await this.readConfig()
    if (!config) {
      throw new Error('Storage is not initialized')
    }

    if (config.passwordEnabled !== false) {
      return false
    }

    const newSalt = crypto.randomBytes(32)
    const newHash = this.hashPassword(newPassword, newSalt)
    const newKey = this.deriveKey(newPassword, newSalt)

    const previousKey = this.encryptionKey

    this.encryptionKey = newKey

    try {
      await this.saveAccounts()

      await this.writeConfig({
        version: config.version || '1.0',
        passwordEnabled: true,
        salt: newSalt.toString('hex'),
        hash: newHash,
        createdAt: config.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })

      this.masterPasswordHash = newHash
      return true
    } catch (error) {
      this.encryptionKey = previousKey
      this.masterPasswordHash = undefined
      try {
        await this.saveAccounts()
      } catch (rollbackError) {
        console.error('Failed to rollback account encryption:', rollbackError)
      }
      console.error('Failed to set master password:', error)
      throw error
    }
  }

  lock(): void {
    this.unlocked = false
    this.encryptionKey = undefined
    this.masterPasswordHash = undefined
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