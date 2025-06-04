'use client'

import { useEffect, useState } from 'react'
import { useUser, useClerk } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { Settings, Edit, Trash2, ExternalLink, LogOut } from 'lucide-react'
import { AppLayout } from '../../components/layout/AppLayout'
import { Avatar } from '../../components/ui/Avatar'
import { Button } from '../../components/ui/Button'
import { Profile } from '../../types'
import { formatDate, generateInterestColor } from '../../lib/utils'

export default function ProfilePage() {
  const { user, isLoaded } = useUser()
  const { signOut } = useClerk()
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

  const handleDeleteProfile = async () => {
    if (!user || !profile) return

    const confirmDelete = window.confirm(
      'Are you sure you want to delete your profile? This action cannot be undone.'
    )

    if (!confirmDelete) return

    try {
      const response = await fetch(`/api/profiles/${user.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        // Profile deleted successfully
        router.push('/create-profile')
      } else {
        throw new Error('Failed to delete profile')
      }
    } catch (error) {
      console.error('Error deleting profile:', error)
      alert('Failed to delete profile. Please try again.')
    }
  }

  const handleSignOut = async () => {
    const confirmSignOut = window.confirm('Are you sure you want to sign out?')
    
    if (!confirmSignOut) return

    try {
      await signOut()
      router.push('/')
    } catch (error) {
      console.error('Error signing out:', error)
      alert('Failed to sign out. Please try again.')
    }
  }

  if (!isLoaded || loading) {
    return (
      <AppLayout showSearch={false}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your profile...</p>
          </div>
        </div>
      </AppLayout>
    )
  }

  if (error) {
    return (
      <AppLayout showSearch={false}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={fetchProfile} variant="outline">
              Try Again
            </Button>
          </div>
        </div>
      </AppLayout>
    )
  }

  if (!profile) {
    return null // Will redirect to create-profile
  }

  return (
    <AppLayout showSearch={false}>
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Your Profile</h1>
            <p className="text-gray-600">Manage your personal information</p>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/profile/edit')}
          >
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Cover/Header */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-32 relative">
            <div className="absolute -bottom-12 left-6">
              <Avatar
                src={profile.avatar_url}
                name={profile.name}
                size="xl"
                className="border-4 border-white shadow-lg"
              />
            </div>
          </div>

          {/* Content */}
          <div className="pt-16 pb-6 px-6">
            {/* Basic Info */}
            <div className="mb-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">
                    {profile.name}
                  </h2>
                  <p className="text-lg text-gray-600 mb-2">
                    {profile.headline}
                  </p>
                  <p className="text-sm text-gray-500">
                    Member since {formatDate(profile.created_at)}
                  </p>
                </div>

                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push('/profile/edit')}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(`/profiles/${user?.id}`, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Bio */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">About</h3>
              <p className="text-gray-700 leading-relaxed">
                {profile.bio}
              </p>
            </div>

            {/* Interests */}
            {profile.interests && profile.interests.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Interests & Passions
                </h3>
                <div className="flex flex-wrap gap-2">
                  {profile.interests.map((interest, index) => (
                    <span
                      key={index}
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${generateInterestColor(interest)}`}
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Profile Stats */}
            <div className="border-t border-gray-100 pt-6">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-gray-900">0</div>
                  <div className="text-sm text-gray-500">Connections</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">0</div>
                  <div className="text-sm text-gray-500">Profile Views</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {profile.interests?.length || 0}
                  </div>
                  <div className="text-sm text-gray-500">Interests</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 space-y-4">
          <Button
            variant="outline"
            onClick={() => router.push('/profile/edit')}
            className="w-full"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>

          <Button
            variant="destructive"
            onClick={handleDeleteProfile}
            className="w-full"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Profile
          </Button>

          <Button
            variant="outline"
            onClick={handleSignOut}
            className="w-full"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>
    </AppLayout>
  )
} 