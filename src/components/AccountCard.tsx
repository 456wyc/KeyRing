import React, { useState } from 'react'
import { Copy, Edit, Save, X, Trash2, Eye, EyeOff, Settings } from 'lucide-react'
import { Account, FieldConfig } from '../types'
import { PasswordGenerator } from './PasswordGenerator'
import { DraggableFieldList } from './DraggableFieldList'
import { TagInput } from './TagInput'
import { TagDisplay } from './TagDisplay'
import { Toast } from './Toast'
import { useI18n } from '../i18n'
import { useToast } from '../hooks/useToast'

interface AccountCardProps {
  account: Account
  accounts: Account[]
  showTags?: boolean
  onUpdate: () => void
}

export const AccountCard: React.FC<AccountCardProps> = ({ account, accounts, showTags = true, onUpdate }) => {
  const { t } = useI18n()
  const { toast, showToast, hideToast } = useToast()
  
  // 获取所有现有标签
  const existingTags = React.useMemo(() => {
    const tagSet = new Set<string>()
    accounts.forEach(acc => {
      acc.tags?.forEach(tag => tagSet.add(tag))
    })
    return Array.from(tagSet).sort()
  }, [accounts])
  const [isEditing, setIsEditing] = useState(false)
  const [editedAccount, setEditedAccount] = useState(account)
  const [visibleFields, setVisibleFields] = useState<Set<string>>(new Set())
  const [showPasswordGenerator, setShowPasswordGenerator] = useState(false)
  const [currentFieldForPassword, setCurrentFieldForPassword] = useState<string>('')
  const [fieldCounter, setFieldCounter] = useState(() => {
    const existingFields = Object.keys(account.fields)
    const fieldNumbers = existingFields
      .filter(key => key.startsWith('Field'))
      .map(key => parseInt(key.replace('Field', '')) || 0)
    return Math.max(...fieldNumbers, 4) + 1
  })
  const [editingFieldKeys, setEditingFieldKeys] = useState<{[oldKey: string]: string}>({})
  const [fieldIds] = useState(() => {
    const ids: {[key: string]: string} = {}
    Object.keys(account.fields).forEach((key, index) => {
      ids[key] = `field-${index}-${Date.now()}`
    })
    return ids
  })

  const handleEdit = () => {
    const accountToEdit = { ...account }
    // Ensure fieldOrder exists
    if (!accountToEdit.fieldOrder) {
      accountToEdit.fieldOrder = Object.keys(accountToEdit.fields)
    }
    setEditedAccount(accountToEdit)
    setIsEditing(true)
  }

  const handleSave = async () => {
    try {
      await window.electronAPI.storage.updateAccount(account.id, {
        name: editedAccount.name,
        tags: editedAccount.tags,
        fields: editedAccount.fields,
        fieldOrder: editedAccount.fieldOrder,
        passwordRules: editedAccount.passwordRules
      })
      setIsEditing(false)
      onUpdate()
    } catch (error) {
      console.error('Error updating account:', error)
      await window.electronAPI.dialog.showError('Failed to update account')
    }
  }

  const handleCancel = () => {
    setEditedAccount(account)
    setIsEditing(false)
  }

  const handleDelete = async () => {
    if (confirm(`Are you sure you want to delete "${account.name}"?`)) {
      try {
        await window.electronAPI.storage.deleteAccount(account.id)
        onUpdate()
      } catch (error) {
        console.error('Error deleting account:', error)
        await window.electronAPI.dialog.showError('Failed to delete account')
      }
    }
  }

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

  const handleFieldChange = (key: string, value: string) => {
    setEditedAccount(prev => ({
      ...prev,
      fields: {
        ...prev.fields,
        [key]: { ...prev.fields[key], value }
      }
    }))
  }

  const handleFieldHiddenToggle = (key: string) => {
    setEditedAccount(prev => ({
      ...prev,
      fields: {
        ...prev.fields,
        [key]: { ...prev.fields[key], hidden: !prev.fields[key].hidden }
      }
    }))
  }

  const addField = () => {
    const newFieldName = `Field${fieldCounter}`
    setEditedAccount(prev => {
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
    const { [key]: removed, ...remainingFields } = editedAccount.fields
    setEditedAccount(prev => ({
      ...prev,
      fields: remainingFields,
      fieldOrder: prev.fieldOrder?.filter(fieldKey => fieldKey !== key) || []
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
    if (editedAccount.fields.hasOwnProperty(newKey)) {
      alert('Field name already exists!')
      setEditingFieldKeys(prev => {
        const { [oldKey]: removed, ...rest } = prev
        return rest
      })
      return
    }
    
    const fieldConfig = editedAccount.fields[oldKey]
    const newFields = { ...editedAccount.fields }
    delete newFields[oldKey]
    newFields[newKey] = fieldConfig
    
    setEditedAccount(prev => ({
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

  const handlePasswordGenerated = (password: string) => {
    if (currentFieldForPassword) {
      handleFieldChange(currentFieldForPassword, password)
      setCurrentFieldForPassword('')
      setShowPasswordGenerator(false)
    }
  }

  const openPasswordGenerator = (fieldKey: string) => {
    setCurrentFieldForPassword(fieldKey)
    setShowPasswordGenerator(true)
  }

  const isPasswordField = (key: string, value: string) => {
    const passwordKeywords = ['password', 'pwd', 'pass', 'pin', 'secret', 'key']
    return passwordKeywords.some(keyword => 
      key.toLowerCase().includes(keyword)
    ) || (value && value.length > 8 && /[A-Za-z]/.test(value) && /\d/.test(value))
  }

  const handleFieldOrderChange = (newOrder: string[]) => {
    setEditedAccount(prev => ({
      ...prev,
      fieldOrder: newOrder
    }))
  }

  const displayedAccount = isEditing ? editedAccount : account

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-4">
          {isEditing ? (
            <input
              type="text"
              value={editedAccount.name}
              onChange={(e) => setEditedAccount(prev => ({ ...prev, name: e.target.value }))}
              className="text-lg font-semibold text-gray-900 bg-transparent border-b border-gray-300 focus:border-blue-500 outline-none flex-1 mr-2"
              placeholder="Account name"
            />
          ) : (
            <h3 className="text-lg font-semibold text-gray-900 truncate flex-1">
              {displayedAccount.name}
            </h3>
          )}
          
          <div className="flex items-center space-x-1 flex-shrink-0">
            {isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  className="p-1 text-green-600 hover:bg-green-100 rounded"
                  title="Save"
                >
                  <Save size={16} />
                </button>
                <button
                  onClick={handleCancel}
                  className="p-1 text-gray-500 hover:bg-gray-100 rounded"
                  title="Cancel"
                >
                  <X size={16} />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleEdit}
                  className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                  title="Edit"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={handleDelete}
                  className="p-1 text-red-600 hover:bg-red-100 rounded"
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </>
            )}
          </div>
        </div>

        {isEditing && (
          <div className="mb-4">
            <TagInput
              tags={editedAccount.tags || []}
              existingTags={existingTags}
              onChange={(tags) => setEditedAccount(prev => ({ ...prev, tags }))}
              placeholder={t('tags.addTags')}
            />
          </div>
        )}

        <DraggableFieldList
          fields={displayedAccount.fields}
          fieldOrder={displayedAccount.fieldOrder || Object.keys(displayedAccount.fields)}
          isEditing={isEditing}
          visibleFields={visibleFields}
          editingFieldKeys={editingFieldKeys}
          onFieldOrderChange={handleFieldOrderChange}
          onFieldKeyChange={handleFieldKeyChange}
          onFieldKeyBlur={handleFieldKeyBlur}
          onFieldChange={handleFieldChange}
          onFieldHiddenToggle={handleFieldHiddenToggle}
          onToggleFieldVisibility={toggleFieldVisibility}
          onCopy={handleCopy}
          onOpenPasswordGenerator={openPasswordGenerator}
          onRemoveField={removeField}
          isPasswordField={isPasswordField}
        />
          
        {isEditing && (
          <button
            onClick={addField}
            className="w-full mt-3 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors"
          >
            + Add Field
          </button>
        )}

        {/* 标签显示区域 */}
        {!isEditing && showTags && displayedAccount.tags && displayedAccount.tags.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <TagDisplay 
              tags={displayedAccount.tags} 
              maxTags={5}
              size="sm"
            />
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="text-xs text-gray-500">
            Updated: {new Date(displayedAccount.updatedAt).toLocaleDateString()}
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
        />
      )}

      {toast.isVisible && (
        <Toast
          message={toast.message}
          onClose={hideToast}
        />
      )}

    </>
  )
}