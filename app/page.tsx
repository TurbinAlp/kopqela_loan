'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  ShoppingCartIcon,
  CreditCardIcon,
  ChartBarIcon,
  UserGroupIcon,
  CubeIcon,
  ShieldCheckIcon,
  DevicePhoneMobileIcon,
  GlobeAltIcon,
  CheckCircleIcon,
  StarIcon
} from '@heroicons/react/24/outline'

export default function Home() {
  const features = [
    {
      icon: ShoppingCartIcon,
      title: 'Point of Sale (POS)',
      description: 'Fast and intuitive sales processing with real-time inventory tracking'
    },
    {
      icon: CreditCardIcon,
      title: 'Credit Management',
      description: 'Complete credit sales workflow with application processing and tracking'
    },
    {
      icon: ChartBarIcon,
      title: 'Analytics & Reports',
      description: 'Comprehensive business insights with detailed sales and financial reports'
    },
    {
      icon: UserGroupIcon,
      title: 'Customer Management',
      description: 'Track customer history, payments, and build lasting relationships'
    },
    {
      icon: CubeIcon,
      title: 'Inventory Control',
      description: 'Smart inventory management with low stock alerts and reorder points'
    },
    {
      icon: ShieldCheckIcon,
      title: 'Role-Based Access',
      description: 'Secure system with Admin, Manager, and Cashier permission levels'
    }
  ]

  const userTypes = [
    {
      type: 'Admin',
      title: 'Business Owners',
      description: 'Complete system control with full access to all features, reports, and settings',
      features: ['Full System Access', 'User Management', 'Business Settings', 'Advanced Reports'],
      color: 'from-teal-500 to-teal-600',
      link: '/admin/dashboard'
    },
    {
      type: 'Cashier',
      title: 'Sales Staff',
      description: 'Efficient sales processing with customer management and payment collection',
      features: ['Point of Sale', 'Customer Lookup', 'Payment Processing', 'Basic Reports'],
      color: 'from-blue-500 to-blue-600',
      link: '/login'
    },
    {
      type: 'Customer',
      title: 'Your Customers',
      description: 'Self-service portal for product browsing, orders, and account management',
      features: ['Product Catalog', 'Order History', 'Account Management', 'Payment Tracking'],
      color: 'from-green-500 to-green-600',
      link: '/store'
    }
  ]

  const benefits = [
    {
      icon: DevicePhoneMobileIcon,
      title: 'Mobile Responsive',
      description: 'Works perfectly on all devices - desktop, tablet, and mobile'
    },
    {
      icon: GlobeAltIcon,
      title: 'Multilingual Support',
      description: 'Full English and Swahili language support for local businesses'
    },
    {
      icon: CheckCircleIcon,
      title: 'Easy to Use',
      description: 'Intuitive interface designed for users of all technical levels'
    }
  ]

  const stats = [
    { number: '95%', label: 'Customer Satisfaction' },
    { number: '50%', label: 'Faster Checkout' },
    { number: '30%', label: 'Increased Sales' },
    { number: '24/7', label: 'System Uptime' }
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center">
                <span className="text-xl font-bold text-white">K</span>
              </div>
              <span className="ml-3 text-2xl font-bold text-gray-900">Kopqela</span>
            </div>
            <div className="flex space-x-4">
              <Link href="/login" className="px-4 py-2 text-teal-600 hover:text-teal-700 font-medium">
                Login
              </Link>
              <Link href="/register" className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-medium transition-colors">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-teal-50 via-white to-teal-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6">
                <span className="text-teal-600">Kopqela</span> Sales
                <br />& Credit Management
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                Complete business solution for sales processing, credit management, and customer relationships. 
                Built for Tanzanian businesses with multilingual support and modern features.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/register">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-4 bg-teal-600 text-white rounded-xl font-semibold text-lg hover:bg-teal-700 transition-colors shadow-lg"
                  >
                    Start Free Trial
                  </motion.button>
                </Link>
                <Link href="/admin/dashboard">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-4 border-2 border-teal-600 text-teal-600 rounded-xl font-semibold text-lg hover:bg-teal-50 transition-colors"
                  >
                    View Demo
                  </motion.button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl md:text-4xl font-bold text-teal-600 mb-2">{stat.number}</div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Powerful Features</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to manage your business efficiently and grow your revenue
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-shadow"
              >
                <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-teal-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* User Types Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Built for Everyone</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Tailored experiences for different user roles in your business
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {userTypes.map((user, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                className="relative"
              >
                <div className={`bg-gradient-to-br ${user.color} rounded-2xl p-8 text-white h-full`}>
                  <div className="mb-6">
                    <div className="text-sm font-medium opacity-90 mb-2">{user.type}</div>
                    <h3 className="text-2xl font-bold mb-3">{user.title}</h3>
                    <p className="text-white/90 mb-6">{user.description}</p>
                  </div>
                  
                  <div className="space-y-2 mb-8">
                    {user.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center">
                        <CheckCircleIcon className="w-5 h-5 mr-2 text-white/80" />
                        <span className="text-sm text-white/90">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <Link href={user.link}>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-full bg-white/20 backdrop-blur-sm text-white font-semibold py-3 px-6 rounded-lg hover:bg-white/30 transition-colors"
                    >
                      Access {user.type} Portal
                    </motion.button>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-teal-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose Kopqela?</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Designed specifically for Tanzanian businesses with local needs in mind
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <benefit.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Trusted by Businesses</h2>
            <p className="text-xl text-gray-600">See what our customers say about Kopqela</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-gray-50 rounded-xl p-8"
            >
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <StarIcon key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
                             <p className="text-gray-700 mb-6 italic">
                 &ldquo;Kopqela has transformed how we manage our electronics store. The credit management system 
                 alone has increased our sales by 40%. The multilingual support makes it easy for all our staff.&rdquo;
               </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mr-4">
                  <span className="text-teal-600 font-semibold">JM</span>
                </div>
                <div>
                  <div className="font-semibold text-gray-900">John Mwalimu</div>
                  <div className="text-gray-600">TechWorld Electronics, Dar es Salaam</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-gray-50 rounded-xl p-8"
            >
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <StarIcon key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
                             <p className="text-gray-700 mb-6 italic">
                 &ldquo;The point of sale system is incredibly fast and the inventory management keeps us organized. 
                 Our customers love the online portal where they can track their orders and payments.&rdquo;
               </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                  <span className="text-green-600 font-semibold">AS</span>
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Amina Salum</div>
                  <div className="text-gray-600">Mama Amina General Store, Arusha</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-teal-600 to-teal-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Transform Your Business?
            </h2>
            <p className="text-xl text-teal-100 mb-8 max-w-2xl mx-auto">
              Join hundreds of Tanzanian businesses already using Kopqela to streamline 
              their operations and increase revenue.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-white text-teal-600 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-colors shadow-lg"
                >
                  Start Your Free Trial
                </motion.button>
              </Link>
              <Link href="/admin/dashboard">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 border-2 border-white text-white rounded-xl font-semibold text-lg hover:bg-white/10 transition-colors"
                >
                  Schedule Demo
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center">
                  <span className="text-xl font-bold text-white">K</span>
                </div>
                <span className="ml-3 text-2xl font-bold">Kopqela</span>
              </div>
              <p className="text-gray-300 mb-6 max-w-md">
                Empowering Tanzanian businesses with modern sales and credit management solutions. 
                Built locally, designed globally.
              </p>
              <div className="text-sm text-gray-400">
                © 2024 Kopqela. All rights reserved.
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-gray-300">
                <li><Link href="/login" className="hover:text-white transition-colors">Login</Link></li>
                <li><Link href="/register" className="hover:text-white transition-colors">Register</Link></li>
                <li><Link href="/admin/dashboard" className="hover:text-white transition-colors">Admin Panel</Link></li>
                <li><Link href="/store" className="hover:text-white transition-colors">Customer Portal</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-300">
                <li>Email: support@kopqela.com</li>
                <li>Phone: +255 123 456 789</li>
                <li>Address: Dar es Salaam, Tanzania</li>
                <li className="mt-4">
                  <span className="text-sm">Available in:</span>
                  <div className="flex space-x-2 mt-1">
                    <span className="px-2 py-1 bg-teal-600 rounded text-xs">English</span>
                    <span className="px-2 py-1 bg-teal-600 rounded text-xs">Kiswahili</span>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
