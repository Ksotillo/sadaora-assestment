'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function DiscoverPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to dashboard since discover is essentially the same as home
    router.replace('/dashboard')
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-[#ebf9ff] to-white">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1b7296] mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting...</p>
      </div>
    </div>
  )
} 