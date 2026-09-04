import type { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <div
      className={`bg-[var(--card)] border border-[var(--card-border)] rounded-2xl p-6 md:p-7 ${className}`}
      style={{ boxShadow: 'var(--shadow-card)' }}
    >
      {children}
    </div>
  )
}
