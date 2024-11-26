/* eslint-disable @typescript-eslint/no-unused-vars */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar } from "@/app/components/sidebar"
import { Plus, ChevronDown, AlertCircle } from 'lucide-react'
import { useQuery } from "convex/react"
import { api } from "../../convex/_generated/api"
import type { Course } from "../../convex/types"
import { Id } from "../../convex/_generated/dataModel"

interface ClassItemProps extends Course {
  isExpanded?: boolean;
  onToggle?: () => void;
}

function ClassItem({ 
  name, 
  code, 
  instructor, 
  schedule, 
  location, 
  courseType, 
  section, 
  classNumber,
  isExpanded = false,
  onToggle 
}: ClassItemProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm mb-4">
      <button 
        onClick={onToggle}
        className="w-full text-left"
      >
        <div className="flex justify-between items-center p-4">
          <div>
            <h3 className="text-lg font-semibold">{name} ({code})</h3>
            <p className="text-gray-600">{instructor}</p>
          </div>
          <div className="text-right flex items-center">
            <p className="font-medium">{schedule}</p>
            <ChevronDown 
              className={`h-5 w-5 text-gray-400 ml-2 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
            />
          </div>
        </div>
      </button>
      {isExpanded && (
        <div className="bg-gray-50 p-4">
          <p><strong>Location:</strong> {location}</p>
          <p><strong>Course type:</strong> {courseType}</p>
          <p><strong>Section:</strong> {section}</p>
          <p><strong>Class number:</strong> {classNumber}</p>
          <button className="mt-2 bg-green-500 text-white px-4 py-1 rounded-full text-sm font-medium">
            Enrolled
          </button>
        </div>
      )}
    </div>
  )
}

export default function ClassesPage() {
  const router = useRouter()
  const courses = useQuery(api.courses.getRegisteredCourses)
  const [expandedCourseId, setExpandedCourseId] = useState<string | null>(null)

  const handleAddClass = () => {
    router.push('/add-class')
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar currentPage="/classes" />
      <div className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">My Classes</h1>
            <button
              onClick={handleAddClass}
              className="h-10 w-10 rounded-full bg-purple-600 flex items-center justify-center text-white hover:bg-purple-700 transition-colors duration-200"
              aria-label="Add new class"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 flex items-start">
            <AlertCircle className="h-5 w-5 text-yellow-500 mr-3 mt-0.5" />
            <div>
              <p className="font-medium text-yellow-800">
                Note: The Add/Drop deadline is September 16.
              </p>
              <p className="text-yellow-700">
                Any courses dropped after this date will be denoted with a &quot;W&quot;.
              </p>
            </div>
          </div>

          {courses?.filter((course): course is NonNullable<typeof course> => 
            course !== null
          ).map((course) => (
            <ClassItem
              key={course._id}
              {...course}
              isExpanded={expandedCourseId === course._id}
              onToggle={() => setExpandedCourseId(
                expandedCourseId === course._id ? null : course._id
              )}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

