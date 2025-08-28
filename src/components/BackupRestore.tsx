import React, { useState } from 'react'
import { Download, Upload, X, AlertCircle, CheckCircle, FileText, Shield } from 'lucide-react'
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
  accounts: Account[]
  metadata: {
    totalAccounts: number
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

  const handleExport = async () => {
    try {
      const backupData: BackupData = {
        version: '1.0.0',
        timestamp: new Date().toISOString(),
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

      const dataStr = JSON.stringify(backupData, null, 2)
      const blob = new Blob([dataStr], { type: 'application/json' })
      
      // Create download link
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `keyring-backup-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
    } catch (error) {
      console.error('Export failed:', error)
      await window.electronAPI.dialog.showError(t('backup.exportFailed'))
    }
  }

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setImporting(true)
    setImportResult(null)

    try {
      const text = await file.text()
      const backupData: BackupData = JSON.parse(text)

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

      onAccountsImported()
      
    } catch (error) {
      console.error('Import failed:', error)
      setImportResult({
        success: false,
        message: error instanceof Error ? error.message : t('backup.importFailed')
      })
    } finally {
      setImporting(false)
      // Reset file input
      event.target.value = ''
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
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
        <div className="flex border-b border-gray-200">
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

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4">
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