import React, { useState, useEffect } from 'react'
import { Lock, Key } from 'lucide-react'

interface LoginScreenProps {
  onUnlock: () => void
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onUnlock }) => {
  const [masterPassword, setMasterPassword] = useState('')
  const [isFirstTime, setIsFirstTime] = useState(false)
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    checkIfFirstTime()
  }, [])

  const checkIfFirstTime = async () => {
    try {
      const initialized = await window.electronAPI.storage.isInitialized()
      setIsFirstTime(!initialized)
    } catch (error) {
      setIsFirstTime(true)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!masterPassword) return

    if (isFirstTime && masterPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)
    setError('')

    try {
      let success = false
      
      if (isFirstTime) {
        success = await window.electronAPI.storage.init(masterPassword)
      } else {
        success = await window.electronAPI.storage.unlock(masterPassword)
      }

      if (success) {
        onUnlock()
      } else {
        setError('Invalid master password')
      }
    } catch (error) {
      setError('Failed to authenticate')
      console.error('Authentication error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="bg-blue-100 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Key className="text-blue-600" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Key Ring</h1>
          <p className="text-gray-600">
            {isFirstTime ? 'Create your master password' : 'Enter your master password'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="masterPassword" className="block text-sm font-medium text-gray-700 mb-2">
              Master Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                id="masterPassword"
                type="password"
                value={masterPassword}
                onChange={(e) => setMasterPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter master password"
                required
              />
            </div>
          </div>

          {isFirstTime && (
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Confirm master password"
                  required
                />
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-4 rounded-lg transition-colors"
          >
            {loading ? 'Please wait...' : (isFirstTime ? 'Create & Unlock' : 'Unlock')}
          </button>
        </form>

        {isFirstTime && (
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-300 rounded-lg">
            <p className="text-sm text-yellow-700">
              <strong>Important:</strong> Remember your master password. It cannot be recovered if lost.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}