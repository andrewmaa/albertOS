/* eslint-disable @typescript-eslint/no-unused-vars */

'use client'

import { Home, BookOpen, Calendar, DollarSign, Heart, LogOut } from 'lucide-react'
import { cn } from "@/lib/utils"
import Link from 'next/link'
import { useMutation } from "convex/react"
import { api } from "../../convex/_generated/api"
import { useRouter } from 'next/navigation'
import { toast } from "sonner"

const navItems = [
  { icon: Home, label: 'Home', href: '/dashboard' },
  { icon: BookOpen, label: 'Classes', href: '/classes' },
  { icon: Calendar, label: 'Planner', href: '/planner' },
  { icon: DollarSign, label: 'Finances', href: '/finances' },
  { icon: Heart, label: 'Resources', href: '/resources' },
]

interface SidebarProps {
  currentPage: string;
}

export function Sidebar({ currentPage }: SidebarProps) {
  const router = useRouter()
  const logout = useMutation(api.auth.logout)

  const handleLogout = async () => {
    try {
      await logout()
      toast.success("Logged out successfully")
      router.push('/login')
    } catch (error) {
      toast.error("Failed to log out")
    }
  }

  return (
    <div className="w-80 min-h-screen bg-white border-r border-gray-200 p-4">
      <div className="mb-8 flex items-center">
        <div className="w-12 h-12 rounded-full bg-gray-200 mr-4" />
        <div>
          <h2 className="text-lg font-semibold">Andrew Smith</h2>
          <p className="text-sm text-gray-500">andrew.smith@nyu.edu</p>
        </div>
      </div>
      <nav className="flex flex-col justify-between h-[calc(100vh-120px)]">
        <div className="space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium",
                currentPage === item.href
                  ? "text-blue-600 bg-blue-50"
                  : "text-gray-700 hover:bg-gray-100"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
        
        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50"
        >
          <LogOut className="h-5 w-5" />
          <span>Log out</span>
        </button>
      </nav>
    </div>
  )
}

