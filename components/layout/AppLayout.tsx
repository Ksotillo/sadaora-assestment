'use client'

import { ReactNode } from 'react'
import { AppHeader } from './AppHeader'
import { BottomNavigation } from './BottomNavigation'

interface AppLayoutProps {
  children: ReactNode
  showSearch?: boolean
  onSearchChange?: (search: string) => void
  searchValue?: string
  className?: string
}

const AppLayout = ({ 
  children, 
  showSearch = true, 
  onSearchChange, 
  searchValue = '',
  className = ''
}: AppLayoutProps) => {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-r from-[#ebf9ff] to-white">
      {/* Header */}
      <AppHeader 
        showSearch={showSearch}
        onSearchChange={onSearchChange}
        searchValue={searchValue}
      />

      {/* Main Content */}
      <main className={`flex-1 overflow-auto pb-24 ${className}`}>
        {children}
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  )
}

export { AppLayout } 