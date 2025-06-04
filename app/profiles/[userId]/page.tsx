'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { ArrowLeft, ExternalLink, Heart, UserPlus } from 'lucide-react'
import { Avatar } from '../../../components/ui/Avatar'
import { Button } from '../../../components/ui/Button'
import { Profile } from '../../../types'
import { formatDate, generateInterestColor } from '../../../lib/utils'

export default function PublicProfilePage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useUser()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isFollowing, setIsFollowing] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [followerCount, setFollowerCount] = useState(0)
  const [likeCount, setLikeCount] = useState(0)
  const [isFollowLoading, setIsFollowLoading] = useState(false)

  const userId = params.userId as string
  const isCurrentUser = user?.id === userId

  useEffect(() => {
    if (userId) {
      fetchProfile()
    }
  }, [userId])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/profiles/${userId}`)
      
      if (response.ok) {
        const data = await response.json()
        const profileData = data.data
        setProfile(profileData)
        
        // Set social stats
        setIsFollowing(profileData.is_following || false)
        setIsLiked(profileData.is_liked || false)
        setFollowerCount(profileData.follower_count || 0)
        setLikeCount(profileData.like_count || 0)
      } else if (response.status === 404) {
        setError('Profile not found')
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

  const handleFollow = async () => {
    if (isFollowLoading || !profile) return
    
    setIsFollowLoading(true)
    try {
      if (isFollowing) {
        // Unfollow
        const response = await fetch(`/api/follows?following_id=${profile.user_id}`, {
          method: 'DELETE'
        })
        
        if (response.ok) {
          setIsFollowing(false)
          setFollowerCount(prev => Math.max(0, prev - 1))
        } else {
          const error = await response.json()
          console.error('Error unfollowing:', error)
          alert('Failed to unfollow user')
        }
      } else {
        // Follow
        const response = await fetch('/api/follows', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            following_id: profile.user_id
          })
        })
        
        if (response.ok) {
          setIsFollowing(true)
          setFollowerCount(prev => prev + 1)
        } else {
          const error = await response.json()
          console.error('Error following:', error)
          alert('Failed to follow user')
        }
      }
    } catch (error) {
      console.error('Error in follow action:', error)
      alert('Something went wrong')
    } finally {
      setIsFollowLoading(false)
    }
  }

  const handleLike = async () => {
    if (!profile) return
    
    // Instant optimistic update
    const wasLiked = isLiked
    const prevLikeCount = likeCount
    
    // Update UI immediately
    setIsLiked(!isLiked)
    setLikeCount(prev => isLiked ? Math.max(0, prev - 1) : prev + 1)
    
    try {
      if (wasLiked) {
        // Unlike
        const response = await fetch(`/api/likes?profile_id=${profile.id}`, {
          method: 'DELETE'
        })
        
        if (!response.ok) {
          // Revert on error
          setIsLiked(wasLiked)
          setLikeCount(prevLikeCount)
          const error = await response.json()
          console.error('Error unliking:', error)
          alert('Failed to unlike profile')
        }
      } else {
        // Like
        const response = await fetch('/api/likes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            profile_id: profile.id
          })
        })
        
        if (!response.ok) {
          // Revert on error
          setIsLiked(wasLiked)
          setLikeCount(prevLikeCount)
          const error = await response.json()
          console.error('Error liking:', error)
          alert('Failed to like profile')
        }
      }
    } catch (error) {
      // Revert on error
      setIsLiked(wasLiked)
      setLikeCount(prevLikeCount)
      console.error('Error in like action:', error)
      alert('Something went wrong')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-[#ebf9ff] to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-[#ebf9ff] to-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="text-6xl mb-4">😕</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {error || 'Profile not found'}
          </h1>
          <p className="text-gray-600 mb-6">
            This profile doesn&apos;t exist or may have been removed.
          </p>
          <Button onClick={() => router.push('/dashboard')} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-[#ebf9ff] to-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            
            <div className="flex items-center space-x-2">
              {isCurrentUser && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push('/profile/edit')}
                >
                  Edit Profile
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const url = `${window.location.origin}/profiles/${userId}`
                  navigator.clipboard.writeText(url)
                  // You could add a toast notification here
                }}
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Content */}
      <div className="max-w-2xl mx-auto px-4 py-6">
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
                  <h1 className="text-2xl font-bold text-gray-900 mb-1">
                    {profile.name}
                  </h1>
                  <p className="text-lg text-gray-600 mb-2">
                    {profile.headline}
                  </p>
                  <p className="text-sm text-gray-500">
                    Member since {formatDate(profile.created_at)}
                  </p>
                </div>

                {/* Action Buttons */}
                {!isCurrentUser && user && (
                  <div className="flex space-x-2 ml-4">
                    <Button
                      variant={isFollowing ? "secondary" : "primary"}
                      size="sm"
                      className={`${
                        isFollowing 
                          ? 'bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200' 
                          : ''
                      }`}
                      onClick={handleFollow}
                      disabled={isFollowLoading}
                      isLoading={isFollowLoading}
                      aria-label={`${isFollowing ? 'Unfollow' : 'Follow'} ${profile.name}`}
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      {isFollowing ? 'Following' : 'Follow'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`${
                        isLiked 
                          ? 'text-red-500 hover:text-red-600' 
                          : 'text-gray-600 hover:text-red-500'
                      }`}
                      onClick={handleLike}
                      aria-label={`${isLiked ? 'Unlike' : 'Like'} ${profile.name}'s profile`}
                    >
                      <Heart className={`h-4 w-4 mr-1 transition-all duration-200 ${isLiked ? 'fill-current scale-110' : ''}`} />
                      {isLiked ? 'Liked' : 'Like'}
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Social Stats */}
            <div className="mb-6">
              <div className="grid grid-cols-3 gap-4 text-center bg-gray-50 rounded-lg p-4">
                <div>
                  <div className="text-2xl font-bold text-gray-900">{followerCount}</div>
                  <div className="text-sm text-gray-500">Followers</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{profile.following_count || 0}</div>
                  <div className="text-sm text-gray-500">Following</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{likeCount}</div>
                  <div className="text-sm text-gray-500">Likes</div>
                </div>
              </div>
            </div>

            {/* Bio */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">About</h2>
              <p className="text-gray-700 leading-relaxed">
                {profile.bio}
              </p>
            </div>

            {/* Interests */}
            {profile.interests && profile.interests.length > 0 && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">
                  Interests & Passions
                </h2>
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
          </div>
        </div>

        {/* Call to Action for non-users */}
        {!user && (
          <div className="mt-6 text-center">
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Interested in connecting?
              </h3>
              <p className="text-gray-600 mb-4">
                Join Sadaora to connect with {profile.name} and discover more amazing people.
              </p>
              <Button onClick={() => router.push('/dashboard')}>
                Explore Community
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 