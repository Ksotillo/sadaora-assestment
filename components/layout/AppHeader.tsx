'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { Search, Bell } from 'lucide-react'
import { Avatar } from '../ui/Avatar'
import { NotificationsModal } from '../ui/NotificationsModal'
import { cn } from '../../lib/utils'
import { Profile } from '../../types'

interface AppHeaderProps {
  onSearchChange?: (search: string) => void
  searchValue?: string
  showSearch?: boolean
}

const AppHeader = ({ onSearchChange, searchValue = '', showSearch = true }: AppHeaderProps) => {
  const { user, isLoaded } = useUser()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [profileLoading, setProfileLoading] = useState(true)
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const [notificationCount, setNotificationCount] = useState(0)

  useEffect(() => {
    if (isLoaded && user) {
      fetchProfile()
      fetchNotificationCount()
    }
  }, [isLoaded, user])

  const fetchProfile = async () => {
    if (!user) return

    try {
      setProfileLoading(true)
      const response = await fetch(`/api/profiles/${user.id}`)
      
      if (response.ok) {
        const data = await response.json()
        setProfile(data.data)
      } else if (response.status === 404) {
        // No profile exists yet
        setProfile(null)
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
      setProfile(null)
    } finally {
      setProfileLoading(false)
    }
  }

  const fetchNotificationCount = async () => {
    if (!user) return

    try {
      const response = await fetch('/api/notifications?unread_only=true')
      
      if (response.ok) {
        const data = await response.json()
        setNotificationCount(data.data?.length || 0)
      } else {
        // If notifications table doesn't exist yet, just set count to 0
        console.log('Notifications not available yet:', response.status)
        setNotificationCount(0)
      }
    } catch (error) {
      console.error('Error fetching notification count:', error)
      setNotificationCount(0)
    }
  }

  const handleNotificationsClick = () => {
    setIsNotificationsOpen(true)
  }

  const handleNotificationCountChange = (count: number) => {
    setNotificationCount(count)
  }

  // Use profile data if available, otherwise fall back to Clerk user data
  const displayName = profile?.name || user?.fullName || user?.firstName || 'User'
  const avatarUrl = profile?.avatar_url || user?.imageUrl
  const followerCount = profile?.follower_count || 0

  // Format follower count for display
  const formatFollowerCount = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`
    }
    return count.toString()
  }

  return (
    <>
      <div className="bg-transparent">
        {/* Top User Info Section */}
        <div className="flex items-center justify-between px-4 py-4">
          {/* User Info */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => window.location.href = '/profile'}
              className="cursor-pointer transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-full"
              aria-label={`View ${displayName}'s profile`}
              role="button"
              tabIndex={0}
            >
              <Avatar 
                src={avatarUrl}
                name={displayName}
                size="lg"
              />
            </button>
            <div>
              <button
                onClick={() => window.location.href = '/profile'}
                className="cursor-pointer text-left transition-all duration-200 hover:text-blue-600 focus:outline-none focus:text-blue-600"
                aria-label={`View ${displayName}'s profile`}
                role="button"
                tabIndex={0}
              >
                <h1 className="text-lg font-semibold text-gray-900 transition-colors duration-200">
                  {profileLoading ? (
                    <div className="h-5 w-24 bg-gray-200 rounded animate-pulse"></div>
                  ) : (
                    displayName
                  )}
                </h1>
              </button>
              <div className="text-sm text-gray-500">
                {profileLoading ? (
                  <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                ) : (
                  `${formatFollowerCount(followerCount)} Followers`
                )}
              </div>
            </div>
          </div>

          {/* Notification Bell */}
          <button 
            className="cursor-pointer relative p-2 rounded-full hover:bg-white/70 transition-all duration-200 bg-white/30 backdrop-blur-sm hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            style={{
              boxShadow: isSearchFocused 
                ? '0 4px 12px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.06)' 
                : '0 2px 8px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.04)'
            }}
            aria-label={`View notifications${notificationCount > 0 ? ` (${notificationCount} unread)` : ''}`}
            role="button"
            tabIndex={0}
            onClick={handleNotificationsClick}
          >
            <Bell className="h-6 w-6 text-gray-600 transition-colors duration-200" />
            {/* Notification badge */}
            {notificationCount > 0 && (
              <span 
                className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-xs text-white flex items-center justify-center transition-all duration-200 hover:scale-110"
                style={{
                  boxShadow: '0 2px 4px rgba(239, 68, 68, 0.3)'
                }}
                aria-hidden="true"
              >
                {notificationCount > 9 ? '9+' : notificationCount}
              </span>
            )}
          </button>
        </div>

        {/* Search Bar */}
        {showSearch && (
          <div className="px-4 pb-4">
            <div 
              className={cn(
                "flex items-center space-x-3 rounded-2xl bg-white/60 backdrop-blur-sm px-4 py-3 transition-all duration-200 border border-white/40 hover:bg-white/70",
                isSearchFocused ? "bg-white/80 border-white/60 shadow-lg" : ""
              )}
              style={{
                boxShadow: isSearchFocused 
                  ? '0 4px 16px rgba(0, 0, 0, 0.08), 0 2px 6px rgba(0, 0, 0, 0.06)' 
                  : '0 2px 12px rgba(0, 0, 0, 0.06), 0 1px 4px rgba(0, 0, 0, 0.04)'
              }}
            >
              <Search className="h-5 w-5 text-gray-400 transition-colors duration-200" />
              <input
                type="text"
                placeholder="Search..."
                value={searchValue}
                onChange={(e) => onSearchChange?.(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                className="flex-1 bg-transparent text-gray-900 placeholder:text-gray-400 outline-none cursor-text"
                aria-label="Search for profiles"
                role="searchbox"
              />
            </div>
          </div>
        )}
      </div>

      {/* Notifications Modal */}
      <NotificationsModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        onNotificationCountChange={handleNotificationCountChange}
      />
    </>
  )
}

export { AppHeader } 