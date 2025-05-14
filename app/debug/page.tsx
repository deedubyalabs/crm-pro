import { inspectTable, listTables } from "@/lib/schema-inspector"

export default async function DebugPage() {
  // List all tables
  const tables = await listTables()

  // Inspect the people table
  const peopleSchema = await inspectTable("people")

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Database Schema Debug</h1>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Available Tables</h2>
        {tables && tables.length > 0 ? (
          <ul className="list-disc pl-6">
            {tables.map((table) => (
              <li key={table}>{table}</li>
            ))}
          </ul>
        ) : (
          <p>No tables found or error occurred.</p>
        )}
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">People Table Schema</h2>
        {peopleSchema ? (
          <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96">{JSON.stringify(peopleSchema, null, 2)}</pre>
        ) : (
          <p>Could not retrieve schema for people table.</p>
        )}
      </div>
    </div>
  )
}
