import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { supabase } from '../../../lib/supabase'
import { ApiResponse } from '../../../types'

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

// GET /api/notifications - Get notifications for current user
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json<ApiResponse<null>>(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const unreadOnly = searchParams.get('unread_only') === 'true'

    // Build query
    let query = supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50)

    if (unreadOnly) {
      query = query.eq('read', false)
    }

    const { data: notifications, error } = await query

    if (error) {
      console.error('Error fetching notifications:', error)
      return NextResponse.json<ApiResponse<null>>(
        { error: 'Failed to fetch notifications' },
        { status: 500 }
      )
    }

    return NextResponse.json<ApiResponse<Notification[]>>({
      data: notifications || []
    })
  } catch (error) {
    console.error('Error in notifications API:', error)
    return NextResponse.json<ApiResponse<null>>(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/notifications - Mark notifications as read
export async function PUT(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json<ApiResponse<null>>(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { notificationIds, markAllAsRead } = body

    if (markAllAsRead) {
      // Mark all notifications as read for this user
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', userId)
        .eq('read', false)

      if (error) {
        console.error('Error marking all notifications as read:', error)
        return NextResponse.json<ApiResponse<null>>(
          { error: 'Failed to mark notifications as read' },
          { status: 500 }
        )
      }
    } else if (notificationIds && Array.isArray(notificationIds)) {
      // Mark specific notifications as read
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', userId)
        .in('id', notificationIds)

      if (error) {
        console.error('Error marking notifications as read:', error)
        return NextResponse.json<ApiResponse<null>>(
          { error: 'Failed to mark notifications as read' },
          { status: 500 }
        )
      }
    }

    return NextResponse.json<ApiResponse<{ success: boolean }>>({
      data: { success: true }
    })
  } catch (error) {
    console.error('Error updating notifications:', error)
    return NextResponse.json<ApiResponse<null>>(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 