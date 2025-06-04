'use client'

import { useState, useEffect, useCallback } from 'react'
import { useUser } from '@clerk/nextjs'
import { AppLayout } from '../../components/layout/AppLayout'
import { ProfileCard } from '../../components/feed/ProfileCard'
import { Profile, PaginatedResponse } from '../../types'

const FollowingPage = () => {
  const { user } = useUser()
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchValue, setSearchValue] = useState('')
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)

  const fetchFollowingProfiles = useCallback(async (pageNum: number = 1, search: string = '', append: boolean = false) => {
    try {
      if (pageNum === 1 && !append) {
        setLoading(true)
      } else {
        setLoadingMore(true)
      }
      setError(null)

      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: '10',
        following_only: 'true' // Add parameter to filter only following
      })
      
      if (search.trim()) {
        params.append('search', search.trim())
      }

      const response = await fetch(`/api/profiles?${params}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch following profiles')
      }

      const data: { data: PaginatedResponse<Profile> } = await response.json()
      
      if (append) {
        setProfiles(prev => [...prev, ...data.data.data])
      } else {
        setProfiles(data.data.data)
      }
      
      setHasMore(data.data.hasMore)
      setPage(pageNum)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [])

  // Initial load
  useEffect(() => {
    if (user) {
      fetchFollowingProfiles(1, searchValue)
    }
  }, [fetchFollowingProfiles, searchValue, user])

  // Search handler with debounce
  useEffect(() => {
    if (!user) return
    
    const timer = setTimeout(() => {
      setPage(1)
      fetchFollowingProfiles(1, searchValue)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchValue, fetchFollowingProfiles, user])

  const handleLoadMore = () => {
    if (hasMore && !loadingMore) {
      fetchFollowingProfiles(page + 1, searchValue, true)
    }
  }

  if (!user) {
    return (
      <AppLayout showSearch={true} searchValue={searchValue} onSearchChange={setSearchValue}>
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <p className="text-gray-600">Please sign in to view your following list</p>
            </div>
          </div>
        </div>
      </AppLayout>
    )
  }

  if (loading && profiles.length === 0) {
    return (
      <AppLayout showSearch={true} searchValue={searchValue} onSearchChange={setSearchValue}>
        <div className="max-w-md mx-auto">
          {/* Loading */}
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1b7296] mx-auto mb-4"></div>
              <p className="text-gray-600">Loading people you follow...</p>
            </div>
          </div>
        </div>
      </AppLayout>
    )
  }

  if (error) {
    return (
      <AppLayout showSearch={true} searchValue={searchValue} onSearchChange={setSearchValue}>
        <div className="max-w-md mx-auto">
          {/* Error */}
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={() => fetchFollowingProfiles(1, searchValue)}
                className="text-[#1b7296] hover:text-blue-700 font-medium"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout showSearch={true} searchValue={searchValue} onSearchChange={setSearchValue}>
      <div className="max-w-md mx-auto">
        {/* Page Header */}
        <div className="px-4 pt-4 pb-2">
          <h2 className="text-xl font-semibold text-gray-900">Following</h2>
          <p className="text-sm text-gray-600">People you follow</p>
        </div>

        {/* Search Results Header */}
        {searchValue && (
          <div className="px-4 mb-4">
            <p className="text-sm text-gray-600">
              {profiles.length > 0 
                ? `Found ${profiles.length} people matching "${searchValue}"`
                : `No followers found for "${searchValue}"`
              }
            </p>
          </div>
        )}

        {/* Following Feed */}
        {profiles.length === 0 ? (
          <div className="text-center py-12 px-4">
            <div className="mb-4">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchValue ? 'No matches found' : 'Not following anyone yet'}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchValue 
                ? 'Try adjusting your search terms'
                : 'Discover and follow people in the Home tab to see them here!'
              }
            </p>
            {!searchValue && (
              <button
                onClick={() => window.location.href = '/dashboard'}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#1b7296] hover:bg-blue-700"
              >
                Discover People
              </button>
            )}
          </div>
        ) : (
          <div className="px-4 space-y-4">
            {profiles.map((profile) => (
              <ProfileCard
                key={profile.id}
                profile={profile}
                isCurrentUser={user?.id === profile.user_id}
              />
            ))}

            {/* Load More Button */}
            {hasMore && (
              <div className="text-center py-6">
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="inline-flex items-center px-6 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  {loadingMore ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                      Loading...
                    </>
                  ) : (
                    'Load More'
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  )
}

export default FollowingPage 