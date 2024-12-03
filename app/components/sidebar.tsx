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
      router.push('/')
    } catch (error) {
      toast.error("Failed to log out")
    }
  }

  return (
    <div className="w-64 h-screen bg-white border-r border-gray-200 p-4 sticky top-0 flex flex-col">
      <div className="mb-8 flex items-center">
        <div className="w-10 h-10 rounded-full bg-gray-200 mr-3" />
        <div>
          <h2 className="text-base font-semibold">Andrew Smith</h2>
          <p className="text-xs text-gray-500">andrew.smith@nyu.edu</p>
        </div>
      </div>
      
      <div className="flex-1 flex flex-col">
        <nav className="space-y-1">
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
              <item.icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        
        <div className="flex-1 flex items-end pb-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50"
          >
            <LogOut className="h-4 w-4" />
            <span>Log out</span>
          </button>
        </div>
      </div>
    </div>
  )
}

