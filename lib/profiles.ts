import { supabase } from './supabase'
import { Profile, CreateProfileData, UpdateProfileData, PaginatedResponse } from '../types'

export const createProfile = async (
  userId: string,
  data: CreateProfileData
): Promise<Profile> => {
  const { data: profile, error } = await supabase
    .from('profiles')
    .insert({
      user_id: userId,
      name: data.name,
      bio: data.bio,
      headline: data.headline,
      interests: data.interests,
      avatar_url: null // Will be updated separately if avatar is provided
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating profile:', error)
    throw new Error('Failed to create profile')
  }

  return profile
}

export const getProfile = async (userId: string): Promise<Profile | null> => {
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      // No profile found
      return null
    }
    console.error('Error fetching profile:', error)
    throw new Error('Failed to fetch profile')
  }

  return profile
}

export const getProfileWithStats = async (
  userId: string,
  currentUserId?: string
): Promise<Profile | null> => {
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    console.error('Error fetching profile:', error)
    throw new Error('Failed to fetch profile')
  }

  if (!profile) return null

  // Get social stats
  const stats = await getProfileStats(profile.id, currentUserId)
  
  return {
    ...profile,
    ...stats
  }
}

export const getProfileStats = async (
  profileId: string,
  currentUserId?: string
) => {
  // Get the profile's user_id first
  const { data: profileUser } = await supabase
    .from('profiles')
    .select('user_id')
    .eq('id', profileId)
    .single()

  if (!profileUser) {
    return {
      follower_count: 0,
      following_count: 0,
      like_count: 0,
      is_following: false,
      is_liked: false
    }
  }

  const profileUserId = profileUser.user_id

  // Get follower count for this profile's user
  const { count: followerCount } = await supabase
    .from('follows')
    .select('*', { count: 'exact', head: true })
    .eq('following_id', profileUserId)

  // Get following count for this profile's user  
  const { count: followingCount } = await supabase
    .from('follows')
    .select('*', { count: 'exact', head: true })
    .eq('follower_id', profileUserId)

  // Get like count for this profile
  const { count: likeCount } = await supabase
    .from('likes')
    .select('*', { count: 'exact', head: true })
    .eq('profile_id', profileId)

  let isFollowing = false
  let isLiked = false

  if (currentUserId) {
    // Check if current user follows this profile's user
    const { data: followCheck } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', currentUserId)
      .eq('following_id', profileUserId)
      .single()

    isFollowing = !!followCheck

    // Check if current user liked this profile
    const { data: likeCheck } = await supabase
      .from('likes')
      .select('id')
      .eq('user_id', currentUserId)
      .eq('profile_id', profileId)
      .single()

    isLiked = !!likeCheck
  }

  return {
    follower_count: followerCount || 0,
    following_count: followingCount || 0,
    like_count: likeCount || 0,
    is_following: isFollowing,
    is_liked: isLiked
  }
}

export const updateProfile = async (
  userId: string,
  data: UpdateProfileData
): Promise<Profile> => {
  const updateData: Partial<Pick<Profile, 'name' | 'bio' | 'headline' | 'interests'>> = {}
  
  if (data.name !== undefined) updateData.name = data.name
  if (data.bio !== undefined) updateData.bio = data.bio
  if (data.headline !== undefined) updateData.headline = data.headline
  if (data.interests !== undefined) updateData.interests = data.interests

  const { data: profile, error } = await supabase
    .from('profiles')
    .update(updateData)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) {
    console.error('Error updating profile:', error)
    throw new Error('Failed to update profile')
  }

  return profile
}

export const updateProfileAvatar = async (
  userId: string,
  avatarUrl: string
): Promise<Profile> => {
  const { data: profile, error } = await supabase
    .from('profiles')
    .update({ avatar_url: avatarUrl })
    .eq('user_id', userId)
    .select()
    .single()

  if (error) {
    console.error('Error updating profile avatar:', error)
    throw new Error('Failed to update profile avatar')
  }

  return profile
}

export const deleteProfile = async (userId: string): Promise<void> => {
  const { error } = await supabase
    .from('profiles')
    .delete()
    .eq('user_id', userId)

  if (error) {
    console.error('Error deleting profile:', error)
    throw new Error('Failed to delete profile')
  }
}

