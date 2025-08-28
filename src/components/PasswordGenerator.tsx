import React, { useState, useEffect } from 'react'
import { X, RefreshCw, Copy, Key, Hash } from 'lucide-react'
import { PasswordRules } from '../types'
import CryptoJS from 'crypto-js'

interface PasswordGeneratorProps {
  onClose: () => void
  onPasswordGenerated: (password: string) => void
  initialRules?: PasswordRules
  onRulesUpdate?: (rules: PasswordRules) => void
}

export const PasswordGenerator: React.FC<PasswordGeneratorProps> = ({
  onClose,
  onPasswordGenerated,
  initialRules,
  onRulesUpdate
}) => {
  const [rules, setRules] = useState<PasswordRules>(
    initialRules || {
      length: 16,
      includeUppercase: true,
      includeLowercase: true,
      includeNumbers: true,
      includeSymbols: true,
      excludeAmbiguous: true,
      customCharacters: '',
      excludeCharacters: ''
    }
  )

  const [generatedPassword, setGeneratedPassword] = useState('')
  const [masterPassword, setMasterPassword] = useState('')
  const [siteName, setSiteName] = useState('')
  const [generationMode, setGenerationMode] = useState<'random' | 'deterministic'>('random')

  useEffect(() => {
    generatePassword()
  }, [rules, generationMode])

  const generateRandomPassword = (): string => {
    let charset = ''
    
    if (rules.includeLowercase) charset += 'abcdefghijklmnopqrstuvwxyz'
    if (rules.includeUppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    if (rules.includeNumbers) charset += '0123456789'
    if (rules.includeSymbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?'
    
    if (rules.customCharacters) {
      charset += rules.customCharacters
    }
    
    if (rules.excludeAmbiguous) {
      charset = charset.replace(/[0O1lI]/g, '')
    }
    
    if (rules.excludeCharacters) {
      const excludeRegex = new RegExp(`[${rules.excludeCharacters.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}]`, 'g')
      charset = charset.replace(excludeRegex, '')
    }
    
    if (!charset) {
      return 'Please select at least one character type'
    }
    
    let password = ''
    for (let i = 0; i < rules.length; i++) {
      password += charset[Math.floor(Math.random() * charset.length)]
    }
    
    return password
  }

  const generateDeterministicPassword = (): string => {
    if (!masterPassword || !siteName) {
      return 'Enter master password and site name'
    }

    try {
      const input = `${masterPassword}:${siteName}:${JSON.stringify(rules)}`
      const hash = CryptoJS.SHA256(input).toString()
      
      let charset = ''
      if (rules.includeLowercase) charset += 'abcdefghijklmnopqrstuvwxyz'
      if (rules.includeUppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
      if (rules.includeNumbers) charset += '0123456789'
      if (rules.includeSymbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?'
      
      if (rules.customCharacters) charset += rules.customCharacters
      
      if (rules.excludeAmbiguous) {
        charset = charset.replace(/[0O1lI]/g, '')
      }
      
      if (rules.excludeCharacters) {
        const excludeRegex = new RegExp(`[${rules.excludeCharacters.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}]`, 'g')
        charset = charset.replace(excludeRegex, '')
      }
      
      if (!charset) return 'Invalid character set'
      
      let password = ''
      for (let i = 0; i < rules.length; i++) {
        const charIndex = parseInt(hash.charAt(i % hash.length), 16) || 0
        password += charset[charIndex % charset.length]
      }
      
      return password
    } catch (error) {
      return 'Error generating password'
    }
  }

  const generatePassword = () => {
    if (generationMode === 'random') {
      setGeneratedPassword(generateRandomPassword())
    } else {
      setGeneratedPassword(generateDeterministicPassword())
    }
  }

  const handleRuleChange = (key: keyof PasswordRules, value: any) => {
    const newRules = { ...rules, [key]: value }
    setRules(newRules)
    if (onRulesUpdate) {
      onRulesUpdate(newRules)
    }
  }

  const handleUsePassword = () => {
    onPasswordGenerated(generatedPassword)
  }

  const handleCopyPassword = async () => {
    try {
      await window.electronAPI.clipboard.write(generatedPassword)
    } catch (error) {
      console.error('Error copying password:', error)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Password Generator</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="space-y-4">
            <div className="flex space-x-4">
              <button
                onClick={() => setGenerationMode('random')}
                className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg border-2 transition-colors ${
                  generationMode === 'random'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <RefreshCw size={20} />
                <span>Random</span>
              </button>
              <button
                onClick={() => setGenerationMode('deterministic')}
                className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg border-2 transition-colors ${
                  generationMode === 'deterministic'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <Hash size={20} />
                <span>Master Password</span>
              </button>
            </div>

            {generationMode === 'deterministic' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Master Password
                  </label>
                  <input
                    type="password"
                    value={masterPassword}
                    onChange={(e) => setMasterPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your master password"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Site/Account Name
                  </label>
                  <input
                    type="text"
                    value={siteName}
                    onChange={(e) => setSiteName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., gmail.com, github"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900">Password Rules</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Length: {rules.length}
              </label>
              <input
                type="range"
                min="4"
                max="128"
                value={rules.length}
                onChange={(e) => handleRuleChange('length', parseInt(e.target.value))}
                className="w-full"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={rules.includeUppercase}
                  onChange={(e) => handleRuleChange('includeUppercase', e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm">Uppercase (A-Z)</span>
              </label>
              
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={rules.includeLowercase}
                  onChange={(e) => handleRuleChange('includeLowercase', e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm">Lowercase (a-z)</span>
              </label>
              
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={rules.includeNumbers}
                  onChange={(e) => handleRuleChange('includeNumbers', e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm">Numbers (0-9)</span>
              </label>
              
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={rules.includeSymbols}
                  onChange={(e) => handleRuleChange('includeSymbols', e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm">Symbols</span>
              </label>
            </div>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={rules.excludeAmbiguous}
                onChange={(e) => handleRuleChange('excludeAmbiguous', e.target.checked)}
                className="rounded border-gray-300"
              />
              <span className="text-sm">Exclude ambiguous (0, O, 1, l, I)</span>
            </label>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Custom Characters
              </label>
              <input
                type="text"
                value={rules.customCharacters || ''}
                onChange={(e) => handleRuleChange('customCharacters', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                placeholder="Additional characters to include"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Exclude Characters
              </label>
              <input
                type="text"
                value={rules.excludeCharacters || ''}
                onChange={(e) => handleRuleChange('excludeCharacters', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                placeholder="Characters to exclude"
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">Generated Password</h3>
              <button
                onClick={generatePassword}
                className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                title="Regenerate"
              >
                <RefreshCw size={16} />
              </button>
            </div>
            
            <div className="relative">
              <input
                type="text"
                value={generatedPassword}
                readOnly
                className="w-full px-3 py-3 border border-gray-300 rounded font-mono text-sm bg-gray-50"
              />
              <button
                onClick={handleCopyPassword}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-gray-500 hover:bg-gray-200 rounded"
                title="Copy password"
              >
                <Copy size={16} />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleUsePassword}
              disabled={!generatedPassword || generatedPassword.includes('Error') || generatedPassword.includes('Please') || generatedPassword.includes('Enter')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors"
            >
              Use Password
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}