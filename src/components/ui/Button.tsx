import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

interface ButtonProps {
  children: ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'ghost'
  disabled?: boolean
  type?: 'button' | 'submit'
  className?: string
}

export function Button({ children, onClick, variant = 'primary', disabled, type = 'button', className = '' }: ButtonProps) {
  const base = 'w-full rounded-xl px-6 py-3.5 font-semibold font-[var(--font-body)] transition-all duration-200 cursor-pointer select-none inline-block text-center'
  const variants = {
    primary: 'text-[#2a1a06]',
    secondary: 'bg-[var(--input-bg)] text-[var(--text)] border border-[var(--input-border)] hover:border-[var(--accent)]',
    ghost: 'border border-[var(--input-border)] text-[var(--text-soft)] hover:border-[var(--accent)] hover:text-[var(--text)]',
  }
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileHover={{ scale: disabled ? 1 : 1.015 }}
      whileTap={{ scale: disabled ? 1 : 0.985 }}
      className={`${base} ${variants[variant]} ${disabled ? 'opacity-40 cursor-not-allowed' : ''} ${className}`}
      style={
        variant === 'primary'
          ? { background: 'var(--accent-grad)', boxShadow: 'var(--shadow-button)' }
          : undefined
      }
    >
      {children}
    </motion.button>
  )
}
