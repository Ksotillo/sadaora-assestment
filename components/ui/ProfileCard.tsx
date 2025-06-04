interface ProfileCardProps {
  profile: Profile
  showStats?: boolean
  onFollow?: (userId: string, isFollowing: boolean) => void
  isLoading?: boolean
  onInterestClick?: (interest: string) => void
} 