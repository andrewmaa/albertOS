import { AlertCircle, FileText, CheckCircle2, PenLine } from 'lucide-react'
import { cn } from "@/lib/utils"
import { StatusBadge } from "@/app/components/status-badge"

interface InfoCardProps {
  title: string
  description: string
  status: "NOTICE" | "COMPLETE NOW" | "COMPLETE SOON" | "COMPLETED"
  icon?: "alert" | "file" | "check" | "pen"
}

export function InfoCard({ title, description, status, icon = "alert" }: InfoCardProps) {
  const IconComponent = {
    alert: AlertCircle,
    file: FileText,
    check: CheckCircle2,
    pen: PenLine,
  }[icon]

  const iconColor = status === "COMPLETED" ? "text-green-500" : "text-gray-500"

  return (
    <div className="bg-white rounded-lg border p-6 mb-4">
      <div className="flex items-start space-x-4">
        <div className={cn("mt-1", iconColor)}>
          <IconComponent className="h-5 w-5" />
        </div>
        <div className="flex-1 space-y-1">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-gray-900">{title}</h3>
            <StatusBadge status={status} />
          </div>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
      </div>
    </div>
  )
}

