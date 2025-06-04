'use client'

import { useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { Heart, UserPlus } from 'lucide-react'
import { Avatar } from '../ui/Avatar'
import { Button } from '../ui/Button'
import { ProfileModal } from '../ui/ProfileModal'
import { Profile } from '../../types'
import { generateInterestColor } from '../../lib/utils'

interface ProfileCardProps {
  profile: Profile
  isCurrentUser?: boolean
  onInterestClick?: (interest: string) => void
}

const ProfileCard = ({ profile, isCurrentUser = false, onInterestClick }: ProfileCardProps) => {
  const { user } = useUser()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isFollowing, setIsFollowing] = useState(profile.is_following || false)
  const [isLiked, setIsLiked] = useState(profile.is_liked || false)
  const [followerCount, setFollowerCount] = useState(profile.follower_count || 0)
  const [likeCount, setLikeCount] = useState(profile.like_count || 0)
  const [isFollowLoading, setIsFollowLoading] = useState(false)

  const handleFollow = async (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent modal from opening
    if (isFollowLoading) return
    
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

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent modal from opening
    
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

  const handleCardClick = () => {
    setIsModalOpen(true)
  }

  // Show current user's own profile card with edit option
  if (isCurrentUser) {
    return (
      <>
        <div 
          className="cursor-pointer bg-white rounded-2xl border border-gray-100 p-6 transition-all duration-200 hover:scale-105 active:scale-95 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          style={{
            boxShadow: '0 2px 12px rgba(0, 0, 0, 0.06), 0 1px 4px rgba(0, 0, 0, 0.04)'
          }}
          onClick={handleCardClick}
          role="button"
          tabIndex={0}
          aria-label={`View ${profile.name}'s profile`}
        >
          {/* Profile Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Avatar 
                src={profile.avatar_url}
                name={profile.name}
                size="md"
              />
              <div>
                <h3 className="font-semibold text-gray-900 text-lg transition-colors duration-200 hover:text-blue-600">
                  {profile.name}
                </h3>
                <p className="text-gray-600 text-sm">{profile.headline}</p>
              </div>
            </div>
          </div>

          {/* Bio */}
          <p className="text-gray-700 mb-4 line-clamp-3 leading-relaxed">
            {profile.bio}
          </p>

          {/* Interests */}
          {profile.interests && profile.interests.length > 0 && (
            <div className="mb-4">
              <div className="flex flex-wrap gap-2">
                {profile.interests.slice(0, 3).map((interest, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation()
                      onInterestClick?.(interest)
                    }}
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium transition-all duration-200 hover:scale-105 ${generateInterestColor(interest)} ${
                      onInterestClick ? 'cursor-pointer hover:opacity-80' : 'cursor-default'
                    }`}
                    disabled={!onInterestClick}
                  >
                    {interest}
                  </button>
                ))}
                {profile.interests.length > 3 && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                    +{profile.interests.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Social Stats */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex space-x-4 text-sm text-gray-600">
              <span>
                <span className="font-medium text-gray-900">{followerCount}</span> Followers
              </span>
              <span>
                <span className="font-medium text-gray-900">{profile.following_count || 0}</span> Following
              </span>
              <span>
                <span className="font-medium text-gray-900">{likeCount}</span> Likes
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-600 font-medium">Your Profile</span>
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                window.location.href = '/profile/edit'
              }}
              className="hover:bg-blue-50 hover:border-blue-300"
            >
              Edit Profile
            </Button>
          </div>
        </div>

        <ProfileModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          userId={profile.user_id}
        />
      </>
    )
  }

  // Regular profile card for other users
  return (
    <>
      <div 
        className="cursor-pointer bg-white rounded-2xl border border-gray-100 p-6 transition-all duration-200 hover:scale-105 active:scale-95 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        style={{
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.06), 0 1px 4px rgba(0, 0, 0, 0.04)'
        }}
        onClick={handleCardClick}
        role="button"
        tabIndex={0}
        aria-label={`View ${profile.name}'s profile`}
      >
        {/* Profile Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Avatar 
              src={profile.avatar_url}
              name={profile.name}
              size="md"
            />
            <div>
              <h3 className="font-semibold text-gray-900 text-lg transition-colors duration-200 hover:text-blue-600">
                {profile.name}
              </h3>
              <p className="text-gray-600 text-sm">{profile.headline}</p>
            </div>
          </div>
        </div>

        {/* Bio */}
        <p className="text-gray-700 mb-4 line-clamp-3 leading-relaxed">
          {profile.bio}
        </p>

        {/* Interests */}
        {profile.interests && profile.interests.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-2">
              {profile.interests.slice(0, 3).map((interest, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation()
                    onInterestClick?.(interest)
                  }}
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium transition-all duration-200 hover:scale-105 ${generateInterestColor(interest)} ${
                    onInterestClick ? 'cursor-pointer hover:opacity-80' : 'cursor-default'
                  }`}
                  disabled={!onInterestClick}
                >
                  {interest}
                </button>
              ))}
              {profile.interests.length > 3 && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                  +{profile.interests.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Social Stats */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex space-x-4 text-sm text-gray-600">
            <span>
              <span className="font-medium text-gray-900">{followerCount}</span> Followers
            </span>
            <span>
              <span className="font-medium text-gray-900">{profile.following_count || 0}</span> Following
            </span>
            <span>
              <span className="font-medium text-gray-900">{likeCount}</span> Likes
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <button
            onClick={handleLike}
            className={`cursor-pointer flex items-center space-x-1 px-3 py-2 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 ${
              isLiked 
                ? 'text-red-500 bg-red-50 hover:bg-red-100' 
                : 'text-gray-600 hover:text-red-500 hover:bg-red-50'
            }`}
            style={{
              boxShadow: isLiked 
                ? '0 2px 8px rgba(239, 68, 68, 0.2)' 
                : '0 1px 3px rgba(0, 0, 0, 0.1)'
            }}
            aria-label={`${isLiked ? 'Unlike' : 'Like'} ${profile.name}'s profile`}
            role="button"
            tabIndex={0}
          >
            <Heart className={`h-4 w-4 transition-all duration-200 ${isLiked ? 'fill-current scale-110' : ''}`} />
            <span className="text-sm font-medium">{isLiked ? 'Liked' : 'Like'}</span>
          </button>

          {user && (
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
          )}
        </div>
      </div>

      <ProfileModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        userId={profile.user_id}
      />
    </>
  )
}

export { ProfileCard } 