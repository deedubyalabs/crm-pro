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
    const { data, error } = await supabase
      .from("information_schema.tables")
      .select("table_name")
      .eq("table_schema", "public")

    if (error) {
      console.error("Error listing tables:", error)
      return []
    }

    console.log("Available tables:", data)
    return data.map((t) => t.table_name)
  } catch (error) {
    console.error("Error in listing tables:", error)
    return []
  }
}
