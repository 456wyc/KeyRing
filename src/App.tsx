import React, { useState, useEffect } from 'react'
import { LoginScreen } from './components/LoginScreen'
import { AccountManager } from './components/AccountManager'
import { Account } from './types'
import { I18nProvider, useI18n } from './i18n'

function AppContent() {
  const { t } = useI18n()
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [accounts, setAccounts] = useState<Account[]>([])

  useEffect(() => {
    checkUnlockStatus()
  }, [])

  const checkUnlockStatus = async () => {
    try {
      const unlocked = await window.electronAPI.storage.isUnlocked()
      setIsUnlocked(unlocked)
      
      if (unlocked) {
        await loadAccounts()
      }
    } catch (error) {
      console.error('Error checking unlock status:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadAccounts = async () => {
    try {
      const accountsData = await window.electronAPI.storage.getAccounts()
      setAccounts(accountsData)
    } catch (error) {
      console.error('Error loading accounts:', error)
      await window.electronAPI.dialog.showError('Failed to load accounts')
    }
  }

  const handleUnlock = async () => {
    setIsUnlocked(true)
    await loadAccounts()
  }

  const handleLock = async () => {
    try {
      await window.electronAPI.storage.lock()
      setIsUnlocked(false)
      setAccounts([])
    } catch (error) {
      console.error('Error locking storage:', error)
    }
  }

  const handleAccountsChange = () => {
    loadAccounts()
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-lg">{t('common.loading')}</div>
      </div>
    )
  }

  if (!isUnlocked) {
    return <LoginScreen onUnlock={handleUnlock} />
  }

  return (
    <AccountManager
      accounts={accounts}
      onAccountsChange={handleAccountsChange}
      onLock={handleLock}
    />
  )
}

function App() {
  return (
    <I18nProvider>
      <AppContent />
    </I18nProvider>
  )
}

export default App