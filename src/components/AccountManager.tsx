import React, { useState } from 'react'
import { Plus, Lock, Search } from 'lucide-react'
import { Account } from '../types'
import { AccountCard } from './AccountCard'
import { AddAccountModal } from './AddAccountModal'

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
  const [showAddModal, setShowAddModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const filteredAccounts = accounts.filter(account =>
    account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    Object.keys(account.fields).some(key =>
      key.toLowerCase().includes(searchTerm.toLowerCase())
    )
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">Key Ring</h1>
          <button
            onClick={onLock}
            className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Lock size={20} />
            <span>Lock</span>
          </button>
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
              placeholder="Search accounts..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Plus size={20} />
            <span>Add Account</span>
          </button>
        </div>

        {filteredAccounts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              {searchTerm ? 'No accounts found matching your search.' : 'No accounts yet.'}
            </div>
            {!searchTerm && (
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <Plus size={20} />
                <span>Add your first account</span>
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredAccounts.map(account => (
              <AccountCard
                key={account.id}
                account={account}
                onUpdate={onAccountsChange}
              />
            ))}
          </div>
        )}
      </div>

      {showAddModal && (
        <AddAccountModal
          onClose={() => setShowAddModal(false)}
          onAccountAdded={onAccountsChange}
        />
      )}
    </div>
  )
}