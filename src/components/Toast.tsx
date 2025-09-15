import React, { useState, useEffect } from 'react'
import { CheckCircle } from 'lucide-react'

interface ToastProps {
  message: string
  duration?: number
  onClose: () => void
}

export const Toast: React.FC<ToastProps> = ({ message, duration = 2000, onClose }) => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // 立即显示
    setIsVisible(true)
    
    // 设置自动关闭
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(onClose, 300) // 等待动画完成后关闭
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  return (
    <div className={`fixed top-4 right-4 z-50 transform transition-all duration-300 ${
      isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
    }`}>
      <div className="bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2">
        <CheckCircle size={16} />
        <span className="text-sm">{message}</span>
      </div>
    </div>
  )
}