'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { Input } from '../ui/Input'
import { Textarea } from '../ui/Textarea'
import { Button } from '../ui/Button'
import { ImageUpload } from './ImageUpload'
import { InterestsInput } from './InterestsInput'
import { Profile } from '../../types'

interface ProfileFormData {
  name: string
  headline: string
  bio: string
  interests: string[]
  avatar?: File | null
}

interface ProfileFormProps {
  initialData?: Profile | null
  onSuccess?: (profile: Profile) => void
  isEditing?: boolean
}

const ProfileForm = ({ initialData, onSuccess, isEditing = false }: ProfileFormProps) => {
  const { user } = useUser()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [interests, setInterests] = useState<string[]>(initialData?.interests || [])
  const [avatar, setAvatar] = useState<File | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    clearErrors
  } = useForm<ProfileFormData>({
    defaultValues: {
      name: initialData?.name || user?.fullName || '',
      headline: initialData?.headline || '',
      bio: initialData?.bio || '',
      interests: initialData?.interests || []
    }
  })

  const onSubmit = async (data: ProfileFormData) => {
    if (!user) {
      setError('root', { message: 'You must be logged in to create a profile' })
      return
    }

    if (interests.length === 0) {
      setError('root', { message: 'Please add at least one interest' })
      return
    }

    setLoading(true)
    clearErrors()

    try {
      const formData = new FormData()
      formData.append('name', data.name)
      formData.append('headline', data.headline)
      formData.append('bio', data.bio)
      formData.append('interests', JSON.stringify(interests))
      
      if (avatar) {
        formData.append('avatar', avatar)
      }

      const url = isEditing ? `/api/profiles/${user.id}` : '/api/profiles'
      const method = isEditing ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        body: formData
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to save profile')
      }

      // Success! Call onSuccess callback or redirect
      if (onSuccess) {
        onSuccess(result.data)
      } else {
        router.push('/dashboard')
      }

    } catch (error) {
      console.error('Error saving profile:', error)
      setError('root', { 
        message: error instanceof Error ? error.message : 'Failed to save profile'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isEditing ? 'Edit Your Profile' : 'Create Your Profile'}
          </h1>
          <p className="text-gray-600">
            {isEditing 
              ? 'Update your information to keep your profile current'
              : 'Tell the community about yourself and what you\'re passionate about'
            }
          </p>
        </div>

        {/* Profile Image */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile Photo</h2>
          <ImageUpload
            value={avatar}
            onChange={setAvatar}
            currentImageUrl={initialData?.avatar_url}
            disabled={loading}
          />
        </div>

        {/* Basic Information */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
          
          <Input
            label="Full Name"
            placeholder="Enter your full name"
            required
            disabled={loading}
            error={errors.name?.message}
            {...register('name', {
              required: 'Name is required',
              minLength: { value: 2, message: 'Name must be at least 2 characters' },
              maxLength: { value: 50, message: 'Name must be less than 50 characters' }
            })}
          />

          <Input
            label="Professional Headline"
            placeholder="e.g., Software Engineer, Designer, Student"
            required
            disabled={loading}
            error={errors.headline?.message}
            hint="A brief description of your role or expertise"
            {...register('headline', {
              required: 'Headline is required',
              minLength: { value: 5, message: 'Headline must be at least 5 characters' },
              maxLength: { value: 100, message: 'Headline must be less than 100 characters' }
            })}
          />

          <Textarea
            label="Bio"
            placeholder="Tell people about yourself, your background, and what makes you unique..."
            required
            disabled={loading}
            error={errors.bio?.message}
            hint="Share your story, experiences, and what you're passionate about"
            {...register('bio', {
              required: 'Bio is required',
              minLength: { value: 20, message: 'Bio must be at least 20 characters' },
              maxLength: { value: 500, message: 'Bio must be less than 500 characters' }
            })}
          />
        </div>

        {/* Interests */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Interests & Passions</h2>
          <InterestsInput
            value={interests}
            onChange={setInterests}
            disabled={loading}
            maxInterests={10}
          />
        </div>

        {/* Error Message */}
        {errors.root && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600 text-sm">{errors.root.message}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={loading}
            className="sm:w-auto"
          >
            Cancel
          </Button>
          
          <Button
            type="submit"
            isLoading={loading}
            disabled={loading}
            className="sm:flex-1"
          >
            {loading 
              ? (isEditing ? 'Updating...' : 'Creating...') 
              : (isEditing ? 'Update Profile' : 'Create Profile')
            }
          </Button>
        </div>
      </form>
    </div>
  )
}

export { ProfileForm } 