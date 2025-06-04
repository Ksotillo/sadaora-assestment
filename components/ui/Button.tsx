import { ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '../../lib/utils'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  'aria-label'?: string
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, disabled, ...props }, ref) => {
    const baseClasses = 'cursor-pointer inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed active:scale-95'
    
    const variants = {
      primary: 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg active:bg-blue-800',
      secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 hover:shadow-md active:bg-gray-300',
      outline: 'border border-gray-300 bg-white text-gray-900 hover:bg-gray-50 hover:border-gray-400 hover:shadow-md active:bg-gray-100',
      ghost: 'text-gray-900 hover:bg-gray-100 hover:shadow-sm active:bg-gray-200',
      destructive: 'bg-red-600 text-white hover:bg-red-700 hover:shadow-lg active:bg-red-800'
    }
    
    const sizes = {
      sm: 'h-8 px-3 text-sm',
      md: 'h-10 px-4 text-sm',
      lg: 'h-12 px-6 text-base'
    }

    const getShadowStyle = () => {
      switch (variant) {
        case 'primary':
          return { boxShadow: '0 2px 8px rgba(37, 99, 235, 0.15), 0 1px 3px rgba(0, 0, 0, 0.08)' }
        case 'secondary':
          return { boxShadow: '0 1px 6px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.08)' }
        case 'outline':
          return { boxShadow: '0 1px 6px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.08)' }
        case 'destructive':
          return { boxShadow: '0 2px 8px rgba(220, 38, 38, 0.15), 0 1px 3px rgba(0, 0, 0, 0.08)' }
        default:
          return {}
      }
    }

    return (
      <button
        className={cn(
          baseClasses,
          variants[variant],
          sizes[size],
          className
        )}
        style={getShadowStyle()}
        ref={ref}
        disabled={disabled || isLoading}
        aria-disabled={disabled || isLoading}
        role="button"
        tabIndex={disabled ? -1 : 0}
        {...props}
      >
        {isLoading && (
          <svg 
            className="mr-2 h-4 w-4 animate-spin" 
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'

export { Button } 