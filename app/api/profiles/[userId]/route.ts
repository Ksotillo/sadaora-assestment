import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getProfileWithStats, updateProfile, deleteProfile, updateProfileAvatar, getProfile } from '../../../../lib/profiles'
import { uploadImageToS3, deleteImageFromS3 } from '../../../../lib/aws'
import { ApiResponse, Profile } from '../../../../types'

// GET /api/profiles/[userId] - Get a specific profile
export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId: currentUserId } = await auth()
    
    const profile = await getProfileWithStats(params.userId, currentUserId || undefined)
    
    if (!profile) {
      return NextResponse.json<ApiResponse<null>>(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    return NextResponse.json<ApiResponse<Profile>>({
      data: profile
    })
  } catch (error) {
    console.error('Error fetching profile:', error)
    return NextResponse.json<ApiResponse<null>>(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    )
  }
}

// PUT /api/profiles/[userId] - Update a profile
export async function PUT(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId: currentUserId } = await auth()
    
    if (!currentUserId) {
      return NextResponse.json<ApiResponse<null>>(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Users can only update their own profile
    if (currentUserId !== params.userId) {
      return NextResponse.json<ApiResponse<null>>(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    const formData = await request.formData()
    const name = formData.get('name') as string | null
    const bio = formData.get('bio') as string | null
    const headline = formData.get('headline') as string | null
    const interestsString = formData.get('interests') as string | null
    const avatar = formData.get('avatar') as File | null

    const updateData: Partial<Pick<Profile, 'name' | 'bio' | 'headline' | 'interests'>> = {}
    if (name) updateData.name = name
    if (bio) updateData.bio = bio
    if (headline) updateData.headline = headline
    if (interestsString) updateData.interests = JSON.parse(interestsString)

    // Update basic profile data
    let updatedProfile: Profile
    if (Object.keys(updateData).length > 0) {
      updatedProfile = await updateProfile(params.userId, updateData)
    } else {
      const profile = await getProfile(params.userId)
      if (!profile) {
        return NextResponse.json<ApiResponse<null>>(
          { error: 'Profile not found' },
          { status: 404 }
        )
      }
      updatedProfile = profile
    }

    // Handle avatar upload if provided
    if (avatar && avatar.size > 0) {
      try {
        // Delete old avatar if it exists
        if (updatedProfile.avatar_url) {
          try {
            await deleteImageFromS3(updatedProfile.avatar_url)
          } catch (deleteError) {
            console.warn('Could not delete old avatar:', deleteError)
          }
        }

        // Upload new avatar
        const avatarUrl = await uploadImageToS3(avatar, params.userId)
        updatedProfile = await updateProfileAvatar(params.userId, avatarUrl)
      } catch (uploadError) {
        console.error('Error uploading avatar:', uploadError)
        return NextResponse.json<ApiResponse<Profile>>({
          data: updatedProfile,
          message: 'Profile updated successfully, but avatar upload failed'
        })
      }
    }

    return NextResponse.json<ApiResponse<Profile>>({
      data: updatedProfile,
      message: 'Profile updated successfully'
    })
  } catch (error) {
    console.error('Error updating profile:', error)
    return NextResponse.json<ApiResponse<null>>(
      { error: 'Failed to update profile' },
      { status: 500 }
    )
  }
}

// DELETE /api/profiles/[userId] - Delete a profile
export async function DELETE(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId: currentUserId } = await auth()
    
    if (!currentUserId) {
      return NextResponse.json<ApiResponse<null>>(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Users can only delete their own profile
    if (currentUserId !== params.userId) {
      return NextResponse.json<ApiResponse<null>>(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    // Get profile to check for avatar
    const profile = await getProfile(params.userId)
    if (!profile) {
      return NextResponse.json<ApiResponse<null>>(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    // Delete avatar from S3 if it exists
    if (profile.avatar_url) {
      try {
        await deleteImageFromS3(profile.avatar_url)
      } catch (deleteError) {
        console.warn('Could not delete avatar from S3:', deleteError)
      }
    }

    // Delete the profile
    await deleteProfile(params.userId)

    return NextResponse.json<ApiResponse<null>>({
      message: 'Profile deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting profile:', error)
    return NextResponse.json<ApiResponse<null>>(
      { error: 'Failed to delete profile' },
      { status: 500 }
    )
  }
} 