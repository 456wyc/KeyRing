import React from 'react'
import { Tag } from 'lucide-react'

interface TagDisplayProps {
  tags: string[]
  className?: string
  showIcon?: boolean
  maxTags?: number
  size?: 'sm' | 'md'
}

export const TagDisplay: React.FC<TagDisplayProps> = ({
  tags,
  className = '',
  showIcon = true,
  maxTags,
  size = 'sm'
}) => {
  if (!tags || tags.length === 0) {
    return null
  }

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

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2 py-1'
  }

  const iconSize = size === 'sm' ? 12 : 14

  const displayTags = maxTags ? tags.slice(0, maxTags) : tags
  const remainingCount = maxTags && tags.length > maxTags ? tags.length - maxTags : 0

  return (
    <div className={`flex flex-wrap items-center gap-1 ${className}`}>
      {showIcon && tags.length > 0 && (
        <Tag size={iconSize} className="text-gray-400 flex-shrink-0" />
      )}
      {displayTags.map((tag) => (
        <span
          key={tag}
          className={`inline-flex items-center rounded-full font-medium ${getTagColor(tag)} ${sizeClasses[size]}`}
        >
          {tag}
        </span>
      ))}
      {remainingCount > 0 && (
        <span className={`inline-flex items-center rounded-full font-medium bg-gray-100 text-gray-600 ${sizeClasses[size]}`}>
          +{remainingCount}
        </span>
      )}
    </div>
  )
}