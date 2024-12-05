'use client'

import { useState, useEffect, useRef } from 'react'
import { Sidebar } from "@/app/components/sidebar"
import { Plus, ChevronDown, AlertCircle, ArrowLeft } from 'lucide-react'
import { useQuery, useAction, useMutation } from "convex/react"
import { api } from "../../convex/_generated/api"
import anime from 'animejs'
import { RotatingText } from "@/app/components/rotating-text"
import { toast } from "sonner"
import useLocalStorage from "@/lib/useLocalStorage"
import type { Course } from "../../convex/types"
import { Id } from "../../convex/_generated/dataModel"
// Import other necessary components from add-class/page.tsx

interface ClassItemProps {
  isExpanded?: boolean;
  onToggle?: () => void;
  name: string;
  code: string;
  instructor: string;
  schedule: string;
  location: string;
  courseType: string;
  section: string;
  classNumber: string;
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

interface CartItem {
  _id: Id<"cart">;
  courseId: string;
  name: string;
  code: string;
  instructor: string;
  schedule: string;
  location: string;
  courseType: string;
  section: string;
  classNumber: string;
  description: string;
  subjectCode: string;
  capacity: number;
  enrolled: number;
}

function CourseCard({ course, onOpenCart }: { 
  course: Course; 
  onOpenCart: () => void; 
}) {
  const [isExpanded, setIsExpanded] = useState(false)
  const addToCart = useMutation(api.courses.addToCart)
  const [isAdding, setIsAdding] = useState(false)
  const [sessionId] = useLocalStorage('sessionId', Date.now().toString())
  const cartItems = useQuery(api.courses.getCartItems, { sessionId }) || []
  const enrolledCourses = useQuery(api.courses.getRegisteredCourses) || []
  
  const isEnrolled = enrolledCourses.some(
    enrolled => enrolled?.code === course.code
  )

  const isSectionInCart = (sectionNumber: string) => 
    cartItems.some(item => item.classNumber === sectionNumber)

  const cartSectionCount = cartItems.filter(item => 
    item.code === course.code
  ).length

  const formatDescription = (description: string) => {
    const parts = []
    let mainText = description

    const prereqMatch = description.match(/Prerequisite[s]?:.*?(?=\n|$)/i)
    if (prereqMatch) {
      const [label, content] = prereqMatch[0].split(':')
      parts.push(
        <div key="prereq" className="prerequisite mt-2 space-y-1 text-sm text-gray-500">
          <p>
            <span className="font-medium text-gray-700">{label}:</span>{content}
          </p>
        </div>
      )
      mainText = mainText.replace(prereqMatch[0], '')
    }

    return (
      <>
        <p className="text-sm text-gray-500 mb-3">{mainText.trim()}</p>
        {parts}
      </>
    )
  }

  const handleAddToCart = async (section: Course['sections'][0]) => {
    if (isSectionInCart(section.classNumber)) {
      onOpenCart()
      return
    }

    if (cartSectionCount >= 2) {
      toast.error("Maximum of 2 sections per course allowed")
      return
    }

    setIsAdding(true)
    try {
      await addToCart({
        course: {
          courseId: section.classNumber,
          name: course.name,
          code: course.code,
          instructor: section.instructor,
          schedule: section.schedule,
          location: section.location,
          courseType: section.courseType,
          section: section.section,
          classNumber: section.classNumber,
          description: course.description,
          subjectCode: course.code.split(' ')[0],
          capacity: 0,
          enrolled: 0,
        },
        sessionId: sessionId
      })
      toast.success("Added to cart")
    } catch (error) {
      console.error("Error adding to cart:", error)
      toast.error("Failed to add to cart")
    } finally {
      setIsAdding(false)
    }
  }

  const isLimitReached = (sectionNumber: string) => 
    cartSectionCount >= 2 && !isSectionInCart(sectionNumber)

  return (
    <div className="w-full bg-white rounded-xl p-4 hover:shadow-md transition-shadow duration-200">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl font-semibold">{course.name}</h3>
              <p className="text-gray-600">{course.code}</p>
            </div>
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 hover:bg-gray-100 rounded-full"
              aria-label={isExpanded ? "Show less" : "Show more"}
            >
              <ChevronDown 
                className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${
                  isExpanded ? 'rotate-180' : ''
                }`}
              />
            </button>
          </div>
          
          <div className={`mt-2 overflow-hidden transition-all duration-200 ${
            isExpanded ? 'max-h-[80vh]' : 'max-h-0'
          }`}>
            {formatDescription(course.description)}
            
            <div className="space-y-4 mt-4 max-h-[60vh] overflow-y-auto">
              {course.sections.map((section) => (
                <div key={section.classNumber} 
                  className="border border-gray-100 rounded-lg p-4"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">Section {section.section}</p>
                      <p className="text-sm text-gray-600">
                        <strong>Instructor:</strong> {section.instructor}
                      </p>
                      <p className="text-sm text-gray-600">
                        <strong>Schedule:</strong> {section.schedule}
                      </p>
                      <p className="text-sm text-gray-600">
                        <strong>Location:</strong> {section.location}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm px-2 py-1 rounded ${
                        section.status === 'Open' ? 'bg-green-100 text-green-800' :
                        section.status === 'Waitlist' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {section.status === 'Waitlist' ? 'Waitlist' : section.status}
                      </span>
                      <button 
                        className={`ml-4 px-4 py-2 rounded-md transition-colors ${
                          isEnrolled 
                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                            : isSectionInCart(section.classNumber)
                            ? 'border-2 border-[#007AFF] text-[#007AFF] hover:bg-[#007AFF]/5'
                            : isLimitReached(section.classNumber)
                            ? 'bg-gray-200 text-gray-500'
                            : 'bg-[#007AFF] text-white hover:bg-[#007AFF]/80'
                        } ${isAdding ? 'opacity-50 cursor-not-allowed' : ''}`}
                        onClick={() => handleAddToCart(section)}
                        disabled={isAdding || section.status === 'Closed' || isLimitReached(section.classNumber) || isEnrolled}
                        title={isEnrolled ? "Already enrolled in this course" : ""}
                      >
                        {isEnrolled 
                          ? 'Enrolled' 
                          : isSectionInCart(section.classNumber)
                          ? 'In Cart'
                          : isLimitReached(section.classNumber)
                          ? 'Limit Reached'
                          : isAdding 
                          ? 'Adding...' 
                          : 'Add to Cart'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function CartPreview({ onClick }: { onClick: () => void }) {
  const previewRef = useRef<HTMLDivElement>(null)

  return (
    <div 
      ref={previewRef}
      className="cursor-pointer hover:bg-gray-50 transition-colors"
      onClick={onClick}
    >
      <div className="max-w-4xl w-full mx-auto px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-purple-100 p-1.5 rounded-full">
            <ChevronDown className="h-4 w-4 text-purple-600 rotate-180" />
          </div>
          <span className="font-medium">View Cart</span>
        </div>
        <span className="text-sm text-gray-500">
          Click to expand
        </span>
      </div>
    </div>
  )
}

function CartDropdown({ items, isOpen, onClose }: {
  items: CartItem[];
  isOpen: boolean;
  onClose: () => void;
}) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const removeFromCart = useMutation(api.courses.removeFromCart)
  const [removingId, setRemovingId] = useState<string | null>(null)
  const [sessionId] = useLocalStorage('sessionId', Date.now().toString())

  useEffect(() => {
    if (isOpen) {
      // Animate overlay
      anime({
        targets: overlayRef.current,
        opacity: [0, 1],
        duration: 300,
        easing: 'easeOutCubic'
      })

      // Animate content
      anime({
        targets: contentRef.current,
        translateY: ['100%', 0],
        duration: 500,
        easing: 'easeOutExpo'
      })
    }
  }, [isOpen])

  // Calculate dynamic max height based on number of items and viewport
  const getMaxHeight = () => {
    const baseHeight = 180; // Height for header and padding
    const itemHeight = 140; // Approximate height per item
    const totalContentHeight = baseHeight + (items.length * itemHeight);
    const maxViewportHeight = window.innerHeight - 100; // Leave some space from top
    
    return `${Math.min(totalContentHeight, maxViewportHeight)}px`;
  }

  const handleClose = () => {
    // Animate out
    anime({
      targets: overlayRef.current,
      opacity: 0,
      duration: 300,
      easing: 'easeOutCubic'
    })

    anime({
      targets: contentRef.current,
      translateY: '100%',
      duration: 500,
      easing: 'easeOutExpo',
      complete: onClose
    })
  }

  const handleRemove = async (courseId: string) => {
    setRemovingId(courseId)
    try {
      await removeFromCart({ 
        courseId: courseId,
        sessionId: sessionId
      })
      toast.success("Removed from cart")
    } catch (error) {
      console.error("Error removing course:", error)
      toast.error("Failed to remove course")
    } finally {
      setRemovingId(null)
    }
  }

  if (!isOpen) return null;

  return (
    <>
      <div 
        ref={overlayRef}
        className="fixed inset-0 bg-black/50 opacity-0 z-50"
        onClick={handleClose}
      />
      <div 
        ref={contentRef}
        className="fixed inset-x-0 bottom-0 transform z-50"
        style={{ maxHeight: getMaxHeight() }}
      >
        <div className="bg-white border-t shadow-lg h-full">
          <div className="max-w-4xl mx-auto p-6">
            <div className="flex justify-between items-center mb-4 sticky top-0 bg-white">
              <h3 className="text-xl font-semibold">Cart Items</h3>
              <button 
                onClick={handleClose}
                className="text-gray-500 hover:text-gray-700"
              >
                Close
              </button>
            </div>
            {items.length === 0 ? (
              <p className="text-gray-500">No items in cart</p>
            ) : (
              <div className="space-y-4 overflow-y-auto" style={{ maxHeight: `calc(${getMaxHeight()} - 100px)` }}>
                {items.map((item) => (
                  <div 
                    key={item._id} 
                    className="bg-white rounded-lg border border-gray-100 p-4"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-lg">{item.name}</h4>
                        <p className="text-gray-600">{item.code}</p>
                        <div className="mt-2 space-y-1 text-sm text-gray-500">
                          <p>
                            <span className="font-medium text-gray-700">Schedule:</span> {item.schedule}
                          </p>
                          <p>
                            <span className="font-medium text-gray-700">Instructor:</span> {item.instructor}
                          </p>
                          <p>
                            <span className="font-medium text-gray-700">Location:</span> {item.location}
                          </p>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleRemove(item.classNumber)}
                        disabled={removingId === item.classNumber}
                        className={`text-red-500 hover:text-red-600 text-sm transition-colors
                          ${removingId === item.classNumber ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {removingId === item.classNumber ? 'Removing...' : 'Remove'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default function ClassesPage() {
  const [isAddClassOpen, setIsAddClassOpen] = useState(false)
  const mainContentRef = useRef<HTMLDivElement>(null)
  const addClassPanelRef = useRef<HTMLDivElement>(null)
  const courses = useQuery(api.courses.getRegisteredCourses)
  const [expandedCourseId, setExpandedCourseId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("CSCI-UA")
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [sessionId] = useLocalStorage('sessionId', Date.now().toString())
  const cartItems = useQuery(api.courses.getCartItems, { sessionId })
  const searchCourses = useAction(api.courses.searchCourses)
  const [searchResults, setSearchResults] = useState<Course[]>([])
  const validateSchedule = useMutation(api.courses.validateSchedule)
  const enrollInCourses = useMutation(api.courses.enrollInCourses)
  const [isEnrolling, setIsEnrolling] = useState(false)

  useEffect(() => {
    const fetchCourses = async () => {
      if (searchTerm.length >= 6) {
        const results = await searchCourses({ searchTerm });
        setSearchResults(results);
      } else {
        setSearchResults([]);
      }
    };
    
    fetchCourses();
  }, [searchTerm, searchCourses]);

  const handleEnroll = async () => {
    if (!cartItems?.length) return;
    
    setIsEnrolling(true);
    try {
      const validationResult = await validateSchedule();
      
      if (!validationResult.valid) {
        toast.error(validationResult.error || 'Schedule validation failed.');
        return;
      }

      const enrollResult = await enrollInCourses();
      
      if (!enrollResult.success) {
        toast.error(enrollResult.error || 'Failed to enroll in courses.');
        return;
      }

      toast.success("Successfully enrolled in courses!");
      handleBack();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to enroll in courses");
    } finally {
      setIsEnrolling(false);
    }
  };

  const handleAddClass = () => {
    // Slide main content left
    anime({
      targets: mainContentRef.current,
      translateX: '-100%',
      duration: 600,
      easing: 'easeInOutQuart'
    })

    // Slide in add class panel
    anime({
      targets: addClassPanelRef.current,
      translateX: ['100%', '0%'],
      duration: 600,
      easing: 'easeInOutQuart'
    })

    setIsAddClassOpen(true)
  }

  const handleBack = () => {
    // Slide main content back
    anime({
      targets: mainContentRef.current,
      translateX: '0%',
      duration: 600,
      easing: 'easeInOutQuart'
    })

    // Slide out add class panel
    anime({
      targets: addClassPanelRef.current,
      translateX: '100%',
      duration: 600,
      easing: 'easeInOutQuart'
    })

    setIsAddClassOpen(false)
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar currentPage="/classes" />
      <div className="flex-1 overflow-hidden relative">
        {/* Main Classes Content */}
        <div 
          ref={mainContentRef}
          className="w-full h-full absolute inset-0"
        >
          <div className="h-full overflow-y-auto">
            <div className="p-8">
              <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center h-[40px] mb-6">
                  <h1 className="text-3xl font-bold">My <span className="bg-[#007AFF] text-white px-2 py-1 rounded-md">Classes</span></h1>
                  <div className="relative w-32 h-32 flex items-center justify-center group">
                    <div className="absolute w-20 h-20 group-hover:scale-125 transition-transform duration-200">
                      <RotatingText />
                    </div>
                    <button
                      onClick={handleAddClass}
                      className="w-10 h-10 rounded-full bg-[#007AFF] flex items-center justify-center text-white 
                        hover:bg-[#007AFF]/80 transition-all duration-200 z-10
                        group-hover:scale-125"
                      aria-label="Add new class"
                    >
                      <Plus className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* Warning Banner */}
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

                {/* Course List */}
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
        </div>

        {/* Add Class Panel */}
        <div 
          ref={addClassPanelRef}
          className={`w-full h-full absolute inset-0 bg-gray-50 overflow-y-auto transform translate-x-full
            ${isAddClassOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}
        >
          <div className="h-full overflow-y-auto">
            <div className="p-8">
              <div className="max-w-4xl mx-auto">
                <div className="flex items-center h-[40px] mb-6">
                  <button 
                    onClick={handleBack}
                    className="hover:bg-gray-100 p-2 rounded-full mr-3"
                  >
                    <ArrowLeft className="h-6 w-6" />
                  </button>
                  <h1 className="text-3xl font-bold">Add a <span className="bg-[#007AFF] text-white px-2 py-1 rounded-md">Class</span></h1>
                </div>

                <p className="text-lg mb-6">
                  Search for a class by subject code (e.g., CSCI-UA, MATH-UA)
                </p>

                <div className="flex gap-4 mb-8">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search for courses (e.g. Linear algebra)"
                    className="flex-1 p-3 rounded-md border border-gray-200 bg-gray-50"
                  />
                </div>

                {searchResults === undefined ? (
                  <div className="text-center py-8">
                    <p>Loading courses...</p>
                  </div>
                ) : !searchResults || searchResults.length === 0 ? (
                  <div className="text-center py-8">
                    <p>No courses found. Try a different search term.</p>
                  </div>
                ) : (
                  <div className="space-y-3 mb-8">
                    {searchResults.map((course) => (
                      <CourseCard 
                        key={course._id} 
                        course={course} 
                        onOpenCart={() => setIsCartOpen(true)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Cart UI - Move inside the scroll container but keep fixed positioning */}
            <div 
              className="fixed bottom-0 left-0 right-0 bg-white border-t z-40"
            >
              <CartPreview 
                onClick={() => setIsCartOpen(true)} 
              />
              <div className="py-4 px-8">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                  <h2 className="text-2xl font-semibold">
                    Cart {cartItems?.length ? `(${cartItems.length})` : ''}
                  </h2>
                  <button 
                    className={`bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-md flex items-center gap-2 
                      ${(!cartItems?.length || isEnrolling) ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={handleEnroll}
                    disabled={!cartItems?.length || isEnrolling}
                  >
                    {isEnrolling ? (
                      <>
                        <span className="animate-spin">↻</span>
                        Validating...
                      </>
                    ) : (
                      <>
                        <span>+</span> Enroll
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            <CartDropdown 
              items={cartItems || []} 
              isOpen={isCartOpen}
              onClose={() => setIsCartOpen(false)}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

