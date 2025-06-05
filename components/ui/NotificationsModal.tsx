'use client'

import { useState, useEffect } from 'react'
import { X, Heart, UserPlus, User } from 'lucide-react'
import { Button } from './Button'
import { Avatar } from './Avatar'

interface Notification {
  id: string
  type: 'follow' | 'like'
  actor_user_id: string
  actor_name: string
  actor_avatar_url?: string
  profile_id?: string
  profile_name?: string
  read: boolean
  created_at: string
}

interface NotificationsModalProps {
  isOpen: boolean
  onClose: () => void
  onNotificationCountChange?: (count: number) => void
}

const NotificationsModal = ({ isOpen, onClose, onNotificationCountChange }: NotificationsModalProps) => {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      fetchNotifications()
    }
  }, [isOpen])

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/notifications')
      
      if (response.ok) {
        const data = await response.json()
        setNotifications(data.data || [])
        
        // Count unread notifications
        const unreadCount = (data.data || []).filter((n: Notification) => !n.read).length
        onNotificationCountChange?.(unreadCount)
        
        // Mark all as read after viewing
        if (data.data && data.data.length > 0) {
          markAllAsRead()
        }
      } else if (response.status === 500) {
        // If notifications table doesn't exist yet, show empty state
        console.log('Notifications table not ready yet')
        setNotifications([])
        onNotificationCountChange?.(0)
      } else {
        throw new Error('Failed to fetch notifications')
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
      setNotifications([])
      onNotificationCountChange?.(0)
      setError('Notifications not available yet')
    } finally {
      setLoading(false)
    }
  }

  const markAllAsRead = async () => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          markAllAsRead: true
        })
      })

      if (response.ok) {
        // Update local state to mark all as read
        setNotifications(prev => prev.map(n => ({ ...n, read: true })))
        onNotificationCountChange?.(0)
      }
    } catch (error) {
      console.error('Error marking notifications as read:', error)
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return 'Just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`
    return date.toLocaleDateString()
  }

  const getNotificationText = (notification: Notification) => {
    switch (notification.type) {
      case 'follow':
        return `${notification.actor_name} started following you`
      case 'like':
        return `${notification.actor_name} liked your profile${notification.profile_name ? ` "${notification.profile_name}"` : ''}`
      default:
        return 'New notification'
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'follow':
        return <UserPlus className="h-4 w-4 text-blue-500" />
      case 'like':
        return <Heart className="h-4 w-4 text-red-500 fill-current" />
      default:
        return <User className="h-4 w-4 text-gray-500" />
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm pb-20">
      <div className="w-full max-w-md bg-white rounded-t-3xl max-h-[75vh] overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
            aria-label="Close notifications"
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
                <p className="text-gray-600">Loading notifications...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="text-4xl mb-4">😕</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {error}
                </h3>
                <Button 
                  variant="outline"
                  onClick={fetchNotifications}
                >
                  Try Again
                </Button>
              </div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="text-4xl mb-4">🔔</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No notifications yet
                </h3>
                <p className="text-gray-600">
                  When people follow you or like your profile, you&apos;ll see it here!
                </p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 transition-colors duration-200 hover:bg-gray-50 ${
                    !notification.read ? 'bg-blue-50/50' : ''
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    {/* Avatar */}
                    <Avatar
                      src={notification.actor_avatar_url}
                      name={notification.actor_name}
                      size="sm"
                    />
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm text-gray-900 leading-relaxed">
                            {getNotificationText(notification)}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {formatTimeAgo(notification.created_at)}
                          </p>
                        </div>
                        
                        {/* Notification Icon */}
                        <div className="flex-shrink-0 ml-2">
                          {getNotificationIcon(notification.type)}
                        </div>
                      </div>
                      
                      {/* Unread indicator */}
                      {!notification.read && (
                        <div className="flex items-center mt-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                          <span className="text-xs text-blue-600 font-medium">New</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export { NotificationsModal } 