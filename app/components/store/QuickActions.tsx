'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useCustomerBusiness } from '../../hooks/useCustomerBusiness'
import { useLanguage } from '../../contexts/LanguageContext'
import { ShoppingBagIcon, CreditCardIcon, PhoneIcon } from '@heroicons/react/24/outline'

export default function QuickActions() {
  const params = useParams()
  const slug = params.slug as string
  const { business, isLoading } = useCustomerBusiness(slug)
  const { language } = useLanguage()

  if (isLoading || !business) return null

  const translations = {
    en: {
      quickActions: 'Quick Actions',
      browseProducts: 'Browse Products',
      placeOrder: 'Place Order',
      applyCredit: 'Apply for Credit',
      contactUs: 'Contact Us',
      viewLocation: 'View Location'
    },
    sw: {
      quickActions: 'Vitendo vya Haraka',
      browseProducts: 'Angalia Bidhaa',
      placeOrder: 'Agiza',
      applyCredit: 'Omba Mkopo',
      contactUs: 'Wasiliana Nasi',
      viewLocation: 'Ona Mahali'
    }
  }

  const t = translations[language]

  const actions = [
    {
      name: t.browseProducts,
      href: `/store/${business.slug}/products`,
      icon: ShoppingBagIcon,
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      name: t.placeOrder,
      href: `/store/${business.slug}/order`,
      icon: ShoppingBagIcon,
      color: 'bg-green-500 hover:bg-green-600'
    }
  ]

  if (business.businessSetting?.enableCreditSales) {
    actions.push({
      name: t.applyCredit,
      href: `/store/${business.slug}/credit`,
      icon: CreditCardIcon,
      color: 'bg-purple-500 hover:bg-purple-600'
    })
  }

  if (business.businessSetting?.phone) {
    actions.push({
      name: t.contactUs,
      href: `tel:${business.businessSetting.phone}`,
      icon: PhoneIcon,
      color: 'bg-orange-500 hover:bg-orange-600'
    })
  }

  return (
    <div className="bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">{t.quickActions}</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {actions.map((action) => {
            const Icon = action.icon
            return (
              <Link
                key={action.name}
                href={action.href}
                className={`${action.color} text-white p-6 rounded-lg text-center hover:transform hover:scale-105 transition-all shadow-lg`}
              >
                <Icon className="w-8 h-8 mx-auto mb-2" />
                <div className="font-semibold text-sm">{action.name}</div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
} 