import { useState } from 'react'

interface ToastState {
  message: string
  isVisible: boolean
}

export const useToast = () => {
  const [toast, setToast] = useState<ToastState>({ message: '', isVisible: false })

  const showToast = (message: string) => {
    setToast({ message, isVisible: true })
  }

  const hideToast = () => {
    setToast(prev => ({ ...prev, isVisible: false }))
  }

  return { toast, showToast, hideToast }
}