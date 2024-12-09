/* eslint-disable @typescript-eslint/no-unused-vars */

'use client'

import { Home, BookOpen, Calendar, DollarSign, Heart, LogOut, Menu, X } from 'lucide-react'
import { cn } from "@/lib/utils"
import Link from 'next/link'
import { useMutation } from "convex/react"
import { api } from "../../convex/_generated/api"
import { useRouter } from 'next/navigation'
import { toast } from "sonner"
import { useState } from 'react'

const navItems = [
  { 
    icon: Home, 
    label: 'Home', 
    href: '/dashboard',
    activeColor: 'bg-black/5 text-black',
    hoverColor: 'hover:bg-black/5'
  },
  { 
    icon: BookOpen, 
    label: 'Classes', 
    href: '/classes',
    activeColor: 'bg-[#007AFF]/10 text-[#007AFF]',
    hoverColor: 'hover:bg-[#007AFF]/5'
  },
  { 
    icon: Calendar, 
    label: 'Planner', 
    href: '/planner',
    activeColor: 'bg-[#8900E1]/10 text-[#8900E1]',
    hoverColor: 'hover:bg-[#8900E1]/5'
  },
  { 
    icon: DollarSign, 
    label: 'Finances', 
    href: '/finances',
    activeColor: 'bg-green-50 text-green-600',
    hoverColor: 'hover:bg-green-50/50'
  },
  { 
    icon: Heart, 
    label: 'Resources', 
    href: '/resources',
    activeColor: 'bg-red-50 text-red-600',
    hoverColor: 'hover:bg-red-50/50'
  },
]

interface SidebarProps {
  currentPage: string;
}

export function Sidebar({ currentPage }: SidebarProps) {
  const router = useRouter()
  const logout = useMutation(api.auth.logout)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

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
    <>
      {/* Mobile Menu Button */}
      <button 
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-white shadow-md"
      >
        {isMobileMenuOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <Menu className="h-6 w-6" />
        )}
      </button>

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transition-transform duration-300 lg:translate-x-0 lg:static",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="h-full p-4 flex flex-col">
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
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    currentPage === item.href
                      ? item.activeColor
                      : `text-gray-700 ${item.hoverColor}`
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
                className="w-full flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>Log out</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-30 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  )
}

