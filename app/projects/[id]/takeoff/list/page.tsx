import TakeoffListPageClient from "./TakeoffListPageClient"

export const metadata = {
  title: "Project Takeoffs | HomePro One",
  description: "View and manage project takeoffs",
}

export default async function TakeoffListPage({ params }: { params: { id: string } }) {
  return <TakeoffListPageClient params={params} />
}
