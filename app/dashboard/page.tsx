import SectionHeader from '@/app/components/section-header'
import { Sidebar } from '@/app/components/sidebar'
import { InfoCard } from '@/app/components/info-card'

export default function Page() {
  return (
    <div className="flex min-h-screen">
      <Sidebar currentPage="/dashboard" />
      
      <div className="flex-1">
        <SectionHeader isMainHeader title="Welcome to AlbertOS!" />
        
        <div className="max-w-[1200px] mx-auto px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div>
              <SectionHeader title="My Classes" href="/classes" />
              <div className="space-y-4">
                <InfoCard
                  title="Add/Drop ends September 16"
                  description="September 16 is the last day to change your classes before a 'W' is added on your transcript."
                  status="NOTICE"
                  icon="alert"
                />
                <InfoCard
                  title="Review schedule conflicts"
                  description="Review the classes you are waitlisted for, and make changes if necessary. Note: you will be skipped over the waitlist should there be any conflicting classes."
                  status="NOTICE"
                  icon="alert"
                />
              </div>
            </div>

            <div>
              <SectionHeader title="My Information" href="/information" />
              <div className="space-y-4">
                <InfoCard
                  title="Immigration documents"
                  description="OGS needs your most up-to-date and accurate visa information to comply with government regulations."
                  status="REQUIRED"
                  icon="file"
                />
                <InfoCard
                  title="Complete immigration module"
                  description="OGS requires all students in F-1 and J-1 status to complete the US Immigration Requirements Training."
                  status="REQUIRED"
                  icon="pen"
                />
              </div>
            </div>

            <div>
              <SectionHeader title="Completed Items" />
              <div className="space-y-4">
                <InfoCard
                  title="Met course credit requirements"
                  description="You completed this requirement on May 16, 2024."
                  status="COMPLETED"
                  icon="check"
                />
                <InfoCard
                  title="Update personal information"
                  description="You completed this requirement on March 24, 2024."
                  status="COMPLETED"
                  icon="check"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

