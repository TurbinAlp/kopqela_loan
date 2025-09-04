'use client'

import Link from 'next/link'
import { ReactNode, MouseEvent } from 'react'
import { useLoadingBar } from './LoadingBarProvider'

interface LoadingLinkProps {
  href: string
  children: ReactNode
  className?: string
  onClick?: (e: MouseEvent<HTMLAnchorElement>) => void
  closeSidebarOnMobile?: boolean
  [key: string]: any
}

export default function LoadingLink({ 
  href, 
  children, 
  className, 
  onClick, 
  closeSidebarOnMobile = false,
  ...props 
}: LoadingLinkProps) {
  const { startLoading } = useLoadingBar()

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    // Start loading immediately when link is clicked
    startLoading()
    
    // Close sidebar on mobile if specified
    if (closeSidebarOnMobile) {
      // Check if we're on mobile (screen width < 1024px)
      if (window.innerWidth < 1024) {
        // Dispatch custom event to close sidebar
        window.dispatchEvent(new CustomEvent('closeSidebar'))
      }
    }
    
    // Call custom onClick if provided
    if (onClick) {
      onClick(e)
    }
  }

  return (
    <Link href={href} className={className} onClick={handleClick} {...props}>
      {children}
    </Link>
  )
}
