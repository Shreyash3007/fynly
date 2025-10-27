/**
 * Mobile Optimized Layout Components
 * Responsive design components for mobile devices
 */

'use client'

import { useState, useEffect } from 'react'
import { Menu, X, Search, Bell, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAuth } from '@/hooks/useAuth'

interface MobileHeaderProps {
  title: string
  onMenuClick?: () => void
  onSearchClick?: () => void
  onNotificationClick?: () => void
  showSearch?: boolean
  showNotifications?: boolean
}

export function MobileHeader({
  title,
  onMenuClick,
  onSearchClick,
  onNotificationClick,
  showSearch = true,
  showNotifications = true
}: MobileHeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 px-4 py-3 md:hidden">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onMenuClick}
            className="p-2"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold text-gray-900 truncate">{title}</h1>
        </div>
        
        <div className="flex items-center space-x-2">
          {showSearch && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onSearchClick}
              className="p-2"
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </Button>
          )}
          {showNotifications && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onNotificationClick}
              className="p-2 relative"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}

interface MobileSidebarProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
}

export function MobileSidebar({ isOpen, onClose, children }: MobileSidebarProps) {
  const { user, signOut } = useAuth()

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div
        className={cn(
          'fixed top-0 left-0 h-full w-80 bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-50 md:hidden',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="p-2"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {children}
          </div>
          
          {/* Footer */}
          {user && (
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center space-x-3 mb-3">
                <div className="h-8 w-8 bg-gray-300 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-gray-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user.full_name || user.email}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={signOut}
                className="w-full"
              >
                Sign Out
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

interface MobileCardProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
}

export function MobileCard({ children, className, onClick }: MobileCardProps) {
  return (
    <div
      className={cn(
        'bg-white rounded-lg border border-gray-200 p-4 shadow-sm',
        'active:scale-95 transition-transform duration-150',
        onClick && 'cursor-pointer hover:shadow-md',
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  )
}

interface MobileSearchProps {
  placeholder?: string
  onSearch: (query: string) => void
  className?: string
}

export function MobileSearch({ 
  placeholder = "Search...", 
  onSearch, 
  className 
}: MobileSearchProps) {
  const [query, setQuery] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(query)
  }

  return (
    <form onSubmit={handleSubmit} className={cn('w-full', className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10 pr-4 py-2 w-full"
        />
      </div>
    </form>
  )
}

interface MobileBottomNavProps {
  activeTab: string
  onTabChange: (tab: string) => void
  tabs: Array<{
    id: string
    label: string
    icon: React.ComponentType<{ className?: string }>
    href?: string
  }>
}

export function MobileBottomNav({ activeTab, onTabChange, tabs }: MobileBottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 md:hidden">
      <div className="flex justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                'flex flex-col items-center py-2 px-3 rounded-lg transition-colors',
                isActive
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-500 hover:text-gray-700'
              )}
            >
              <Icon className={cn('h-5 w-5', isActive ? 'text-blue-600' : 'text-gray-500')} />
              <span className="text-xs mt-1 font-medium">{tab.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}

// Hook for mobile detection
export function useMobile() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return isMobile
}