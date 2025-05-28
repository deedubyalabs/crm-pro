import { supabase } from "./supabase"

export async function inspectTable(tableName: string) {
  try {
    // Get the table definition
    const { data: tableInfo, error: tableError } = await supabase.rpc("inspect_table", {
      table_name: tableName,
    })

    if (tableError) {
      console.error(`Error inspecting table ${tableName}:`, tableError)
      return null
    }

    console.log(`Table ${tableName} schema:`, tableInfo)
    return tableInfo
  } catch (error) {
    console.error(`Error in schema inspection for ${tableName}:`, error)
    return null
  }
}

export async function listTables() {
  try {
    const { data, error } = await supabase.rpc('get_tables')

    if (error) {
      console.error("Error listing tables:", error)
      return []
    }

    console.log("Available tables:", data)
    return (data as Array<{ table_name: string }>).map((t) => t.table_name)
  } catch (error) {
    console.error("Error in listing tables:", error)
    return []
  }
}
