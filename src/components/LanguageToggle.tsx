import React from 'react'
import { Globe } from 'lucide-react'
import { useI18n, SupportedLanguage } from '../i18n'

interface LanguageToggleProps {
  className?: string
}

export const LanguageToggle: React.FC<LanguageToggleProps> = ({ className = '' }) => {
  const { language, setLanguage } = useI18n()

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'zh' : 'en')
  }

  const getLanguageDisplay = (lang: SupportedLanguage) => {
    return lang === 'en' ? 'EN' : '中'
  }

  return (
    <button
      onClick={toggleLanguage}
      className={`flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors ${className}`}
      title={`Switch to ${language === 'en' ? 'Chinese' : 'English'}`}
    >
      <Globe size={18} />
      <span className="text-sm font-medium">{getLanguageDisplay(language)}</span>
    </button>
  )
}