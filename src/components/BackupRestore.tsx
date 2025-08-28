import React, { useState } from 'react'
import { Download, Upload, X, AlertCircle, CheckCircle, FileText, Shield, Lock, Key } from 'lucide-react'
import { Account } from '../types'
import { useI18n } from '../i18n'

interface BackupRestoreProps {
  accounts: Account[]
  onClose: () => void
  onAccountsImported: () => void
}

interface BackupData {
  version: string
  timestamp: string
  encrypted?: boolean
  accounts: Account[]
  metadata: {
    totalAccounts: number
    exportedBy: string
  }
}

interface EncryptedBackupData {
  version: string
  timestamp: string
  encrypted: true
  data: string  // Base64 encoded encrypted data
  metadata: {
    exportedBy: string
  }
}

export const BackupRestore: React.FC<BackupRestoreProps> = ({
  accounts,
  onClose,
  onAccountsImported
}) => {
  const { t } = useI18n()
  const [activeTab, setActiveTab] = useState<'backup' | 'restore'>('backup')
  const [importing, setImporting] = useState(false)
  const [importResult, setImportResult] = useState<{
    success: boolean
    message: string
    count?: number
  } | null>(null)
  const [useEncryption, setUseEncryption] = useState(true)
  const [encryptionPassword, setEncryptionPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [decryptionPassword, setDecryptionPassword] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [fileIsEncrypted, setFileIsEncrypted] = useState<boolean | null>(null)

  // Encryption helper functions
  const encryptData = async (data: string, password: string): Promise<string> => {
    try {
      // Use the same encryption method as the main app
      const result = await window.electronAPI.crypto.encrypt(data, password)
      return result
    } catch (error) {
      console.error('Encryption failed:', error)
      throw new Error(t('backup.encryptionFailed'))
    }
  }

  const decryptData = async (encryptedData: string, password: string): Promise<string> => {
    try {
      // Use the same decryption method as the main app
      const result = await window.electronAPI.crypto.decrypt(encryptedData, password)
      return result
    } catch (error) {
      console.error('Decryption failed:', error)
      throw new Error(t('backup.decryptionFailed'))
    }
  }

  const handleExport = async () => {
    // Validation for encrypted export
    if (useEncryption) {
      if (!encryptionPassword.trim()) {
        await window.electronAPI.dialog.showError(t('backup.passwordRequired'))
        return
      }
      if (encryptionPassword !== confirmPassword) {
        await window.electronAPI.dialog.showError(t('backup.passwordMismatch'))
        return
      }
      if (encryptionPassword.length < 8) {
        await window.electronAPI.dialog.showError(t('backup.passwordTooShort'))
        return
      }
    }

    try {
      const backupData: BackupData = {
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        encrypted: useEncryption,
        accounts: accounts.map(account => ({
          ...account,
          // Convert dates to ISO strings for JSON serialization
          createdAt: new Date(account.createdAt),
          updatedAt: new Date(account.updatedAt)
        })),
        metadata: {
          totalAccounts: accounts.length,
          exportedBy: 'Key Ring'
        }
      }

      let dataStr: string
      let filename: string
      
      if (useEncryption) {
        // Create encrypted backup
        const plainData = JSON.stringify(backupData)
        const encryptedData = await encryptData(plainData, encryptionPassword)
        
        const encryptedBackup: EncryptedBackupData = {
          version: '1.0.0',
          timestamp: new Date().toISOString(),
          encrypted: true,
          data: encryptedData,
          metadata: {
            exportedBy: 'Key Ring'
          }
        }
        
        dataStr = JSON.stringify(encryptedBackup, null, 2)
        filename = `keyring-backup-encrypted-${new Date().toISOString().split('T')[0]}.json`
      } else {
        // Create plain backup
        dataStr = JSON.stringify(backupData, null, 2)
        filename = `keyring-backup-${new Date().toISOString().split('T')[0]}.json`
      }

      const blob = new Blob([dataStr], { type: 'application/json' })
      
      // Create download link
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      // Clear passwords after successful export
      setEncryptionPassword('')
      setConfirmPassword('')
      
    } catch (error) {
      console.error('Export failed:', error)
      await window.electronAPI.dialog.showError(error instanceof Error ? error.message : t('backup.exportFailed'))
    }
  }

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setImportResult(null)
    setSelectedFile(file)

    try {
      const text = await file.text()
      const parsedData = JSON.parse(text)

      // Check if this is an encrypted backup
      if (parsedData.encrypted === true && parsedData.data) {
        setFileIsEncrypted(true)
      } else {
        setFileIsEncrypted(false)
      }
    } catch (error) {
      setImportResult({
        success: false,
        message: t('backup.invalidFormat')
      })
      setSelectedFile(null)
      setFileIsEncrypted(null)
    }

    // Reset file input
    event.target.value = ''
  }

  const handleImport = async () => {
    if (!selectedFile) return

    // Validation for encrypted files
    if (fileIsEncrypted && !decryptionPassword.trim()) {
      setImportResult({
        success: false,
        message: t('backup.passwordRequired')
      })
      return
    }

    setImporting(true)
    setImportResult(null)

    try {
      const text = await selectedFile.text()
      const parsedData = JSON.parse(text)

      let backupData: BackupData

      // Check if this is an encrypted backup
      if (parsedData.encrypted === true && parsedData.data) {
        try {
          // Decrypt the data
          const decryptedText = await decryptData(parsedData.data, decryptionPassword)
          backupData = JSON.parse(decryptedText)
        } catch (error) {
          setImportResult({
            success: false,
            message: t('backup.wrongPassword')
          })
          setImporting(false)
          return
        }
      } else {
        // This is a plain backup
        backupData = parsedData as BackupData
      }

      // Validate backup data structure
      if (!backupData.accounts || !Array.isArray(backupData.accounts)) {
        throw new Error(t('backup.invalidFormat'))
      }

      // Validate each account has required fields
      for (const account of backupData.accounts) {
        if (!account.id || !account.name || !account.fields) {
          throw new Error(t('backup.invalidAccountData'))
        }
      }

      // Show confirmation dialog
      const confirmMessage = t('backup.importConfirm', { 
        count: backupData.accounts.length,
        current: accounts.length
      })
      
      if (!confirm(confirmMessage)) {
        setImporting(false)
        return
      }

      // Import accounts
      let importedCount = 0
      for (const accountData of backupData.accounts) {
        try {
          // Generate new ID to avoid conflicts
          const newAccount = {
            ...accountData,
            id: crypto.randomUUID(),
            createdAt: new Date(),
            updatedAt: new Date()
          }

          await window.electronAPI.storage.addAccount(newAccount)
          importedCount++
        } catch (error) {
          console.warn('Failed to import account:', accountData.name, error)
        }
      }

      setImportResult({
        success: true,
        message: t('backup.importSuccess'),
        count: importedCount
      })

      // Clear state after successful import
      setDecryptionPassword('')
      setSelectedFile(null)
      setFileIsEncrypted(null)
      onAccountsImported()
      
    } catch (error) {
      console.error('Import failed:', error)
      setImportResult({
        success: false,
        message: error instanceof Error ? error.message : t('backup.importFailed')
      })
    } finally {
      setImporting(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-6 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[80vh] overflow-hidden flex flex-col">
        {/* Fixed Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-xl font-semibold text-gray-900">
            {t('backup.title')}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 flex-shrink-0">
          <button
            onClick={() => setActiveTab('backup')}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'backup'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Download size={16} className="inline mr-2" />
            {t('backup.export')}
          </button>
          <button
            onClick={() => setActiveTab('restore')}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'restore'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Upload size={16} className="inline mr-2" />
            {t('backup.import')}
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
          {activeTab === 'backup' ? (
            <div className="space-y-4">
              {/* Export Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <Shield className="text-blue-600 mt-1" size={20} />
                  <div>
                    <h3 className="font-medium text-blue-900 mb-1">
                      {t('backup.secureExport')}
                    </h3>
                    <p className="text-sm text-blue-700">
                      {t('backup.exportDescription')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Current Data Summary */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">
                  {t('backup.currentData')}
                </h4>
                <div className="space-y-1 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>{t('backup.totalAccounts')}:</span>
                    <span className="font-medium">{accounts.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t('backup.lastModified')}:</span>
                    <span>
                      {accounts.length > 0
                        ? formatDate(
                            Math.max(...accounts.map(a => new Date(a.updatedAt).getTime())).toString()
                          )
                        : t('backup.never')
                      }
                    </span>
                  </div>
                </div>
              </div>

              {/* Encryption Options */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <input
                    type="checkbox"
                    id="useEncryption"
                    checked={useEncryption}
                    onChange={(e) => setUseEncryption(e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="useEncryption" className="flex items-center text-sm font-medium text-gray-900">
                    <Lock size={16} className="mr-1" />
                    {t('backup.useEncryption')}
                  </label>
                </div>
                
                {useEncryption && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        {t('backup.encryptionPassword')}
                      </label>
                      <input
                        type="password"
                        value={encryptionPassword}
                        onChange={(e) => setEncryptionPassword(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder={t('backup.enterPassword')}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        {t('backup.confirmPassword')}
                      </label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder={t('backup.confirmPassword')}
                      />
                    </div>
                    <div className="flex items-start space-x-2">
                      <Key size={14} className="text-blue-600 mt-0.5" />
                      <p className="text-xs text-gray-600">
                        {t('backup.encryptionNote')}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Export Button */}
              <button
                onClick={handleExport}
                disabled={accounts.length === 0}
                className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
              >
                <Download size={20} />
                <span>
                  {accounts.length === 0 
                    ? t('backup.noDataToExport')
                    : t('backup.exportNow')
                  }
                </span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Import Warning */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="text-amber-600 mt-1" size={20} />
                  <div>
                    <h3 className="font-medium text-amber-900 mb-1">
                      {t('backup.importWarning')}
                    </h3>
                    <p className="text-sm text-amber-700">
                      {t('backup.importDescription')}
                    </p>
                  </div>
                </div>
              </div>

              {/* File Input */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                <FileText className="mx-auto text-gray-400 mb-2" size={32} />
                <label className="cursor-pointer">
                  <span className="text-sm text-gray-600 mb-2 block">
                    {t('backup.selectFile')}
                  </span>
                  <span className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                    <Upload size={16} className="mr-2" />
                    {t('backup.chooseFile')}
                  </span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleFileSelect}
                    className="hidden"
                    disabled={importing}
                  />
                </label>
              </div>

              {/* Decryption Password - Only show for encrypted files */}
              {fileIsEncrypted === true && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Lock size={16} className="text-yellow-700" />
                    <label className="text-sm font-medium text-yellow-900">
                      {t('backup.decryptionPassword')}
                    </label>
                  </div>
                  <input
                    type="password"
                    value={decryptionPassword}
                    onChange={(e) => setDecryptionPassword(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                    placeholder={t('backup.enterDecryptionPassword')}
                    autoFocus
                  />
                  <p className="text-xs text-yellow-700 mt-1">
                    {t('backup.encryptedFileNote')}
                  </p>
                </div>
              )}

              {/* Selected File Info */}
              {selectedFile && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <FileText className="text-blue-600 mt-1" size={20} />
                    <div className="flex-1">
                      <h4 className="font-medium text-blue-900 mb-1">
                        {t('backup.selectedFile')}
                      </h4>
                      <p className="text-sm text-blue-700 mb-2">
                        <span className="font-medium">{selectedFile.name}</span>
                        <span className="text-blue-600 ml-2">
                          ({(selectedFile.size / 1024).toFixed(1)} KB)
                        </span>
                      </p>
                      <div className="flex items-center space-x-2">
                        {fileIsEncrypted === true && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            <Lock size={12} className="mr-1" />
                            {t('backup.encrypted')}
                          </span>
                        )}
                        {fileIsEncrypted === false && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <Shield size={12} className="mr-1" />
                            {t('backup.unencrypted')}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedFile(null)
                        setFileIsEncrypted(null)
                        setDecryptionPassword('')
                        setImportResult(null)
                      }}
                      className="p-1 text-blue-500 hover:bg-blue-100 rounded"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              )}

              {/* Import Button */}
              {selectedFile && (
                <button
                  onClick={handleImport}
                  disabled={importing || (fileIsEncrypted && !decryptionPassword.trim())}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
                >
                  <Upload size={20} />
                  <span>
                    {importing ? t('backup.importing') : t('backup.startImport')}
                  </span>
                </button>
              )}

              {/* Import Status */}
              {importing && (
                <div className="text-center py-4">
                  <div className="inline-flex items-center text-blue-600">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                    {t('backup.importing')}
                  </div>
                </div>
              )}

              {/* Import Result */}
              {importResult && (
                <div className={`border rounded-lg p-4 ${
                  importResult.success 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-red-50 border-red-200'
                }`}>
                  <div className="flex items-start space-x-3">
                    {importResult.success ? (
                      <CheckCircle className="text-green-600 mt-1" size={20} />
                    ) : (
                      <AlertCircle className="text-red-600 mt-1" size={20} />
                    )}
                    <div>
                      <h4 className={`font-medium mb-1 ${
                        importResult.success ? 'text-green-900' : 'text-red-900'
                      }`}>
                        {importResult.success 
                          ? t('backup.importSuccessTitle')
                          : t('backup.importErrorTitle')
                        }
                      </h4>
                      <p className={`text-sm ${
                        importResult.success ? 'text-green-700' : 'text-red-700'
                      }`}>
                        {importResult.message}
                        {importResult.count !== undefined && (
                          <span className="block mt-1">
                            {t('backup.accountsImported', { count: importResult.count })}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          </div>
        </div>

        {/* Fixed Footer */}
        <div className="border-t border-gray-200 px-6 py-4 flex-shrink-0 bg-white">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {t('common.close')}
          </button>
        </div>
      </div>
    </div>
  )
}