'use client'

import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { ProfileForm } from '../../components/forms/ProfileForm'

export default function CreateProfilePage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    if (!isLoaded) return

    if (!user) {
      router.push('/sign-in')
      return
    }

    // Check if user already has a profile
    checkExistingProfile()
  }, [isLoaded, user, router])

  const checkExistingProfile = async () => {
    if (!user) return

    try {
      const response = await fetch(`/api/profiles/${user.id}`)
      
      if (response.ok) {
        // Profile already exists, redirect to dashboard
        router.push('/dashboard')
        return
      }
    } catch (error) {
      console.error('Error checking existing profile:', error)
    } finally {
      setChecking(false)
    }
  }

  if (!isLoaded || checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-[#ebf9ff] to-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect to sign-in
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-[#ebf9ff] to-white py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Welcome Message */}
        <div className="text-center mb-8">
          <div className="mb-4">
            <span className="text-4xl">🎉</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to Sadaora, {user.firstName}!
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Let&apos;s create your profile so the community can get to know you better.
          </p>
        </div>

        {/* Profile Form */}
        <ProfileForm 
          onSuccess={() => {
            // Redirect to dashboard after successful profile creation
            router.push('/dashboard')
          }}
        />
      </div>
    </div>
  )
} 