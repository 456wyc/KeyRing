import React, { useState } from 'react'
import { X, Plus, Settings, Eye, EyeOff } from 'lucide-react'
import { NewAccount, PasswordRules, FieldConfig, Account } from '../types'
import { PasswordGenerator } from './PasswordGenerator'
import { DraggableFieldList } from './DraggableFieldList'
import { TagInput } from './TagInput'
import { useI18n } from '../i18n'

interface AddAccountModalProps {
  accounts: Account[]
  onClose: () => void
  onAccountAdded: () => void
}

export const AddAccountModal: React.FC<AddAccountModalProps> = ({
  accounts,
  onClose,
  onAccountAdded
}) => {
  const { t } = useI18n()
  
  // 获取所有现有标签
  const existingTags = React.useMemo(() => {
    const tagSet = new Set<string>()
    accounts.forEach(acc => {
      acc.tags?.forEach(tag => tagSet.add(tag))
    })
    return Array.from(tagSet).sort()
  }, [accounts])

  const [account, setAccount] = useState<NewAccount>({
    name: '',
    fields: {
      'Username': { value: '', hidden: false },
      'Password': { value: '', hidden: true },
      'Email': { value: '', hidden: false },
      'URL': { value: '', hidden: false }
    },
    fieldOrder: ['Username', 'Password', 'Email', 'URL'],
    passwordRules: {
      length: 16,
      includeUppercase: true,
      includeLowercase: true,
      includeNumbers: true,
      includeSymbols: true,
      excludeAmbiguous: true
    }
  })
  
  const [loading, setLoading] = useState(false)
  const [showPasswordGenerator, setShowPasswordGenerator] = useState(false)
  const [currentFieldForPassword, setCurrentFieldForPassword] = useState<string>('')
  const [fieldCounter, setFieldCounter] = useState(5)
  const [editingFieldKeys, setEditingFieldKeys] = useState<{[oldKey: string]: string}>({})
  const [fieldIds] = useState(() => {
    const ids: {[key: string]: string} = {}
    Object.keys(account.fields).forEach((key, index) => {
      ids[key] = `field-${index}-${Date.now()}`
    })
    return ids
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!account.name.trim()) return

    setLoading(true)
    try {
      await window.electronAPI.storage.addAccount(account)
      onAccountAdded()
      onClose()
    } catch (error) {
      console.error('Error adding account:', error)
      await window.electronAPI.dialog.showError('Failed to add account')
    } finally {
      setLoading(false)
    }
  }

  const handleFieldChange = (key: string, value: string) => {
    setAccount(prev => ({
      ...prev,
      fields: {
        ...prev.fields,
        [key]: { ...prev.fields[key], value }
      }
    }))
  }

  const handleFieldHiddenToggle = (key: string) => {
    setAccount(prev => ({
      ...prev,
      fields: {
        ...prev.fields,
        [key]: { ...prev.fields[key], hidden: !prev.fields[key].hidden }
      }
    }))
  }

  const handleFieldKeyChange = (oldKey: string, newKey: string) => {
    // 先更新临时编辑状态，不立即更改数据结构
    setEditingFieldKeys(prev => ({
      ...prev,
      [oldKey]: newKey
    }))
  }

  const handleFieldKeyBlur = (oldKey: string) => {
    const newKey = editingFieldKeys[oldKey]
    if (!newKey || newKey === oldKey) {
      // 清除编辑状态
      setEditingFieldKeys(prev => {
        const { [oldKey]: removed, ...rest } = prev
        return rest
      })
      return
    }
    
    // 检查新的字段名是否为空
    if (!newKey.trim()) {
      setEditingFieldKeys(prev => {
        const { [oldKey]: removed, ...rest } = prev
        return rest
      })
      return
    }
    
    // 检查新的字段名是否已存在（除了当前字段）
    if (account.fields.hasOwnProperty(newKey)) {
      alert('Field name already exists!')
      setEditingFieldKeys(prev => {
        const { [oldKey]: removed, ...rest } = prev
        return rest
      })
      return
    }
    
    const fieldConfig = account.fields[oldKey]
    const newFields = { ...account.fields }
    delete newFields[oldKey]
    newFields[newKey] = fieldConfig
    
    setAccount(prev => ({
      ...prev,
      fields: newFields,
      fieldOrder: prev.fieldOrder?.map(fieldKey => fieldKey === oldKey ? newKey : fieldKey) || []
    }))
    
    // 清除编辑状态
    setEditingFieldKeys(prev => {
      const { [oldKey]: removed, ...rest } = prev
      return rest
    })
  }

  const addField = () => {
    const newFieldName = `Field${fieldCounter}`
    setAccount(prev => {
      const newFieldOrder = prev.fieldOrder ? [...prev.fieldOrder, newFieldName] : [newFieldName]
      return {
        ...prev,
        fields: {
          ...prev.fields,
          [newFieldName]: { value: '', hidden: false }
        },
        fieldOrder: newFieldOrder
      }
    })
    setFieldCounter(prev => prev + 1)
  }

  const removeField = (key: string) => {
    const { [key]: removed, ...remainingFields } = account.fields
    setAccount(prev => ({
      ...prev,
      fields: remainingFields,
      fieldOrder: prev.fieldOrder?.filter(fieldKey => fieldKey !== key) || []
    }))
  }

  const openPasswordGenerator = (fieldKey: string) => {
    setCurrentFieldForPassword(fieldKey)
    setShowPasswordGenerator(true)
  }

  const handlePasswordGenerated = (password: string) => {
    if (currentFieldForPassword) {
      handleFieldChange(currentFieldForPassword, password)
      setCurrentFieldForPassword('')
      setShowPasswordGenerator(false)
    }
  }

  const handleRulesUpdate = (rules: PasswordRules) => {
    setAccount(prev => ({
      ...prev,
      passwordRules: rules
    }))
  }

  const isPasswordField = (key: string, value: string) => {
    const passwordKeywords = ['password', 'pwd', 'pass', 'pin', 'secret', 'key']
    return passwordKeywords.some(keyword => 
      key.toLowerCase().includes(keyword)
    ) || (value && value.length > 8 && /[A-Za-z]/.test(value) && /\d/.test(value))
  }

  const handleFieldOrderChange = (newOrder: string[]) => {
    setAccount(prev => ({
      ...prev,
      fieldOrder: newOrder
    }))
  }

  const handleCopy = async (text: string) => {
    try {
      await window.electronAPI.clipboard.write(text)
    } catch (error) {
      console.error('Error copying to clipboard:', error)
    }
  }

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-6 z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[80vh] overflow-hidden flex flex-col">
          {/* Fixed Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
            <h2 className="text-xl font-semibold text-gray-900">{t('addAccountModal.title')}</h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:bg-gray-100 rounded-full"
            >
              <X size={20} />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto">
            <form id="add-account-form" onSubmit={handleSubmit} className="p-6">
            <div className="mb-6">
              <label htmlFor="accountName" className="block text-sm font-medium text-gray-700 mb-2">
                {t('addAccountModal.accountName')} *
              </label>
              <input
                id="accountName"
                type="text"
                value={account.name}
                onChange={(e) => setAccount(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder={t('addAccountModal.accountNamePlaceholder')}
                required
              />
            </div>

            <div className="mb-6">
              <TagInput
                tags={account.tags || []}
                existingTags={existingTags}
                onChange={(tags) => setAccount(prev => ({ ...prev, tags }))}
                placeholder={t('tags.addTags')}
              />
            </div>

            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-700">{t('addAccountModal.accountFields')}</h3>
                <button
                  type="button"
                  onClick={addField}
                  className="text-sm text-blue-600 hover:text-blue-700 flex items-center space-x-1"
                >
                  <Plus size={16} />
                  <span>{t('account.addField')}</span>
                </button>
              </div>

              <DraggableFieldList
                fields={account.fields}
                fieldOrder={account.fieldOrder || Object.keys(account.fields)}
                isEditing={true}
                visibleFields={new Set()}
                editingFieldKeys={editingFieldKeys}
                onFieldOrderChange={handleFieldOrderChange}
                onFieldKeyChange={handleFieldKeyChange}
                onFieldKeyBlur={handleFieldKeyBlur}
                onFieldChange={handleFieldChange}
                onFieldHiddenToggle={handleFieldHiddenToggle}
                onToggleFieldVisibility={() => {}}
                onCopy={handleCopy}
                onOpenPasswordGenerator={openPasswordGenerator}
                onRemoveField={removeField}
                isPasswordField={isPasswordField}
              />
            </div>
          </form>
          </div>

          {/* Fixed Footer */}
          <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 flex-shrink-0 bg-white">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              form="add-account-form"
              disabled={loading || !account.name.trim()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors"
            >
              {loading ? t('addAccountModal.adding') : t('addAccountModal.addAccount')}
            </button>
          </div>
        </div>
      </div>

      {showPasswordGenerator && (
        <PasswordGenerator
          onClose={() => {
            setShowPasswordGenerator(false)
            setCurrentFieldForPassword('')
          }}
          onPasswordGenerated={handlePasswordGenerated}
          initialRules={account.passwordRules}
          onRulesUpdate={handleRulesUpdate}
        />
      )}

    </>
  )
}