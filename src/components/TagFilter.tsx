import React from 'react'
import { Tag, X } from 'lucide-react'
import { Account } from '../types'
import { useI18n } from '../i18n'

interface TagFilterProps {
  accounts: Account[]
  selectedTags: string[]
  onTagToggle: (tag: string) => void
  onClearFilters: () => void
}

export const TagFilter: React.FC<TagFilterProps> = ({
  accounts,
  selectedTags,
  onTagToggle,
  onClearFilters
}) => {
  const { t } = useI18n()

  // 获取所有标签及其使用次数
  const allTags = React.useMemo(() => {
    const tagCount: { [tag: string]: number } = {}
    accounts.forEach(account => {
      account.tags?.forEach(tag => {
        tagCount[tag] = (tagCount[tag] || 0) + 1
      })
    })
    return Object.entries(tagCount)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag))
  }, [accounts])

  if (allTags.length === 0) {
    return null
  }

  // 预定义标签颜色
  const tagColors = [
    'bg-blue-100 text-blue-800 hover:bg-blue-200',
    'bg-green-100 text-green-800 hover:bg-green-200',
    'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
    'bg-red-100 text-red-800 hover:bg-red-200',
    'bg-purple-100 text-purple-800 hover:bg-purple-200',
    'bg-pink-100 text-pink-800 hover:bg-pink-200',
    'bg-indigo-100 text-indigo-800 hover:bg-indigo-200',
    'bg-gray-100 text-gray-800 hover:bg-gray-200',
  ]

  const getTagColor = (tag: string, isSelected: boolean) => {
    const hash = tag.split('').reduce((a, b) => a + b.charCodeAt(0), 0)
    const baseColor = tagColors[hash % tagColors.length]
    
    if (isSelected) {
      return baseColor.replace('100', '200').replace('hover:bg-', 'bg-')
    }
    return baseColor
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-700 flex items-center">
          <Tag size={16} className="mr-2" />
          {t('tags.filterByTag')}
        </h3>
        {selectedTags.length > 0 && (
          <button
            onClick={onClearFilters}
            className="text-xs text-gray-500 hover:text-gray-700 flex items-center space-x-1"
          >
            <X size={12} />
            <span>Clear</span>
          </button>
        )}
      </div>
      
      <div className="flex flex-wrap gap-2">
        {allTags.map(({ tag, count }) => {
          const isSelected = selectedTags.includes(tag)
          return (
            <button
              key={tag}
              onClick={() => onTagToggle(tag)}
              className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-colors ${getTagColor(tag, isSelected)}`}
            >
              <span>{tag}</span>
              <span className="text-xs opacity-75">({count})</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}