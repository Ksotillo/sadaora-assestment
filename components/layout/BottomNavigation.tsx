'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { Home, User, Users } from 'lucide-react'
import { cn } from '../../lib/utils'

const BottomNavigation = () => {
  const pathname = usePathname()
  const router = useRouter()
  const { user } = useUser()

  const navItems = [
    {
      name: 'Home',
      icon: Home,
      path: '/dashboard',
      isActive: pathname === '/dashboard',
      ariaLabel: 'Navigate to home dashboard'
    },
    {
      name: 'Following',
      icon: Users,
      path: '/following',
      isActive: pathname === '/following',
      ariaLabel: 'View people you follow'
    },
    {
      name: user?.firstName || 'Profile',
      icon: User,
      path: '/profile',
      isActive: pathname === '/profile' || pathname.startsWith('/profile/'),
      ariaLabel: 'View your profile'
    }
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      <div className="bg-white/90 backdrop-blur-sm border-t border-white/40"
        style={{
          boxShadow: '0 -4px 20px rgba(235, 249, 255, 0.3)'
        }}
      >
        <nav className="max-w-md mx-auto" aria-label="Bottom navigation">
          <div className="flex items-center justify-around py-2 px-4">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.name}
                  onClick={() => router.push(item.path)}
                  className={cn(
                    "cursor-pointer flex items-center justify-center rounded-2xl transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                    item.isActive 
                      ? "bg-[#1b7296] shadow-lg px-4 py-3 hover:bg-[#155a7a]" 
                      : "hover:bg-gray-100/70 p-3 hover:shadow-sm"
                  )}
                  style={item.isActive ? {
                    boxShadow: '0 4px 12px rgba(27, 114, 150, 0.3)'
                  } : {}}
                  aria-label={item.ariaLabel}
                  aria-current={item.isActive ? 'page' : undefined}
                  role="button"
                  tabIndex={0}
                >
                  <Icon 
                    className={cn(
                      "h-5 w-5 transition-colors duration-200",
                      item.isActive ? "text-white" : "text-gray-600"
                    )} 
                    aria-hidden="true"
                  />
                  {item.isActive && (
                    <span 
                      className="text-sm font-medium text-white ml-2 transition-opacity duration-200"
                    >
                      {item.name}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </nav>
      </div>
    </div>
  )
}

export { BottomNavigation } 