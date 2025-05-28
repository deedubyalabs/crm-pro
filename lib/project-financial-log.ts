import { supabase, handleSupabaseError } from "@/lib/supabase";
import type { NewProjectFinancialLog, ProjectFinancialLog, UpdateProjectFinancialLog } from "@/types/project-financial-log";

export const projectFinancialLogService = {
  async getProjectFinancialLogs(projectId: string): Promise<ProjectFinancialLog[]> {
    try {
      const { data, error } = await supabase
        .from("project_financial_log")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }
      return (data?.filter(item => item.created_at !== null) as ProjectFinancialLog[]) || [];
    } catch (error) {
      console.error("Error fetching project financial logs:", error);
      throw new Error(handleSupabaseError(error));
    }
  },

  async addProjectFinancialLog(logEntry: NewProjectFinancialLog): Promise<ProjectFinancialLog> {
    try {
      const { data, error } = await supabase
        .from("project_financial_log")
        .insert(logEntry)
        .select()
        .single();

      if (error || !data?.created_at) {
        throw new Error('Failed to create project financial log entry');
      }
      return data as ProjectFinancialLog;
    } catch (error) {
      console.error("Error adding project financial log entry:", error);
      throw new Error(handleSupabaseError(error));
    }
  },

  async updateProjectFinancialLog(id: string, updates: UpdateProjectFinancialLog): Promise<ProjectFinancialLog> {
    try {
      const { data, error } = await supabase
        .from("project_financial_log")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error || !data?.created_at) {
        throw new Error('Failed to update project financial log entry');
      }
      return data as ProjectFinancialLog;
    } catch (error) {
      console.error("Error updating project financial log entry:", error);
      throw new Error(handleSupabaseError(error));
    }
  },

  async deleteProjectFinancialLog(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from("project_financial_log")
        .delete()
        .eq("id", id);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error("Error deleting project financial log entry:", error);
      throw new Error(handleSupabaseError(error));
    }
  },
};