export const getAllProfiles = async (
  page: number = 1,
  limit: number = 10
): Promise<PaginatedResponse<Profile>> => {
  const query = supabase
    .from('profiles')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })

  // Note: We include all profiles in the feed, including the current user's profile
  // This allows users to see their own profile in the community feed

  const from = (page - 1) * limit
  const to = from + limit - 1

  const { data: profiles, error, count } = await query
    .range(from, to)

  if (error) {
    console.error('Error fetching profiles:', error)
    throw new Error('Failed to fetch profiles')
  }

  const total = count || 0
  const hasMore = to < total - 1

  return {
    data: profiles || [],
    page,
    limit,
    total,
    hasMore
  }
}

export const getAllProfilesWithStats = async (
  page: number = 1,
  limit: number = 10,
  currentUserId?: string
): Promise<PaginatedResponse<Profile>> => {
  const query = supabase
    .from('profiles')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })

  const from = (page - 1) * limit
  const to = from + limit - 1

  const { data: profiles, error, count } = await query
    .range(from, to)

  if (error) {
    console.error('Error fetching profiles:', error)
    throw new Error('Failed to fetch profiles')
  }

  // Add social stats to each profile
  const profilesWithStats = await Promise.all(
    (profiles || []).map(async (profile) => {
      const stats = await getProfileStats(profile.id, currentUserId)
      return {
        ...profile,
        ...stats
      }
    })
  )

  const total = count || 0
  const hasMore = to < total - 1

  return {
    data: profilesWithStats,
    page,
    limit,
    total,
    hasMore
  }
}

export const searchProfiles = async (
  searchTerm: string,
  page: number = 1,
  limit: number = 10
): Promise<PaginatedResponse<Profile>> => {
  const query = supabase
    .from('profiles')
    .select('*', { count: 'exact' })
    .or(`name.ilike.%${searchTerm}%,bio.ilike.%${searchTerm}%,headline.ilike.%${searchTerm}%`)
    .order('created_at', { ascending: false })

  // Note: We include all profiles in search results, including the current user's profile
  // This allows users to find their own profile when searching

  const from = (page - 1) * limit
  const to = from + limit - 1

  const { data: profiles, error, count } = await query
    .range(from, to)

  if (error) {
    console.error('Error searching profiles:', error)
    throw new Error('Failed to search profiles')
  }

  const total = count || 0
  const hasMore = to < total - 1

  return {
    data: profiles || [],
    page,
    limit,
    total,
    hasMore
  }
}

export const searchProfilesWithStats = async (
  searchTerm: string,
  page: number = 1,
  limit: number = 10,
  currentUserId?: string
): Promise<PaginatedResponse<Profile>> => {
  const query = supabase
    .from('profiles')
    .select('*', { count: 'exact' })
    .or(`name.ilike.%${searchTerm}%,bio.ilike.%${searchTerm}%,headline.ilike.%${searchTerm}%`)
    .order('created_at', { ascending: false })

  const from = (page - 1) * limit
  const to = from + limit - 1

  const { data: profiles, error, count } = await query
    .range(from, to)

  if (error) {
    console.error('Error searching profiles:', error)
    throw new Error('Failed to search profiles')
  }

  // Add social stats to each profile
  const profilesWithStats = await Promise.all(
    (profiles || []).map(async (profile) => {
      const stats = await getProfileStats(profile.id, currentUserId)
      return {
        ...profile,
        ...stats
      }
    })
  )

  const total = count || 0
  const hasMore = to < total - 1

  return {
    data: profilesWithStats,
    page,
    limit,
    total,
    hasMore
  }
}

export const getFollowingProfilesWithStats = async (
  currentUserId: string,
  page: number = 1,
  limit: number = 10
): Promise<PaginatedResponse<Profile>> => {
  // First get the user IDs that the current user follows
  const { data: followingData, error: followingError } = await supabase
    .from('follows')
    .select('following_id')
    .eq('follower_id', currentUserId)

  if (followingError) {
    console.error('Error fetching following data:', followingError)
    throw new Error('Failed to fetch following data')
  }

  const followingIds = followingData?.map(follow => follow.following_id) || []

  if (followingIds.length === 0) {
    return {
      data: [],
      page,
      limit,
      total: 0,
      hasMore: false
    }
  }

  // Get profiles of users that the current user follows
  const query = supabase
    .from('profiles')
    .select('*', { count: 'exact' })
    .in('user_id', followingIds)
    .order('created_at', { ascending: false })

  const from = (page - 1) * limit
  const to = from + limit - 1

  const { data: profiles, error, count } = await query
    .range(from, to)

  if (error) {
    console.error('Error fetching following profiles:', error)
    throw new Error('Failed to fetch following profiles')
  }

  // Add social stats to each profile
  const profilesWithStats = await Promise.all(
    (profiles || []).map(async (profile) => {
      const stats = await getProfileStats(profile.id, currentUserId)
      return {
        ...profile,
        ...stats
      }
    })
  )

  const total = count || 0
  const hasMore = to < total - 1

  return {
    data: profilesWithStats,
    page,
    limit,
    total,
    hasMore
  }
}

