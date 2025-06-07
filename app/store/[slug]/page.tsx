'use client'

import { useBusiness } from '../../contexts/BusinessContext'
import CustomerHero from '../../components/store/CustomerHero'
import FeaturedProducts from '../../components/store/FeaturedProducts'
import CategoriesGrid from '../../components/store/CategoriesGrid'
import AboutBusiness from '../../components/store/AboutBusiness'
import QuickActions from '../../components/store/QuickActions'

export default function CustomerHomepage() {
  const { business } = useBusiness()

  if (!business) {
    return null
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <CustomerHero />

      {/* Quick Actions */}
      <QuickActions />

      {/* Featured Products */}
      <FeaturedProducts />

      {/* Categories Grid */}
      <CategoriesGrid />

      {/* About Business */}
      <AboutBusiness />
    </div>
  )
} 