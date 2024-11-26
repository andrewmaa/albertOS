import { cn } from "@/lib/utils"

interface StatusBadgeProps {
  status: "NOTICE" | "COMPLETE NOW" | "COMPLETE SOON" | "COMPLETED"
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const getStatusStyles = () => {
    switch (status) {
      case "NOTICE":
        return "bg-orange-50 text-orange-700 rounded-md px-3 py-1"
      case "COMPLETE NOW":
        return "bg-red-50 text-red-700 rounded-full px-4 py-1"
      case "COMPLETE SOON":
        return "bg-yellow-50 text-yellow-700 rounded-full px-4 py-1"
      case "COMPLETED":
        return "bg-green-50 text-green-700 rounded-full px-4 py-1"
      default:
        return ""
    }
  }

  return (
    <span className={cn(getStatusStyles(), "text-sm font-medium", className)}>
      {status === "COMPLETE SOON" ? "COMPLETE SOON" : status}
    </span>
  )
}

