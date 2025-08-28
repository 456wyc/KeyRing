import React, { useState } from 'react'
import { X } from 'lucide-react'

interface InputModalProps {
  title: string
  placeholder: string
  onConfirm: (value: string) => void
  onCancel: () => void
}

export const InputModal: React.FC<InputModalProps> = ({
  title,
  placeholder,
  onConfirm,
  onCancel
}) => {
  const [value, setValue] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (value.trim()) {
      onConfirm(value.trim())
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-6 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-sm w-full overflow-hidden flex flex-col">
        {/* Fixed Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <button
            onClick={onCancel}
            className="p-1 text-gray-500 hover:bg-gray-100 rounded"
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <form id="input-form" onSubmit={handleSubmit} className="p-4">
            <input
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={placeholder}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              autoFocus
            />
          </form>
        </div>

        {/* Fixed Footer */}
        <div className="flex justify-end space-x-2 p-4 border-t border-gray-200 flex-shrink-0 bg-white">
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-2 text-gray-700 hover:bg-gray-100 rounded"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="input-form"
            disabled={!value.trim()}
            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  )
}