export const searchFollowingProfilesWithStats = async (
  currentUserId: string,
  searchTerm: string,
  page: number = 1,
  limit: number = 10
): Promise<PaginatedResponse<Profile>> => {
  // First get the user IDs that the current user follows
  const { data: followingData, error: followingError } = await supabase
    .from('follows')
    .select('following_id')
    .eq('follower_id', currentUserId)

  if (followingError) {
    console.error('Error fetching following data:', followingError)
    throw new Error('Failed to fetch following data')
  }

  const followingIds = followingData?.map(follow => follow.following_id) || []

  if (followingIds.length === 0) {
    return {
      data: [],
      page,
      limit,
      total: 0,
      hasMore: false
    }
  }

  // Search within profiles of users that the current user follows
  const query = supabase
    .from('profiles')
    .select('*', { count: 'exact' })
    .in('user_id', followingIds)
    .or(`name.ilike.%${searchTerm}%,bio.ilike.%${searchTerm}%,headline.ilike.%${searchTerm}%`)
    .order('created_at', { ascending: false })

  const from = (page - 1) * limit
  const to = from + limit - 1

  const { data: profiles, error, count } = await query
    .range(from, to)

  if (error) {
    console.error('Error searching following profiles:', error)
    throw new Error('Failed to search following profiles')
  }

  // Add social stats to each profile
  const profilesWithStats = await Promise.all(
    (profiles || []).map(async (profile) => {
      const stats = await getProfileStats(profile.id, currentUserId)
      return {
        ...profile,
        ...stats
      }
    })
  )

  const total = count || 0
  const hasMore = to < total - 1

  return {
    data: profilesWithStats,
    page,
    limit,
    total,
    hasMore
  }
}

export const filterProfilesByInterestWithStats = async (
  interest: string,
  page: number = 1,
  limit: number = 10,
  currentUserId?: string
): Promise<PaginatedResponse<Profile>> => {
  // Filter profiles that have the specified interest
  const query = supabase
    .from('profiles')
    .select('*', { count: 'exact' })
    .contains('interests', [interest])
    .order('created_at', { ascending: false })

  const from = (page - 1) * limit
  const to = from + limit - 1

  const { data: profiles, error, count } = await query
    .range(from, to)

  if (error) {
    console.error('Error filtering profiles by interest:', error)
    throw new Error('Failed to filter profiles by interest')
  }

  // Add social stats to each profile
  const profilesWithStats = await Promise.all(
    (profiles || []).map(async (profile) => {
      const stats = await getProfileStats(profile.id, currentUserId)
      return {
        ...profile,
        ...stats
      }
    })
  )

  const total = count || 0
  const hasMore = to < total - 1

  return {
    data: profilesWithStats,
    page,
    limit,
    total,
    hasMore
  }
}

export const filterFollowingProfilesByInterestWithStats = async (
  currentUserId: string,
  interest: string,
  page: number = 1,
  limit: number = 10
): Promise<PaginatedResponse<Profile>> => {
  // First get the user IDs that the current user follows
  const { data: followingData, error: followingError } = await supabase
    .from('follows')
    .select('following_id')
    .eq('follower_id', currentUserId)

  if (followingError) {
    console.error('Error fetching following data:', followingError)
    throw new Error('Failed to fetch following data')
  }

  const followingIds = followingData?.map(follow => follow.following_id) || []

  if (followingIds.length === 0) {
    return {
      data: [],
      page,
      limit,
      total: 0,
      hasMore: false
    }
  }

  // Filter following profiles by interest
  const query = supabase
    .from('profiles')
    .select('*', { count: 'exact' })
    .in('user_id', followingIds)
    .contains('interests', [interest])
    .order('created_at', { ascending: false })

  const from = (page - 1) * limit
  const to = from + limit - 1

  const { data: profiles, error, count } = await query
    .range(from, to)

  if (error) {
    console.error('Error filtering following profiles by interest:', error)
    throw new Error('Failed to filter following profiles by interest')
  }

  // Add social stats to each profile
  const profilesWithStats = await Promise.all(
    (profiles || []).map(async (profile) => {
      const stats = await getProfileStats(profile.id, currentUserId)
      return {
        ...profile,
        ...stats
      }
    })
  )

  const total = count || 0
  const hasMore = to < total - 1

  return {
    data: profilesWithStats,
    page,
    limit,
    total,
    hasMore
  }
} 