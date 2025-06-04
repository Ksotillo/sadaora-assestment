export interface Profile {
  id: string
  user_id: string // Clerk user ID
  name: string
  bio: string
  headline: string
  avatar_url?: string
  interests: string[] // Array of interest tags
  created_at: string
  updated_at: string
  // Social stats (will be populated from API)
  follower_count?: number
  following_count?: number
  like_count?: number
  is_following?: boolean // Whether current user follows this profile
  is_liked?: boolean // Whether current user liked this profile
}

export interface Follow {
  id: string
  follower_id: string // Clerk user ID of the follower
  following_id: string // Clerk user ID of the user being followed
  created_at: string
}

export interface Like {
  id: string
  user_id: string // Clerk user ID of the liker
  profile_id: string // Profile ID being liked
  created_at: string
}

export interface SocialStats {
  follower_count: number
  following_count: number
  like_count: number
  is_following: boolean
  is_liked: boolean
}

export interface CreateProfileData {
  name: string
  bio: string
  headline: string
  interests: string[]
  avatar?: File
}

export interface UpdateProfileData {
  name?: string
  bio?: string
  headline?: string
  interests?: string[]
  avatar?: File
}

export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  page: number
  limit: number
  total: number
  hasMore: boolean
} 