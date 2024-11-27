'use client'

import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'

const SphereBackground = dynamic(() => import('@/app/components/sphere-background'), { 
  ssr: false 
})

export default function TestLandingPage() {
  const router = useRouter()

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      {/* Three.js background */}
      <div className="absolute inset-0 -z-10">
        <SphereBackground />
      </div>

      {/* Content overlay */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center px-4">
        <div className="text-center max-w-3xl mx-auto backdrop-blur-sm bg-white/10 p-8 rounded-2xl">
          <h1 className="text-6xl font-bold text-white mb-6 drop-shadow-lg">
            AlbertOS
          </h1>
          <p className="text-xl text-gray-200 mb-8 drop-shadow">
            Experience course registration in a whole new dimension.
          </p>
          <button
            onClick={() => router.push('/login')}
            className="bg-white/20 backdrop-blur-md text-white px-8 py-3 rounded-lg 
              text-lg font-medium hover:bg-white/30 transition-colors duration-200 
              shadow-lg border border-white/30"
          >
            Enter
          </button>
        </div>
      </div>
    </div>
  )
} 