import React from 'react'
import { cn } from '@/lib/utils'

interface TextEffectProps {
  children: React.ReactNode
  className?: string
  as?: React.ElementType
  preset?: string
  speedSegment?: number
  delay?: number
  per?: string
}

export const TextEffect: React.FC<TextEffectProps> = ({
  children,
  className,
  as: Component = 'div',
  preset,
  speedSegment,
  delay,
  per,
  ...props
}) => {
  return (
    <Component 
      className={cn('animate-fade-in-up', className)} 
      style={{
        animationDelay: delay ? `${delay}s` : undefined,
        animationDuration: speedSegment ? `${speedSegment}s` : undefined
      }}
      {...props}
    >
      {children}
    </Component>
  )
}
