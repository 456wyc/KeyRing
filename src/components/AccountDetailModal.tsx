import React, { useState } from 'react'
import { X, Copy, Eye, EyeOff, Edit } from 'lucide-react'
import { Account } from '../types'
import { Toast } from './Toast'
import { useI18n } from '../i18n'
import { useToast } from '../hooks/useToast'

interface AccountDetailModalProps {
  account: Account
  onClose: () => void
  onEdit: (account: Account) => void
}

export const AccountDetailModal: React.FC<AccountDetailModalProps> = ({
  account,
  onClose,
  onEdit
}) => {
  const { t } = useI18n()
  const { toast, showToast, hideToast } = useToast()
  const [visibleFields, setVisibleFields] = useState<Set<string>>(new Set())

  const handleCopy = async (text: string) => {
    try {
      await window.electronAPI.clipboard.write(text)
      // 显示成功提示
      showToast(t('messages.copiedToClipboard'))
    } catch (error) {
      console.error('Error copying to clipboard:', error)
    }
  }

  const toggleFieldVisibility = (fieldKey: string) => {
    const newVisibleFields = new Set(visibleFields)
    if (newVisibleFields.has(fieldKey)) {
      newVisibleFields.delete(fieldKey)
    } else {
      newVisibleFields.add(fieldKey)
    }
    setVisibleFields(newVisibleFields)
  }

  const isPasswordField = (key: string, value: string) => {
    const passwordKeywords = ['password', 'pwd', 'pass', 'pin', 'secret', 'key']
    return passwordKeywords.some(keyword => 
      key.toLowerCase().includes(keyword)
    ) || (value && value.length > 8 && /[A-Za-z]/.test(value) && /\d/.test(value))
  }

  const fieldOrder = account.fieldOrder || Object.keys(account.fields)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-6 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        {/* Fixed Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-xl font-semibold text-gray-900">{account.name}</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onEdit(account)}
              className="p-2 text-blue-600 hover:bg-blue-100 rounded-full"
              title="Edit Account"
            >
              <Edit size={20} />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:bg-gray-100 rounded-full"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
          <div className="space-y-4">
            {fieldOrder.map((key) => {
              const fieldConfig = account.fields[key]
              if (!fieldConfig) return null

              const isPassword = isPasswordField(key, fieldConfig.value)
              const isVisible = visibleFields.has(key) || !fieldConfig.hidden

              return (
                <div key={key} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700">
                      {key}
                    </label>
                    <div className="flex items-center space-x-1">
                      {(fieldConfig.hidden || isPassword) && (
                        <button
                          onClick={() => toggleFieldVisibility(key)}
                          className="p-1 text-gray-500 hover:bg-gray-100 rounded"
                          title={isVisible ? "Hide" : "Show"}
                        >
                          {isVisible ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      )}
                      <button
                        onClick={() => handleCopy(fieldConfig.value)}
                        className="p-1 text-gray-500 hover:bg-gray-100 rounded"
                        title="Copy to clipboard"
                      >
                        <Copy size={14} />
                      </button>
                    </div>
                  </div>
                  
                  <input
                    type={(fieldConfig.hidden || isPassword) && !isVisible ? "password" : "text"}
                    value={(fieldConfig.hidden || isPassword) && !isVisible ? "••••••••" : fieldConfig.value}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded bg-white cursor-default"
                  />
                </div>
              )
            })}
          </div>
          </div>
        </div>

        {/* Fixed Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex-shrink-0 bg-white">
          <div className="text-xs text-gray-500 space-y-1">
            <div>Created: {new Date(account.createdAt).toLocaleString()}</div>
            <div>Updated: {new Date(account.updatedAt).toLocaleString()}</div>
          </div>
        </div>
      </div>

      {toast.isVisible && (
        <Toast
          message={toast.message}
          onClose={hideToast}
        />
      )}
    </div>
  )
}