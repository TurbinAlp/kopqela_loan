'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface SidebarContextType {
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  closeSidebar: () => void
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined)

export function useSidebar() {
  const context = useContext(SidebarContext)
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider')
  }
  return context
}

interface SidebarProviderProps {
  children: ReactNode
}

export function SidebarProvider({ children }: SidebarProviderProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const closeSidebar = () => {
    setSidebarOpen(false)
  }

  return (
    <SidebarContext.Provider value={{ sidebarOpen, setSidebarOpen, closeSidebar }}>
      {children}
    </SidebarContext.Provider>
  )
}
