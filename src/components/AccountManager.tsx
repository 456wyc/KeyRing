import React, { useState } from 'react'
import { Plus, Lock, Search, Grid, List, Tag } from 'lucide-react'
import { Account } from '../types'
import { AccountCard } from './AccountCard'
import { AccountListView } from './AccountListView'
import { AccountDetailModal } from './AccountDetailModal'
import { AddAccountModal } from './AddAccountModal'
import { TagFilter } from './TagFilter'
import { LanguageToggle } from './LanguageToggle'
import { useI18n } from '../i18n'

interface AccountManagerProps {
  accounts: Account[]
  onAccountsChange: () => void
  onLock: () => void
}

export const AccountManager: React.FC<AccountManagerProps> = ({
  accounts,
  onAccountsChange,
  onLock
}) => {
  const { t } = useI18n()
  const [showAddModal, setShowAddModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card')
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null)
  const [editingAccount, setEditingAccount] = useState<Account | null>(null)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [showTags, setShowTags] = useState<boolean>(() => {
    const saved = localStorage.getItem('keyring-show-tags')
    return saved ? JSON.parse(saved) : true
  })

  const filteredAccounts = accounts.filter(account => {
    // 文本筛选
    const matchesSearch = searchTerm === '' || 
      account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      Object.keys(account.fields).some(key =>
        key.toLowerCase().includes(searchTerm.toLowerCase())
      )
    
    // 标签筛选：如果没有选中标签，显示所有；如果选中标签，必须包含至少一个选中的标签
    const matchesTags = selectedTags.length === 0 ||
      selectedTags.some(tag => account.tags?.includes(tag))
    
    return matchesSearch && matchesTags
  })

  const handleAccountClick = (account: Account) => {
    setSelectedAccount(account)
  }

  const handleEditAccount = (account: Account) => {
    setEditingAccount(account)
    setSelectedAccount(null)
  }

  const handleCloseDetailModal = () => {
    setSelectedAccount(null)
  }

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
  }

  const handleClearTagFilters = () => {
    setSelectedTags([])
  }

  const toggleTagDisplay = () => {
    const newValue = !showTags
    setShowTags(newValue)
    localStorage.setItem('keyring-show-tags', JSON.stringify(newValue))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">{t('app.title')}</h1>
          <div className="flex items-center space-x-2">
            <LanguageToggle />
            <button
              onClick={onLock}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Lock size={20} />
              <span>{t('app.lock')}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="mb-6 flex items-center space-x-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t('accountManager.searchPlaceholder')}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div className="flex items-center space-x-2 border border-gray-300 rounded-lg">
            <button
              onClick={() => setViewMode('card')}
              className={`p-2 rounded-l-lg transition-colors ${
                viewMode === 'card' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              title={t('accountManager.cardView')}
            >
              <Grid size={18} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-r-lg transition-colors ${
                viewMode === 'list' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              title={t('accountManager.listView')}
            >
              <List size={18} />
            </button>
          </div>

          <button
            onClick={toggleTagDisplay}
            className={`p-2 rounded-lg transition-colors ${
              showTags 
                ? 'bg-green-100 text-green-700' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
            title={showTags ? t('tags.hideTags') : t('tags.showTags')}
          >
            <Tag size={18} />
          </button>
          
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Plus size={20} />
            <span>{t('accountManager.addAccount')}</span>
          </button>
        </div>

        {showTags && (
          <TagFilter
            accounts={accounts}
            selectedTags={selectedTags}
            onTagToggle={handleTagToggle}
            onClearFilters={handleClearTagFilters}
          />
        )}

        {filteredAccounts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              {searchTerm ? t('accountManager.noSearchResults') : t('accountManager.noAccounts')}
            </div>
            {!searchTerm && (
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <Plus size={20} />
                <span>{t('accountManager.addFirstAccount')}</span>
              </button>
            )}
          </div>
        ) : (
          viewMode === 'card' ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredAccounts.map(account => (
                <AccountCard
                  key={account.id}
                  account={account}
                  accounts={accounts}
                  showTags={showTags}
                  onUpdate={onAccountsChange}
                />
              ))}
            </div>
          ) : (
            <AccountListView
              accounts={filteredAccounts}
              onAccountClick={handleAccountClick}
            />
          )
        )}
      </div>

      {showAddModal && (
        <AddAccountModal
          accounts={accounts}
          onClose={() => setShowAddModal(false)}
          onAccountAdded={onAccountsChange}
        />
      )}

      {selectedAccount && (
        <AccountDetailModal
          account={selectedAccount}
          onClose={handleCloseDetailModal}
          onEdit={handleEditAccount}
        />
      )}

      {editingAccount && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <AccountCard
              account={editingAccount}
              accounts={accounts}
              showTags={showTags}
              onUpdate={() => {
                onAccountsChange()
                setEditingAccount(null)
              }}
            />
            <div className="p-4 border-t border-gray-200">
              <button
                onClick={() => setEditingAccount(null)}
                className="w-full px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {t('common.close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}