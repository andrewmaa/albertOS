'use client'

import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'

// Update import path
const Background = dynamic(() => import('@/app/components/gradient-background'), { ssr: false })

export default function LandingPage() {
  const router = useRouter()

  return (
    <div className="relative h-screen w-screen">
      {/* Three.js background */}
      <div className="absolute inset-0 -z-10">
        <Background />
      </div>

      {/* Content overlay */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center px-4">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-6xl font-bold text-white mb-6 drop-shadow-lg">
            Welcome to AlbertOS
          </h1>
          <p className="text-xl text-gray-200 mb-8 drop-shadow">
            Your student information system, reimagined for the modern era.
          </p>
          <button
            onClick={() => router.push('/login')}
            className="bg-white text-purple-600 px-8 py-3 rounded-lg text-lg font-medium
              hover:bg-gray-100 transition-colors duration-200 shadow-lg"
          >
            Get Started
          </button>
        </div>
      </div>
    </div>
  )
} 