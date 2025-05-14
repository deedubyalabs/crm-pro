import CalendarPageClient from "./calendar-page-client"

export const metadata = {
  title: "Calendar | HomePro One",
  description: "View and manage your schedule",
}

export default function CalendarPage({
  searchParams,
}: {
  searchParams: {
    month?: string
    year?: string
  }
}) {
  return <CalendarPageClient searchParams={searchParams} />
}
