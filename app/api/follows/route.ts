import { NextRequest, NextResponse } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'
import { supabase } from '../../../lib/supabase'
import { ApiResponse } from '../../../types'

// POST /api/follows - Follow a user
export async function POST(request: NextRequest) {
  try {
    const { userId: currentUserId } = await auth()
    
    if (!currentUserId) {
      return NextResponse.json<ApiResponse<null>>(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { following_id } = body

    if (!following_id) {
      return NextResponse.json<ApiResponse<null>>(
        { error: 'following_id is required' },
        { status: 400 }
      )
    }

    if (currentUserId === following_id) {
      return NextResponse.json<ApiResponse<null>>(
        { error: 'Cannot follow yourself' },
        { status: 400 }
      )
    }

    // Check if already following
    const { data: existingFollow } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', currentUserId)
      .eq('following_id', following_id)
      .single()

    if (existingFollow) {
      return NextResponse.json<ApiResponse<null>>(
        { error: 'Already following this user' },
        { status: 400 }
      )
    }

    // Create the follow relationship
    const { error: followError } = await supabase
      .from('follows')
      .insert({
        follower_id: currentUserId,
        following_id: following_id
      })

    if (followError) {
      console.error('Error creating follow:', followError)
      return NextResponse.json<ApiResponse<null>>(
        { error: 'Failed to follow user' },
        { status: 500 }
      )
    }

    // Get current user's PROFILE DATA from database (not Clerk)
    const { data: followerProfile, error: profileError } = await supabase
      .from('profiles')
      .select('name, avatar_url')
      .eq('user_id', currentUserId)
      .single()

    let followerName: string
    let followerAvatar: string | null

    if (profileError) {
      console.error('Error fetching follower profile:', profileError)
      // If no profile exists, fall back to Clerk data
      const clerk = await clerkClient()
      const currentUser = await clerk.users.getUser(currentUserId)
      
      followerName = currentUser.fullName || currentUser.firstName || 'Someone'
      followerAvatar = currentUser.imageUrl || null
    } else {
      // Use actual profile data from database
      followerName = followerProfile.name
      followerAvatar = followerProfile.avatar_url
    }

    console.log('🔍 Debug Follow - Using profile data:')
    console.log('  - Follower name from DB:', followerName)
    console.log('  - Follower avatar from DB:', followerAvatar)
    console.log('  - Following user:', following_id)

    // Create notification
    const { error: notificationError } = await supabase
      .from('notifications')
      .insert({
        user_id: following_id,
        type: 'follow',
        actor_user_id: currentUserId,
        actor_name: followerName,
        actor_avatar_url: followerAvatar
      })

    if (notificationError) {
      console.error('Error creating notification:', notificationError)
      // Don't fail the follow if notification creation fails
    } else {
      console.log('✅ Debug Follow - Notification created successfully!')
      console.log('  - Saved name:', followerName)
      console.log('  - Saved avatar:', followerAvatar)
    }

    return NextResponse.json<ApiResponse<{ success: boolean }>>({
      data: { success: true },
      message: 'Successfully followed user'
    })
  } catch (error) {
    console.error('Error in follow API:', error)
    return NextResponse.json<ApiResponse<null>>(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/follows - Unfollow a user
export async function DELETE(request: NextRequest) {
  try {
    const { userId: currentUserId } = await auth()
    
    if (!currentUserId) {
      return NextResponse.json<ApiResponse<null>>(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const following_id = searchParams.get('following_id')

    if (!following_id) {
      return NextResponse.json<ApiResponse<null>>(
        { error: 'following_id is required' },
        { status: 400 }
      )
    }

    // Delete the follow relationship
    const { error: unfollowError } = await supabase
      .from('follows')
      .delete()
      .eq('follower_id', currentUserId)
      .eq('following_id', following_id)

    if (unfollowError) {
      console.error('Error unfollowing user:', unfollowError)
      return NextResponse.json<ApiResponse<null>>(
        { error: 'Failed to unfollow user' },
        { status: 500 }
      )
    }

    // Delete the follow notification
    const { error: notificationError } = await supabase
      .from('notifications')
      .delete()
      .eq('user_id', following_id)
      .eq('actor_user_id', currentUserId)
      .eq('type', 'follow')

    if (notificationError) {
      console.error('Error deleting notification:', notificationError)
      // Don't fail the unfollow if notification deletion fails
    }

    return NextResponse.json<ApiResponse<{ success: boolean }>>({
      data: { success: true },
      message: 'Successfully unfollowed user'
    })
  } catch (error) {
    console.error('Error in unfollow API:', error)
    return NextResponse.json<ApiResponse<null>>(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 