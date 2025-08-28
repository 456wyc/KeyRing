import React, { useState, useRef, useEffect } from 'react'
import { X, Tag, Plus } from 'lucide-react'
import { useI18n } from '../i18n'

interface TagInputProps {
  tags: string[]
  existingTags: string[]
  onChange: (tags: string[]) => void
  placeholder?: string
  className?: string
}

export const TagInput: React.FC<TagInputProps> = ({
  tags,
  existingTags,
  onChange,
  placeholder,
  className = ''
}) => {
  const { t } = useI18n()
  const [inputValue, setInputValue] = useState('')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [focusedIndex, setFocusedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // 获取建议标签（已存在但未选中的标签）
  const suggestedTags = existingTags.filter(tag => 
    !tags.includes(tag) && 
    tag.toLowerCase().includes(inputValue.toLowerCase())
  ).slice(0, 5)

  // 处理标签添加
  const addTag = (tag: string) => {
    const trimmedTag = tag.trim()
    if (trimmedTag && !tags.includes(trimmedTag)) {
      onChange([...tags, trimmedTag])
    }
    setInputValue('')
    setIsDropdownOpen(false)
    setFocusedIndex(-1)
  }

  // 处理标签删除
  const removeTag = (tagToRemove: string) => {
    onChange(tags.filter(tag => tag !== tagToRemove))
  }

  // 处理键盘事件
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (focusedIndex >= 0 && suggestedTags[focusedIndex]) {
        addTag(suggestedTags[focusedIndex])
      } else if (inputValue.trim()) {
        addTag(inputValue)
      }
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      removeTag(tags[tags.length - 1])
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setFocusedIndex(prev => Math.min(prev + 1, suggestedTags.length - 1))
      setIsDropdownOpen(true)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setFocusedIndex(prev => Math.max(prev - 1, -1))
    } else if (e.key === 'Escape') {
      setIsDropdownOpen(false)
      setFocusedIndex(-1)
    }
  }

  // 处理输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInputValue(value)
    setIsDropdownOpen(value.length > 0 || suggestedTags.length > 0)
    setFocusedIndex(-1)
  }

  // 处理点击外部关闭下拉
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
        setFocusedIndex(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // 预定义标签颜色
  const tagColors = [
    'bg-blue-100 text-blue-800',
    'bg-green-100 text-green-800', 
    'bg-yellow-100 text-yellow-800',
    'bg-red-100 text-red-800',
    'bg-purple-100 text-purple-800',
    'bg-pink-100 text-pink-800',
    'bg-indigo-100 text-indigo-800',
    'bg-gray-100 text-gray-800',
  ]

  const getTagColor = (tag: string) => {
    const hash = tag.split('').reduce((a, b) => a + b.charCodeAt(0), 0)
    return tagColors[hash % tagColors.length]
  }

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        <Tag size={16} className="inline mr-1" />
        {t('tags.tags')}
      </label>
      
      <div className="min-h-[42px] w-full px-3 py-2 border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 bg-white">
        <div className="flex flex-wrap gap-1 items-center">
          {/* 显示已选标签 */}
          {tags.map((tag) => (
            <span
              key={tag}
              className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getTagColor(tag)}`}
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="hover:bg-black hover:bg-opacity-10 rounded-full p-0.5"
              >
                <X size={12} />
              </button>
            </span>
          ))}
          
          {/* 输入框 */}
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (suggestedTags.length > 0) {
                setIsDropdownOpen(true)
              }
            }}
            placeholder={tags.length === 0 ? (placeholder || t('tags.addTags')) : ''}
            className="flex-1 min-w-[100px] outline-none bg-transparent text-sm"
          />
        </div>
      </div>

      {/* 下拉建议 */}
      {isDropdownOpen && suggestedTags.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
          {suggestedTags.map((tag, index) => (
            <button
              key={tag}
              type="button"
              onClick={() => addTag(tag)}
              className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 flex items-center space-x-2 ${
                index === focusedIndex ? 'bg-blue-50 text-blue-700' : 'text-gray-900'
              }`}
            >
              <Tag size={14} className="text-gray-400" />
              <span>{tag}</span>
            </button>
          ))}
        </div>
      )}

      {/* 创建新标签提示 */}
      {inputValue.trim() && !suggestedTags.includes(inputValue.trim()) && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
          <button
            type="button"
            onClick={() => addTag(inputValue)}
            className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 flex items-center space-x-2 text-blue-600"
          >
            <Plus size={14} />
            <span>{t('tags.createTag')}: "{inputValue.trim()}"</span>
          </button>
        </div>
      )}
    </div>
  )
}