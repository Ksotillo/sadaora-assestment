import { useState } from 'react'
import { cn, getInitials } from '../../lib/utils'

interface AvatarProps {
  src?: string | null
  alt?: string
  name?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const Avatar = ({ src, alt, name = '', size = 'md', className }: AvatarProps) => {
  const [imageError, setImageError] = useState(false)
  
  const sizes = {
    sm: 'h-8 w-8 text-sm',
    md: 'h-12 w-12 text-base',
    lg: 'h-16 w-16 text-lg',
    xl: 'h-24 w-24 text-2xl'
  }

  const showImage = src && !imageError
  const initials = getInitials(name)

  return (
    <div className={cn(
      'relative inline-flex items-center justify-center rounded-full bg-gray-100 font-medium text-gray-600 overflow-hidden',
      sizes[size],
      className
    )}>
      {showImage ? (
        <img
          src={src}
          alt={alt || name}
          className="h-full w-full object-cover"
          onError={() => setImageError(true)}
        />
      ) : (
        <span className="select-none">
          {initials || '?'}
        </span>
      )}
    </div>
  )
}

export { Avatar } 