'use client'

import { ArrowRight, Plus } from 'lucide-react'
import Link from 'next/link'

interface SectionHeaderProps {
  title: string
  href?: string
  isMainHeader?: boolean
}

export default function SectionHeader({ title, href, isMainHeader }: SectionHeaderProps) {
  if (isMainHeader) {
    return (
      <div className="bg-purple-600 py-16">
        <div className="max-w-[1200px] w-full mx-auto px-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold mb-2 text-white">Welcome to AlbertOS.</h1>
              <p className="text-white">
                Happy <span className="font-medium">Fall semester!</span> Review your{" "}
                <span className="font-medium">classes and student information</span> below.
              </p>
            </div>
            <button className="h-10 w-10 rounded-full bg-white flex items-center justify-center text-purple-600 hover:bg-gray-100">
              <Plus className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    )
  }

  const content = (
    <>
      <h2 className="text-xl font-semibold">{title}</h2>
      {href && <ArrowRight className="h-5 w-5 text-gray-400" />}
    </>
  )

  return (
    <div className="flex items-center space-x-2 mb-4">
      {href ? (
        <Link href={href} className="flex items-center space-x-2 hover:text-blue-600 transition-colors">
          {content}
        </Link>
      ) : (
        content
      )}
    </div>
  )
} 