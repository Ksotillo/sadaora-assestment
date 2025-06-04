'use client'

import { useState, useEffect, useCallback } from 'react'
import { useUser } from '@clerk/nextjs'
import { AppLayout } from '../../components/layout/AppLayout'
import { ProfileCard } from '../../components/feed/ProfileCard'
import { Profile } from '../../types'

const DashboardPage = () => {
  const { user } = useUser()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedInterest, setSelectedInterest] = useState<string | null>(null)
  
  // Feed state
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)

  const fetchProfiles = useCallback(async (pageNum: number, searchTerm: string = '', isLoadMore: boolean = false) => {
    if (!isLoadMore) {
      setLoading(true)
      setError(null)
    } else {
      setLoadingMore(true)
    }

    try {
      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: '10'
      })

      if (searchTerm.trim()) {
        params.append('search', searchTerm.trim())
      }

      if (selectedInterest) {
        params.append('interest', selectedInterest)
      }

      const response = await fetch(`/api/profiles?${params}`)
      const data = await response.json()

      if (response.ok) {
        const result = data.data
        if (isLoadMore) {
          setProfiles(prev => [...prev, ...result.data])
        } else {
          setProfiles(result.data)
        }
        setPage(pageNum)
        setHasMore(result.hasMore)
      } else {
        throw new Error(data.error || 'Failed to fetch profiles')
      }
    } catch (error) {
      console.error('Error fetching profiles:', error)
      setError(error instanceof Error ? error.message : 'Failed to load profiles')
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [selectedInterest])

  const handleInterestClick = (interest: string) => {
    setSelectedInterest(interest)
    setPage(1)
    setProfiles([])
  }

  const clearFilters = () => {
    setSelectedInterest(null)
    setSearchQuery('')
    setPage(1)
    setProfiles([])
  }

  // Initial load
  useEffect(() => {
    fetchProfiles(1, searchQuery)
  }, [fetchProfiles, searchQuery])

  // Search handler with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1)
      fetchProfiles(1, searchQuery)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery, fetchProfiles])

  const handleLoadMore = () => {
    if (hasMore && !loadingMore) {
      fetchProfiles(page + 1, searchQuery, true)
    }
  }

  if (loading && profiles.length === 0) {
    return (
      <AppLayout showSearch={true} searchValue={searchQuery} onSearchChange={setSearchQuery}>
        <div className="max-w-md mx-auto">
          {/* Loading */}
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1b7296] mx-auto mb-4"></div>
              <p className="text-gray-600">Loading profiles...</p>
            </div>
          </div>
        </div>
      </AppLayout>
    )
  }

  if (error) {
    return (
      <AppLayout showSearch={true} searchValue={searchQuery} onSearchChange={setSearchQuery}>
        <div className="max-w-md mx-auto">
          {/* Error */}
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={() => fetchProfiles(1, searchQuery)}
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
    <AppLayout showSearch={true} searchValue={searchQuery} onSearchChange={setSearchQuery}>
      <div className="max-w-md mx-auto">
        {/* Active Filters */}
        {(selectedInterest || searchQuery) && (
          <div className="px-4 mb-4 pt-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-blue-700 font-medium">Active Filters:</span>
                <button
                  onClick={clearFilters}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  Clear all
                </button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedInterest && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                    Interest: {selectedInterest}
                    <button
                      onClick={() => setSelectedInterest(null)}
                      className="hover:text-blue-900"
                    >
                      ×
                    </button>
                  </span>
                )}
                {searchQuery && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                    Search: &quot;{searchQuery}&quot;
                    <button
                      onClick={() => setSearchQuery('')}
                      className="hover:text-blue-900"
                    >
                      ×
                    </button>
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Search Results Header */}
        {searchQuery && (
          <div className="px-4 mb-4 pt-4">
            <p className="text-sm text-gray-600">
              {profiles.length > 0 
                ? `Found ${profiles.length} profiles matching "${searchQuery}"`
                : `No profiles found for "${searchQuery}"`
              }
            </p>
          </div>
        )}

        {/* Profiles Feed */}
        {profiles.length === 0 ? (
          <div className="text-center py-12 px-4">
            <div className="mb-4">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No profiles yet</h3>
            <p className="text-gray-600 mb-4">
              {searchQuery 
                ? 'Try adjusting your search terms'
                : 'Be the first to create a profile and connect with others!'
              }
            </p>
            {!searchQuery && (
              <button
                onClick={() => window.location.href = '/create-profile'}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#1b7296] hover:bg-blue-700"
              >
                Create Your Profile
              </button>
            )}
          </div>
        ) : (
          <div className="px-4 space-y-4 pt-4">
            {profiles.map((profile) => (
              <ProfileCard
                key={profile.id}
                profile={profile}
                isCurrentUser={user?.id === profile.user_id}
                onInterestClick={handleInterestClick}
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

export default DashboardPage 