'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { toast } from 'sonner'
import dynamic from 'next/dynamic'

const Background = dynamic(() => import('@/app/components/gradient-background'), { ssr: false })

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isDemoLoading, setIsDemoLoading] = useState(false)
  const createDemoSession = useMutation(api.auth.createDemoSession)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    // Add regular login logic here
    setTimeout(() => {
      setIsLoading(false)
      router.push('/classes')
    }, 1000)
  }

  const handleDemoLogin = async () => {
    setIsDemoLoading(true)
    try {
      const { sessionId, userId } = await createDemoSession()
      // Store both sessionId and userId in localStorage
      localStorage.setItem('sessionId', sessionId)
      localStorage.setItem('userId', userId)
      // Redirect directly to the dashboard page
      router.push('/dashboard')  // or whatever your main dashboard route is
    } catch (error) {
      console.error('Demo login failed:', error)
      toast.error('Failed to create demo session')
    } finally {
      setIsDemoLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <Background />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col md:flex-row">
        {/* Left side - Login Form */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-md space-y-8 bg-white/90 backdrop-blur-sm p-8 rounded-lg shadow-xl">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Welcome to AlbertOS</h1>
              <p className="text-gray-600">Sign in to your NYU account</p>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
              <div className="space-y-4">
                <div>
                  <label htmlFor="netid" className="block text-sm font-medium text-gray-700">
                    NetID
                  </label>
                  <input
                    id="netid"
                    name="netid"
                    type="text"
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Enter your NetID"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Enter your password"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <a href="#" className="font-medium text-purple-600 hover:text-purple-500">
                    Forgot password?
                  </a>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Signing in...' : 'Sign in'}
                </button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">or</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleDemoLogin}
                  disabled={isDemoLoading}
                  className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDemoLoading ? 'Creating Demo...' : 'Try Demo Version'}
                </button>
              </div>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Need help?</span>
                </div>
              </div>
              <div className="mt-6 text-center">
                <a href="https://nyu.edu/it" className="text-sm text-purple-600 hover:text-purple-500">
                  Contact NYU IT Support
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - NYU Branding */}
        <div className="hidden md:flex md:flex-1 items-center justify-center p-8">
          <div className="max-w-md text-center text-white">
            <div className="mb-8">
              <div className="w-24 h-24 mx-auto bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center">
                <span className="text-purple-700 text-2xl font-bold">NYU</span>
              </div>
            </div>
            <h2 className="text-3xl font-bold mb-4 drop-shadow-lg">New York University</h2>
            <p className="text-white/90 drop-shadow">
              Access your courses, check grades, and manage your academic journey all in one place.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

