'use client'

import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { Button } from '../components/ui/Button'

export default function HomePage() {
  const { isSignedIn, isLoaded } = useUser()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (isLoaded) {
      setIsLoading(false)
      if (isSignedIn) {
        router.push('/dashboard')
      }
    }
  }, [isLoaded, isSignedIn, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-[#ebf9ff] to-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1b7296]"></div>
      </div>
    )
  }

  if (isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-[#ebf9ff] to-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1b7296] mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting to dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-[#ebf9ff] to-white">
      <div className="min-h-screen flex flex-col justify-center px-6 py-12">
        {/* Header with Enhanced Gradient Title */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-700 via-blue-500 to-purple-600 bg-clip-text text-transparent drop-shadow-sm">
            Sadaora
          </h1>
          <p className="text-gray-600 text-lg">
            Connect with amazing people
          </p>
        </div>

        {/* Main Card - Enhanced shadows */}
        <div className="mx-4">
          <div 
            className="bg-white/90 backdrop-blur-sm py-8 px-6 border border-white/40 rounded-3xl"
            style={{
              boxShadow: '0 12px 40px rgba(235, 249, 255, 0.75), 0 4px 20px rgba(235, 249, 255, 0.5), 0 2px 8px rgba(0, 0, 0, 0.03)'
            }}
          >
            <div className="space-y-6">
              {/* Welcome Message */}
              <div className="text-center">
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                  Welcome back
                </h2>
                <p className="text-gray-600">
                  Sign in to continue your journey
                </p>
              </div>
              
              {/* Sign In Button */}
              <Button
                onClick={() => router.push('/sign-in')}
                className="w-full text-white border-0"
                style={{
                  background: 'linear-gradient(to right, #1b7296, #2563eb)',
                  boxShadow: '0 6px 20px rgba(235, 249, 255, 0.875), 0 2px 8px rgba(27, 114, 150, 0.2)'
                }}
                size="lg"
              >
                Sign In
              </Button>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200/60" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white/90 text-gray-500 font-medium">or</span>
                </div>
              </div>

              {/* Sign Up Section */}
              <div className="text-center">
                <p className="text-gray-600 mb-4">
                  New to Sadaora?
                </p>
                <Button
                  variant="outline"
                  onClick={() => router.push('/sign-up')}
                  className="w-full border-2 border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300"
                  style={{
                    boxShadow: '0 4px 12px rgba(235, 249, 255, 0.625), 0 1px 4px rgba(0, 0, 0, 0.03)'
                  }}
                  size="lg"
                >
                  Create Account
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center px-4">
          <p className="text-gray-500">
            Join our community and discover amazing profiles
          </p>
        </div>
      </div>
    </div>
  )
}
