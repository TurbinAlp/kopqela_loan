'use client'
 
import { useEffect } from 'react'
 
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])
 
  return (
    <div className="min-h-screen flex items-center justify-center flex-col p-5 font-sans">
      <h1 className="text-3xl font-bold mb-4 text-red-500">
        Something went wrong!
      </h1>
      <p className="mb-4 text-gray-600 text-center max-w-md">
        {error.message || 'An unexpected error occurred. Please try again.'}
      </p>
      <div className="flex gap-4">
        <button
          onClick={reset}
          className="px-4 py-2 bg-red-500 text-white border-none rounded-lg cursor-pointer hover:bg-red-600 transition-colors"
        >
          Try again
        </button>
        <button
          onClick={() => window.location.href = '/'}
          className="px-4 py-2 bg-gray-500 text-white border-none rounded-lg cursor-pointer hover:bg-gray-600 transition-colors"
        >
          Go home
        </button>
      </div>
    </div>
  )
}