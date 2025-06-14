import { supabase } from './supabase';
import type { Job, CreateJobPayload, UpdateJobPayload, JobChecklistItem, CreateJobChecklistItemPayload, UpdateJobChecklistItemPayload } from '../types/job';
import type { Database } from '../types/supabase'; // Import Database type

export class JobService {
  private supabase;

  constructor() {
    this.supabase = supabase;
  }

  async createJob(jobData: CreateJobPayload): Promise<Job | null> {
    const { data, error } = await this.supabase
      .from('jobs')
      .insert([jobData])
      .select()
      .single();

    if (error) {
      console.error('Error creating job:', error);
      throw error;
    }
    return data;
  }

  async getJobById(id: string): Promise<Job | null> {
    const { data, error } = await this.supabase
      .from('jobs')
      .select(`
        *,
        job_checklist_items(*)
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching job:', error);
      throw error;
    }
    return data;
  }

  async getJobs(filters?: { projectId?: string; assignedTo?: string; status?: Database["public"]["Enums"]["job_status"]; search?: string; startDate?: string; endDate?: string }): Promise<Job[]> {
    let query = this.supabase
      .from('jobs')
      .select(`
        *,
        people!jobs_assigned_to_fkey(first_name, last_name, business_name),
        projects(project_name),
        opportunities(opportunity_name)
      `);

    if (filters?.projectId) {
      query = query.eq('linked_project_id', filters.projectId);
    }
    if (filters?.assignedTo) {
      query = query.eq('assigned_to', filters.assignedTo);
    }
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.search) {
      query = query.ilike('name', `%${filters.search}%`);
    }
    if (filters?.startDate) {
      query = query.gte('scheduled_start_date', filters.startDate);
    }
    if (filters?.endDate) {
      query = query.lte('scheduled_end_date', filters.endDate);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching jobs:', error);
      throw error;
    }
    return data;
  }

  async updateJob(id: string, jobData: UpdateJobPayload): Promise<Job | null> {
    const { data, error } = await this.supabase
      .from('jobs')
      .update(jobData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating job:', error);
      throw error;
    }
    return data;
  }

  async deleteJob(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('jobs')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting job:', error);
      throw error;
    }
  }

  async createChecklistItem(checklistItemData: CreateJobChecklistItemPayload): Promise<JobChecklistItem | null> {
    const { data, error } = await this.supabase
      .from('job_checklist_items')
      .insert([checklistItemData])
      .select()
      .single();

    if (error) {
      console.error('Error creating checklist item:', error);
      throw error;
    }
    return data;
  }

  async updateChecklistItem(id: string, checklistItemData: UpdateJobChecklistItemPayload): Promise<JobChecklistItem | null> {
    const { data, error } = await this.supabase
      .from('job_checklist_items')
      .update(checklistItemData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating checklist item:', error);
      throw error;
    }
    return data;
  }

  async deleteChecklistItem(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('job_checklist_items')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting checklist item:', error);
      throw error;
    }
  }
}

export const jobService = new JobService();
