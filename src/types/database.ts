/**
 * Database types for MeloCaps Supabase schema.
 * 
 * This is a stub — run `npx supabase gen types typescript` after S1-04
 * (schema migration) to generate the full types automatically.
 * 
 * Or use: npx supabase gen types typescript --project-id papynmqfpqdicsolvjjq
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type ThemeStatus = "upcoming" | "open" | "locked" | "resolving" | "finished";
export type TransactionType =
  | "weekly_allocation"
  | "stake_placed"
  | "stake_won"
  | "stake_lost"
  | "bonus";

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          spotify_id: string;
          display_name: string;
          avatar_url: string | null;
          wallet_balance: number;
          reputation_score: number;
          locale: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          spotify_id: string;
          display_name: string;
          avatar_url?: string | null;
          wallet_balance?: number;
          reputation_score?: number;
          locale?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          spotify_id?: string;
          display_name?: string;
          avatar_url?: string | null;
          wallet_balance?: number;
          reputation_score?: number;
          locale?: string;
          updated_at?: string;
        };
      };
      weekly_themes: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          week_number: number;
          year: number;
          status: ThemeStatus;
          opened_at: string | null;
          locked_at: string | null;
          resolved_at: string | null;
          results_json: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          week_number: number;
          year: number;
          status?: ThemeStatus;
          opened_at?: string | null;
          locked_at?: string | null;
          resolved_at?: string | null;
          results_json?: Json | null;
          created_at?: string;
        };
        Update: {
          title?: string;
          description?: string | null;
          status?: ThemeStatus;
          opened_at?: string | null;
          locked_at?: string | null;
          resolved_at?: string | null;
          results_json?: Json | null;
        };
      };
      pods: {
        Row: {
          id: string;
          theme_id: string;
          is_full: boolean;
          member_count: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          theme_id: string;
          is_full?: boolean;
          member_count?: number;
          created_at?: string;
        };
        Update: {
          is_full?: boolean;
          member_count?: number;
        };
      };
      pods_members: {
        Row: {
          id: string;
          pod_id: string;
          user_id: string;
          joined_at: string;
        };
        Insert: {
          id?: string;
          pod_id: string;
          user_id: string;
          joined_at?: string;
        };
        Update: never;
      };
      submissions: {
        Row: {
          id: string;
          user_id: string;
          pod_id: string;
          spotify_track_id: string;
          track_name: string;
          artist_name: string;
          album_image_url: string | null;
          preview_url: string | null;
          spotify_uri: string;
          global_score: number | null;
          global_rank: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          pod_id: string;
          spotify_track_id: string;
          track_name: string;
          artist_name: string;
          album_image_url?: string | null;
          preview_url?: string | null;
          spotify_uri: string;
          global_score?: number | null;
          global_rank?: number | null;
          created_at?: string;
        };
        Update: {
          global_score?: number | null;
          global_rank?: number | null;
        };
      };
      stakes: {
        Row: {
          id: string;
          user_id: string;
          submission_id: string;
          amount: number;
          result: "won" | "lost" | null;
          payout: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          submission_id: string;
          amount: number;
          result?: "won" | "lost" | null;
          payout?: number | null;
          created_at?: string;
        };
        Update: {
          result?: "won" | "lost" | null;
          payout?: number | null;
        };
      };
      transactions: {
        Row: {
          id: string;
          user_id: string;
          type: TransactionType;
          amount: number;
          balance_after: number;
          reference_id: string | null;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: TransactionType;
          amount: number;
          balance_after: number;
          reference_id?: string | null;
          description?: string | null;
          created_at?: string;
        };
        Update: never;
      };
      messages: {
        Row: {
          id: string;
          pod_id: string;
          user_id: string;
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          pod_id: string;
          user_id: string;
          content: string;
          created_at?: string;
        };
        Update: never;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      theme_status: ThemeStatus;
      transaction_type: TransactionType;
    };
  };
}
