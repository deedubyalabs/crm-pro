export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      activities: {
        Row: {
          activity_type: string | null
          assigned_to_user_id: string
          created_at: string | null
          description: string | null
          due_date: string | null
          end_time: string | null
          id: string
          is_all_day: boolean | null
          linked_opportunity_id: string | null
          linked_person_id: string | null
          linked_project_id: string | null
          location: string | null
          priority: string | null
          start_time: string | null
          status: string
          subject: string
          updated_at: string | null
        }
        Insert: {
          activity_type?: string | null
          assigned_to_user_id: string
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          end_time?: string | null
          id?: string
          is_all_day?: boolean | null
          linked_opportunity_id?: string | null
          linked_person_id?: string | null
          linked_project_id?: string | null
          location?: string | null
          priority?: string | null
          start_time?: string | null
          status: string
          subject: string
          updated_at?: string | null
        }
        Update: {
          activity_type?: string | null
          assigned_to_user_id?: string
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          end_time?: string | null
          id?: string
          is_all_day?: boolean | null
          linked_opportunity_id?: string | null
          linked_person_id?: string | null
          linked_project_id?: string | null
          location?: string | null
          priority?: string | null
          start_time?: string | null
          status?: string
          subject?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activities_activity_type_fkey"
            columns: ["activity_type"]
            isOneToOne: false
            referencedRelation: "activity_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_assigned_to_user_id_fkey"
            columns: ["assigned_to_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_linked_opportunity_id_fkey"
            columns: ["linked_opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_linked_person_id_fkey"
            columns: ["linked_person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_linked_project_id_fkey"
            columns: ["linked_project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      activity_attendees: {
        Row: {
          activity_id: string
          created_at: string | null
          id: string
          person_id: string
          updated_at: string | null
        }
        Insert: {
          activity_id: string
          created_at?: string | null
          id?: string
          person_id: string
          updated_at?: string | null
        }
        Update: {
          activity_id?: string
          created_at?: string | null
          id?: string
          person_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_attendees_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_attendees_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
        ]
      }
      activity_types: {
        Row: {
          created_at: string | null
          id: string
          is_default: boolean | null
          name: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          name: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          name?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_types_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_knowledge_sources: {
        Row: {
          agent_version_id: string
          created_at: string
          id: string
          knowledge_source_id: string
        }
        Insert: {
          agent_version_id: string
          created_at?: string
          id?: string
          knowledge_source_id: string
        }
        Update: {
          agent_version_id?: string
          created_at?: string
          id?: string
          knowledge_source_id?: string
        }
        Relationships: []
      }
      agent_tools: {
        Row: {
          agent_version_id: string
          created_at: string
          id: string
          tool_id: string
        }
        Insert: {
          agent_version_id: string
          created_at?: string
          id?: string
          tool_id: string
        }
        Update: {
          agent_version_id?: string
          created_at?: string
          id?: string
          tool_id?: string
        }
        Relationships: []
      }
      agents: {
        Row: {
          created_at: string
          description: string | null
          id: string
          model: string | null
          name: string
          status: string | null
          system_prompt: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          model?: string | null
          name: string
          status?: string | null
          system_prompt?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          model?: string | null
          name?: string
          status?: string | null
          system_prompt?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      appointments: {
        Row: {
          address: string | null
          appointment_type: string
          created_at: string
          end_time: string
          id: string
          notes: string | null
          opportunity_id: string | null
          person_id: string | null
          project_id: string | null
          start_time: string
          status: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          appointment_type: string
          created_at?: string
          end_time: string
          id?: string
          notes?: string | null
          opportunity_id?: string | null
          person_id?: string | null
          project_id?: string | null
          start_time: string
          status: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          appointment_type?: string
          created_at?: string
          end_time?: string
          id?: string
          notes?: string | null
          opportunity_id?: string | null
          person_id?: string | null
          project_id?: string | null
          start_time?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      bid_attachments: {
        Row: {
          bid_request_id: string | null
          bid_response_id: string | null
          created_at: string
          file_name: string
          file_path: string
          file_size: number
          file_type: string
          id: string
          updated_at: string
          uploaded_by: string | null
        }
        Insert: {
          bid_request_id?: string | null
          bid_response_id?: string | null
          created_at?: string
          file_name: string
          file_path: string
          file_size: number
          file_type: string
          id?: string
          updated_at?: string
          uploaded_by?: string | null
        }
        Update: {
          bid_request_id?: string | null
          bid_response_id?: string | null
          created_at?: string
          file_name?: string
          file_path?: string
          file_size?: number
          file_type?: string
          id?: string
          updated_at?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bid_attachments_bid_request_id_fkey"
            columns: ["bid_request_id"]
            isOneToOne: false
            referencedRelation: "bid_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bid_attachments_bid_response_id_fkey"
            columns: ["bid_response_id"]
            isOneToOne: false
            referencedRelation: "bid_responses"
            referencedColumns: ["id"]
          },
        ]
      }
      bid_items: {
        Row: {
          bid_request_id: string
          change_order_line_item_id: string | null
          created_at: string
          description: string
          estimate_line_item_id: string | null
          estimated_cost: number | null
          estimated_total: number | null
          id: string
          quantity: number
          sort_order: number
          unit: string
          updated_at: string
        }
        Insert: {
          bid_request_id: string
          change_order_line_item_id?: string | null
          created_at?: string
          description: string
          estimate_line_item_id?: string | null
          estimated_cost?: number | null
          estimated_total?: number | null
          id?: string
          quantity: number
          sort_order?: number
          unit: string
          updated_at?: string
        }
        Update: {
          bid_request_id?: string
          change_order_line_item_id?: string | null
          created_at?: string
          description?: string
          estimate_line_item_id?: string | null
          estimated_cost?: number | null
          estimated_total?: number | null
          id?: string
          quantity?: number
          sort_order?: number
          unit?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bid_items_bid_request_id_fkey"
            columns: ["bid_request_id"]
            isOneToOne: false
            referencedRelation: "bid_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bid_items_change_order_line_item_id_fkey"
            columns: ["change_order_line_item_id"]
            isOneToOne: false
            referencedRelation: "change_order_line_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bid_items_estimate_line_item_id_fkey"
            columns: ["estimate_line_item_id"]
            isOneToOne: false
            referencedRelation: "estimate_line_items"
            referencedColumns: ["id"]
          },
        ]
      }
      bid_requests: {
        Row: {
          awarded_at: string | null
          awarded_to: string | null
          change_order_id: string | null
          created_at: string
          created_by: string | null
          description: string | null
          due_date: string | null
          estimate_id: string | null
          id: string
          notes: string | null
          project_id: string
          sent_at: string | null
          status: string
          title: string
          trade_category: string | null
          updated_at: string
        }
        Insert: {
          awarded_at?: string | null
          awarded_to?: string | null
          change_order_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          estimate_id?: string | null
          id?: string
          notes?: string | null
          project_id: string
          sent_at?: string | null
          status?: string
          title: string
          trade_category?: string | null
          updated_at?: string
        }
        Update: {
          awarded_at?: string | null
          awarded_to?: string | null
          change_order_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          estimate_id?: string | null
          id?: string
          notes?: string | null
          project_id?: string
          sent_at?: string | null
          status?: string
          title?: string
          trade_category?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bid_requests_change_order_id_fkey"
            columns: ["change_order_id"]
            isOneToOne: false
            referencedRelation: "change_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bid_requests_estimate_id_fkey"
            columns: ["estimate_id"]
            isOneToOne: false
            referencedRelation: "estimates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bid_requests_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      bid_response_items: {
        Row: {
          bid_item_id: string
          bid_response_id: string
          created_at: string
          id: string
          notes: string | null
          total_price: number
          unit_price: number
          updated_at: string
        }
        Insert: {
          bid_item_id: string
          bid_response_id: string
          created_at?: string
          id?: string
          notes?: string | null
          total_price: number
          unit_price: number
          updated_at?: string
        }
        Update: {
          bid_item_id?: string
          bid_response_id?: string
          created_at?: string
          id?: string
          notes?: string | null
          total_price?: number
          unit_price?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bid_response_items_bid_item_id_fkey"
            columns: ["bid_item_id"]
            isOneToOne: false
            referencedRelation: "bid_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bid_response_items_bid_response_id_fkey"
            columns: ["bid_response_id"]
            isOneToOne: false
            referencedRelation: "bid_responses"
            referencedColumns: ["id"]
          },
        ]
      }
      bid_responses: {
        Row: {
          bid_request_id: string
          created_at: string
          estimated_duration: number | null
          estimated_start_date: string | null
          id: string
          notes: string | null
          status: string
          subcontractor_id: string
          total_amount: number
          updated_at: string
        }
        Insert: {
          bid_request_id: string
          created_at?: string
          estimated_duration?: number | null
          estimated_start_date?: string | null
          id?: string
          notes?: string | null
          status?: string
          subcontractor_id: string
          total_amount: number
          updated_at?: string
        }
        Update: {
          bid_request_id?: string
          created_at?: string
          estimated_duration?: number | null
          estimated_start_date?: string | null
          id?: string
          notes?: string | null
          status?: string
          subcontractor_id?: string
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bid_responses_bid_request_id_fkey"
            columns: ["bid_request_id"]
            isOneToOne: false
            referencedRelation: "bid_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bid_responses_subcontractor_id_fkey"
            columns: ["subcontractor_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
        ]
      }
      bid_subcontractors: {
        Row: {
          bid_request_id: string
          created_at: string
          declined_reason: string | null
          id: string
          invited_at: string
          notes: string | null
          responded_at: string | null
          status: string
          subcontractor_id: string
          updated_at: string
          viewed_at: string | null
        }
        Insert: {
          bid_request_id: string
          created_at?: string
          declined_reason?: string | null
          id?: string
          invited_at?: string
          notes?: string | null
          responded_at?: string | null
          status?: string
          subcontractor_id: string
          updated_at?: string
          viewed_at?: string | null
        }
        Update: {
          bid_request_id?: string
          created_at?: string
          declined_reason?: string | null
          id?: string
          invited_at?: string
          notes?: string | null
          responded_at?: string | null
          status?: string
          subcontractor_id?: string
          updated_at?: string
          viewed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bid_subcontractors_bid_request_id_fkey"
            columns: ["bid_request_id"]
            isOneToOne: false
            referencedRelation: "bid_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bid_subcontractors_subcontractor_id_fkey"
            columns: ["subcontractor_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
        ]
      }
      bids: {
        Row: {
          bid_amount: number
          bid_document_id: string | null
          bid_request_description: string | null
          change_order_id: string | null
          created_at: string
          estimate_id: string | null
          expiration_date: string | null
          id: string
          notes: string | null
          project_id: string | null
          status: string
          subcontractor_person_id: string
          submission_date: string
          updated_at: string
        }
        Insert: {
          bid_amount: number
          bid_document_id?: string | null
          bid_request_description?: string | null
          change_order_id?: string | null
          created_at?: string
          estimate_id?: string | null
          expiration_date?: string | null
          id?: string
          notes?: string | null
          project_id?: string | null
          status?: string
          subcontractor_person_id: string
          submission_date: string
          updated_at?: string
        }
        Update: {
          bid_amount?: number
          bid_document_id?: string | null
          bid_request_description?: string | null
          change_order_id?: string | null
          created_at?: string
          estimate_id?: string | null
          expiration_date?: string | null
          id?: string
          notes?: string | null
          project_id?: string | null
          status?: string
          subcontractor_person_id?: string
          submission_date?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bids_bid_document_id_fkey"
            columns: ["bid_document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bids_change_order_id_fkey"
            columns: ["change_order_id"]
            isOneToOne: false
            referencedRelation: "change_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bids_estimate_id_fkey"
            columns: ["estimate_id"]
            isOneToOne: false
            referencedRelation: "estimates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bids_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bids_subcontractor_person_id_fkey"
            columns: ["subcontractor_person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
        ]
      }
      bigbox_product_mappings: {
        Row: {
          bigbox_product_id: string
          cost_item_id: string
          created_at: string
          id: string
          last_synced_at: string | null
          quantity: number
          store_id: string
          updated_at: string
        }
        Insert: {
          bigbox_product_id: string
          cost_item_id: string
          created_at?: string
          id?: string
          last_synced_at?: string | null
          quantity?: number
          store_id: string
          updated_at?: string
        }
        Update: {
          bigbox_product_id?: string
          cost_item_id?: string
          created_at?: string
          id?: string
          last_synced_at?: string | null
          quantity?: number
          store_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bigbox_product_mappings_cost_item_id_fkey"
            columns: ["cost_item_id"]
            isOneToOne: false
            referencedRelation: "cost_items"
            referencedColumns: ["id"]
          },
        ]
      }
      change_order_line_items: {
        Row: {
          change_order_id: string
          created_at: string
          description: string
          has_bids: boolean | null
          id: string
          invoice_line_item_id: string | null
          is_billed: boolean
          quantity: number
          sort_order: number
          total: number
          trade_category: string | null
          unit: string
          unit_price: number
          updated_at: string
        }
        Insert: {
          change_order_id: string
          created_at?: string
          description: string
          has_bids?: boolean | null
          id?: string
          invoice_line_item_id?: string | null
          is_billed?: boolean
          quantity: number
          sort_order?: number
          total: number
          trade_category?: string | null
          unit: string
          unit_price: number
          updated_at?: string
        }
        Update: {
          change_order_id?: string
          created_at?: string
          description?: string
          has_bids?: boolean | null
          id?: string
          invoice_line_item_id?: string | null
          is_billed?: boolean
          quantity?: number
          sort_order?: number
          total?: number
          trade_category?: string | null
          unit?: string
          unit_price?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "change_order_line_items_change_order_id_fkey"
            columns: ["change_order_id"]
            isOneToOne: false
            referencedRelation: "change_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "change_order_line_items_invoice_line_item_id_fkey"
            columns: ["invoice_line_item_id"]
            isOneToOne: false
            referencedRelation: "invoice_line_items"
            referencedColumns: ["id"]
          },
        ]
      }
      change_orders: {
        Row: {
          approval_date: string | null
          approved_by_person_id: string | null
          change_order_number: string | null
          client_signature: string | null
          created_at: string
          created_by_user_id: string | null
          description: string
          id: string
          impact_on_timeline: number | null
          person_id: string | null
          project_id: string
          reason: string | null
          requested_by: string | null
          status: string
          title: string
          total_amount: number
          updated_at: string
        }
        Insert: {
          approval_date?: string | null
          approved_by_person_id?: string | null
          change_order_number?: string | null
          client_signature?: string | null
          created_at?: string
          created_by_user_id?: string | null
          description: string
          id?: string
          impact_on_timeline?: number | null
          person_id?: string | null
          project_id: string
          reason?: string | null
          requested_by?: string | null
          status?: string
          title: string
          total_amount?: number
          updated_at?: string
        }
        Update: {
          approval_date?: string | null
          approved_by_person_id?: string | null
          change_order_number?: string | null
          client_signature?: string | null
          created_at?: string
          created_by_user_id?: string | null
          description?: string
          id?: string
          impact_on_timeline?: number | null
          person_id?: string | null
          project_id?: string
          reason?: string | null
          requested_by?: string | null
          status?: string
          title?: string
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "change_orders_approved_by_person_id_fkey"
            columns: ["approved_by_person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "change_orders_created_by_user_id_fkey"
            columns: ["created_by_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "change_orders_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "change_orders_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      cost_item_groups: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      cost_items: {
        Row: {
          cost_item_group_id: string | null
          created_at: string
          default_markup: number
          description: string | null
          id: string
          is_active: boolean
          item_code: string
          last_price_sync: string | null
          name: string
          sync_with_bigbox: boolean | null
          type: Database["public"]["Enums"]["cost_item_type"]
          unit: string
          unit_cost: number
          updated_at: string
        }
        Insert: {
          cost_item_group_id?: string | null
          created_at?: string
          default_markup?: number
          description?: string | null
          id?: string
          is_active?: boolean
          item_code: string
          last_price_sync?: string | null
          name: string
          sync_with_bigbox?: boolean | null
          type: Database["public"]["Enums"]["cost_item_type"]
          unit: string
          unit_cost?: number
          updated_at?: string
        }
        Update: {
          cost_item_group_id?: string | null
          created_at?: string
          default_markup?: number
          description?: string | null
          id?: string
          is_active?: boolean
          item_code?: string
          last_price_sync?: string | null
          name?: string
          sync_with_bigbox?: boolean | null
          type?: Database["public"]["Enums"]["cost_item_type"]
          unit?: string
          unit_cost?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_cost_item_group"
            columns: ["cost_item_group_id"]
            isOneToOne: false
            referencedRelation: "cost_item_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_projects: {
        Row: {
          created_at: string | null
          customer_id: string
          id: string
          project_id: string
        }
        Insert: {
          created_at?: string | null
          customer_id: string
          id?: string
          project_id: string
        }
        Update: {
          created_at?: string | null
          customer_id?: string
          id?: string
          project_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_projects_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_projects_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_schedules: {
        Row: {
          contact_name: string | null
          contact_phone: string | null
          created_at: string | null
          delivery_window_end: string | null
          delivery_window_start: string | null
          id: string
          notes: string | null
          purchase_order_id: string
          scheduled_date: string
          status: string
          updated_at: string | null
        }
        Insert: {
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string | null
          delivery_window_end?: string | null
          delivery_window_start?: string | null
          id?: string
          notes?: string | null
          purchase_order_id: string
          scheduled_date: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string | null
          delivery_window_end?: string | null
          delivery_window_start?: string | null
          id?: string
          notes?: string | null
          purchase_order_id?: string
          scheduled_date?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "delivery_schedules_purchase_order_id_fkey"
            columns: ["purchase_order_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      document_shares: {
        Row: {
          access_level: string
          created_at: string | null
          document_id: string
          expires_at: string | null
          id: string
          person_id: string
        }
        Insert: {
          access_level?: string
          created_at?: string | null
          document_id: string
          expires_at?: string | null
          id?: string
          person_id: string
        }
        Update: {
          access_level?: string
          created_at?: string | null
          document_id?: string
          expires_at?: string | null
          id?: string
          person_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_shares_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_shares_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          change_order_id: string | null
          created_at: string
          created_by: string
          description: string | null
          document_type: string
          estimate_id: string | null
          file_size: number
          file_type: string
          file_url: string
          id: string
          invoice_id: string | null
          job_id: string | null
          metadata: Json | null
          name: string
          opportunity_id: string | null
          person_id: string | null
          project_id: string | null
          status: string
          tags: string[] | null
          updated_at: string
          version: number
        }
        Insert: {
          change_order_id?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          document_type: string
          estimate_id?: string | null
          file_size: number
          file_type: string
          file_url: string
          id?: string
          invoice_id?: string | null
          job_id?: string | null
          metadata?: Json | null
          name: string
          opportunity_id?: string | null
          person_id?: string | null
          project_id?: string | null
          status?: string
          tags?: string[] | null
          updated_at?: string
          version?: number
        }
        Update: {
          change_order_id?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          document_type?: string
          estimate_id?: string | null
          file_size?: number
          file_type?: string
          file_url?: string
          id?: string
          invoice_id?: string | null
          job_id?: string | null
          metadata?: Json | null
          name?: string
          opportunity_id?: string | null
          person_id?: string | null
          project_id?: string | null
          status?: string
          tags?: string[] | null
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "documents_change_order_id_fkey"
            columns: ["change_order_id"]
            isOneToOne: false
            referencedRelation: "change_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_estimate_id_fkey"
            columns: ["estimate_id"]
            isOneToOne: false
            referencedRelation: "estimates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      estimate_line_items: {
        Row: {
          assigned_to_user_id: string | null
          cost_item_id: string | null
          created_at: string
          description: string
          estimate_id: string
          has_bids: boolean | null
          id: string
          is_optional: boolean
          is_taxable: boolean
          markup: number
          quantity: number
          section_name: string | null
          sort_order: number
          total: number
          trade_category: string | null
          unit: string
          unit_cost: number
          updated_at: string
        }
        Insert: {
          assigned_to_user_id?: string | null
          cost_item_id?: string | null
          created_at?: string
          description: string
          estimate_id: string
          has_bids?: boolean | null
          id?: string
          is_optional?: boolean
          is_taxable?: boolean
          markup: number
          quantity: number
          section_name?: string | null
          sort_order?: number
          total: number
          trade_category?: string | null
          unit: string
          unit_cost: number
          updated_at?: string
        }
        Update: {
          assigned_to_user_id?: string | null
          cost_item_id?: string | null
          created_at?: string
          description?: string
          estimate_id?: string
          has_bids?: boolean | null
          id?: string
          is_optional?: boolean
          is_taxable?: boolean
          markup?: number
          quantity?: number
          section_name?: string | null
          sort_order?: number
          total?: number
          trade_category?: string | null
          unit?: string
          unit_cost?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "estimate_line_items_cost_item_id_fkey"
            columns: ["cost_item_id"]
            isOneToOne: false
            referencedRelation: "cost_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estimate_line_items_estimate_id_fkey"
            columns: ["estimate_id"]
            isOneToOne: false
            referencedRelation: "estimates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_assigned_to_user"
            columns: ["assigned_to_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      estimate_payment_schedules: {
        Row: {
          amount: number
          created_at: string
          description: string
          due_date: string | null
          due_days: number | null
          due_type: string
          estimate_id: string
          id: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          description: string
          due_date?: string | null
          due_days?: number | null
          due_type: string
          estimate_id: string
          id?: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string
          due_date?: string | null
          due_days?: number | null
          due_type?: string
          estimate_id?: string
          id?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "estimate_payment_schedules_estimate_id_fkey"
            columns: ["estimate_id"]
            isOneToOne: false
            referencedRelation: "estimates"
            referencedColumns: ["id"]
          },
        ]
      }
      estimates: {
        Row: {
          cover_sheet_details: string | null
          created_at: string
          created_by_user_id: string | null
          deposit_amount: number | null
          deposit_percentage: number | null
          deposit_required: boolean
          discount_amount: number | null
          discount_percentage: number | null
          discount_type: string | null
          discount_value: number | null
          estimate_number: string | null
          expiration_date: string | null
          id: string
          initial_invoice_id: string | null
          is_converted_to_project: boolean
          is_converted_to_pvb: boolean
          is_initial_invoice_generated: boolean
          issue_date: string | null
          notes: string | null
          opportunity_id: string
          person_id: string
          project_id: string | null
          requires_deposit: boolean
          project_values_blueprint_id: string | null
          scope_of_work: string | null
          status: Database["public"]["Enums"]["estimate_status"]
          subtotal_amount: number
          tax_rate_percentage: number | null
          terms_and_conditions: string | null
          total_amount: number
          updated_at: string
        }
        Insert: {
          cover_sheet_details?: string | null
          created_at?: string
          created_by_user_id?: string | null
          deposit_amount?: number | null
          deposit_percentage?: number | null
          deposit_required?: boolean
          discount_amount?: number | null
          discount_percentage?: number | null
          discount_type?: string | null
          discount_value?: number | null
          estimate_number?: string | null
          expiration_date?: string | null
          id?: string
          initial_invoice_id?: string | null
          is_converted_to_project?: boolean
          is_converted_to_pvb?: boolean
          is_initial_invoice_generated?: boolean
          issue_date?: string | null
          notes?: string | null
          opportunity_id: string
          person_id: string
          project_id?: string | null
          requires_deposit?: boolean
          project_values_blueprint_id?: string | null
          scope_of_work?: string | null
          status?: Database["public"]["Enums"]["estimate_status"]
          subtotal_amount?: number
          tax_rate_percentage?: number | null
          terms_and_conditions?: string | null
          total_amount?: number
          updated_at?: string
        }
        Update: {
          cover_sheet_details?: string | null
          created_at?: string
          created_by_user_id?: string | null
          deposit_amount?: number | null
          deposit_percentage?: number | null
          deposit_required?: boolean
          discount_amount?: number | null
          discount_percentage?: number | null
          discount_type?: string | null
          discount_value?: number | null
          estimate_number?: string | null
          expiration_date?: string | null
          id?: string
          initial_invoice_id?: string | null
          is_converted_to_project?: boolean
          is_converted_to_pvb?: boolean
          is_initial_invoice_generated?: boolean
          issue_date?: string | null
          notes?: string | null
          opportunity_id?: string
          person_id?: string
          project_id?: string | null
          requires_deposit?: boolean
          project_values_blueprint_id?: string | null
          scope_of_work?: string | null
          status?: Database["public"]["Enums"]["estimate_status"]
          subtotal_amount?: number
          tax_rate_percentage?: number | null
          terms_and_conditions?: string | null
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "estimates_created_by_user_id_fkey"
            columns: ["created_by_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estimates_initial_invoice_id_fkey"
            columns: ["initial_invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estimates_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estimates_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estimates_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estimates_project_values_blueprint_id_fkey"
            columns: ["project_values_blueprint_id"]
            isOneToOne: false
            referencedRelation: "project_values_blueprints"
            referencedColumns: ["id"]
          },
        ]
      }
      expense_categories: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      expenses: {
        Row: {
          amount: number
          billable: boolean | null
          billed: boolean
          category: string | null
          created_at: string
          created_by_user_id: string | null
          description: string
          expense_date: string
          id: string
          invoice_id: string | null
          notes: string | null
          person_id: string | null
          project_id: string | null
          receipt_url: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          billable?: boolean | null
          billed?: boolean
          category?: string | null
          created_at?: string
          created_by_user_id?: string | null
          description: string
          expense_date: string
          id?: string
          invoice_id?: string | null
          notes?: string | null
          person_id?: string | null
          project_id?: string | null
          receipt_url?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          billable?: boolean | null
          billed?: boolean
          category?: string | null
          created_at?: string
          created_by_user_id?: string | null
          description?: string
          expense_date?: string
          id?: string
          invoice_id?: string | null
          notes?: string | null
          person_id?: string | null
          project_id?: string | null
          receipt_url?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "expenses_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_line_items: {
        Row: {
          created_at: string
          description: string
          id: string
          invoice_id: string
          linked_change_order_id: string | null
          linked_expense_id: string | null
          linked_time_entry_id: string | null
          quantity: number
          sort_order: number
          total: number
          unit: string
          unit_price: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          invoice_id: string
          linked_change_order_id?: string | null
          linked_expense_id?: string | null
          linked_time_entry_id?: string | null
          quantity: number
          sort_order?: number
          total: number
          unit: string
          unit_price: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          invoice_id?: string
          linked_change_order_id?: string | null
          linked_expense_id?: string | null
          linked_time_entry_id?: string | null
          quantity?: number
          sort_order?: number
          total?: number
          unit?: string
          unit_price?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoice_line_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_line_items_linked_change_order_id_fkey"
            columns: ["linked_change_order_id"]
            isOneToOne: false
            referencedRelation: "change_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_line_items_linked_expense_id_fkey"
            columns: ["linked_expense_id"]
            isOneToOne: false
            referencedRelation: "expenses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_line_items_linked_time_entry_id_fkey"
            columns: ["linked_time_entry_id"]
            isOneToOne: false
            referencedRelation: "time_entries"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          amount_paid: number
          created_at: string
          created_by_user_id: string | null
          due_date: string | null
          id: string
          invoice_number: string | null
          is_paid_in_full: boolean
          issue_date: string | null
          linked_estimate_id: string | null
          notes: string | null
          person_id: string
          project_id: string | null
          status: string
          total_amount: number
          updated_at: string
        }
        Insert: {
          amount_paid?: number
          created_at?: string
          created_by_user_id?: string | null
          due_date?: string | null
          id?: string
          invoice_number?: string | null
          is_paid_in_full?: boolean
          issue_date?: string | null
          linked_estimate_id?: string | null
          notes?: string | null
          person_id: string
          project_id?: string | null
          status?: string
          total_amount?: number
          updated_at?: string
        }
        Update: {
          amount_paid?: number
          created_at?: string
          created_by_user_id?: string | null
          due_date?: string | null
          id?: string
          invoice_number?: string | null
          is_paid_in_full?: boolean
          issue_date?: string | null
          linked_estimate_id?: string | null
          notes?: string | null
          person_id?: string
          project_id?: string | null
          status?: string
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_created_by_user_id_fkey"
            columns: ["created_by_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_linked_estimate_id_fkey"
            columns: ["linked_estimate_id"]
            isOneToOne: false
            referencedRelation: "estimates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      job_checklist_items: {
        Row: {
          created_at: string
          description: string
          id: string
          is_complete: boolean
          job_id: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          is_complete?: boolean
          job_id: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          is_complete?: boolean
          job_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_checklist_items_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      job_dependencies: {
        Row: {
          created_at: string | null
          dependency_type: string | null
          id: string
          lag_time: number | null
          predecessor_job_id: string
          successor_job_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          dependency_type?: string | null
          id?: string
          lag_time?: number | null
          predecessor_job_id: string
          successor_job_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          dependency_type?: string | null
          id?: string
          lag_time?: number | null
          predecessor_job_id?: string
          successor_job_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      jobs: {
        Row: {
          actual_end_date: string | null
          actual_hours: number | null
          actual_start_date: string | null
          assigned_to: string | null
          created_at: string
          created_by_user_id: string | null
          description: string | null
          due_date: string | null
          due_time: string | null
          estimated_hours: number | null
          hourly_rate: number | null
          id: string
          linked_contact_id: string | null
          linked_opportunity_id: string | null
          name: string
          priority: string | null
          project_id: string
          scheduled_end_date: string | null
          scheduled_start_date: string | null
          sort_order: number
          status: Database["public"]["Enums"]["job_status"]
          tags: string[] | null
          updated_at: string
        }
        Insert: {
          actual_end_date?: string | null
          actual_hours?: number | null
          actual_start_date?: string | null
          assigned_to?: string | null
          created_at?: string
          created_by_user_id?: string | null
          description?: string | null
          due_date?: string | null
          due_time?: string | null
          estimated_hours?: number | null
          hourly_rate?: number | null
          id?: string
          linked_contact_id?: string | null
          linked_opportunity_id?: string | null
          name: string
          priority?: string | null
          project_id: string
          scheduled_end_date?: string | null
          scheduled_start_date?: string | null
          sort_order?: number
          status?: Database["public"]["Enums"]["job_status"]
          tags?: string[] | null
          updated_at?: string
        }
        Update: {
          actual_end_date?: string | null
          actual_hours?: number | null
          actual_start_date?: string | null
          assigned_to?: string | null
          created_at?: string
          created_by_user_id?: string | null
          description?: string | null
          due_date?: string | null
          due_time?: string | null
          estimated_hours?: number | null
          hourly_rate?: number | null
          id?: string
          linked_contact_id?: string | null
          linked_opportunity_id?: string | null
          name?: string
          priority?: string | null
          project_id?: string
          scheduled_end_date?: string | null
          scheduled_start_date?: string | null
          sort_order?: number
          status?: Database["public"]["Enums"]["job_status"]
          tags?: string[] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "jobs_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_created_by_user_id_fkey"
            columns: ["created_by_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_linked_contact_id_fkey"
            columns: ["linked_contact_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_linked_opportunity_id_fkey"
            columns: ["linked_opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_sources: {
        Row: {
          id: string
          name: string
        }
        Insert: {
          id?: string
          name: string
        }
        Update: {
          id?: string
          name?: string
        }
        Relationships: []
      }
      lead_stages: {
        Row: {
          id: string
          name: string
        }
        Insert: {
          id?: string
          name: string
        }
        Update: {
          id?: string
          name?: string
        }
        Relationships: []
      }
      logs: {
        Row: {
          created_at: string
          id: string
          level: string
          message: string
          metadata: Json | null
          source_id: string | null
          source_name: string | null
          source_type: string
          span_id: string | null
          timestamp: string
          trace_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          level: string
          message: string
          metadata?: Json | null
          source_id?: string | null
          source_name?: string | null
          source_type: string
          span_id?: string | null
          timestamp?: string
          trace_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          level?: string
          message?: string
          metadata?: Json | null
          source_id?: string | null
          source_name?: string | null
          source_type?: string
          span_id?: string | null
          timestamp?: string
          trace_id?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      material_list_items: {
        Row: {
          base_quantity: number
          cost_item_id: string | null
          created_at: string | null
          description: string
          id: string
          material_list_id: string
          notes: string | null
          quantity: number
          status: string | null
          supplier_id: string | null
          total_cost: number | null
          unit: string
          unit_cost: number | null
          updated_at: string | null
          waste_factor: number | null
        }
        Insert: {
          base_quantity: number
          cost_item_id?: string | null
          created_at?: string | null
          description: string
          id?: string
          material_list_id: string
          notes?: string | null
          quantity: number
          status?: string | null
          supplier_id?: string | null
          total_cost?: number | null
          unit: string
          unit_cost?: number | null
          updated_at?: string | null
          waste_factor?: number | null
        }
        Update: {
          base_quantity?: number
          cost_item_id?: string | null
          created_at?: string | null
          description?: string
          id?: string
          material_list_id?: string
          notes?: string | null
          quantity?: number
          status?: string | null
          supplier_id?: string | null
          total_cost?: number | null
          unit?: string
          unit_cost?: number | null
          updated_at?: string | null
          waste_factor?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "material_list_items_cost_item_id_fkey"
            columns: ["cost_item_id"]
            isOneToOne: false
            referencedRelation: "cost_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "material_list_items_material_list_id_fkey"
            columns: ["material_list_id"]
            isOneToOne: false
            referencedRelation: "material_lists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "material_list_items_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      material_lists: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          estimate_id: string | null
          id: string
          name: string
          project_id: string | null
          status: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          estimate_id?: string | null
          id?: string
          name: string
          project_id?: string | null
          status?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          estimate_id?: string | null
          id?: string
          name?: string
          project_id?: string | null
          status?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "material_lists_estimate_id_fkey"
            columns: ["estimate_id"]
            isOneToOne: false
            referencedRelation: "estimates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "material_lists_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      opportunities: {
        Row: {
          assigned_user_id: string | null
          created_at: string
          created_by_user_id: string | null
          description: string | null
          estimated_value: number | null
          id: string
          lead_score: number | null
          opportunity_name: string
          person_id: string
          probability: number | null
          requested_completion_date: string | null
          source: string | null
          status: Database["public"]["Enums"]["opportunity_status"]
          updated_at: string
        }
        Insert: {
          assigned_user_id?: string | null
          created_at?: string
          created_by_user_id?: string | null
          description?: string | null
          estimated_value?: number | null
          id?: string
          lead_score?: number | null
          opportunity_name: string
          person_id: string
          probability?: number | null
          requested_completion_date?: string | null
          source?: string | null
          status?: Database["public"]["Enums"]["opportunity_status"]
          updated_at?: string
        }
        Update: {
          assigned_user_id?: string | null
          created_at?: string
          created_by_user_id?: string | null
          description?: string | null
          estimated_value?: number | null
          id?: string
          lead_score?: number | null
          opportunity_name?: string
          person_id?: string
          probability?: number | null
          requested_completion_date?: string | null
          source?: string | null
          status?: Database["public"]["Enums"]["opportunity_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "opportunities_assigned_user_id_fkey"
            columns: ["assigned_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunities_created_by_user_id_fkey"
            columns: ["created_by_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunities_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_methods: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean
          is_online: boolean
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          is_online?: boolean
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          is_online?: boolean
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          created_by_user_id: string | null
          id: string
          invoice_id: string
          notes: string | null
          payment_date: string
          payment_method: string
          person_id: string
          project_id: string
          reference_number: string | null
          square_payment_id: string | null
          square_receipt_url: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          created_by_user_id?: string | null
          id?: string
          invoice_id: string
          notes?: string | null
          payment_date?: string
          payment_method: string
          person_id: string
          project_id: string
          reference_number?: string | null
          square_payment_id?: string | null
          square_receipt_url?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          created_by_user_id?: string | null
          id?: string
          invoice_id?: string
          notes?: string | null
          payment_date?: string
          payment_method?: string
          person_id?: string
          project_id?: string
          reference_number?: string | null
          square_payment_id?: string | null
          square_receipt_url?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_created_by_user_id_fkey"
            columns: ["created_by_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      people: {
        Row: {
          address_line1: string | null
          address_line2: string | null
          business_name: string | null
          city: string | null
          country: string | null
          created_at: string
          created_by_user_id: string | null
          email: string | null
          first_name: string | null
          google_contact_id: string | null
          id: string
          last_contacted_at: string | null
          last_name: string | null
          lead_source: string | null
          lead_stage: string | null
          notes: string | null
          person_type: Database["public"]["Enums"]["person_type"]
          phone: string | null
          postal_code: string | null
          square_customer_id: string | null
          state_province: string | null
          tags: string[] | null
          trade_categories: string[] | null
          updated_at: string
        }
        Insert: {
          address_line1?: string | null
          address_line2?: string | null
          business_name?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          created_by_user_id?: string | null
          email?: string | null
          first_name?: string | null
          google_contact_id?: string | null
          id?: string
          last_contacted_at?: string | null
          last_name?: string | null
          lead_source?: string | null
          lead_stage?: string | null
          notes?: string | null
          person_type: Database["public"]["Enums"]["person_type"]
          phone?: string | null
          postal_code?: string | null
          square_customer_id?: string | null
          state_province?: string | null
          tags?: string[] | null
          trade_categories?: string[] | null
          updated_at?: string
        }
        Update: {
          address_line1?: string | null
          address_line2?: string | null
          business_name?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          created_by_user_id?: string | null
          email?: string | null
          first_name?: string | null
          google_contact_id?: string | null
          id?: string
          last_contacted_at?: string | null
          last_name?: string | null
          lead_source?: string | null
          lead_stage?: string | null
          notes?: string | null
          person_type?: Database["public"]["Enums"]["person_type"]
          phone?: string | null
          postal_code?: string | null
          square_customer_id?: string | null
          state_province?: string | null
          tags?: string[] | null
          trade_categories?: string[] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "people_created_by_user_id_fkey"
            columns: ["created_by_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      project_financial_log: {
        Row: {
          amount_impact: number
          created_at: string | null
          created_by_user_id: string | null
          description: string | null
          id: string
          new_actual_cost: number | null
          new_budget_amount: number | null
          project_id: string | null
          transaction_id: string | null
          transaction_type: string
        }
        Insert: {
          amount_impact: number
          created_at?: string | null
          created_by_user_id?: string | null
          description?: string | null
          id?: string
          new_actual_cost?: number | null
          new_budget_amount?: number | null
          project_id?: string | null
          transaction_id?: string | null
          transaction_type: string
        }
        Update: {
          amount_impact?: number
          created_at?: string | null
          created_by_user_id?: string | null
          description?: string | null
          id?: string
          new_actual_cost?: number | null
          new_budget_amount?: number | null
          project_id?: string | null
          transaction_id?: string | null
          transaction_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_financial_log_created_by_user_id_fkey"
            columns: ["created_by_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_financial_log_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          actual_cost: number | null
          actual_end_date: string | null
          actual_profit: number
          actual_start_date: string | null
          budget_amount: number | null
          created_at: string
          created_by_user_id: string | null
          description: string | null
          estimate_id: string | null
          estimated_profit: number
          id: string
          notes: string | null
          opportunity_id: string | null
          person_id: string
          planned_end_date: string | null
          planned_start_date: string | null
          profit_margin_percentage: number
          project_address_line1: string | null
          project_address_line2: string | null
          project_city: string | null
          project_country: string | null
          project_name: string
          project_number: string | null
          project_postal_code: string | null
          project_state_province: string | null
          status: Database["public"]["Enums"]["project_status"]
          total_change_order_amount: number
          total_invoiced_amount: number
          total_payments_received: number
          updated_at: string
        }
        Insert: {
          actual_cost?: number | null
          actual_end_date?: string | null
          actual_profit?: number
          actual_start_date?: string | null
          budget_amount?: number | null
          created_at?: string
          created_by_user_id?: string | null
          description?: string | null
          estimate_id?: string | null
          estimated_profit?: number
          id?: string
          notes?: string | null
          opportunity_id?: string | null
          person_id: string
          planned_end_date?: string | null
          planned_start_date?: string | null
          profit_margin_percentage?: number
          project_address_line1?: string | null
          project_address_line2?: string | null
          project_city?: string | null
          project_country?: string | null
          project_name: string
          project_number?: string | null
          project_postal_code?: string | null
          project_state_province?: string | null
          status?: Database["public"]["Enums"]["project_status"]
          total_change_order_amount?: number
          total_invoiced_amount?: number
          total_payments_received?: number
          updated_at?: string
        }
        Update: {
          actual_cost?: number | null
          actual_end_date?: string | null
          actual_profit?: number
          actual_start_date?: string | null
          budget_amount?: number | null
          created_at?: string
          created_by_user_id?: string | null
          description?: string | null
          estimate_id?: string | null
          estimated_profit?: number
          id?: string
          notes?: string | null
          opportunity_id?: string | null
          person_id?: string
          planned_end_date?: string | null
          planned_start_date?: string | null
          profit_margin_percentage?: number
          project_address_line1?: string | null
          project_address_line2?: string | null
          project_city?: string | null
          project_country?: string | null
          project_name?: string
          project_number?: string | null
          project_postal_code?: string | null
          project_state_province?: string | null
          status?: Database["public"]["Enums"]["project_status"]
          total_change_order_amount?: number
          total_invoiced_amount?: number
          total_payments_received?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_created_by_user_id_fkey"
            columns: ["created_by_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_estimate_id_fkey"
            columns: ["estimate_id"]
            isOneToOne: true
            referencedRelation: "estimates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: true
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_order_items: {
        Row: {
          cost_item_id: string | null
          created_at: string | null
          description: string
          id: string
          material_list_item_id: string | null
          notes: string | null
          purchase_order_id: string
          quantity: number
          total_cost: number
          unit: string
          unit_cost: number
          updated_at: string | null
        }
        Insert: {
          cost_item_id?: string | null
          created_at?: string | null
          description: string
          id?: string
          material_list_item_id?: string | null
          notes?: string | null
          purchase_order_id: string
          quantity: number
          total_cost: number
          unit: string
          unit_cost: number
          updated_at?: string | null
        }
        Update: {
          cost_item_id?: string | null
          created_at?: string | null
          description?: string
          id?: string
          material_list_item_id?: string | null
          notes?: string | null
          purchase_order_id?: string
          quantity?: number
          total_cost?: number
          unit?: string
          unit_cost?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "purchase_order_items_cost_item_id_fkey"
            columns: ["cost_item_id"]
            isOneToOne: false
            referencedRelation: "cost_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_order_items_material_list_item_id_fkey"
            columns: ["material_list_item_id"]
            isOneToOne: false
            referencedRelation: "material_list_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_order_items_purchase_order_id_fkey"
            columns: ["purchase_order_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_orders: {
        Row: {
          created_at: string | null
          created_by: string | null
          delivery_date: string | null
          id: string
          issue_date: string | null
          material_list_id: string | null
          notes: string | null
          po_number: string
          project_id: string | null
          shipping_address_line1: string | null
          shipping_address_line2: string | null
          shipping_city: string | null
          shipping_country: string | null
          shipping_postal_code: string | null
          shipping_state_province: string | null
          status: string
          subtotal_amount: number
          supplier_id: string | null
          tax_amount: number
          total_amount: number
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          delivery_date?: string | null
          id?: string
          issue_date?: string | null
          material_list_id?: string | null
          notes?: string | null
          po_number: string
          project_id?: string | null
          shipping_address_line1?: string | null
          shipping_address_line2?: string | null
          shipping_city?: string | null
          shipping_country?: string | null
          shipping_postal_code?: string | null
          shipping_state_province?: string | null
          status?: string
          subtotal_amount?: number
          supplier_id?: string | null
          tax_amount?: number
          total_amount?: number
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          delivery_date?: string | null
          id?: string
          issue_date?: string | null
          material_list_id?: string | null
          notes?: string | null
          po_number?: string
          project_id?: string | null
          shipping_address_line1?: string | null
          shipping_address_line2?: string | null
          shipping_city?: string | null
          shipping_country?: string | null
          shipping_postal_code?: string | null
          shipping_state_province?: string | null
          status?: string
          subtotal_amount?: number
          supplier_id?: string | null
          tax_amount?: number
          total_amount?: number
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "purchase_orders_material_list_id_fkey"
            columns: ["material_list_id"]
            isOneToOne: false
            referencedRelation: "material_lists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_orders_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_orders_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          comment: string | null
          created_at: string
          google_review_id: string | null
          id: string
          person_id: string | null
          reply_comment: string | null
          reply_created_at: string | null
          reply_updated_at: string | null
          review_created_at: string
          review_updated_at: string | null
          reviewer_name: string | null
          reviewer_photo_url: string | null
          source: string
          star_rating: number
          updated_at: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          google_review_id?: string | null
          id?: string
          person_id?: string | null
          reply_comment?: string | null
          reply_created_at?: string | null
          reply_updated_at?: string | null
          review_created_at: string
          review_updated_at?: string | null
          reviewer_name?: string | null
          reviewer_photo_url?: string | null
          source?: string
          star_rating: number
          updated_at?: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          google_review_id?: string | null
          id?: string
          person_id?: string | null
          reply_comment?: string | null
          reply_created_at?: string | null
          reply_updated_at?: string | null
          review_created_at?: string
          review_updated_at?: string | null
          reviewer_name?: string | null
          reviewer_photo_url?: string | null
          source?: string
          star_rating?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
        ]
      }
      project_values_blueprint_items: {
        Row: {
          created_at: string | null
          description: string
          id: string
          invoice_line_item_id: string | null
          is_billed: boolean
          linked_change_order_line_item_id: string | null
          linked_estimate_line_item_id: string | null
          quantity: number
          sort_order: number
          pvb_id: string | null
          total: number
          unit: string
          unit_price: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description: string
          id?: string
          invoice_line_item_id?: string | null
          is_billed?: boolean
          linked_change_order_line_item_id?: string | null
          linked_estimate_line_item_id?: string | null
          quantity: number
          sort_order?: number
          pvb_id?: string | null
          total: number
          unit: string
          unit_price: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string
          id?: string
          invoice_line_item_id?: string | null
          is_billed?: boolean
          linked_change_order_line_item_id?: string | null
          linked_estimate_line_item_id?: string | null
          quantity?: number
          sort_order?: number
          pvb_id?: string | null
          total?: number
          unit?: string
          unit_price?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_values_blueprint_items_invoice_line_item_id_fkey"
            columns: ["invoice_line_item_id"]
            isOneToOne: false
            referencedRelation: "invoice_line_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_values_blueprint_items_linked_change_order_line_item_id_fkey"
            columns: ["linked_change_order_line_item_id"]
            isOneToOne: false
            referencedRelation: "change_order_line_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_values_blueprint_items_linked_estimate_line_item_id_fkey"
            columns: ["linked_estimate_line_item_id"]
            isOneToOne: false
            referencedRelation: "estimate_line_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_values_blueprint_items_pvb_id_fkey"
            columns: ["pvb_id"]
            isOneToOne: false
            referencedRelation: "project_values_blueprints"
            referencedColumns: ["id"]
          },
        ]
      }
      project_values_blueprints: {
        Row: {
          created_at: string | null
          estimate_id: string | null
          id: string
          name: string
          project_id: string | null
          status: string
          total_amount: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          estimate_id?: string | null
          id?: string
          name: string
          project_id?: string | null
          status?: string
          total_amount?: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          estimate_id?: string | null
          id?: string
          name?: string
          project_id?: string | null
          status?: string
          total_amount?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_values_blueprints_estimate_id_fkey"
            columns: ["estimate_id"]
            isOneToOne: false
            referencedRelation: "estimates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_values_blueprints_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      scheduling_conflicts: {
        Row: {
          affected_jobs: string[] | null
          affected_resources: string[] | null
          conflict_type: string
          created_at: string | null
          description: string | null
          id: string
          project_id: string | null
          resolution_description: string | null
          resolution_status: string | null
          updated_at: string | null
        }
        Insert: {
          affected_jobs?: string[] | null
          affected_resources?: string[] | null
          conflict_type: string
          created_at?: string | null
          description?: string | null
          id?: string
          project_id?: string | null
          resolution_description?: string | null
          resolution_status?: string | null
          updated_at?: string | null
        }
        Update: {
          affected_jobs?: string[] | null
          affected_resources?: string[] | null
          conflict_type?: string
          created_at?: string | null
          description?: string | null
          id?: string
          project_id?: string | null
          resolution_description?: string | null
          resolution_status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scheduling_conflicts_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      scheduling_constraints: {
        Row: {
          constraint_date: string
          constraint_type: string
          created_at: string | null
          id: string
          is_hard_constraint: boolean | null
          job_id: string | null
          notes: string | null
          project_id: string | null
          updated_at: string | null
        }
        Insert: {
          constraint_date: string
          constraint_type: string
          created_at?: string | null
          id?: string
          is_hard_constraint?: boolean | null
          job_id?: string | null
          notes?: string | null
          project_id?: string | null
          updated_at?: string | null
        }
        Update: {
          constraint_date?: string
          constraint_type?: string
          created_at?: string | null
          id?: string
          is_hard_constraint?: boolean | null
          job_id?: string | null
          notes?: string | null
          project_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scheduling_constraints_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      scheduling_history: {
        Row: {
          action_type: string
          changes: Json | null
          created_at: string | null
          description: string | null
          id: string
          project_id: string | null
          user_id: string | null
        }
        Insert: {
          action_type: string
          changes?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string
          project_id?: string | null
          user_id?: string | null
        }
        Update: {
          action_type?: string
          changes?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string
          project_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scheduling_history_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      suppliers: {
        Row: {
          address_line1: string | null
          address_line2: string | null
          city: string | null
          contact_name: string | null
          country: string | null
          created_at: string | null
          email: string | null
          id: string
          is_active: boolean | null
          name: string
          notes: string | null
          phone: string | null
          postal_code: string | null
          state_province: string | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          contact_name?: string | null
          country?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          notes?: string | null
          phone?: string | null
          postal_code?: string | null
          state_province?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          contact_name?: string | null
          country?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          notes?: string | null
          phone?: string | null
          postal_code?: string | null
          state_province?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      takeoffs: {
        Row: {
          created_at: string | null
          data: Json
          description: string | null
          id: string
          name: string
          project_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          data: Json
          description?: string | null
          id?: string
          name: string
          project_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          data?: Json
          description?: string | null
          id?: string
          name?: string
          project_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "takeoffs_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      task_templates: {
        Row: {
          created_at: string | null
          default_resources: Json | null
          description: string | null
          estimated_duration: number
          id: string
          name: string
          predecessor_templates: Json | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          default_resources?: Json | null
          description?: string | null
          estimated_duration: number
          id?: string
          name: string
          predecessor_templates?: Json | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          default_resources?: Json | null
          description?: string | null
          estimated_duration?: number
          id?: string
          name?: string
          predecessor_templates?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      time_entries: {
        Row: {
          billable: boolean
          billed: boolean
          created_at: string | null
          created_by_user_id: string | null
          date: string
          description: string | null
          hours: number
          id: string
          invoice_id: string | null
          job_id: string
          person_id: string
          project_id: string
          updated_at: string | null
        }
        Insert: {
          billable?: boolean
          billed?: boolean
          created_at?: string | null
          created_by_user_id?: string | null
          date: string
          description?: string | null
          hours: number
          id?: string
          invoice_id?: string | null
          job_id: string
          person_id: string
          project_id: string
          updated_at?: string | null
        }
        Update: {
          billable?: boolean
          billed?: boolean
          created_at?: string | null
          created_by_user_id?: string | null
          date?: string
          description?: string | null
          hours?: number
          id?: string
          invoice_id?: string | null
          job_id?: string
          person_id?: string
          project_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "time_entries_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_entries_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_entries_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_entries_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          first_name: string | null
          id: string
          last_name: string | null
          phone: string | null
          role: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          first_name?: string | null
          id: string
          last_name?: string | null
          phone?: string | null
          role?: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string
          email: string
          first_name: string | null
          hashed_password: string
          id: string
          is_active: boolean
          last_name: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          first_name?: string | null
          hashed_password: string
          id?: string
          is_active?: boolean
          last_name?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          first_name?: string | null
          hashed_password?: string
          id?: string
          is_active?: boolean
          last_name?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: []
      }
      voice_notes: {
        Row: {
          audio_url: string
          created_at: string | null
          duration: number
          id: string
          job_id: string | null
          project_id: string | null
          status: string
          title: string
          transcript: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          audio_url: string
          created_at?: string | null
          duration: number
          id?: string
          job_id?: string | null
          project_id?: string | null
          status?: string
          title: string
          transcript?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          audio_url?: string
          created_at?: string | null
          duration?: number
          id?: string
          job_id?: string | null
          project_id?: string | null
          status?: string
          title?: string
          transcript?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "voice_notes_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "voice_notes_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      weather_data: {
        Row: {
          created_at: string | null
          forecast_date: string
          id: string
          location_id: string
          precipitation_amount: number | null
          precipitation_probability: number | null
          source: string | null
          temperature_high: number | null
          temperature_low: number | null
          updated_at: string | null
          weather_condition: string | null
          wind_speed: number | null
        }
        Insert: {
          created_at?: string | null
          forecast_date: string
          id?: string
          location_id: string
          precipitation_amount?: number | null
          precipitation_probability?: number | null
          source?: string | null
          temperature_high?: number | null
          temperature_low?: number | null
          updated_at?: string | null
          weather_condition?: string | null
          wind_speed?: number | null
        }
        Update: {
          created_at?: string | null
          forecast_date?: string
          id?: string
          location_id?: string
          precipitation_amount?: number | null
          precipitation_probability?: number | null
          source?: string | null
          temperature_high?: number | null
          temperature_low?: number | null
          updated_at?: string | null
          weather_condition?: string | null
          wind_speed?: number | null
        }
        Relationships: []
      }
      weather_impact_rules: {
        Row: {
          created_at: string | null
          id: string
          impact_type: string
          impact_value: number
          notes: string | null
          precipitation_threshold: number | null
          task_template_id: string | null
          temperature_max: number | null
          temperature_min: number | null
          updated_at: string | null
          weather_condition: string
          wind_threshold: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          impact_type: string
          impact_value: number
          notes?: string | null
          precipitation_threshold?: number | null
          task_template_id?: string | null
          temperature_max?: number | null
          temperature_min?: number | null
          updated_at?: string | null
          weather_condition: string
          wind_threshold?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          impact_type?: string
          impact_value?: number
          notes?: string | null
          precipitation_threshold?: number | null
          task_template_id?: string | null
          temperature_max?: number | null
          temperature_min?: number | null
          updated_at?: string | null
          weather_condition?: string
          wind_threshold?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "weather_impact_rules_task_template_id_fkey"
            columns: ["task_template_id"]
            isOneToOne: false
            referencedRelation: "task_templates"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      binary_quantize: {
        Args: { "": string } | { "": unknown }
        Returns: unknown
      }
      execute_sql: {
        Args: { query: string; params?: Json }
        Returns: Json
      }
      get_all_agents: {
        Args: Record<PropertyKey, never>
        Returns: {
          created_at: string
          description: string | null
          id: string
          model: string | null
          name: string
          status: string | null
          system_prompt: string | null
          updated_at: string
          user_id: string
        }[]
      }
      halfvec_avg: {
        Args: { "": number[] }
        Returns: unknown
      }
      halfvec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      halfvec_send: {
        Args: { "": unknown }
        Returns: string
      }
      halfvec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      hnsw_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_sparsevec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnswhandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      is_development_mode: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      ivfflat_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflathandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      l2_norm: {
        Args: { "": unknown } | { "": unknown }
        Returns: number
      }
      l2_normalize: {
        Args: { "": string } | { "": unknown } | { "": unknown }
        Returns: string
      }
      set_active_agent_version: {
        Args: { p_agent_id: string; p_version_id: string; p_user_id: string }
        Returns: undefined
      }
      sparsevec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      sparsevec_send: {
        Args: { "": unknown }
        Returns: string
      }
      sparsevec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      vector_avg: {
        Args: { "": number[] }
        Returns: string
      }
      vector_dims: {
        Args: { "": string } | { "": unknown }
        Returns: number
      }
      vector_norm: {
        Args: { "": string }
        Returns: number
      }
      vector_out: {
        Args: { "": string }
        Returns: unknown
      }
      vector_send: {
        Args: { "": string }
        Returns: string
      }
      vector_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
    }
    Enums: {
      appointment_status:
        | "Scheduled"
        | "Completed"
        | "Canceled"
        | "Rescheduled"
        | "No Show"
      bid_response_status:
        | "submitted"
        | "under_review"
        | "clarification_needed"
        | "accepted"
        | "rejected"
      bid_status:
        | "draft"
        | "sent"
        | "viewed"
        | "responded"
        | "awarded"
        | "declined"
        | "expired"
        | "cancelled"
      change_order_status:
        | "Draft"
        | "Pending Approval"
        | "Approved"
        | "Rejected"
        | "Implemented"
        | "Canceled"
      cost_item_type:
        | "Material"
        | "Labor"
        | "Equipment"
        | "Subcontractor"
        | "Overhead"
        | "Other"
      document_type:
        | "Contract"
        | "Invoice"
        | "Estimate"
        | "Change Order"
        | "Permit"
        | "Drawing"
        | "Specification"
        | "Photo"
        | "Form"
        | "Checklist"
        | "Receipt"
        | "Other"
      estimate_status:
        | "Draft"
        | "Sent"
        | "Viewed"
        | "Accepted"
        | "Rejected"
        | "Expired"
        | "Revised"
      expense_status: "Pending" | "Approved" | "Rejected" | "Paid"
      invoice_status:
        | "Draft"
        | "Sent"
        | "Partially Paid"
        | "Paid"
        | "Overdue"
        | "Void"
      job_status:
        | "Pending"
        | "Scheduled"
        | "In Progress"
        | "Blocked"
        | "Completed"
        | "Canceled"
        | "not_started"
        | "in_progress"
        | "delayed"
        | "cancelled"
      opportunity_status:
        | "New Lead"
        | "Contact Attempted"
        | "Contacted"
        | "Needs Scheduling"
        | "Appointment Scheduled"
        | "Needs Estimate"
        | "Estimate Sent"
        | "Estimate Accepted"
        | "Estimate Rejected"
        | "On Hold"
        | "Lost"
      payment_method:
        | "Credit Card"
        | "Bank Transfer"
        | "Cash"
        | "Check"
        | "Square"
        | "Other"
      payment_status:
        | "Completed"
        | "Pending"
        | "Failed"
        | "Refunded"
        | "Partially Refunded"
      person_type:
        | "Lead"
        | "Customer"
        | "Business"
        | "Subcontractor"
        | "Employee"
      project_status:
        | "Pending Start"
        | "Planning"
        | "In Progress"
        | "On Hold"
        | "Awaiting Change Order Approval"
        | "Nearing Completion"
        | "Completed"
        | "Canceled"
      trade_category:
        | "general"
        | "electrical"
        | "plumbing"
        | "hvac"
        | "carpentry"
        | "masonry"
        | "roofing"
        | "flooring"
        | "painting"
        | "landscaping"
        | "concrete"
        | "drywall"
        | "insulation"
        | "windows_doors"
        | "siding"
        | "cleaning"
        | "demolition"
        | "excavation"
        | "other"
      user_role: "Admin" | "Manager" | "Sales" | "Technician" | "AgentService"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      appointment_status: [
        "Scheduled",
        "Completed",
        "Canceled",
        "Rescheduled",
        "No Show",
      ],
      bid_response_status: [
        "submitted",
        "under_review",
        "clarification_needed",
        "accepted",
        "rejected",
      ],
      bid_status: [
        "draft",
        "sent",
        "viewed",
        "responded",
        "awarded",
        "declined",
        "expired",
        "cancelled",
      ],
      change_order_status: [
        "Draft",
        "Pending Approval",
        "Approved",
        "Rejected",
        "Implemented",
        "Canceled",
      ],
      cost_item_type: [
        "Material",
        "Labor",
        "Equipment",
        "Subcontractor",
        "Overhead",
        "Other",
      ],
      document_type: [
        "Contract",
        "Invoice",
        "Estimate",
        "Change Order",
        "Permit",
        "Drawing",
        "Specification",
        "Photo",
        "Form",
        "Checklist",
        "Receipt",
        "Other",
      ],
      estimate_status: [
        "Draft",
        "Sent",
        "Viewed",
        "Accepted",
        "Rejected",
        "Expired",
        "Revised",
      ],
      expense_status: ["Pending", "Approved", "Rejected", "Paid"],
      invoice_status: [
        "Draft",
        "Sent",
        "Partially Paid",
        "Paid",
        "Overdue",
        "Void",
      ],
      job_status: [
        "Pending",
        "Scheduled",
        "In Progress",
        "Blocked",
        "Completed",
        "Canceled",
        "not_started",
        "in_progress",
        "delayed",
        "cancelled",
      ],
      opportunity_status: [
        "New Lead",
        "Contact Attempted",
        "Contacted",
        "Needs Scheduling",
        "Appointment Scheduled",
        "Needs Estimate",
        "Estimate Sent",
        "Estimate Accepted",
        "Estimate Rejected",
        "On Hold",
        "Lost",
      ],
      payment_method: [
        "Credit Card",
        "Bank Transfer",
        "Cash",
        "Check",
        "Square",
        "Other",
      ],
      payment_status: [
        "Completed",
        "Pending",
        "Failed",
        "Refunded",
        "Partially Refunded",
      ],
      person_type: [
        "Lead",
        "Customer",
        "Business",
        "Subcontractor",
        "Employee",
      ],
      project_status: [
        "Pending Start",
        "Planning",
        "In Progress",
        "On Hold",
        "Awaiting Change Order Approval",
        "Nearing Completion",
        "Completed",
        "Canceled",
      ],
      trade_category: [
        "general",
        "electrical",
        "plumbing",
        "hvac",
        "carpentry",
        "masonry",
        "roofing",
        "flooring",
        "painting",
        "landscaping",
        "concrete",
        "drywall",
        "insulation",
        "windows_doors",
        "siding",
        "cleaning",
        "demolition",
        "excavation",
        "other",
      ],
      user_role: ["Admin", "Manager", "Sales", "Technician", "AgentService"],
    },
  },
} as const
