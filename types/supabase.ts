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
        Relationships: [
          {
            foreignKeyName: "agent_knowledge_sources_agent_version_id_fkey"
            columns: ["agent_version_id"]
            isOneToOne: false
            referencedRelation: "agent_versions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_knowledge_sources_knowledge_source_id_fkey"
            columns: ["knowledge_source_id"]
            isOneToOne: false
            referencedRelation: "knowledge_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_memory_configurations: {
        Row: {
          agent_version_id: string
          created_at: string
          id: string
          memory_configuration_id: string
        }
        Insert: {
          agent_version_id: string
          created_at?: string
          id?: string
          memory_configuration_id: string
        }
        Update: {
          agent_version_id?: string
          created_at?: string
          id?: string
          memory_configuration_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_memory_configurations_agent_version_id_fkey"
            columns: ["agent_version_id"]
            isOneToOne: false
            referencedRelation: "agent_versions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_memory_configurations_memory_configuration_id_fkey"
            columns: ["memory_configuration_id"]
            isOneToOne: false
            referencedRelation: "memory_configurations"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_messages: {
        Row: {
          content: string | null
          id: string
          metadata: Json | null
          name: string | null
          role: string
          run_id: string
          timestamp: string
          tool_call_id: string | null
          tool_calls: Json | null
        }
        Insert: {
          content?: string | null
          id?: string
          metadata?: Json | null
          name?: string | null
          role: string
          run_id: string
          timestamp?: string
          tool_call_id?: string | null
          tool_calls?: Json | null
        }
        Update: {
          content?: string | null
          id?: string
          metadata?: Json | null
          name?: string | null
          role?: string
          run_id?: string
          timestamp?: string
          tool_call_id?: string | null
          tool_calls?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_messages_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "agent_runs"
            referencedColumns: ["run_id"]
          },
        ]
      }
      agent_runs: {
        Row: {
          agent_name: string | null
          end_time: string | null
          error: string | null
          id: string
          input: Json | null
          metadata: Json | null
          output: Json | null
          parent_run_id: string | null
          run_id: string
          session_id: string
          start_time: string
          status: string | null
        }
        Insert: {
          agent_name?: string | null
          end_time?: string | null
          error?: string | null
          id?: string
          input?: Json | null
          metadata?: Json | null
          output?: Json | null
          parent_run_id?: string | null
          run_id: string
          session_id: string
          start_time?: string
          status?: string | null
        }
        Update: {
          agent_name?: string | null
          end_time?: string | null
          error?: string | null
          id?: string
          input?: Json | null
          metadata?: Json | null
          output?: Json | null
          parent_run_id?: string | null
          run_id?: string
          session_id?: string
          start_time?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_runs_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "agent_sessions"
            referencedColumns: "session_id"
          },
        ]
      }
      agent_sessions: {
        Row: {
          agent_name: string | null
          created_at: string
          id: string
          metadata: Json | null
          session_id: string
          session_state: Json | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          agent_name?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          session_id: string
          session_state?: Json | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          agent_name?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          session_id?: string
          session_state?: Json | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      agent_storage_configurations: {
        Row: {
          agent_version_id: string
          created_at: string
          id: string
          storage_configuration_id: string
        }
        Insert: {
          agent_version_id: string
          created_at?: string
          id?: string
          storage_configuration_id: string
        }
        Update: {
          agent_version_id?: string
          created_at?: string
          id?: string
          storage_configuration_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_storage_configurations_agent_version_id_fkey"
            columns: ["agent_version_id"]
            isOneToOne: false
            referencedRelation: "agent_versions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_storage_configurations_storage_configuration_id_fkey"
            columns: ["storage_configuration_id"]
            isOneToOne: false
            referencedRelation: "storage_configurations"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_team_members: {
        Row: {
          agent_id: string
          created_at: string | null
          id: string
          role: string
          team_id: string
        }
        Insert: {
          agent_id: string
          created_at?: string | null
          id?: string
          role?: string
          team_id: string
        }
        Update: {
          agent_id?: string
          created_at?: string | null
          id?: string
          role?: string
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_team_members_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_team_members_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "agent_teams"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_teams: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          updated_at?: string | null
          user_id?: string
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
        Relationships: [
          {
            foreignKeyName: "agent_tools_agent_version_id_fkey"
            columns: ["agent_version_id"]
            isOneToOne: false
            referencedRelation: "agent_versions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_tools_tool_id_fkey"
            columns: ["tool_id"]
            isOneToOne: false
            referencedRelation: "tools"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_versions: {
        Row: {
          agent_id: string
          config: Json
          created_at: string
          id: string
          is_active: boolean
          user_id: string
          version: number
        }
        Insert: {
          agent_id: string
          config: Json
          created_at?: string
          id?: string
          is_active?: boolean
          user_id: string
          version: number
        }
        Update: {
          agent_id?: string
          config?: Json
          created_at?: string
          id?: string
          is_active?: boolean
          user_id?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "agent_versions_agent_id_fkey"
            columns: "agent_id"
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      agents: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ai_conversations: {
        Row: {
          created_at: string | null
          entity_id: string | null
          entity_type: string | null
          id: string
          title: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      ai_messages: {
        Row: {
          content: string | null
          conversation_id: string | null
          created_at: string | null
          id: string
          sender_id: string | null
          sender_type: string
        }
        Insert: {
          content?: string | null
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          sender_id?: string | null
          sender_type: string
        }
        Update: {
          content?: string | null
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          sender_id?: string | null
          sender_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "ai_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      appointments: {
        Row: {
          address: string | null
          appointment_type: string
          created_at: string
          created_by_user_id: string | null
          end_time: string
          id: string
          notes: string | null
          opportunity_id: string | null
          person_id: string
          project_id: string | null
          start_time: string
          status: Database["public"]["Enums"]["appointment_status"]
          updated_at: string
        }
        Insert: {
          address?: string | null
          appointment_type: string
          created_at?: string
          created_by_user_id?: string | null
          end_time: string
          id?: string
          notes?: string | null
          opportunity_id?: string | null
          person_id: string
          project_id?: string | null
          start_time: string
          status?: Database["public"]["Enums"]["appointment_status"]
          updated_at?: string
        }
        Update: {
          address?: string | null
          appointment_type?: string
          created_at?: string
          created_by_user_id?: string | null
          end_time?: string
          id?: string
          notes?: string | null
          opportunity_id?: string | null
          person_id?: string
          project_id?: string | null
          start_time?: string
          status?: Database["public"]["Enums"]["appointment_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_created_by_user_id_fkey"
            columns: ["created_by_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
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
            columns: "change_order_line_item_id"
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
            columns: "bid_request_id"
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
      call_recordings: {
        Row: {
          call_id: string
          created_at: string | null
          duration: number
          file_path: string
          id: string
          transcription: string | null
          updated_at: string | null
        }
        Insert: {
          call_id: string
          created_at?: string | null
          duration: number
          file_path: string
          id?: string
          transcription?: string | null
          updated_at?: string | null
        }
        Update: {
          call_id?: string
          created_at?: string | null
          duration?: number
          file_path?: string
          id?: string
          transcription?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "call_recordings_call_id_fkey"
            columns: ["call_id"]
            isOneToOne: false
            referencedRelation: "calls"
            referencedColumns: ["id"]
          },
        ]
      }
      calls: {
        Row: {
          caller_id: string | null
          caller_type: string | null
          conversation_id: string | null
          created_at: string | null
          direction: string
          duration: number | null
          ended_at: string | null
          id: string
          notes: string | null
          recipient_id: string | null
          recipient_type: string | null
          started_at: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          caller_id?: string | null
          caller_type?: string | null
          conversation_id?: string | null
          created_at?: string | null
          direction: string
          duration?: number | null
          ended_at?: string | null
          id?: string
          notes?: string | null
          recipient_id?: string | null
          recipient_type?: string | null
          started_at?: string | null
          status: string
          updated_at?: string | null
        }
        Update: {
          caller_id?: string | null
          caller_type?: string | null
          conversation_id?: string | null
          created_at?: string | null
          direction?: string
          duration?: number | null
          ended_at?: string | null
          id?: string
          notes?: string | null
          recipient_id?: string | null
          recipient_type?: string | null
          started_at?: string | null
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "calls_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
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
        ]
      }
      change_orders: {
        Row: {
          approval_date: string | null
          change_order_number: string | null
          created_at: string
          created_by_user_id: string | null
          description: string
          id: string
          impact_on_timeline: number | null
          project_id: string
          reason: string | null
          requested_by: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          approval_date?: string | null
          change_order_number?: string | null
          created_at?: string
          created_by_user_id?: string | null
          description: string
          id?: string
          impact_on_timeline?: number | null
          project_id: string
          reason?: string | null
          requested_by?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          approval_date?: string | null
          change_order_number?: string | null
          created_at?: string
          created_by_user_id?: string | null
          description?: string
          id?: string
          impact_on_timeline?: number | null
          project_id?: string
          reason?: string | null
          requested_by?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "change_orders_created_by_user_id_fkey"
            columns: ["created_by_user_id"]
            isOneToOne: false
            referencedRelation: "users"
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
      client_portal_activities: {
        Row: {
          created_at: string | null
          details: Json | null
          id: string
          ip_address: string | null
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: string | null
          type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: string | null
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_portal_activities_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "client_portal_users"
            referencedColumns: ["id"]
          },
        ]
      }
      client_portal_invitations: {
        Row: {
          accepted_at: string | null
          created_at: string | null
          created_by: string | null
          customer_id: string
          email: string
          expires_at: string
          id: string
          token: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string | null
          created_by?: string | null
          customer_id: string
          email: string
          expires_at: string
          id?: string
          token: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string | null
          created_by?: string | null
          customer_id?: string
          email?: string
          expires_at?: string
          id?: string
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_portal_invitations_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_portal_invitations_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
        ]
      }
      client_portal_notifications: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          link: string | null
          message: string
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          link?: string | null
          message: string
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          link?: string | null
          message?: string
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_portal_notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "client_portal_users"
            referencedColumns: ["id"]
          },
        ]
      }
      client_portal_sessions: {
        Row: {
          created_at: string | null
          expires_at: string
          id: string
          ip_address: string | null
          token: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          expires_at: string
          id?: string
          ip_address?: string | null
          token: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string
          id?: string
          ip_address?: string | null
          token?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_portal_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "client_portal_users"
            referencedColumns: ["id"]
          },
        ]
      }
      client_portal_settings: {
        Row: {
          company_id: string
          created_at: string | null
          enable_document_signing: boolean | null
          enable_messaging: boolean | null
          enable_payments: boolean | null
          enable_project_updates: boolean | null
          id: string
          logo_url: string | null
          portal_name: string
          primary_color: string | null
          privacy_policy: string | null
          terms_and_conditions: string | null
          updated_at: string | null
        }
        Insert: {
          company_id: string
          created_at?: string | null
          enable_document_signing?: boolean | null
          enable_messaging?: boolean | null
          enable_payments?: boolean | null
          enable_project_updates?: boolean | null
          id?: string
          logo_url?: string | null
          portal_name?: string
          primary_color?: string | null
          privacy_policy?: string | null
          terms_and_conditions?: string | null
          updated_at?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string | null
          enable_document_signing?: boolean | null
          enable_messaging?: boolean | null
          enable_payments?: boolean | null
          enable_project_updates?: boolean | null
          id?: string
          logo_url?: string | null
          portal_name?: string
          primary_color?: string | null
          privacy_policy?: string | null
          terms_and_conditions?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      client_portal_users: {
        Row: {
          created_at: string | null
          customer_id: string
          email: string
          first_name: string | null
          id: string
          is_active: boolean | null
          last_login_at: string | null
          last_name: string | null
          password_hash: string
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          customer_id: string
          email: string
          first_name?: string | null
          id?: string
          is_active?: boolean | null
          last_login_at?: string | null
          last_name?: string | null
          password_hash: string
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          customer_id?: string
          email?: string
          first_name?: string | null
          id?: string
          is_active?: boolean | null
          last_login_at?: string | null
          last_name?: string | null
          password_hash?: string
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_portal_users_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
        ]
      }
      communication_templates: {
        Row: {
          content: string
          created_at: string | null
          id: string
          is_global: boolean | null
          title: string
          type: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          is_global?: boolean | null
          title: string
          type: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          is_global?: boolean | null
          title?: string
          type?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "communication_templates_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_participants: {
        Row: {
          conversation_id: string
          customer_id: string | null
          id: string
          joined_at: string | null
          last_read_at: string | null
          left_at: string | null
          type: string
          user_id: string | null
        }
        Insert: {
          conversation_id: string
          customer_id?: string | null
          id?: string
          joined_at?: string | null
          last_read_at?: string | null
          left_at?: string | null
          type: string
          user_id?: string | null
        }
        Update: {
          conversation_id?: string
          customer_id?: string | null
          id?: string
          joined_at?: string | null
          last_read_at?: string | null
          left_at?: string | null
          type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversation_participants_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversation_participants_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversation_participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          archived_at: string | null
          created_at: string | null
          customer_id: string | null
          id: string
          last_message_at: string | null
          project_id: string | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          archived_at?: string | null
          created_at?: string | null
          customer_id?: string | null
          id?: string
          last_message_at?: string | null
          project_id?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          archived_at?: string | null
          created_at?: string | null
          customer_id?: string | null
          id?: string
          last_message_at?: string | null
          project_id?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversations_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      cost_items: {
        Row: {
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
        Relationships: []
      }
      customer_memberships: {
        Row: {
          auto_renew: boolean | null
          cancellation_date: string | null
          cancellation_reason: string | null
          created_at: string | null
          customer_id: string
          end_date: string
          id: string
          last_payment_date: string | null
          next_payment_date: string | null
          payment_frequency: string
          start_date: string
          status: string
          tier_id: string
          updated_at: string | null
        }
        Insert: {
          auto_renew?: boolean | null
          cancellation_date?: string | null
          cancellation_reason?: string | null
          created_at?: string | null
          customer_id: string
          end_date: string
          id?: string
          last_payment_date?: string | null
          next_payment_date?: string | null
          payment_frequency: string
          start_date: string
          status: string
          tier_id: string
          updated_at?: string | null
        }
        Update: {
          auto_renew?: boolean | null
          cancellation_date?: string | null
          cancellation_reason?: string | null
          created_at?: string | null
          customer_id?: string
          end_date?: string
          id?: string
          last_payment_date?: string | null
          next_payment_date?: string | null
          payment_frequency?: string
          start_date?: string
          status?: string
          tier_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_memberships_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_memberships_tier_id_fkey"
            columns: ["tier_id"]
            isOneToOne: false
            referencedRelation: "membership_tiers"
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
      customer_rewards_accounts: {
        Row: {
          created_at: string | null
          current_points: number
          customer_id: string
          enrollment_date: string
          id: string
          last_activity_date: string | null
          lifetime_points: number
          program_id: string
          status: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          current_points?: number
          customer_id: string
          enrollment_date: string
          id?: string
          last_activity_date?: string | null
          lifetime_points?: number
          program_id: string
          status: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          current_points?: number
          customer_id?: string
          enrollment_date?: string
          id?: string
          last_activity_date?: string | null
          lifetime_points?: number
          program_id?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_rewards_accounts_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_rewards_accounts_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "rewards_programs"
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
      email_integrations: {
        Row: {
          access_token: string | null
          created_at: string | null
          email_address: string
          id: string
          is_active: boolean | null
          provider: string
          refresh_token: string | null
          token_expires_at: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          access_token?: string | null
          created_at?: string | null
          email_address: string
          id?: string
          is_active?: boolean | null
          provider: string
          refresh_token?: string | null
          token_expires_at?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          access_token?: string | null
          created_at?: string | null
          email_address?: string
          id?: string
          is_active?: boolean | null
          provider?: string
          refresh_token?: string | null
          token_expires_at?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_integrations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      estimate_line_items: {
        Row: {
          cost_item_id: string | null
          created_at: string
          description: string
          estimate_id: string
          has_bids: boolean | null
          id: string
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
          cost_item_id?: string | null
          created_at?: string
          description: string
          estimate_id: string
          has_bids?: boolean | null
          id?: string
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
          cost_item_id?: string | null
          created_at?: string
          description?: string
          estimate_id?: string
          has_bids?: boolean | null
          id?: string
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
          issue_date: string | null
          notes: string | null
          opportunity_id: string
          person_id: string
          requires_deposit: boolean
          status: Database["public"]["Enums"]["estimate_status"]
          subtotal_amount: number
          tax_rate_percentage: number | null
          total_amount: number
          updated_at: string
        }
        Insert: {
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
          issue_date?: string | null
          notes?: string | null
          opportunity_id: string
          person_id: string
          requires_deposit?: boolean
          status?: Database["public"]["Enums"]["estimate_status"]
          subtotal_amount?: number
          tax_rate_percentage?: number | null
          total_amount?: number
          updated_at?: string
        }
        Update: {
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
          issue_date?: string | null
          notes?: string | null
          opportunity_id?: string
          person_id?: string
          requires_deposit?: boolean
          status?: Database["public"]["Enums"]["estimate_status"]
          subtotal_amount?: number
          tax_rate_percentage?: number | null
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
          issue_date: string | null
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
          issue_date?: string | null
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
          issue_date?: string | null
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
      knowledge_sources: {
        Row: {
          config: Json
          created_at: string
          description: string | null
          id: string
          name: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          config: Json
          created_at?: string
          description?: string | null
          id?: string
          name: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          config?: Json
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      langtrace_config: {
        Row: {
          api_key: string
          created_at: string
          enabled: boolean
          environment: string | null
          id: string
          project_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          api_key: string
          created_at?: string
          enabled?: boolean
          environment?: string | null
          id?: string
          project_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          api_key?: string
          created_at?: string
          enabled?: boolean
          environment?: string | null
          id?: string
          project_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
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
      mcp_servers: {
        Row: {
          api_key: string
          created_at: string | null
          id: string
          is_default: boolean | null
          name: string
          updated_at: string | null
          url: string
          user_id: string | null
        }
        Insert: {
          api_key: string
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          name: string
          updated_at?: string | null
          url: string
          user_id?: string | null
        }
        Update: {
          api_key?: string
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          name?: string
          updated_at?: string | null
          url?: string
          user_id?: string | null
        }
        Relationships: []
      }
      membership_included_services: {
        Row: {
          created_at: string | null
          description: string | null
          frequency: string | null
          id: string
          is_active: boolean | null
          service_name: string
          tier_id: string
          updated_at: string | null
          visits_per_year: number | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          frequency?: string | null
          id?: string
          is_active?: boolean | null
          service_name: string
          tier_id: string
          updated_at?: string | null
          visits_per_year?: number | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          frequency?: string | null
          id?: string
          is_active?: boolean | null
          service_name?: string
          tier_id?: string
          updated_at?: string | null
          visits_per_year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "membership_included_services_tier_id_fkey"
            columns: ["tier_id"]
            isOneToOne: false
            referencedRelation: "membership_tiers"
            referencedColumns: ["id"]
          },
        ]
      }
      membership_programs: {
        Row: {
          created_at: string | null
          created_by_user_id: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by_user_id?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by_user_id?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "membership_programs_created_by_user_id_fkey"
            columns: ["created_by_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      membership_service_history: {
        Row: {
          completed_date: string | null
          created_at: string | null
          id: string
          membership_id: string
          notes: string | null
          scheduled_date: string
          service_id: string
          status: string
          technician_id: string | null
          updated_at: string | null
        }
        Insert: {
          completed_date?: string | null
          created_at?: string | null
          id?: string
          membership_id: string
          notes?: string | null
          scheduled_date: string
          service_id: string
          status: string
          technician_id?: string | null
          updated_at?: string | null
        }
        Update: {
          completed_date?: string | null
          created_at?: string | null
          id?: string
          membership_id?: string
          notes?: string | null
          scheduled_date?: string
          service_id?: string
          status?: string
          technician_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "membership_service_history_membership_id_fkey"
            columns: ["membership_id"]
            isOneToOne: false
            referencedRelation: "customer_memberships"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "membership_service_history_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "membership_included_services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "membership_service_history_technician_id_fkey"
            columns: ["technician_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      membership_tiers: {
        Row: {
          annual_price: number | null
          benefits: Json | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          monthly_price: number
          name: string
          program_id: string
          updated_at: string | null
        }
        Insert: {
          annual_price?: number | null
          benefits?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          monthly_price: number
          name: string
          program_id: string
          updated_at?: string | null
        }
        Update: {
          annual_price?: number | null
          benefits?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          monthly_price?: number
          name?: string
          program_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "membership_tiers_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "membership_programs"
            referencedColumns: ["id"]
          },
        ]
      }
      memory_configurations: {
        Row: {
          config: Json
          created_at: string | null
          custom_implementation: Json | null
          description: string | null
          id: string
          name: string
          sharing_config: Json | null
          type: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          config: Json
          created_at?: string | null
          custom_implementation?: Json | null
          description?: string | null
          id?: string
          name: string
          sharing_config?: Json | null
          type: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          config?: Json
          created_at?: string | null
          custom_implementation?: Json | null
          description?: string | null
          id?: string
          name?: string
          sharing_config?: Json | null
          type?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      memory_operations: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          memory_id: string
          operation_type: string
          parameters: Json | null
          result: Json | null
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          memory_id: string
          operation_type: string
          parameters?: Json | null
          result?: Json | null
          status: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          memory_id?: string
          operation_type?: string
          parameters?: Json | null
          result?: Json | null
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "memory_operations_memory_id_fkey"
            columns: ["memory_id"]
            isOneToOne: false
            referencedRelation: "memory_configurations"
            referencedColumns: ["id"]
          },
        ]
      }
      memory_search_index: {
        Row: {
          content: string
          created_at: string
          embedding: string | null
          id: string
          memory_id: string
          metadata: Json | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string
          embedding?: string | null
          id?: string
          memory_id: string
          metadata?: Json | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          embedding?: string | null
          id?: string
          memory_id?: string
          metadata?: Json | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "memory_search_index_memory_id_fkey"
            columns: ["memory_id"]
            isOneToOne: false
            referencedRelation: "memory_configurations"
            referencedColumns: ["id"]
          },
        ]
      }
      memory_sharing: {
        Row: {
          agent_id: string | null
          created_at: string
          id: string
          memory_id: string
          read_only: boolean
          team_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          agent_id?: string | null
          created_at?: string
          id?: string
          memory_id: string
          read_only?: boolean
          team_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          agent_id?: string | null
          created_at?: string
          id?: string
          memory_id?: string
          read_only?: boolean
          team_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "memory_sharing_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "memory_sharing_memory_id_fkey"
            columns: ["memory_id"]
            isOneToOne: false
            referencedRelation: "memory_configurations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "memory_sharing_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "agent_teams"
            referencedColumns: ["id"]
          },
        ]
      }
      message_attachments: {
        Row: {
          created_at: string | null
          file_name: string
          file_path: string
          file_size: number
          file_type: string
          id: string
          message_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          file_name: string
          file_path: string
          file_size: number
          file_type: string
          id?: string
          message_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          file_name?: string
          file_path?: string
          file_size?: number
          file_type?: string
          id?: string
          message_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "message_attachments_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string | null
          conversation_id: string
          created_at: string | null
          delivered_at: string | null
          id: string
          metadata: Json | null
          priority: string | null
          read_at: string | null
          sender_id: string | null
          sent_at: string | null
          status: string
          type: string
          updated_at: string | null
        }
        Insert: {
          content?: string | null
          conversation_id: string
          created_at?: string | null
          delivered_at?: string | null
          id?: string
          metadata?: Json | null
          priority?: string | null
          read_at?: string | null
          sender_id?: string | null
          sent_at?: string | null
          status: string
          type: string
          updated_at?: string | null
        }
        Update: {
          content?: string | null
          conversation_id?: string
          created_at?: string | null
          delivered_at?: string | null
          id?: string
          metadata?: Json | null
          priority?: string | null
          read_at?: string | null
          sender_id?: string | null
          sent_at?: string | null
          status?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      models: {
        Row: {
          api_key: string | null
          context_window: number
          created_at: string | null
          id: string
          is_enabled: boolean | null
          max_tokens: number
          mcp_server_id: string | null
          model_id: string
          name: string
          provider: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          api_key?: string | null
          context_window: number
          created_at?: string | null
          id?: string
          is_enabled?: boolean | null
          max_tokens: number
          mcp_server_id?: string | null
          model_id: string
          name: string
          provider: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          api_key?: string | null
          context_window?: number
          created_at?: string | null
          id?: string
          is_enabled?: boolean | null
          max_tokens?: number
          mcp_server_id?: string | null
          model_id?: string
          name?: string
          provider?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
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
      project_tasks: {
        Row: {
          actual_duration: number | null
          actual_end: string | null
          actual_start: string | null
          completion_percentage: number | null
          created_at: string | null
          description: string | null
          estimated_duration: number
          id: string
          is_milestone: boolean | null
          job_id: string | null
          name: string
          priority: number | null
          project_id: string | null
          scheduled_end: string | null
          scheduled_start: string | null
          status: string | null
          task_template_id: string | null
          updated_at: string | null
        }
        Insert: {
          actual_duration?: number | null
          actual_end?: string | null
          actual_start?: string | null
          completion_percentage?: number | null
          created_at?: string | null
          description?: string | null
          estimated_duration: number
          id?: string
          is_milestone?: boolean | null
          job_id?: string | null
          name: string
          priority?: number | null
          project_id?: string | null
          scheduled_end?: string | null
          scheduled_start?: string | null
          status?: string | null
          task_template_id?: string | null
          updated_at?: string | null
        }
        Update: {
          actual_duration?: number | null
          actual_end?: string | null
          actual_start?: string | null
          completion_percentage?: number | null
          created_at?: string | null
          description?: string | null
          estimated_duration?: number
          id?: string
          is_milestone?: boolean | null
          job_id?: string | null
          name?: string
          priority?: number | null
          project_id?: string | null
          scheduled_end?: string | null
          scheduled_start?: string | null
          status?: string | null
          task_template_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_tasks_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_tasks_task_template_id_fkey"
            columns: ["task_template_id"]
            isOneToOne: false
            referencedRelation: "task_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          actual_cost: number | null
          actual_end_date: string | null
          actual_start_date: string | null
          budget_amount: number | null
          created_at: string
          created_by_user_id: string | null
          description: string | null
          estimate_id: string | null
          id: string
          notes: string | null
          opportunity_id: string | null
          person_id: string
          planned_end_date: string | null
          planned_start_date: string | null
          project_address_line1: string | null
          project_address_line2: string | null
          project_city: string | null
          project_country: string | null
          project_name: string
          project_number: string | null
          project_postal_code: string | null
          project_state_province: string | null
          status: Database["public"]["Enums"]["project_status"]
          updated_at: string
        }
        Insert: {
          actual_cost?: number | null
          actual_end_date?: string | null
          actual_start_date?: string | null
          budget_amount?: number | null
          created_at?: string
          created_by_user_id?: string | null
          description?: string | null
          estimate_id?: string | null
          id?: string
          notes?: string | null
          opportunity_id?: string | null
          person_id: string
          planned_end_date?: string | null
          planned_start_date?: string | null
          project_address_line1?: string | null
          project_address_line2?: string | null
          project_city?: string | null
          project_country?: string | null
          project_name: string
          project_number?: string | null
          project_postal_code?: string | null
          project_state_province?: string | null
          status?: Database["public"]["Enums"]["project_status"]
          updated_at?: string
        }
        Update: {
          actual_cost?: number | null
          actual_end_date?: string | null
          actual_start_date?: string | null
          budget_amount?: number | null
          created_at?: string
          created_by_user_id?: string | null
          description?: string | null
          estimate_id?: string | null
          id?: string
          notes?: string | null
          opportunity_id?: string | null
          person_id?: string
          planned_end_date?: string | null
          planned_start_date?: string | null
          project_address_line1?: string | null
          project_address_line2?: string | null
          project_city?: string | null
          project_country?: string | null
          project_name?: string
          project_number?: string | null
          project_postal_code?: string | null
          project_state_province?: string | null
          status?: Database["public"]["Enums"]["project_status"]
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
      resource_assignments: {
        Row: {
          allocation_percentage: number | null
          assignment_end: string
          assignment_start: string
          created_at: string | null
          id: string
          notes: string | null
          resource_id: string
          task_id: string
          updated_at: string | null
        }
        Insert: {
          allocation_percentage?: number | null
          assignment_end: string
          assignment_start: string
          created_at?: string | null
          id?: string
          notes?: string | null
          resource_id: string
          task_id: string
          updated_at?: string | null
        }
        Update: {
          allocation_percentage?: number | null
          assignment_end?: string
          assignment_start?: string
          created_at?: string | null
          id?: string
          notes?: string | null
          resource_id?: string
          task_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "resource_assignments_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "resources"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resource_assignments_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "project_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      resource_types: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      resources: {
        Row: {
          availability_days: number[] | null
          availability_end_time: string | null
          availability_start_time: string | null
          capacity: number | null
          created_at: string | null
          description: string | null
          hourly_rate: number | null
          id: string
          is_active: boolean | null
          name: string
          resource_type_id: string | null
          updated_at: string | null
        }
        Insert: {
          availability_days?: number[] | null
          availability_end_time?: string | null
          availability_start_time?: string | null
          capacity?: number | null
          created_at?: string | null
          description?: string | null
          hourly_rate?: number | null
          id?: string
          is_active?: boolean | null
          name: string
          resource_type_id?: string | null
          updated_at?: string | null
        }
        Update: {
          availability_days?: number[] | null
          availability_end_time?: string | null
          availability_start_time?: string | null
          capacity?: number | null
          created_at?: string | null
          description?: string | null
          hourly_rate?: number | null
          id?: string
          is_active?: boolean | null
          name?: string
          resource_type_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "resources_resource_type_id_fkey"
            columns: ["resource_type_id"]
            isOneToOne: false
            referencedRelation: "resource_types"
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
      rewards_catalog: {
        Row: {
          created_at: string | null
          description: string | null
          discount_amount: number | null
          discount_percentage: number | null
          end_date: string | null
          id: string
          is_active: boolean | null
          merchandise_details: Json | null
          name: string
          points_required: number
          program_id: string
          quantity_available: number | null
          reward_type: string
          service_id: string | null
          start_date: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          discount_amount?: number | null
          discount_percentage?: number | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          merchandise_details?: Json | null
          name: string
          points_required: number
          program_id: string
          quantity_available?: number | null
          reward_type: string
          service_id?: string | null
          start_date?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          discount_amount?: number | null
          discount_percentage?: number | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          merchandise_details?: Json | null
          name?: string
          points_required?: number
          program_id?: string
          quantity_available?: number | null
          reward_type?: string
          service_id?: string | null
          start_date?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rewards_catalog_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "rewards_programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rewards_catalog_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "membership_included_services"
            referencedColumns: ["id"]
          },
        ]
      }
      rewards_earning_rules: {
        Row: {
          created_at: string | null
          description: string | null
          end_date: string | null
          id: string
          is_active: boolean | null
          name: string
          points_value: number
          program_id: string
          rule_type: string
          start_date: string | null
          unit_type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          points_value: number
          program_id: string
          rule_type: string
          start_date?: string | null
          unit_type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          points_value?: number
          program_id?: string
          rule_type?: string
          start_date?: string | null
          unit_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rewards_earning_rules_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "rewards_programs"
            referencedColumns: ["id"]
          },
        ]
      }
      rewards_programs: {
        Row: {
          created_at: string | null
          created_by_user_id: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          points_expiration_months: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by_user_id?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          points_expiration_months?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by_user_id?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          points_expiration_months?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rewards_programs_created_by_user_id_fkey"
            columns: ["created_by_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      rewards_redemptions: {
        Row: {
          created_at: string | null
          fulfillment_date: string | null
          id: string
          notes: string | null
          reward_id: string
          status: string
          transaction_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          fulfillment_date?: string | null
          id?: string
          notes?: string | null
          reward_id: string
          status: string
          transaction_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          fulfillment_date?: string | null
          id?: string
          notes?: string | null
          reward_id?: string
          status?: string
          transaction_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rewards_redemptions_reward_id_fkey"
            columns: ["reward_id"]
            isOneToOne: false
            referencedRelation: "rewards_catalog"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rewards_redemptions_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "rewards_transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      rewards_transactions: {
        Row: {
          account_id: string
          balance_after: number
          created_at: string | null
          created_by_user_id: string | null
          description: string | null
          id: string
          points: number
          source_id: string | null
          source_type: string | null
          transaction_date: string
          transaction_type: string
        }
        Insert: {
          account_id: string
          balance_after: number
          created_at?: string | null
          created_by_user_id?: string | null
          description?: string | null
          id?: string
          points: number
          source_id?: string | null
          source_type?: string | null
          transaction_date?: string
          transaction_type: string
        }
        Update: {
          account_id?: string
          balance_after?: number
          created_at?: string | null
          created_by_user_id?: string | null
          description?: string | null
          id?: string
          points?: number
          source_id?: string | null
          source_type?: string | null
          transaction_date?: string
          transaction_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "rewards_transactions_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "customer_rewards_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rewards_transactions_created_by_user_id_fkey"
            columns: ["created_by_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      scheduling_conflicts: {
        Row: {
          affected_resources: string[] | null
          affected_tasks: string[] | null
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
          affected_resources?: string[] | null
          affected_tasks?: string[] | null
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
          affected_resources?: string[] | null
          affected_tasks?: string[] | null
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
          notes: string | null
          project_id: string | null
          task_id: string | null
          updated_at: string | null
        }
        Insert: {
          constraint_date: string
          constraint_type: string
          created_at?: string | null
          id?: string
          is_hard_constraint?: boolean | null
          notes?: string | null
          project_id?: string | null
          task_id?: string | null
          updated_at?: string | null
        }
        Update: {
          constraint_date?: string
          constraint_type?: string
          created_at?: string | null
          id?: string
          is_hard_constraint?: boolean | null
          notes?: string | null
          project_id?: string | null
          task_id?: string | null
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
          {
            foreignKeyName: "scheduling_constraints_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "project_tasks"
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
      sms_integrations: {
        Row: {
          access_token: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          phone_number: string
          provider: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          access_token?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          phone_number: string
          provider: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          access_token?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          phone_number?: string
          provider?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sms_integrations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      storage_configurations: {
        Row: {
          config: Json
          created_at: string | null
          description: string | null
          id: string
          name: string
          type: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          config: Json
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          type: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          config?: Json
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          type?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
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
      task_dependencies: {
        Row: {
          created_at: string | null
          dependency_type: string | null
          id: string
          lag_time: number | null
          predecessor_task_id: string
          successor_task_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          dependency_type?: string | null
          id?: string
          lag_time?: number | null
          predecessor_task_id: string
          successor_task_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          dependency_type?: string | null
          id?: string
          lag_time?: number | null
          predecessor_task_id?: string
          successor_task_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "task_dependencies_predecessor_task_id_fkey"
            columns: ["predecessor_task_id"]
            isOneToOne: false
            referencedRelation: "project_tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_dependencies_successor_task_id_fkey"
            columns: ["successor_task_id"]
            isOneToOne: false
            referencedRelation: "project_tasks"
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
          id?: string
          name: string
          estimated_duration: number
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
      team_collaboration_settings: {
        Row: {
          collaboration_mode: string
          config: Json | null
          consensus_threshold: number | null
          created_at: string | null
          id: string
          max_iterations: number | null
          routing_strategy: string
          team_id: string
          updated_at: string | null
        }
        Insert: {
          collaboration_mode?: string
          config?: Json | null
          consensus_threshold?: number | null
          created_at?: string | null
          id?: string
          max_iterations?: number | null
          routing_strategy?: string
          team_id: string
          updated_at?: string | null
        }
        Update: {
          collaboration_mode?: string
          config?: Json | null
          consensus_threshold?: number | null
          created_at?: string | null
          id?: string
          max_iterations?: number | null
          routing_strategy?: string
          team_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "team_collaboration_settings_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: true
            referencedRelation: "agent_teams"
            referencedColumns: ["id"]
          },
        ]
      }
      team_conversation_messages: {
        Row: {
          agent_id: string | null
          content: string
          conversation_id: string
          created_at: string | null
          id: string
          metadata: Json | null
          role: string
          user_id: string | null
        }
        Insert: {
          agent_id?: string | null
          content: string
          conversation_id: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          role: string
          user_id?: string | null
        }
        Update: {
          agent_id?: string | null
          content?: string
          conversation_id?: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          role?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "team_conversation_messages_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_conversation_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "team_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      team_conversations: {
        Row: {
          created_at: string | null
          id: string
          status: string
          team_id: string
          title: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          status?: string
          team_id: string
          title?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          status?: string
          team_id?: string
          title?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_conversations_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "agent_teams"
            referencedColumns: ["id"]
          },
        ]
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
      tool_secrets: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          secret_id: string
          tool_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          secret_id: string
          tool_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          secret_id?: string
          tool_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tool_secrets_tool_id_fkey"
            columns: ["tool_id"]
            isOneToOne: false
            referencedRelation: "tools"
            referencedColumns: ["id"]
          },
        ]
      }
      tools: {
        Row: {
          config: Json
          created_at: string
          description: string | null
          has_secrets: boolean
          id: string
          inputs: Json
          name: string
          outputs: Json
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          config: Json
          created_at?: string
          description?: string | null
          has_secrets?: boolean
          id?: string
          inputs: Json
          name: string
          outputs: Json
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          config?: Json
          created_at?: string
          description?: string | null
          has_secrets?: boolean
          id?: string
          inputs?: Json
          name?: string
          outputs?: Json
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
      user_sessions: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          token: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: string
          token: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          token?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
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
      video_sessions: {
        Row: {
          conversation_id: string | null
          created_at: string | null
          duration: number | null
          ended_at: string | null
          id: string
          recording_path: string | null
          session_id: string
          started_at: string | null
          updated_at: string | null
        }
        Insert: {
          conversation_id?: string | null
          created_at?: string | null
          duration?: number | null
          ended_at?: string | null
          id?: string
          recording_path?: string | null
          session_id: string
          started_at?: string | null
          updated_at?: string | null
        }
        Update: {
          conversation_id?: string | null
          created_at?: string | null
          duration?: number | null
          ended_at?: string | null
          id?: string
          recording_path?: string | null
          session_id?: string
          started_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "video_sessions_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
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
      get_agent_versions: {
        Args: { agent_id_param: string }
        Returns: {
          agent_id: string
          config: Json
          created_at: string
          id: string
          is_active: boolean
          user_id: string
          version: number
        }[]
      }
      get_all_agents: {
        Args: Record<PropertyKey, never>
        Returns: {
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
          user_id: string
        }[]
      }
      get_all_knowledge_sources: {
        Args: Record<PropertyKey, never>
        Returns: {
          config: Json
          created_at: string
          description: string | null
          id: string
          name: string
          type: string
          updated_at: string
          user_id: string
        }[]
      }
      get_all_memory_configs: {
        Args: Record<PropertyKey, never>
        Returns: {
          config: Json
          created_at: string | null
          custom_implementation: Json | null
          description: string | null
          id: string
          name: string
          sharing_config: Json | null
          type: string
          updated_at: string | null
          user_id: string | null
        }[]
      }
      get_all_storage_configs: {
        Args: Record<PropertyKey, never>
        Returns: {
          config: Json
          created_at: string | null
          description: string | null
          id: string
          name: string
          type: string
          updated_at: string | null
          user_id: string | null
        }[]
      }
      get_all_teams: {
        Args: Record<PropertyKey, never>
        Returns: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          updated_at: string | null
          user_id: string
        }[]
      }
      get_all_tools: {
        Args: Record<PropertyKey, never>
        Returns: {
          config: Json
          created_at: string
          description: string | null
          has_secrets: boolean
          id: string
          inputs: Json
          name: string
          outputs: Json
          type: string
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
