import React, { useState } from 'react'
import { Key, KeyRound, Lock, ShieldAlert, ShieldOff, X, AlertCircle, CheckCircle } from 'lucide-react'
import { useI18n } from '../i18n'

export type MasterPasswordMode = 'change' | 'remove' | 'enable'

interface MasterPasswordModalProps {
  passwordEnabled: boolean
  onClose: () => void
  onStatusChange: () => void
}

type PasswordField = 'current' | 'new' | 'confirm'

export const MasterPasswordModal: React.FC<MasterPasswordModalProps> = ({
  passwordEnabled,
  onClose,
  onStatusChange
}) => {
  const { t } = useI18n()
  const [mode, setMode] = useState<MasterPasswordMode>(passwordEnabled ? 'change' : 'enable')
  const [passwords, setPasswords] = useState<Record<PasswordField, string>>({
    current: '',
    new: '',
    confirm: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState<{ title: string; note: string } | null>(null)

  const setField = (field: PasswordField, value: string) => {
    setPasswords(prev => ({ ...prev, [field]: value }))
  }

  const resetPasswords = () => setPasswords({ current: '', new: '', confirm: '' })

  const switchMode = (next: MasterPasswordMode) => {
    setMode(next)
    setError('')
    resetPasswords()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (mode === 'remove') {
      if (!passwords.current) {
        setError(t('masterPassword.passwordRequired'))
        return
      }

      if (!confirm(t('masterPassword.removeConfirm'))) {
        return
      }

      setLoading(true)
      try {
        const removed = await window.electronAPI.storage.removeMasterPassword(passwords.current)
        if (removed) {
          resetPasswords()
          setSuccess({
            title: t('masterPassword.removeSuccess'),
            note: t('masterPassword.removeNote')
          })
          onStatusChange()
        } else {
          setError(t('masterPassword.wrongCurrentPassword'))
        }
      } catch (err) {
        console.error('Failed to remove master password:', err)
        setError(t('masterPassword.failed'))
      } finally {
        setLoading(false)
      }
      return
    }

    const needsCurrent = mode === 'change'

    if ((needsCurrent && !passwords.current) || !passwords.new || !passwords.confirm) {
      setError(t('masterPassword.passwordRequired'))
      return
    }

    if (passwords.new !== passwords.confirm) {
      setError(t('masterPassword.passwordMismatch'))
      return
    }

    if (needsCurrent && passwords.new === passwords.current) {
      setError(t('masterPassword.sameAsCurrent'))
      return
    }

    setLoading(true)
    try {
      const ok = needsCurrent
        ? await window.electronAPI.storage.changeMasterPassword(passwords.current, passwords.new)
        : await window.electronAPI.storage.setMasterPassword(passwords.new)

      if (ok) {
        resetPasswords()
        setSuccess({
          title: needsCurrent ? t('masterPassword.success') : t('masterPassword.enableSuccess'),
          note: needsCurrent ? t('masterPassword.successNote') : t('masterPassword.enableNote')
        })
        if (!needsCurrent) {
          onStatusChange()
        }
      } else {
        setError(t('masterPassword.wrongCurrentPassword'))
      }
    } catch (err) {
      console.error('Failed to update master password:', err)
      setError(t('masterPassword.failed'))
    } finally {
      setLoading(false)
    }
  }

  const renderField = (field: PasswordField, label: string, autoFocus = false) => (
    <div>
      <label htmlFor={`master-${field}`} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <div className="relative">
        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        <input
          id={`master-${field}`}
          type="password"
          value={passwords[field]}
          onChange={(e) => setField(field, e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder={label}
          autoFocus={autoFocus}
          disabled={loading || success !== null}
        />
      </div>
    </div>
  )

  const title = mode === 'remove'
    ? t('masterPassword.removeTitle')
    : mode === 'enable'
      ? t('masterPassword.enableTitle')
      : t('masterPassword.title')

  const submitLabel = mode === 'remove'
    ? (loading ? t('masterPassword.removing') : t('masterPassword.remove'))
    : mode === 'enable'
      ? (loading ? t('masterPassword.changing') : t('masterPassword.enable'))
      : (loading ? t('masterPassword.changing') : t('masterPassword.change'))

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-6 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            {mode === 'remove' ? (
              <ShieldOff size={20} className="mr-2 text-red-600" />
            ) : mode === 'enable' ? (
              <KeyRound size={20} className="mr-2 text-blue-600" />
            ) : (
              <Key size={20} className="mr-2 text-blue-600" />
            )}
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          {success ? (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="text-green-600 mt-0.5" size={20} />
                  <div>
                    <h3 className="font-medium text-green-900 mb-1">{success.title}</h3>
                    <p className="text-sm text-green-700">{success.note}</p>
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                {t('common.close')}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'remove' ? (
                <>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <ShieldAlert className="text-red-600 mt-0.5" size={20} />
                      <div>
                        <p className="text-sm text-red-700">
                          {t('masterPassword.removeWarning')}
                        </p>
                      </div>
                    </div>
                  </div>
                  {renderField('current', t('masterPassword.currentPassword'), true)}
                  <button
                    type="button"
                    onClick={() => switchMode('change')}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    {t('masterPassword.change')}
                  </button>
                </>
              ) : (
                <>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-700">
                      {mode === 'enable'
                        ? t('masterPassword.enableDescription')
                        : t('masterPassword.description')}
                    </p>
                  </div>

                  {mode === 'change' && renderField('current', t('masterPassword.currentPassword'), true)}
                  {renderField('new', t('masterPassword.newPassword'), mode === 'enable')}
                  {renderField('confirm', t('masterPassword.confirmNewPassword'))}

                  {mode === 'change' && (
                    <button
                      type="button"
                      onClick={() => switchMode('remove')}
                      className="block text-sm text-red-600 hover:underline"
                    >
                      {t('masterPassword.remove')}
                    </button>
                  )}

                  <div className="flex items-start space-x-2">
                    <ShieldAlert size={14} className="text-amber-600 mt-0.5" />
                    <p className="text-xs text-gray-600">
                      {t('masterPassword.warning')}
                    </p>
                  </div>
                </>
              )}

              {error && (
                <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg text-sm flex items-start space-x-2">
                  <AlertCircle size={16} className="mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="flex-1 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`flex-1 px-4 py-2 disabled:opacity-60 text-white rounded-lg transition-colors ${
                    mode === 'remove'
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {submitLabel}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
