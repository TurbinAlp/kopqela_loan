import { ReactNode } from 'react'
import CustomerStoreNavigation from '../../components/store/CustomerStoreNavigation'
import CustomerStoreFooter from '../../components/store/CustomerStoreFooter'
import ClientOnlyToolbar from '@/app/components/ClientOnlyToolbar'

interface StoreLayoutProps {
  children: ReactNode
}

export default function StoreLayout({ children }: StoreLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <CustomerStoreNavigation />
      <main className="flex-1">
        {children}
      </main>
      <CustomerStoreFooter />
      <ClientOnlyToolbar />
    </div>
  )
} 