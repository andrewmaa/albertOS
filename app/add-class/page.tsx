/* eslint-disable @typescript-eslint/no-unused-vars */

'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ChevronDown } from 'lucide-react'
import { Sidebar } from "@/app/components/sidebar"
import { useAction, useMutation, useQuery } from "convex/react"
import { api } from "../../convex/_generated/api"
import type { Course } from "../../convex/types";
import { toast } from "sonner"
import anime from 'animejs'
import { Id } from "../../convex/_generated/dataModel";
import useLocalStorage from "@/lib/useLocalStorage";

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

interface CourseCardProps {
  course: Course;
  onOpenCart: () => void;
}

function CourseCard({ course, onOpenCart }: CourseCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const addToCart = useMutation(api.courses.addToCart)
  const [isAdding, setIsAdding] = useState(false)
  const [sessionId] = useLocalStorage('sessionId', Date.now().toString())
  const cartItems = useQuery(api.courses.getCartItems, { sessionId }) || []
  
  const isInCart = cartItems.some(item => item.classNumber === course.classNumber)

  const formatDescription = (description: string) => {
    const parts = [];
    let mainText = description;

    const prereqMatch = description.match(/Prerequisite[s]?:.*?(?=\n|$)/i);
    if (prereqMatch) {
      const [label, content] = prereqMatch[0].split(':');
      parts.push(
        <div key="prereq" className="prerequisite mt-2 space-y-1 text-sm text-gray-500">
          <p>
            <span className="font-medium text-gray-700">{label}:</span>{content}
          </p>
        </div>
      );
      mainText = mainText.replace(prereqMatch[0], '');
    }

    return (
      <>
        <p className="text-sm text-gray-500 mb-3">{mainText.trim()}</p>
        {parts}
      </>
    );
  };

  const formatSchedule = (schedule: string) => {
    if (!schedule || schedule === "TBA") return "TBA";
    return schedule;
  };

  const handleAddToCart = async () => {
    if (isInCart) {
      onOpenCart()
      return
    }

    setIsAdding(true)
    try {
      await addToCart({
        course: {
          courseId: course.classNumber,
          name: course.name,
          code: course.code,
          instructor: course.instructor,
          schedule: course.schedule,
          location: course.location,
          courseType: course.courseType,
          section: course.section,
          classNumber: course.classNumber,
          description: course.description,
          subjectCode: course.subjectCode,
          capacity: course.capacity,
          enrolled: course.enrolled,
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
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
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
            isExpanded ? 'max-h-96' : 'max-h-0'
          }`}>
            {formatDescription(course.description)}
            <div className="space-y-1 mt-3">
              <p className="text-sm text-gray-600">
                <strong>Instructor:</strong> {course.instructor}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Schedule:</strong> {formatSchedule(course.schedule)}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Location:</strong> {course.location || "TBA"}
              </p>
            </div>
          </div>
        </div>
        <button 
          className={`ml-4 px-4 py-2 rounded-md transition-colors ${
            isInCart 
              ? 'border-2 border-purple-600 text-purple-600 hover:bg-purple-50'
              : 'bg-purple-600 text-white hover:bg-purple-700'
          } ${isAdding ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={handleAddToCart}
          disabled={isAdding}
        >
          {isInCart ? 'In Cart' : isAdding ? 'Adding...' : 'Add to Cart'}
        </button>
      </div>
    </div>
  )
}

interface CartDropdownProps {
  items: CartItem[];
  isOpen: boolean;
  onClose: () => void;
}

function CartPreview({ onView }: { onView: () => void }) {
  const previewRef = useRef<HTMLDivElement>(null)
  const animation = useRef<anime.AnimeInstance | null>(null)

  useEffect(() => {
    const element = previewRef.current
    if (!element) return

    // Cancel any existing animation
    if (animation.current) {
      animation.current.pause()
    }

    // Set initial state
    element.style.opacity = '0'
    element.style.transform = 'translateY(20px)'

    // Create new animation
    animation.current = anime({
      targets: element,
      translateY: [20, 0],
      opacity: [0, 1],
      duration: 300,
      easing: 'easeOutCubic',
      autoplay: true
    })

    // Cleanup function
    return () => {
      if (animation.current) {
        animation.current.pause()
      }
    }
  }, [])

  return (
    <div 
      ref={previewRef}
      className="absolute bottom-full left-0 right-0 px-8 z-50"
      onClick={onView}
      style={{ opacity: 0, transform: 'translateY(20px)' }}
    >
      <div className="bg-[#F2F2F2] text-gray-900 py-3 px-4 cursor-pointer 
        hover:bg-gray-200 transition-colors rounded-t-lg max-w-4xl mx-auto">
        View cart
      </div>
    </div>
  )
}

function CartDropdown({ items, isOpen, onClose }: CartDropdownProps) {
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
      console.log("Removing course:", courseId, "with sessionId:", sessionId) // Debug log
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
        className="fixed inset-0 bg-black opacity-0 z-50"
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
  );
}

export default function AddClassPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("CSCI-UA")
  const [isVisible, setIsVisible] = useState(false)
  const searchCourses = useAction(api.courses.searchCourses);
  const [searchResults, setSearchResults] = useState<Course[]>([]);
  const [sessionId] = useLocalStorage('sessionId', Date.now().toString())
  const cartItems = useQuery(api.courses.getCartItems, { sessionId })
  const validateSchedule = useAction(api.courses.validateSchedule)
  const [isEnrolling, setIsEnrolling] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCartHovered, setIsCartHovered] = useState(false)
  const cartTimeoutRef = useRef<NodeJS.Timeout>()
  const previewRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    // Small delay to ensure proper mounting
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 50)

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const fetchCourses = async () => {
      if (searchTerm.length >= 6) { // Only search when we have a full subject code
        const results = await searchCourses({ searchTerm });
        setSearchResults(results);
      } else {
        setSearchResults([]);
      }
    };
    
    fetchCourses();
  }, [searchTerm, searchCourses]);

  const handleBack = () => {
    setIsVisible(false)
    setTimeout(() => router.back(), 300)
  }

  const handleEnroll = async () => {
    if (!cartItems?.length) return
    
    setIsEnrolling(true)
    try {
      // Get registration numbers from cart items
      const registrationNumbers = cartItems.map(item => item.classNumber)
      
      // Validate schedule
      const result = await validateSchedule({ registrationNumbers })
      
      if (!result.valid) {
        toast.error(result.error || 'Schedule validation failed')
        return
      }
      
      // If valid, proceed with enrollment (to be implemented)
      toast.success("Schedule validated! Ready to enroll.")
      
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to validate schedule")
    } finally {
      setIsEnrolling(false)
    }
  }

  const handleCartMouseEnter = () => {
    if (cartTimeoutRef.current) {
      clearTimeout(cartTimeoutRef.current)
    }
    if (!isCartOpen) {
      setIsCartHovered(true)
    }
  }

  const handleCartMouseLeave = () => {
    cartTimeoutRef.current = setTimeout(() => {
      setIsCartHovered(false)
    }, 100)
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar currentPage="/add-class" />
      <div className="flex-1 flex flex-col relative">
        <div className="flex-1 overflow-y-auto pb-[80px]">
          <div className="p-8">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center gap-3 mb-6">
                <button 
                  onClick={handleBack}
                  className="hover:bg-gray-100 p-2 rounded-full"
                >
                  <ArrowLeft className="h-6 w-6" />
                </button>
                <h1 className="text-3xl font-bold">Add a <span className="bg-purple-600 text-white px-3 py-1 rounded-md">Class</span></h1>
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
                  {searchResults.map((course: Course) => (
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
        </div>
        
        <div 
          className="absolute bottom-0 left-0 right-0 bg-white border-t z-40"
          onMouseEnter={handleCartMouseEnter}
          onMouseLeave={handleCartMouseLeave}
        >
          {isCartHovered && !isCartOpen && (
            <CartPreview 
              onView={() => {
                setIsCartHovered(false)
                setIsCartOpen(true)
              }} 
            />
          )}
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
  )
}

