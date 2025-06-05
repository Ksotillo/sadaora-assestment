'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { X, Heart, UserPlus, ExternalLink } from 'lucide-react'
import { Avatar } from './Avatar'
import { Button } from './Button'
import { Profile } from '../../types'
import { formatDate, generateInterestColor } from '../../lib/utils'

interface ProfileModalProps {
  isOpen: boolean
  onClose: () => void
  userId: string
}

const ProfileModal = ({ isOpen, onClose, userId }: ProfileModalProps) => {
  const { user } = useUser()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isFollowing, setIsFollowing] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [followerCount, setFollowerCount] = useState(0)
  const [likeCount, setLikeCount] = useState(0)
  const [isFollowLoading, setIsFollowLoading] = useState(false)

  const isCurrentUser = user?.id === userId

  useEffect(() => {
    if (isOpen && userId) {
      fetchProfile()
    }
  }, [isOpen, userId])

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

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm pb-20">
      <div className="w-full max-w-md bg-white rounded-t-3xl max-h-[75vh] overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Profile</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
            aria-label="Close profile"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="overflow-y-auto max-h-[calc(75vh-80px)]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading profile...</p>
              </div>
            </div>
          ) : error || !profile ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="text-4xl mb-4">😕</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {error || 'Profile not found'}
                </h3>
                <p className="text-gray-600">
                  This profile doesn&apos;t exist or may have been removed.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Profile Header */}
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-24 relative">
                <div className="absolute -bottom-8 left-6">
                  <Avatar
                    src={profile.avatar_url}
                    name={profile.name}
                    size="xl"
                    className="border-4 border-white shadow-lg"
                  />
                </div>
              </div>

              {/* Profile Content */}
              <div className="pt-12 pb-6 px-6">
                {/* Basic Info */}
                <div className="mb-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h1 className="text-xl font-bold text-gray-900 mb-1">
                        {profile.name}
                      </h1>
                      <p className="text-gray-600 mb-2">
                        {profile.headline}
                      </p>
                      <p className="text-xs text-gray-500">
                        Member since {formatDate(profile.created_at)}
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-2 ml-4">
                      {isCurrentUser ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.location.href = '/profile/edit'}
                        >
                          Edit
                        </Button>
                      ) : (
                        <>
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
                            <UserPlus className="h-4 w-4 mr-1" />
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
                            <Heart className={`h-4 w-4 transition-all duration-200 ${isLiked ? 'fill-current scale-110' : ''}`} />
                          </Button>
                        </>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(`/profiles/${userId}`, '_blank')}
                        aria-label="Open full profile in new tab"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Social Stats */}
                <div className="mb-6">
                  <div className="grid grid-cols-3 gap-4 text-center bg-gray-50 rounded-lg p-3">
                    <div>
                      <div className="text-lg font-bold text-gray-900">{followerCount}</div>
                      <div className="text-xs text-gray-500">Followers</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-gray-900">{profile.following_count || 0}</div>
                      <div className="text-xs text-gray-500">Following</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-gray-900">{likeCount}</div>
                      <div className="text-xs text-gray-500">Likes</div>
                    </div>
                  </div>
                </div>

                {/* Bio */}
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-2">About</h3>
                  <p className="text-gray-700 leading-relaxed text-sm">
                    {profile.bio}
                  </p>
                </div>

                {/* Interests */}
                {profile.interests && profile.interests.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-900 mb-2">
                      Interests
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {profile.interests.map((interest, index) => (
                        <span
                          key={index}
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${generateInterestColor(interest)}`}
                        >
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export { ProfileModal } 