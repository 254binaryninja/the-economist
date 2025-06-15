export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      users: {
        Row: {
          created_at: string | null
          email: string
          id: string
          name: string
          occupation: string
          student: boolean | null
          style: string | null
          user_id: string
          verbosity: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id: string
          name: string
          occupation: string
          student?: boolean | null
          style?: string | null
          user_id?: string
          verbosity?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          name?: string
          occupation?: string
          student?: boolean | null
          style?: string | null
          user_id?: string
          verbosity?: string | null
        }
        Relationships: []
      }
      vault: {
        Row: {
          created_at: string | null
          id: string
          is_public: boolean | null
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id: string
          is_public?: boolean | null
          title: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_public?: boolean | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      vault_document_chunks: {
        Row: {
          chunk_index: number
          created_at: string | null
          document_id: string
          id: string
          user_id: string
        }
        Insert: {
          chunk_index: number
          created_at?: string | null
          document_id: string
          id: string
          user_id: string
        }
        Update: {
          chunk_index?: number
          created_at?: string | null
          document_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vault_document_chunks_document_id_vault_documents_id_fk"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "vault_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      vault_documents: {
        Row: {
          created_at: string | null
          document_metadata: string | null
          document_name: string
          document_size: string | null
          document_type: string
          id: string
          vault_id: string
        }
        Insert: {
          created_at?: string | null
          document_metadata?: string | null
          document_name: string
          document_size?: string | null
          document_type: string
          id: string
          vault_id: string
        }
        Update: {
          created_at?: string | null
          document_metadata?: string | null
          document_name?: string
          document_size?: string | null
          document_type?: string
          id?: string
          vault_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vault_documents_vault_id_vault_id_fk"
            columns: ["vault_id"]
            isOneToOne: false
            referencedRelation: "vault"
            referencedColumns: ["id"]
          },
        ]
      }
      vault_messages: {
        Row: {
          content: string
          created_at: string | null
          id: string
          role: string
          workspace_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id: string
          role: string
          workspace_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          role?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vault_messages_workspace_id_vault_id_fk"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "vault"
            referencedColumns: ["id"]
          },
        ]
      }
      vault_workflows: {
        Row: {
          content: Json
          created_at: string | null
          feedback: string | null
          id: string
          role: string
          workspace_id: string
        }
        Insert: {
          content: Json
          created_at?: string | null
          feedback?: string | null
          id: string
          role: string
          workspace_id: string
        }
        Update: {
          content?: Json
          created_at?: string | null
          feedback?: string | null
          id?: string
          role?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vault_workflows_workspace_id_vault_id_fk"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "vault"
            referencedColumns: ["id"]
          },
        ]
      }
      workspace_messages: {
        Row: {
          content: string
          created_at: string | null
          id: string
          role: string
          workspace_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id: string
          role: string
          workspace_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          role?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspace_messages_workspace_id_workspaces_id_fk"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspaces: {
        Row: {
          created_at: string | null
          id: string
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id: string
          title: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
