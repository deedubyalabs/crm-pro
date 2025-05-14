import { Skeleton } from "@/components/ui/skeleton"

export default function CalendarViewSkeleton() {
  // Create a 6-week calendar grid (42 days)
  const days = Array.from({ length: 42 })

  return (
    <div className="calendar">
      <div className="grid grid-cols-7 gap-px bg-slate-200">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="bg-white p-2 text-center text-sm font-medium">
            {day}
          </div>
        ))}

        {days.map((_, index) => (
          <div key={index} className="bg-white p-2 min-h-[120px]">
            <div className="flex justify-between items-center mb-1">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-6 w-6 rounded-full" />
            </div>
            <div className="space-y-1">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
