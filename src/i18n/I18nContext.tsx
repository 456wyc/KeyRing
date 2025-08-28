import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react'
import { I18nMessages, SupportedLanguage } from './types'
import { enMessages } from './en'
import { zhMessages } from './zh'

interface I18nContextType {
  language: SupportedLanguage
  messages: I18nMessages
  setLanguage: (language: SupportedLanguage) => void
  t: (key: string) => string
}

const I18nContext = createContext<I18nContextType | undefined>(undefined)

const languageMessages: Record<SupportedLanguage, I18nMessages> = {
  en: enMessages,
  zh: zhMessages
}

interface I18nProviderProps {
  children: ReactNode
}

export const I18nProvider: React.FC<I18nProviderProps> = ({ children }) => {
  const [language, setLanguageState] = useState<SupportedLanguage>(() => {
    const saved = localStorage.getItem('keyring-language')
    if (saved && (saved === 'en' || saved === 'zh')) {
      return saved as SupportedLanguage
    }
    // Detect system language, default to English
    const systemLang = navigator.language.toLowerCase()
    return systemLang.startsWith('zh') ? 'zh' : 'en'
  })

  const messages = languageMessages[language]

  const setLanguage = (newLanguage: SupportedLanguage) => {
    setLanguageState(newLanguage)
    localStorage.setItem('keyring-language', newLanguage)
  }

  // Helper function to get nested translation
  const t = (key: string): string => {
    const keys = key.split('.')
    let value: any = messages
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k]
      } else {
        console.warn(`Translation key not found: ${key}`)
        return key
      }
    }
    
    return typeof value === 'string' ? value : key
  }

  return (
    <I18nContext.Provider value={{ language, messages, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  )
}

export const useI18n = (): I18nContextType => {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider')
  }
  return context
}