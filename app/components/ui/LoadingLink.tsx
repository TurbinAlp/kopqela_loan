'use client'

import Link from 'next/link'
import { ReactNode, MouseEvent } from 'react'
import { useLoadingBar } from './LoadingBarProvider'

interface LoadingLinkProps {
  href: string
  children: ReactNode
  className?: string
  onClick?: (e: MouseEvent<HTMLAnchorElement>) => void
  [key: string]: any
}

export default function LoadingLink({ href, children, className, onClick, ...props }: LoadingLinkProps) {
  const { startLoading } = useLoadingBar()

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    // Start loading immediately when link is clicked
    startLoading()
    
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
