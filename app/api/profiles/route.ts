import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getAllProfilesWithStats, createProfile, searchProfilesWithStats, getFollowingProfilesWithStats, searchFollowingProfilesWithStats, filterFollowingProfilesByInterestWithStats, filterProfilesByInterestWithStats } from '../../../lib/profiles'
import { uploadImageToS3 } from '../../../lib/aws'
import { ApiResponse, PaginatedResponse, Profile } from '../../../types'

// GET /api/profiles - Get all profiles for the feed
export async function GET(request: NextRequest) {
  try {
    const { userId: currentUserId } = await auth()
    const { searchParams } = new URL(request.url)
    
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search')
    const interest = searchParams.get('interest')
    const followingOnly = searchParams.get('following_only') === 'true'

    let result: PaginatedResponse<Profile>

    if (followingOnly) {
      // Filter to show only profiles the current user follows
      if (!currentUserId) {
        return NextResponse.json<ApiResponse<PaginatedResponse<Profile>>>({
          data: {
            data: [],
            page,
            limit,
            total: 0,
            hasMore: false
          }
        })
      }

      if (search) {
        result = await searchFollowingProfilesWithStats(currentUserId, search, page, limit)
      } else if (interest) {
        result = await filterFollowingProfilesByInterestWithStats(currentUserId, interest, page, limit)
      } else {
        result = await getFollowingProfilesWithStats(currentUserId, page, limit)
      }
    } else {
      // Regular all profiles feed
      if (search) {
        result = await searchProfilesWithStats(search, page, limit, currentUserId || undefined)
      } else if (interest) {
        result = await filterProfilesByInterestWithStats(interest, page, limit, currentUserId || undefined)
      } else {
        result = await getAllProfilesWithStats(page, limit, currentUserId || undefined)
      }
    }

    return NextResponse.json<ApiResponse<PaginatedResponse<Profile>>>({
      data: result
    })
  } catch (error) {
    console.error('Error fetching profiles:', error)
    return NextResponse.json<ApiResponse<null>>(
      { error: 'Failed to fetch profiles' },
      { status: 500 }
    )
  }
}

// POST /api/profiles - Create a new profile
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json<ApiResponse<null>>(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const name = formData.get('name') as string
    const bio = formData.get('bio') as string
    const headline = formData.get('headline') as string
    const interestsString = formData.get('interests') as string
    const avatar = formData.get('avatar') as File | null

    if (!name || !bio || !headline) {
      return NextResponse.json<ApiResponse<null>>(
        { error: 'Name, bio, and headline are required' },
        { status: 400 }
      )
    }

    const interests = interestsString ? JSON.parse(interestsString) : []

    // Create the profile first
    const profile = await createProfile(userId, {
      name,
      bio,
      headline,
      interests
    })

    // Upload avatar if provided
    if (avatar && avatar.size > 0) {
      try {
        const avatarUrl = await uploadImageToS3(avatar, userId)
        const { updateProfileAvatar } = await import('../../../lib/profiles')
        const updatedProfile = await updateProfileAvatar(userId, avatarUrl)
        
        return NextResponse.json<ApiResponse<Profile>>({
          data: updatedProfile,
          message: 'Profile created successfully'
        })
      } catch (uploadError) {
        console.error('Error uploading avatar:', uploadError)
        // Return profile without avatar if upload fails
        return NextResponse.json<ApiResponse<Profile>>({
          data: profile,
          message: 'Profile created successfully, but avatar upload failed'
        })
      }
    }

    return NextResponse.json<ApiResponse<Profile>>({
      data: profile,
      message: 'Profile created successfully'
    })
  } catch (error) {
    console.error('Error creating profile:', error)
    return NextResponse.json<ApiResponse<null>>(
      { error: 'Failed to create profile' },
      { status: 500 }
    )
  }
} 