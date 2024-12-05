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
  startTime: string
  endTime: string
}

interface Class {
  name: string
  code: string
  schedule: string
  courseType: string
}

// Add this helper function to convert time to 24-hour format
const convertTo24Hour = (time: string) => {
  const [hourStr, modifier] = time.split(' ')
  let [hours, minutes] = hourStr.split(':').map(Number)
  
  if (hours === 12) {
    hours = modifier === 'PM' ? 12 : 0
  } else if (modifier === 'PM') {
    hours = hours + 12
  }
  
  return { hours, minutes }
}

// Add this function to calculate duration in rows
const calculateDuration = (startTime: string, endTime: string) => {
  const start = convertTo24Hour(startTime)
  const end = convertTo24Hour(endTime)
  
  const startMinutes = start.hours * 60 + start.minutes
  const endMinutes = end.hours * 60 + end.minutes
  return (endMinutes - startMinutes) / 60
}

// Add this function to get consistent color based on course code
const getColorForCourse = (code: string) => {
  // Sum the char codes of the course code to get a consistent number
  const sum = code.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  // Use modulo to get a consistent index into the colors array
  return COLORS[sum % COLORS.length]
}

// Add this helper function to calculate the starting position
const calculateStartOffset = (time: string) => {
  const { hours, minutes } = convertTo24Hour(time)
  return (hours - 8) + (minutes / 60)
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
      return { days: [], time: '', fullTime: '', startTime: '', endTime: '' }
    }

    // Split into parts and find the time parts
    const parts = schedule.split(' ')
    const timeStartIndex = parts.findIndex(p => p.includes(':'))
    
    // Get days (everything before the time)
    const daysStr = parts.slice(0, timeStartIndex).join(' ')

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

    // Parse the time range
    const timeRange = parts.slice(timeStartIndex).join(' ')
    const [startTime, , endTime] = timeRange.split(' ')
    const fullStartTime = `${startTime} ${parts[timeStartIndex + 1]}`
    const fullEndTime = `${endTime} ${parts[timeStartIndex + 4]}`

    return { 
      days, 
      time: fullStartTime, 
      fullTime: timeRange,
      startTime: fullStartTime,
      endTime: fullEndTime
    }
  }

  // Process courses for the planner
  const classes: ProcessedClass[] = registeredCourses.map(course => {
    console.log('Processing course:', course)
    const { days, time, fullTime, startTime, endTime } = processSchedule(course.schedule)
    return {
      name: course.name,
      code: course.code,
      time,
      fullTime,
      days: days as DayType[],
      color: getColorForCourse(course.code),
      instructor: course.instructor,
      location: course.location,
      courseType: course.courseType,
      startTime,
      endTime
    }
  })

  console.log('Processed classes:', classes)

  const timeSlots = Array.from({ length: 14 }, (_, i) => {
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
      <div className="flex-1 overflow-hidden">
        <div className="p-8 h-screen flex flex-col">
          <div className="max-w-4xl mx-auto w-full">
            <div className="flex justify-between items-center h-[40px] mb-6">
              <h1 className="text-3xl font-bold">
                My <span className="bg-[#8900E1] text-white px-2 py-1 rounded-md">Planner</span>
              </h1>
              <div className="w-[40px]"></div>
            </div>
            <p className="text-gray-600 mb-8">
              View your enrolled and waitlisted classes in a week-view schedule.
            </p>

            {/* Schedule container with fixed height and scrolling */}
            <div className="bg-white rounded-lg shadow-lg p-6 h-[calc(100vh-220px)] overflow-hidden">
              <div className="h-full overflow-y-auto">
                <div className="grid grid-cols-[auto_repeat(6,1fr)] gap-1 relative">
                  <div className="font-medium text-gray-500 sticky top-0 bg-white z-20 h-6"></div>
                  {days.map(day => (
                    <div 
                      key={day} 
                      className={`font-medium text-gray-500 text-center sticky top-0 bg-white z-20 h-6 text-sm
                        ${day !== 'SAT' ? 'border-r border-gray-100' : ''}`}
                    >
                      {day}
                    </div>
                  ))}

                  {/* Time slots for grid lines */}
                  {timeSlots.map((time, i) => (
                    <React.Fragment key={`timeslot-${i}`}>
                      <div className="text-xs text-gray-500 sticky left-0 bg-white z-10 h-12 flex items-start pt-1">
                        {time}
                      </div>
                      {days.map(day => (
                        <div
                          key={`${day}-${i}`}
                          className={`relative border-t border-gray-100 ${day !== 'SAT' ? 'border-r border-gray-100' : ''}`}
                          style={{ height: '2.5rem' }}
                        >
                          {/* Render courses directly in their grid cells */}
                          {classes.map(cls => {
                            if (cls.days.includes(day)) {
                              const classStartHour = convertTo24Hour(cls.startTime).hours
                              if (classStartHour === i + 8) {
                                const key = `${cls.code}-${day}`
                                const isExpanded = expandedStates[key]
                                
                                return (
                                  <div
                                    key={key}
                                    className={`absolute left-0 right-0 z-10 mx-1 p-1.5 rounded shadow-sm cursor-pointer 
                                      transition-all duration-200 hover:shadow-md
                                      ${cls.color} text-white
                                      ${isExpanded ? 'h-auto' : ''}`}
                                    style={{ 
                                      height: isExpanded ? 'auto' : `${calculateDuration(cls.startTime, cls.endTime) * 2.5}rem`,
                                      top: `${(convertTo24Hour(cls.startTime).minutes / 60) * 2.5}rem`,
                                    }}
                                    onClick={() => toggleExpanded(cls.code, day)}
                                  >
                                    <div className="flex flex-col">
                                      <div className={isExpanded ? "text-xs font-medium" : "text-xs font-medium line-clamp-2"}>
                                        {cls.name}
                                      </div>
                                      <div className="text-[10px] opacity-80 mt-0.5">
                                        {cls.code}
                                      </div>
                                    </div>
                                    {isExpanded && (
                                      <div className="mt-1.5 text-[10px] space-y-0.5 border-t border-white/20 pt-1.5">
                                        <p><span className="opacity-70">Time:</span> {cls.fullTime}</p>
                                        {cls.instructor && <p><span className="opacity-70">Instructor:</span> {cls.instructor}</p>}
                                        {cls.location && <p><span className="opacity-70">Location:</span> {cls.location}</p>}
                                        {cls.courseType && <p><span className="opacity-70">Type:</span> {cls.courseType}</p>}
                                      </div>
                                    )}
                                  </div>
                                )
                              }
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
