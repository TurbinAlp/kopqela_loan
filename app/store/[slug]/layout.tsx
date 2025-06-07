import { ReactNode } from 'react'
import { BusinessProvider } from '../../contexts/BusinessContext'
import { LanguageProvider } from '../../contexts/LanguageContext'
import StoreNavigation from '../../components/store/StoreNavigation'
import StoreFooter from '../../components/store/StoreFooter'
import BusinessNotFound from '../../components/store/BusinessNotFound'
import BusinessLoader from '../../components/store/BusinessLoader'

interface StoreLayoutProps {
  children: ReactNode
}

export default function StoreLayout({ children }: StoreLayoutProps) {
  return (
    <html lang="en">
      <body>
        <LanguageProvider>
          <BusinessProvider>
            <StoreContent>{children}</StoreContent>
          </BusinessProvider>
        </LanguageProvider>
      </body>
    </html>
  )
}

function StoreContent({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <StoreNavigation />
      <main className="flex-1">
        <BusinessLoader>
          <BusinessNotFound>
            {children}
          </BusinessNotFound>
        </BusinessLoader>
      </main>
      <StoreFooter />
    </div>
  )
} 