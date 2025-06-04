'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-400 via-teal-500 to-teal-600 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
          className="w-24 h-24 bg-white rounded-3xl mx-auto mb-8 flex items-center justify-center shadow-2xl"
        >
          <span className="text-4xl font-bold text-teal-600">K</span>
        </motion.div>
        
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
          Kopqela
        </h1>
        
        <p className="text-xl text-white/90 mb-12 max-w-md">
          Sales & Credit Management System
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl">
          {/* Login */}
          <Link href="/login">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 text-white hover:bg-white/30 transition-all duration-300 cursor-pointer"
            >
              <h3 className="text-lg font-semibold mb-2">Login</h3>
              <p className="text-sm text-white/80">Sign in to your account</p>
            </motion.div>
          </Link>
          
          {/* Register */}
          <Link href="/register">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 text-white hover:bg-white/30 transition-all duration-300 cursor-pointer"
            >
              <h3 className="text-lg font-semibold mb-2">Register</h3>
              <p className="text-sm text-white/80">Create new account</p>
            </motion.div>
          </Link>
          
          {/* Admin Dashboard */}
          <Link href="/admin/dashboard">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 text-white hover:bg-white/30 transition-all duration-300 cursor-pointer"
            >
              <h3 className="text-lg font-semibold mb-2">Admin Panel</h3>
              <p className="text-sm text-white/80">Access admin dashboard</p>
            </motion.div>
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
