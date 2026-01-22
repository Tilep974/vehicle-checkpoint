export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      agencies: {
        Row: {
          address: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      clients: {
        Row: {
          address: string | null
          created_at: string
          email: string
          first_name: string
          id: string
          last_name: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          email: string
          first_name: string
          id?: string
          last_name: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      damages: {
        Row: {
          created_at: string
          description: string
          edl_id: string
          id: string
          is_new: boolean
          location: string
          severity: Database["public"]["Enums"]["damage_severity"]
        }
        Insert: {
          created_at?: string
          description: string
          edl_id: string
          id?: string
          is_new?: boolean
          location: string
          severity?: Database["public"]["Enums"]["damage_severity"]
        }
        Update: {
          created_at?: string
          description?: string
          edl_id?: string
          id?: string
          is_new?: boolean
          location?: string
          severity?: Database["public"]["Enums"]["damage_severity"]
        }
        Relationships: [
          {
            foreignKeyName: "damages_edl_id_fkey"
            columns: ["edl_id"]
            isOneToOne: false
            referencedRelation: "edl"
            referencedColumns: ["id"]
          },
        ]
      }
      edl: {
        Row: {
          agent_name: string | null
          agent_signature_url: string | null
          cleanliness_level: number | null
          client_signature_url: string | null
          comments: string | null
          completed_at: string | null
          created_at: string
          fuel_level: number | null
          id: string
          mileage: number | null
          pdf_url: string | null
          rental_id: string
          type: Database["public"]["Enums"]["edl_type"]
          updated_at: string
        }
        Insert: {
          agent_name?: string | null
          agent_signature_url?: string | null
          cleanliness_level?: number | null
          client_signature_url?: string | null
          comments?: string | null
          completed_at?: string | null
          created_at?: string
          fuel_level?: number | null
          id?: string
          mileage?: number | null
          pdf_url?: string | null
          rental_id: string
          type: Database["public"]["Enums"]["edl_type"]
          updated_at?: string
        }
        Update: {
          agent_name?: string | null
          agent_signature_url?: string | null
          cleanliness_level?: number | null
          client_signature_url?: string | null
          comments?: string | null
          completed_at?: string | null
          created_at?: string
          fuel_level?: number | null
          id?: string
          mileage?: number | null
          pdf_url?: string | null
          rental_id?: string
          type?: Database["public"]["Enums"]["edl_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "edl_rental_id_fkey"
            columns: ["rental_id"]
            isOneToOne: false
            referencedRelation: "rentals"
            referencedColumns: ["id"]
          },
        ]
      }
      edl_photos: {
        Row: {
          category: string
          created_at: string
          description: string | null
          edl_id: string
          id: string
          photo_url: string
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          edl_id: string
          id?: string
          photo_url: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          edl_id?: string
          id?: string
          photo_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "edl_photos_edl_id_fkey"
            columns: ["edl_id"]
            isOneToOne: false
            referencedRelation: "edl"
            referencedColumns: ["id"]
          },
        ]
      }
      rentals: {
        Row: {
          agency_id: string
          client_id: string
          created_at: string
          departure_date: string
          external_reference: string | null
          id: string
          return_date: string
          status: Database["public"]["Enums"]["rental_status"]
          updated_at: string
          vehicle_id: string
        }
        Insert: {
          agency_id: string
          client_id: string
          created_at?: string
          departure_date: string
          external_reference?: string | null
          id?: string
          return_date: string
          status?: Database["public"]["Enums"]["rental_status"]
          updated_at?: string
          vehicle_id: string
        }
        Update: {
          agency_id?: string
          client_id?: string
          created_at?: string
          departure_date?: string
          external_reference?: string | null
          id?: string
          return_date?: string
          status?: Database["public"]["Enums"]["rental_status"]
          updated_at?: string
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rentals_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rentals_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rentals_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicles: {
        Row: {
          agency_id: string | null
          brand: string
          color: string | null
          created_at: string
          id: string
          model: string
          registration: string
          updated_at: string
          year: number | null
        }
        Insert: {
          agency_id?: string | null
          brand: string
          color?: string | null
          created_at?: string
          id?: string
          model: string
          registration: string
          updated_at?: string
          year?: number | null
        }
        Update: {
          agency_id?: string | null
          brand?: string
          color?: string | null
          created_at?: string
          id?: string
          model?: string
          registration?: string
          updated_at?: string
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "vehicles_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      damage_severity: "minor" | "moderate" | "severe"
      edl_type: "departure" | "return"
      rental_status: "pending" | "in_progress" | "completed" | "cancelled"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      damage_severity: ["minor", "moderate", "severe"],
      edl_type: ["departure", "return"],
      rental_status: ["pending", "in_progress", "completed", "cancelled"],
    },
  },
} as const
