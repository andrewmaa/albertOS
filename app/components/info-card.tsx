'use client'

import { AlertCircle, FileText, CheckCircle2, PenLine, ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from "@/lib/utils"
import { StatusBadge } from "@/app/components/status-badge"
import { useState, useRef, useEffect } from 'react'

interface InfoCardProps {
  title: string
  description: string
  status: "NOTICE" | "REQUIRED" | "COMPLETED"
  icon?: "alert" | "file" | "check" | "pen"
}

export function InfoCard({ title, description, status, icon = "alert" }: InfoCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showReadMore, setShowReadMore] = useState(false)
  const textRef = useRef<HTMLDivElement>(null)
  
  const IconComponent = {
    alert: AlertCircle,
    file: FileText,
    check: CheckCircle2,
    pen: PenLine,
  }[icon]

  const iconColor = status === "COMPLETED" ? "text-green-500" : "text-gray-500"

  useEffect(() => {
    const checkHeight = () => {
      if (textRef.current) {
        // Get the line height and total height
        const style = window.getComputedStyle(textRef.current)
        const lineHeight = parseInt(style.lineHeight)
        const height = textRef.current.scrollHeight
        
        // If content is more than 2 lines
        setShowReadMore(height > lineHeight * 2)
      }
    }

    checkHeight()
    window.addEventListener('resize', checkHeight)
    return () => window.removeEventListener('resize', checkHeight)
  }, [description])

  return (
    <div className="bg-white rounded-xl border shadow-sm">
      <div className="p-5">
        <div className="flex items-start gap-4">
          <div className={cn("mt-1 flex-shrink-0", iconColor)}>
            <IconComponent className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
              <h3 className="text-base font-medium text-gray-900 leading-6 min-w-0 flex-shrink">{title}</h3>
              <div className="flex-shrink-0">
                <StatusBadge status={status} />
              </div>
            </div>
            <div
              ref={textRef}
              className={cn(
                "text-sm text-gray-600",
                !isExpanded && "line-clamp-2"
              )}
            >
              {description}
            </div>
            {showReadMore && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="mt-2 flex items-center text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                {isExpanded ? (
                  <>
                    Show less
                    <ChevronUp className="h-4 w-4 ml-0.5" />
                  </>
                ) : (
                  <>
                    Read more
                    <ChevronDown className="h-4 w-4 ml-0.5" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

