'use client'

import { useState } from 'react'
import { Sidebar } from "@/app/components/sidebar"
import { useQuery } from "convex/react"
import { api } from "../../convex/_generated/api"
import React from 'react'

type DayType = 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT'

const COLORS = [
  'bg-[#007AFF]', // Blue
  'bg-[#8900E1]', // NYU Purple
  'bg-[#FF2D55]', // Pink
  'bg-[#FF3B30]', // Red
  'bg-[#FF9500]', // Orange
  'bg-[#34C759]', // Green
  'bg-[#5AC8FA]', // Light Blue
  'bg-[#AF52DE]'  // Purple
] as const

type Color = typeof COLORS[number]

interface ProcessedClass {
  name: string
  code: string
  time: string
  fullTime: string
  days: DayType[]
  color: Color
  instructor?: string
  location?: string
  courseType?: string
}

interface Class {
  name: string
  code: string
  schedule: string
  courseType: string
}

// Add this function to get consistent color based on course code
const getColorForCourse = (code: string) => {
  // Sum the char codes of the course code to get a consistent number
  const sum = code.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  // Use modulo to get a consistent index into the colors array
  return COLORS[sum % COLORS.length]
}

export default function PlannerPage() {
  const registeredCourses = useQuery(api.courses.getRegisteredCourses) || []
  const [expandedStates, setExpandedStates] = useState<Record<string, boolean>>({})

  // Convert schedule string (e.g. "M W 12:00 PM - 1:15 PM") to our planner format
  const processSchedule = (schedule: string) => {
    console.log('Processing schedule:', schedule)
    
    // Handle empty or invalid schedules
    if (!schedule || !schedule.includes(' ')) {
      console.log('Invalid schedule format')
      return { days: [], time: '', fullTime: '' }
    }

    // Split into parts and find the time parts
    const parts = schedule.split(' ')
    const timeStartIndex = parts.findIndex(p => p.includes(':'))
    
    // Get days (everything before the time)
    const daysStr = parts.slice(0, timeStartIndex).join(' ')
    // Get start time (the time before the dash)
    const startTime = `${parts[timeStartIndex]} ${parts[timeStartIndex + 1]}`
    // Get full time range
    const fullTime = parts.slice(timeStartIndex).join(' ')

    const days = daysStr.split(' ').map(day => {
      switch(day) {
        case 'M': return 'MON'
        case 'T': return 'TUE'
        case 'W': return 'WED'
        case 'Th': return 'THU'
        case 'F': return 'FRI'
        default: return ''
      }
    }).filter(Boolean)

    return { days, time: startTime, fullTime }
  }

  // Process courses for the planner
  const classes: ProcessedClass[] = registeredCourses.map(course => {
    console.log('Processing course:', course)
    const { days, time, fullTime } = processSchedule(course.schedule)
    return {
      name: course.name,
      code: course.code,
      time,
      fullTime,
      days: days as DayType[],
      color: getColorForCourse(course.code),
      instructor: course.instructor,
      location: course.location,
      courseType: course.courseType
    }
  })

  console.log('Processed classes:', classes)

  const timeSlots = Array.from({ length: 15 }, (_, i) => {
    const hour = i + 8
    return hour <= 12 ? `${hour} AM` : `${hour - 12} PM`
  })

  const days: DayType[] = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

  const toggleExpanded = (classCode: string, day: string) => {
    const key = `${classCode}-${day}`
    setExpandedStates(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar currentPage="/planner" />
      <div className="flex-1 overflow-hidden relative">
        <div className="h-full overflow-y-auto">
          <div className="p-8">
            <div className="max-w-4xl mx-auto">
              <div className="flex justify-between items-center h-[40px] mb-6">
                <h1 className="text-3xl font-bold">
                  My <span className="bg-[#8900E1] text-white px-2 py-1 rounded-md">Planner</span>
                </h1>
                <div className="w-[40px]"></div>
              </div>
              <p className="text-gray-600 mb-8">
                View your enrolled and waitlisted classes in a week-view schedule.
              </p>

              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="grid grid-cols-7 gap-4">
                  <div className="font-medium text-gray-500"></div>
                  {days.map(day => (
                    <div key={day} className="font-medium text-gray-500 text-center">
                      {day}
                    </div>
                  ))}

                  {timeSlots.map((time, i) => (
                    <React.Fragment key={`timeslot-${i}`}>
                      <div className="text-sm text-gray-500 relative -top-3">
                        {time}
                      </div>
                      {days.map(day => (
                        <div
                          key={`${day}-${i}`}
                          className="relative border-t border-gray-200"
                          style={{ height: '4rem' }}
                        >
                          {classes.map(cls => {
                            const classTime = cls.time
                            const classHour = parseInt(classTime.split(':')[0])
                            const isPM = classTime.includes('PM')
                            const normalizedHour = isPM && classHour !== 12 ? classHour + 12 : classHour
                            
                            if (normalizedHour === i + 8 && cls.days.includes(day)) {
                              const key = `${cls.code}-${day}`
                              const isExpanded = expandedStates[key]
                              
                              return (
                                <div
                                  key={key}
                                  className={`absolute -top-3 left-0 right-0 z-10 p-2 rounded shadow-sm cursor-pointer 
                                    transition-all duration-200 hover:shadow-md
                                    ${cls.color} text-white
                                    ${isExpanded ? 'h-auto' : ''}`}
                                  style={{ height: isExpanded ? 'auto' : '7rem' }}
                                  onClick={() => toggleExpanded(cls.code, day)}
                                >
                                  <div className="flex flex-col">
                                    <div className={isExpanded ? "text-sm font-medium" : "text-sm font-medium line-clamp-2"}>
                                      {cls.name}
                                    </div>
                                    <div className="text-xs opacity-80 mt-1">
                                      {cls.code}
                                    </div>
                                  </div>
                                  {isExpanded && (
                                    <div className="mt-2 text-xs space-y-1 border-t border-white/20 pt-2">
                                      <p><span className="opacity-70">Time:</span> {cls.fullTime}</p>
                                      {cls.instructor && <p><span className="opacity-70">Instructor:</span> {cls.instructor}</p>}
                                      {cls.location && <p><span className="opacity-70">Location:</span> {cls.location}</p>}
                                      {cls.courseType && <p><span className="opacity-70">Type:</span> {cls.courseType}</p>}
                                    </div>
                                  )}
                                </div>
                              )
                            }
                            return null
                          })}
                        </div>
                      ))}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
