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
      messages: {
        Row: {
          content: string
          created_at: string
          id: string
          pod_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          pod_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          pod_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_pod_id_fkey"
            columns: ["pod_id"]
            isOneToOne: false
            referencedRelation: "pods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      pods: {
        Row: {
          created_at: string
          id: string
          is_full: boolean
          member_count: number
          theme_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_full?: boolean
          member_count?: number
          theme_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_full?: boolean
          member_count?: number
          theme_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pods_theme_id_fkey"
            columns: ["theme_id"]
            isOneToOne: false
            referencedRelation: "weekly_themes"
            referencedColumns: ["id"]
          },
        ]
      }
      pods_members: {
        Row: {
          id: string
          joined_at: string
          pod_id: string
          user_id: string
        }
        Insert: {
          id?: string
          joined_at?: string
          pod_id: string
          user_id: string
        }
        Update: {
          id?: string
          joined_at?: string
          pod_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pods_members_pod_id_fkey"
            columns: ["pod_id"]
            isOneToOne: false
            referencedRelation: "pods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pods_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      stakes: {
        Row: {
          amount: number
          created_at: string
          id: string
          payout: number | null
          result: string | null
          submission_id: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          payout?: number | null
          result?: string | null
          submission_id: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          payout?: number | null
          result?: string | null
          submission_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "stakes_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "submissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stakes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      submissions: {
        Row: {
          album_image_url: string | null
          artist_name: string
          created_at: string
          global_rank: number | null
          global_score: number | null
          id: string
          pod_id: string
          preview_url: string | null
          spotify_track_id: string
          spotify_uri: string
          track_name: string
          user_id: string
        }
        Insert: {
          album_image_url?: string | null
          artist_name: string
          created_at?: string
          global_rank?: number | null
          global_score?: number | null
          id?: string
          pod_id: string
          preview_url?: string | null
          spotify_track_id: string
          spotify_uri: string
          track_name: string
          user_id: string
        }
        Update: {
          album_image_url?: string | null
          artist_name?: string
          created_at?: string
          global_rank?: number | null
          global_score?: number | null
          id?: string
          pod_id?: string
          preview_url?: string | null
          spotify_track_id?: string
          spotify_uri?: string
          track_name?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "submissions_pod_id_fkey"
            columns: ["pod_id"]
            isOneToOne: false
            referencedRelation: "pods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "submissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          balance_after: number
          created_at: string
          description: string | null
          id: string
          reference_id: string | null
          type: Database["public"]["Enums"]["transaction_type"]
          user_id: string
        }
        Insert: {
          amount: number
          balance_after: number
          created_at?: string
          description?: string | null
          id?: string
          reference_id?: string | null
          type: Database["public"]["Enums"]["transaction_type"]
          user_id: string
        }
        Update: {
          amount?: number
          balance_after?: number
          created_at?: string
          description?: string | null
          id?: string
          reference_id?: string | null
          type?: Database["public"]["Enums"]["transaction_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string
          id: string
          locale: string
          reputation_score: number
          spotify_id: string
          updated_at: string
          wallet_balance: number
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name: string
          id: string
          locale?: string
          reputation_score?: number
          spotify_id: string
          updated_at?: string
          wallet_balance?: number
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string
          id?: string
          locale?: string
          reputation_score?: number
          spotify_id?: string
          updated_at?: string
          wallet_balance?: number
        }
        Relationships: []
      }
      weekly_themes: {
        Row: {
          created_at: string
          description: string | null
          id: string
          locked_at: string | null
          opened_at: string | null
          resolved_at: string | null
          results_json: Json | null
          status: Database["public"]["Enums"]["theme_status"]
          title: string
          week_number: number
          year: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          locked_at?: string | null
          opened_at?: string | null
          resolved_at?: string | null
          results_json?: Json | null
          status?: Database["public"]["Enums"]["theme_status"]
          title: string
          week_number: number
          year: number
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          locked_at?: string | null
          opened_at?: string | null
          resolved_at?: string | null
          results_json?: Json | null
          status?: Database["public"]["Enums"]["theme_status"]
          title?: string
          week_number?: number
          year?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      join_pod: {
        Args: { p_theme_id: string; p_user_id: string }
        Returns: Json
      }
    }
    Enums: {
      theme_status: "upcoming" | "open" | "locked" | "resolving" | "finished"
      transaction_type:
        | "weekly_allocation"
        | "stake_placed"
        | "stake_won"
        | "stake_lost"
        | "bonus"
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
      theme_status: ["upcoming", "open", "locked", "resolving", "finished"],
      transaction_type: [
        "weekly_allocation",
        "stake_placed",
        "stake_won",
        "stake_lost",
        "bonus",
      ],
    },
  },
} as const
