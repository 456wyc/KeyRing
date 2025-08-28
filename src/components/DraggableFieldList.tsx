import React, { useState, useRef } from 'react'
import { GripVertical, Copy, Edit, Save, X, Trash2, Eye, EyeOff, Settings } from 'lucide-react'
import { FieldConfig } from '../types'

interface DraggableFieldListProps {
  fields: { [key: string]: FieldConfig }
  fieldOrder: string[]
  isEditing: boolean
  visibleFields: Set<string>
  editingFieldKeys: { [oldKey: string]: string }
  onFieldOrderChange: (newOrder: string[]) => void
  onFieldKeyChange: (oldKey: string, newKey: string) => void
  onFieldKeyBlur: (oldKey: string) => void
  onFieldChange: (key: string, value: string) => void
  onFieldHiddenToggle: (key: string) => void
  onToggleFieldVisibility: (key: string) => void
  onCopy: (value: string) => void
  onOpenPasswordGenerator: (key: string) => void
  onRemoveField: (key: string) => void
  isPasswordField: (key: string, value: string) => boolean
}

export const DraggableFieldList: React.FC<DraggableFieldListProps> = ({
  fields,
  fieldOrder,
  isEditing,
  visibleFields,
  editingFieldKeys,
  onFieldOrderChange,
  onFieldKeyChange,
  onFieldKeyBlur,
  onFieldChange,
  onFieldHiddenToggle,
  onToggleFieldVisibility,
  onCopy,
  onOpenPasswordGenerator,
  onRemoveField,
  isPasswordField
}) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const draggedElementRef = useRef<HTMLDivElement | null>(null)

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/html', '')
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverIndex(index)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    
    if (draggedIndex === null || draggedIndex === dropIndex) return

    const newOrder = [...fieldOrder]
    const draggedItem = newOrder[draggedIndex]
    
    // Remove the dragged item
    newOrder.splice(draggedIndex, 1)
    
    // Insert at new position
    const insertIndex = draggedIndex < dropIndex ? dropIndex - 1 : dropIndex
    newOrder.splice(insertIndex, 0, draggedItem)
    
    onFieldOrderChange(newOrder)
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  return (
    <div className="space-y-3">
      {fieldOrder.map((key, index) => {
        const fieldConfig = fields[key]
        if (!fieldConfig) return null

        const isPassword = isPasswordField(key, fieldConfig.value)
        const isVisible = visibleFields.has(key) || !fieldConfig.hidden
        const displayKey = editingFieldKeys[key] || key
        const isDragged = draggedIndex === index
        const isDraggedOver = dragOverIndex === index

        return (
          <div
            key={`${key}-${index}`}
            className={`field-row group border rounded-lg p-3 transition-all duration-200 ${
              isDragged ? 'opacity-50 transform rotate-2' : ''
            } ${
              isDraggedOver ? 'border-blue-400 bg-blue-50' : 'border-gray-200 bg-white'
            } ${
              isEditing ? 'cursor-move' : ''
            }`}
            draggable={isEditing}
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={handleDragEnd}
            onDrop={(e) => handleDrop(e, index)}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                {isEditing && (
                  <div className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600">
                    <GripVertical size={16} />
                  </div>
                )}
                <label className="text-sm font-medium text-gray-700">
                  {isEditing ? (
                    <input
                      type="text"
                      value={displayKey}
                      onChange={(e) => onFieldKeyChange(key, e.target.value)}
                      onBlur={() => onFieldKeyBlur(key)}
                      className="text-sm font-medium bg-transparent border-b border-gray-300 focus:border-blue-500 outline-none"
                    />
                  ) : (
                    key
                  )}
                </label>
              </div>
              
              <div className="flex items-center space-x-1">
                {isEditing && (
                  <>
                    <button
                      onClick={() => onFieldHiddenToggle(key)}
                      className={`p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity ${
                        fieldConfig.hidden ? 'text-blue-600 bg-blue-100' : 'text-gray-400 hover:bg-gray-100'
                      }`}
                      title={fieldConfig.hidden ? 'Field is hidden by default' : 'Field is visible by default'}
                    >
                      {fieldConfig.hidden ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                    <button
                      onClick={() => onOpenPasswordGenerator(key)}
                      className="p-1 text-green-600 hover:bg-green-100 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Generate password"
                    >
                      <Settings size={14} />
                    </button>
                    <button
                      onClick={() => onRemoveField(key)}
                      className="p-1 text-red-600 hover:bg-red-100 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Remove field"
                    >
                      <X size={14} />
                    </button>
                  </>
                )}
                {!isEditing && (
                  <>
                    {(fieldConfig.hidden || isPassword) && (
                      <button
                        onClick={() => onToggleFieldVisibility(key)}
                        className="copy-button p-1 text-gray-500 hover:bg-gray-100 rounded"
                        title={isVisible ? "Hide" : "Show"}
                      >
                        {isVisible ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    )}
                    <button
                      onClick={() => onCopy(fieldConfig.value)}
                      className="copy-button p-1 text-gray-500 hover:bg-gray-100 rounded"
                      title="Copy to clipboard"
                    >
                      <Copy size={14} />
                    </button>
                  </>
                )}
              </div>
            </div>
            
            {isEditing ? (
              <input
                type={fieldConfig.hidden ? "password" : "text"}
                value={fieldConfig.value}
                onChange={(e) => onFieldChange(key, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 edit-mode"
                placeholder="Field value"
              />
            ) : (
              <div className="relative">
                <input
                  type={(fieldConfig.hidden || isPassword) && !isVisible ? "password" : "text"}
                  value={(fieldConfig.hidden || isPassword) && !isVisible ? "••••••••" : fieldConfig.value}
                  readOnly
                  className={`w-full px-3 py-2 border rounded readonly-mode cursor-default ${
                    (fieldConfig.hidden || isPassword) ? 'password-field' : ''
                  }`}
                />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}