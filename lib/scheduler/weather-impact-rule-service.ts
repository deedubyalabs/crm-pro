import { supabase, handleSupabaseError } from "../supabase"
import type {
  WeatherImpactRule,
  NewWeatherImpactRule,
  UpdateWeatherImpactRule,
} from "@/types/scheduler"

export const weatherImpactRuleService = {
  async createWeatherImpactRule(
    rule: NewWeatherImpactRule,
  ): Promise<WeatherImpactRule> {
    try {
      const { data, error } = await supabase
        .from("weather_impact_rules")
        .insert(rule)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  },

  async updateWeatherImpactRule(
    id: string,
    updates: UpdateWeatherImpactRule,
  ): Promise<WeatherImpactRule> {
    try {
      const { data, error } = await supabase
        .from("weather_impact_rules")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  },

  async deleteWeatherImpactRule(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from("weather_impact_rules")
        .delete()
        .eq("id", id)

      if (error) throw error
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  },
}
