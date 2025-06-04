'use client'

import { useState, useRef } from 'react'
import { Upload, X, Camera } from 'lucide-react'
import { Avatar } from '../ui/Avatar'
import { Button } from '../ui/Button'
import { cn } from '../../lib/utils'

interface ImageUploadProps {
  value?: File | string | null
  onChange: (file: File | null) => void
  currentImageUrl?: string | null
  disabled?: boolean
  className?: string
}

const ImageUpload = ({ 
  value, 
  onChange, 
  currentImageUrl, 
  disabled = false,
  className 
}: ImageUploadProps) => {
  const [dragOver, setDragOver] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (file: File | null) => {
    if (!file) {
      setPreview(null)
      onChange(null)
      return
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be less than 5MB')
      return
    }

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    onChange(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)

    if (disabled) return

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    if (!disabled) {
      setDragOver(true)
    }
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }

  const openFileDialog = () => {
    if (!disabled) {
      fileInputRef.current?.click()
    }
  }

  const removeImage = () => {
    setPreview(null)
    onChange(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const displayImage = preview || currentImageUrl
  const hasImage = displayImage || value

  return (
    <div className={cn('w-full', className)}>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => handleFileSelect(e.target.files?.[0] || null)}
        className="hidden"
        disabled={disabled}
      />

      {/* Upload Area */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={openFileDialog}
        className={cn(
          'relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed transition-all duration-200 cursor-pointer',
          dragOver
            ? 'border-blue-500 bg-blue-50'
            : hasImage
            ? 'border-gray-200 bg-gray-50'
            : 'border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100',
          disabled && 'cursor-not-allowed opacity-50',
          hasImage ? 'h-32' : 'h-48'
        )}
      >
        {hasImage ? (
          <>
            {/* Image Preview */}
            <div className="relative">
              <Avatar
                src={displayImage}
                size="xl"
                className="border-4 border-white shadow-lg"
              />
              
              {!disabled && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    removeImage()
                  }}
                  className="absolute -top-2 -right-2 rounded-full bg-red-500 p-1 text-white shadow-lg hover:bg-red-600 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {!disabled && (
              <div className="mt-2 text-center">
                <p className="text-sm text-gray-600">Click to change image</p>
              </div>
            )}
          </>
        ) : (
          <>
            {/* Upload Prompt */}
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="rounded-full bg-blue-100 p-4">
                <Camera className="h-8 w-8 text-blue-600" />
              </div>
              
              <div className="text-center">
                <p className="text-lg font-medium text-gray-900">
                  Add a profile photo
                </p>
                <p className="text-sm text-gray-600">
                  Drag & drop or click to upload
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  PNG, JPG up to 5MB
                </p>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={disabled}
                className="pointer-events-none"
              >
                <Upload className="h-4 w-4 mr-2" />
                Choose File
              </Button>
            </div>
          </>
        )}

        {/* Drag overlay */}
        {dragOver && !disabled && (
          <div className="absolute inset-0 rounded-2xl bg-blue-500/20 border-2 border-blue-500 flex items-center justify-center">
            <div className="text-blue-600 font-medium">Drop image here</div>
          </div>
        )}
      </div>
    </div>
  )
}

export { ImageUpload } 