import { motion } from 'framer-motion'

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  color?: 'white' | 'teal' | 'gray'
  className?: string
}

export default function Spinner({ size = 'md', color = 'white', className = '' }: SpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4'
  }

  const colorClasses = {
    white: 'border-white border-t-transparent',
    teal: 'border-teal-500 border-t-transparent', 
    gray: 'border-gray-400 border-t-transparent'
  }

  return (
    <motion.div
      className={`${sizeClasses[size]} ${colorClasses[color]} rounded-full animate-spin ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    />
  )
} 