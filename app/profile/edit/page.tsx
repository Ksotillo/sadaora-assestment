'use client'

import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { ProfileForm } from '../../../components/forms/ProfileForm'
import { Profile } from '../../../types'

export default function EditProfilePage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isLoaded && user) {
      fetchProfile()
    }
  }, [isLoaded, user])

  const fetchProfile = async () => {
    if (!user) return

    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/profiles/${user.id}`)
      
      if (response.ok) {
        const data = await response.json()
        setProfile(data.data)
      } else if (response.status === 404) {
        // No profile exists, redirect to create
        router.push('/create-profile')
        return
      } else {
        throw new Error('Failed to fetch profile')
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
      setError('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-[#ebf9ff] to-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-[#ebf9ff] to-white">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchProfile}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (!profile) {
    return null // Will redirect to create-profile
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-[#ebf9ff] to-white py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <ProfileForm 
          initialData={profile}
          isEditing={true}
          onSuccess={() => {
            // Redirect to profile page after successful update
            router.push('/profile')
          }}
        />
      </div>
    </div>
  )
} 