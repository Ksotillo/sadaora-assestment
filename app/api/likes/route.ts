import { NextRequest, NextResponse } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'
import { supabase } from '../../../lib/supabase'
import { ApiResponse } from '../../../types'

// POST /api/likes - Like a profile
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
    const { profile_id } = body

    if (!profile_id) {
      return NextResponse.json<ApiResponse<null>>(
        { error: 'profile_id is required' },
        { status: 400 }
      )
    }

    // Check if already liked
    const { data: existingLike } = await supabase
      .from('likes')
      .select('id')
      .eq('user_id', currentUserId)
      .eq('profile_id', profile_id)
      .single()

    if (existingLike) {
      return NextResponse.json<ApiResponse<null>>(
        { error: 'Already liked this profile' },
        { status: 400 }
      )
    }

    // Get profile info for notifications
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('user_id, name')
      .eq('id', profile_id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json<ApiResponse<null>>(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    // Don't allow liking your own profile
    if (profile.user_id === currentUserId) {
      return NextResponse.json<ApiResponse<null>>(
        { error: 'Cannot like your own profile' },
        { status: 400 }
      )
    }

    // Create the like
    const { error: likeError } = await supabase
      .from('likes')
      .insert({
        user_id: currentUserId,
        profile_id: profile_id
      })

    if (likeError) {
      console.error('Error creating like:', likeError)
      return NextResponse.json<ApiResponse<null>>(
        { error: 'Failed to like profile' },
        { status: 500 }
      )
    }

    // Get current user's PROFILE DATA from database (not Clerk)
    const { data: likerProfile, error: likerProfileError } = await supabase
      .from('profiles')
      .select('name, avatar_url')
      .eq('user_id', currentUserId)
      .single()

    let likerName: string
    let likerAvatar: string | null

    if (likerProfileError) {
      console.error('Error fetching liker profile:', likerProfileError)
      // If no profile exists, fall back to Clerk data
      const clerk = await clerkClient()
      const currentUser = await clerk.users.getUser(currentUserId)
      
      likerName = currentUser.fullName || currentUser.firstName || 'Someone'
      likerAvatar = currentUser.imageUrl || null
    } else {
      // Use actual profile data from database
      likerName = likerProfile.name
      likerAvatar = likerProfile.avatar_url
    }

    console.log('🔍 Debug Like - Using profile data:')
    console.log('  - Liker name from DB:', likerName)
    console.log('  - Liker avatar from DB:', likerAvatar)
    console.log('  - Profile being liked:', profile_id, profile.name)

    // Create notification
    const { error: notificationError } = await supabase
      .from('notifications')
      .insert({
        user_id: profile.user_id,
        type: 'like',
        actor_user_id: currentUserId,
        actor_name: likerName,
        actor_avatar_url: likerAvatar,
        profile_id: profile_id,
        profile_name: profile.name
      })

    if (notificationError) {
      console.error('Error creating notification:', notificationError)
      // Don't fail the like if notification creation fails
    } else {
      console.log('✅ Debug Like - Notification created successfully!')
      console.log('  - Saved name:', likerName)
      console.log('  - Saved avatar:', likerAvatar)
    }

    return NextResponse.json<ApiResponse<{ success: boolean }>>({
      data: { success: true },
      message: 'Successfully liked profile'
    })
  } catch (error) {
    console.error('Error in like API:', error)
    return NextResponse.json<ApiResponse<null>>(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/likes - Unlike a profile
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
    const profile_id = searchParams.get('profile_id')

    if (!profile_id) {
      return NextResponse.json<ApiResponse<null>>(
        { error: 'profile_id is required' },
        { status: 400 }
      )
    }

    // Delete the like
    const { error: unlikeError } = await supabase
      .from('likes')
      .delete()
      .eq('user_id', currentUserId)
      .eq('profile_id', profile_id)

    if (unlikeError) {
      console.error('Error unliking profile:', unlikeError)
      return NextResponse.json<ApiResponse<null>>(
        { error: 'Failed to unlike profile' },
        { status: 500 }
      )
    }

    // Delete the like notification
    const { error: notificationError } = await supabase
      .from('notifications')
      .delete()
      .eq('actor_user_id', currentUserId)
      .eq('profile_id', profile_id)
      .eq('type', 'like')

    if (notificationError) {
      console.error('Error deleting notification:', notificationError)
      // Don't fail the unlike if notification deletion fails
    }

    return NextResponse.json<ApiResponse<{ success: boolean }>>({
      data: { success: true },
      message: 'Successfully unliked profile'
    })
  } catch (error) {
    console.error('Error in unlike API:', error)
    return NextResponse.json<ApiResponse<null>>(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 