'use client'

import { useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'

export default function OnboardingPage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (isLoaded && user) {
      // Check if user already has a profile
      checkUserProfile()
    }
  }, [isLoaded, user])

  const checkUserProfile = async () => {
    if (!user) return

    try {
      const response = await fetch(`/api/profiles/${user.id}`)
      
      if (response.ok) {
        // Profile exists, redirect to dashboard
        router.push('/dashboard')
      } else if (response.status === 404) {
        // No profile, redirect to create profile
        router.push('/create-profile')
      }
    } catch (error) {
      console.error('Error checking profile:', error)
      // Default to create profile page
      router.push('/create-profile')
    }
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Setting up your account...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting...</p>
      </div>
    </div>
  )
} 