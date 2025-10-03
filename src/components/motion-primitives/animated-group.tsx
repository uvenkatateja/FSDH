import React from 'react'
import { cn } from '@/lib/utils'

interface AnimatedGroupProps {
  children: React.ReactNode
  className?: string
  variants?: any
}

export const AnimatedGroup: React.FC<AnimatedGroupProps> = ({
  children,
  className,
  variants,
  ...props
}) => {
  return (
    <div 
      className={cn('animate-fade-in-up', className)} 
      {...props}
    >
      {children}
    </div>
  )
}
