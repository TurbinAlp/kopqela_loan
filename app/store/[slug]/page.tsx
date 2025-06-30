'use client'

import { useParams } from 'next/navigation'
import { useCustomerBusiness } from '../../hooks/useCustomerBusiness'
import CustomerHero from '../../components/store/CustomerHero'
import FeaturedProducts from '../../components/store/FeaturedProducts'
import CategoriesGrid from '../../components/store/CategoriesGrid'
import AboutBusiness from '../../components/store/AboutBusiness'



export default function CustomerHomepage() {
  const params = useParams()
  const slug = params.slug as string
  const { business, isLoading, error } = useCustomerBusiness(slug)

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    )
  }

  if (error || !business) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Store Not Found</h1>
          <p className="text-gray-600">The store you&apos;re looking for doesn&apos;t exist.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - Primary CTA */}
      <CustomerHero />

      {/* Categories Grid - Product Discovery */}
      <section className="py-16 bg-white">
        <CategoriesGrid />
      </section>

      {/* Featured Products - Social Proof */}
      <section className="py-16 bg-gray-50">
        <FeaturedProducts />
      </section>

      {/* About Business - Trust Building */}
      {business?.businessSetting?.showAboutSection !== false && (
        <section className="py-16 bg-white">
          <AboutBusiness />
        </section>
      )}
      
    </div>
  )
} 