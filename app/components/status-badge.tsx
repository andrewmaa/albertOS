import { cn } from "@/lib/utils"

interface StatusBadgeProps {
  status: "NOTICE" | "REQUIRED" | "COMPLETED"
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const getStatusStyles = () => {
    switch (status) {
      case "NOTICE":
        return "bg-orange-50 text-orange-700 rounded-md px-2 sm:px-3 py-0.5 sm:py-1 whitespace-nowrap"
      case "REQUIRED":
        return "bg-red-50 text-red-700 rounded-full px-3 sm:px-4 py-0.5 sm:py-1 whitespace-nowrap"
      case "COMPLETED":
        return "bg-green-50 text-green-700 rounded-full px-3 sm:px-4 py-0.5 sm:py-1 whitespace-nowrap"
      default:
        return ""
    }
  }

  return (
    <span className={cn(
      getStatusStyles(), 
      "text-xs sm:text-sm font-medium inline-block",
      className
    )}>
      {status}
    </span>
  )
}

