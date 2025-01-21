'use client'

import { useState } from 'react'
import { Sidebar } from "@/app/components/sidebar"
import { Card, CardHeader, CardTitle, CardContent } from "@/app/components/card"
import Link from 'next/link'

type ResourceCategory = 'health' | 'academic' | 'safety' | 'student' | 'technology'

export default function ResourcesPage() {
  const [activeCategory, setActiveCategory] = useState<ResourceCategory>('health')

  const categories: { id: ResourceCategory; label: string }[] = [
    { id: 'health', label: 'Health & Wellness' },
    { id: 'academic', label: 'Academic Services' },
    { id: 'safety', label: 'Safety & Security' },
    { id: 'student', label: 'Student Life' },
    { id: 'technology', label: 'Technology' }
  ]

  const resources = {
    health: [
      {
        title: 'Student Health Center',
        description: 'Schedule appointments, access your health records, and submit forms.',
        link: 'https://shcportal.nyu.edu',
        icon: '🏥'
      },
      {
        title: 'Wellness Exchange',
        description: '24/7 hotline for urgent mental health concerns and counseling services.',
        link: 'https://www.nyu.edu/students/health-and-wellness/wellness-exchange.html',
        icon: '💭'
      },
      {
        title: 'Counseling Services',
        description: 'Free, confidential counseling for NYU students.',
        link: 'https://www.nyu.edu/students/health-and-wellness/counseling-services.html',
        icon: '🗣️'
      }
    ],
    academic: [
      {
        title: 'NYU Registrar',
        description: 'Course registration, transcripts, and academic records.',
        link: 'https://www.nyu.edu/registrar',
        icon: '📚'
      },
      {
        title: 'Academic Calendar',
        description: 'Important dates, deadlines, and academic schedules.',
        link: 'https://www.nyu.edu/registrar/calendars/academic-calendar.html',
        icon: '📅'
      },
      {
        title: 'Libraries',
        description: 'Access library resources, research databases, and study spaces.',
        link: 'https://library.nyu.edu',
        icon: '📖'
      }
    ],
    safety: [
      {
        title: 'Campus Safety',
        description: 'Emergency contacts, safety resources, and campus alerts.',
        link: 'https://www.nyu.edu/life/safety-health-wellness/campus-safety.html',
        icon: '🚨'
      },
      {
        title: 'Safe NYU',
        description: 'Download the Safe NYU app for emergency services and safety features.',
        link: 'https://www.nyu.edu/life/safety-health-wellness/campus-safety/safe-nyu.html',
        icon: '📱'
      },
      {
        title: 'Public Safety',
        description: '24/7 campus security and emergency response.',
        link: 'https://www.nyu.edu/about/leadership-university-administration/office-of-the-president/office-of-the-executivevicepresident/operations/public-safety.html',
        icon: '🚔'
      }
    ],
    student: [
      {
        title: 'Student Life',
        description: 'Campus activities, events, and student organizations.',
        link: 'https://www.nyu.edu/new-york/student-life.html',
        icon: '🎭'
      },
      {
        title: 'Housing Portal',
        description: 'Housing applications, maintenance requests, and room selection.',
        link: 'https://housing.nyu.edu',
        icon: '🏠'
      },
      {
        title: 'Dining Services',
        description: 'Dining locations, meal plans, and dietary information.',
        link: 'https://www.nyu.edu/students/student-life/housing-dining/dining-services.html',
        icon: '🍽️'
      }
    ],
    technology: [
      {
        title: 'NYU IT',
        description: 'Tech support, software downloads, and IT services.',
        link: 'https://www.nyu.edu/it',
        icon: '💻'
      },
      {
        title: 'NYU Classes',
        description: 'Access your course materials and assignments.',
        link: 'https://newclasses.nyu.edu',
        icon: '📝'
      },
      {
        title: 'NYU Email',
        description: 'Access your NYU email and calendar.',
        link: 'https://www.nyu.edu/life/information-technology/communication-and-collaboration/email-and-communication.html',
        icon: '📧'
      }
    ]
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar currentPage="/resources" />
      <div className="flex-1 overflow-hidden w-full">
        <div className="p-4 lg:p-8 h-screen flex flex-col pt-16 lg:pt-8">
          <div className="max-w-4xl mx-auto w-full">
            <div className="flex justify-between items-center h-[40px] mb-6">
              <h1 className="text-2xl lg:text-3xl font-bold">
                NYU <span className="bg-[#8900E1] text-white px-2 py-1 rounded-md">Resources</span>
              </h1>
              <div className="w-[40px]"></div>
            </div>
            <p className="text-gray-600 mb-8">
              Quick access to important NYU services and resources.
            </p>

            {/* Categories */}
            <div className="flex space-x-1 border-b border-gray-200 mb-6 overflow-x-auto">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap
                    ${activeCategory === category.id
                      ? 'bg-white text-[#8900E1] border-t border-x border-gray-200'
                      : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                  {category.label}
                </button>
              ))}
            </div>

            {/* Resource Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {resources[activeCategory].map((resource) => (
                <Link 
                  href={resource.link}
                  key={resource.title}
                  target="_blank"
                  className="transition-transform hover:scale-105"
                >
                  <Card className="h-full hover:shadow-md transition-shadow">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <span className="text-2xl">{resource.icon}</span>
                        <span>{resource.title}</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600">{resource.description}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
