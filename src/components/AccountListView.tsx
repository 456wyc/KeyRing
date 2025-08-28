import React from 'react'
import { Account } from '../types'
import { Eye, Calendar } from 'lucide-react'

interface AccountListViewProps {
  accounts: Account[]
  onAccountClick: (account: Account) => void
}

export const AccountListView: React.FC<AccountListViewProps> = ({
  accounts,
  onAccountClick
}) => {
  const getFieldCount = (account: Account) => {
    return Object.keys(account.fields).length
  }

  const getVisibleFieldsCount = (account: Account) => {
    return Object.values(account.fields).filter(field => !field.hidden).length
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="divide-y divide-gray-100">
        <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
          <div className="grid grid-cols-12 gap-4 text-xs font-medium text-gray-500 uppercase tracking-wide">
            <div className="col-span-4">Account Name</div>
            <div className="col-span-2">Fields</div>
            <div className="col-span-2">Visible</div>
            <div className="col-span-4">Last Updated</div>
          </div>
        </div>
        
        {accounts.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-500">
            No accounts found. Click "Add Account" to create your first account.
          </div>
        ) : (
          accounts.map((account) => (
            <div
              key={account.id}
              onClick={() => onAccountClick(account)}
              className="px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors group"
            >
              <div className="grid grid-cols-12 gap-4 items-center">
                <div className="col-span-4">
                  <div className="flex items-center space-x-2">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-medium text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                        {account.name}
                      </h3>
                    </div>
                  </div>
                </div>
                
                <div className="col-span-2">
                  <div className="flex items-center text-sm text-gray-500">
                    <Eye size={14} className="mr-1" />
                    <span>{getFieldCount(account)}</span>
                  </div>
                </div>
                
                <div className="col-span-2">
                  <span className="text-sm text-gray-500">
                    {getVisibleFieldsCount(account)}
                  </span>
                </div>
                
                <div className="col-span-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar size={14} className="mr-1" />
                    <span>{new Date(account.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}