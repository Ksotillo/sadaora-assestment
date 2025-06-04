'use client'

import { useState, KeyboardEvent } from 'react'
import { X, Plus } from 'lucide-react'
import { generateInterestColor } from '../../lib/utils'
import { Button } from '../ui/Button'

interface InterestsInputProps {
  value: string[]
  onChange: (interests: string[]) => void
  label?: string
  placeholder?: string
  maxInterests?: number
  disabled?: boolean
  error?: string
}

const InterestsInput = ({
  value = [],
  onChange,
  label = 'Interests',
  placeholder = 'Add an interest and press Enter',
  maxInterests = 10,
  disabled = false,
  error
}: InterestsInputProps) => {
  const [inputValue, setInputValue] = useState('')

  const addInterest = (interest: string) => {
    const trimmedInterest = interest.trim()
    
    if (!trimmedInterest) return
    if (value.length >= maxInterests) return
    if (value.some(existing => existing.toLowerCase() === trimmedInterest.toLowerCase())) return

    onChange([...value, trimmedInterest])
    setInputValue('')
  }

  const removeInterest = (index: number) => {
    onChange(value.filter((_, i) => i !== index))
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addInterest(inputValue)
    } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      // Remove last interest if backspace on empty input
      removeInterest(value.length - 1)
    }
  }

  const suggestedInterests = [
    'Technology', 'Design', 'Photography', 'Travel', 'Music', 
    'Sports', 'Reading', 'Cooking', 'Art', 'Gaming',
    'Fitness', 'Movies', 'Writing', 'Science', 'Fashion'
  ]

  const availableSuggestions = suggestedInterests.filter(
    suggestion => !value.some(interest => 
      interest.toLowerCase() === suggestion.toLowerCase()
    )
  )

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          <span className="text-gray-500 ml-1">({value.length}/{maxInterests})</span>
        </label>
      )}

      {/* Current Interests */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {value.map((interest, index) => (
            <span
              key={index}
              className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${generateInterestColor(interest)}`}
            >
              {interest}
              {!disabled && (
                <button
                  type="button"
                  onClick={() => removeInterest(index)}
                  className="ml-1 hover:bg-black/10 rounded-full p-0.5 transition-colors"
                  aria-label={`Remove ${interest}`}
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </span>
          ))}
        </div>
      )}

      {/* Input Field */}
      {!disabled && value.length < maxInterests && (
        <div className="relative">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          
          {inputValue.trim() && (
            <Button
              type="button"
              size="sm"
              onClick={() => addInterest(inputValue)}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 px-2"
            >
              <Plus className="h-3 w-3" />
            </Button>
          )}
        </div>
      )}

      {/* Suggested Interests */}
      {!disabled && value.length < maxInterests && availableSuggestions.length > 0 && (
        <div className="mt-3">
          <p className="text-sm text-gray-600 mb-2">Suggested interests:</p>
          <div className="flex flex-wrap gap-2">
            {availableSuggestions.slice(0, 8).map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => addInterest(suggestion)}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
              >
                <Plus className="h-3 w-3 mr-1" />
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}

      {/* Help Text */}
      {!error && (
        <p className="mt-2 text-sm text-gray-500">
          Add interests that describe you. Press Enter to add each one.
        </p>
      )}
    </div>
  )
}

export { InterestsInput } 