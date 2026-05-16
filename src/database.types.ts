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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      body_metrics: {
        Row: {
          id: string
          metric_type: string
          recorded_at: string
          unit: string
          user_id: string
          value: number
        }
        Insert: {
          id?: string
          metric_type: string
          recorded_at?: string
          unit: string
          user_id?: string
          value: number
        }
        Update: {
          id?: string
          metric_type?: string
          recorded_at?: string
          unit?: string
          user_id?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "body_metrics_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      exercise_alternatives: {
        Row: {
          alternative_id: number
          exercise_id: number
        }
        Insert: {
          alternative_id: number
          exercise_id: number
        }
        Update: {
          alternative_id?: number
          exercise_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "exercise_alternatives_alternative_id_fkey"
            columns: ["alternative_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exercise_alternatives_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
        ]
      }
      exercises: {
        Row: {
          benefits: string | null
          body_zone: string[] | null
          calories_burned_per_minute: string | null
          category: string | null
          created_at: string
          description: string | null
          difficulty: string | null
          equipment: string[] | null
          gif_url: string | null
          id: number
          image: string | null
          instructions: string[] | null
          name: string
          requires_machine: boolean | null
          youtube_id: string | null
        }
        Insert: {
          benefits?: string | null
          body_zone?: string[] | null
          calories_burned_per_minute?: string | null
          category?: string | null
          created_at?: string
          description?: string | null
          difficulty?: string | null
          equipment?: string[] | null
          gif_url?: string | null
          id?: number
          image?: string | null
          instructions?: string[] | null
          name: string
          requires_machine?: boolean | null
          youtube_id?: string | null
        }
        Update: {
          benefits?: string | null
          body_zone?: string[] | null
          calories_burned_per_minute?: string | null
          category?: string | null
          created_at?: string
          description?: string | null
          difficulty?: string | null
          equipment?: string[] | null
          gif_url?: string | null
          id?: number
          image?: string | null
          instructions?: string[] | null
          name?: string
          requires_machine?: boolean | null
          youtube_id?: string | null
        }
        Relationships: []
      }
      friends: {
        Row: {
          created_at: string
          friend_id: string
          id: number
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          friend_id: string
          id?: never
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          friend_id?: string
          id?: never
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      goals: {
        Row: {
          created_at: string
          current_value: number
          description: string
          exercise_id: number | null
          id: number
          status: string
          target_date: string | null
          target_value: number
          type: string
          unit: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          current_value?: number
          description: string
          exercise_id?: number | null
          id?: number
          status?: string
          target_date?: string | null
          target_value: number
          type: string
          unit?: string | null
          user_id?: string
        }
        Update: {
          created_at?: string
          current_value?: number
          description?: string
          exercise_id?: number | null
          id?: number
          status?: string
          target_date?: string | null
          target_value?: number
          type?: string
          unit?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "goals_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
        ]
      }
      ingredients: {
        Row: {
          id: number
          name: string
        }
        Insert: {
          id?: number
          name: string
        }
        Update: {
          id?: number
          name?: string
        }
        Relationships: []
      }
      logged_food_entries: {
        Row: {
          calories_100g: number | null
          carbohydrates_100g: number | null
          created_at: string | null
          entry_date: string
          fat_100g: number | null
          food_api_id: string
          id: string
          product_name: string
          proteins_100g: number | null
          quantity_grams: number
          user_id: string
        }
        Insert: {
          calories_100g?: number | null
          carbohydrates_100g?: number | null
          created_at?: string | null
          entry_date?: string
          fat_100g?: number | null
          food_api_id: string
          id?: string
          product_name: string
          proteins_100g?: number | null
          quantity_grams: number
          user_id: string
        }
        Update: {
          calories_100g?: number | null
          carbohydrates_100g?: number | null
          created_at?: string | null
          entry_date?: string
          fat_100g?: number | null
          food_api_id?: string
          id?: string
          product_name?: string
          proteins_100g?: number | null
          quantity_grams?: number
          user_id?: string
        }
        Relationships: []
      }
      motivation_posts: {
        Row: {
          content_url: string | null
          created_at: string | null
          description: string | null
          id: string
          type: string
          user_id: string | null
        }
        Insert: {
          content_url?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          type: string
          user_id?: string | null
        }
        Update: {
          content_url?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "motivation_posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      motivational_posts: {
        Row: {
          author_avatar_url: string | null
          author_name: string | null
          caption: string | null
          created_at: string
          id: number
          liked_by: string[] | null
          likes: number | null
          media_url: string
          type: string
          user_id: string | null
        }
        Insert: {
          author_avatar_url?: string | null
          author_name?: string | null
          caption?: string | null
          created_at?: string
          id?: number
          liked_by?: string[] | null
          likes?: number | null
          media_url: string
          type: string
          user_id?: string | null
        }
        Update: {
          author_avatar_url?: string | null
          author_name?: string | null
          caption?: string | null
          created_at?: string
          id?: number
          liked_by?: string[] | null
          likes?: number | null
          media_url?: string
          type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "motivational_posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      nutrition_logs: {
        Row: {
          calories: number
          carbohydrates: number | null
          fats: number | null
          id: string
          logged_at: string
          meal: string
          name: string
          product_id: string | null
          proteins: number | null
          quantity: number
          unit: string
          user_id: string
        }
        Insert: {
          calories: number
          carbohydrates?: number | null
          fats?: number | null
          id?: string
          logged_at?: string
          meal: string
          name: string
          product_id?: string | null
          proteins?: number | null
          quantity: number
          unit: string
          user_id: string
        }
        Update: {
          calories?: number
          carbohydrates?: number | null
          fats?: number | null
          id?: string
          logged_at?: string
          meal?: string
          name?: string
          product_id?: string | null
          proteins?: number | null
          quantity?: number
          unit?: string
          user_id?: string
        }
        Relationships: []
      }
      plan_goals: {
        Row: {
          description: string | null
          id: string
          name: string
        }
        Insert: {
          description?: string | null
          id: string
          name: string
        }
        Update: {
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      plan_recipes: {
        Row: {
          day_of_week: number | null
          id: number
          meal_type: string
          plan_id: string
          recipe_id: number
        }
        Insert: {
          day_of_week?: number | null
          id?: never
          meal_type: string
          plan_id: string
          recipe_id: number
        }
        Update: {
          day_of_week?: number | null
          id?: never
          meal_type?: string
          plan_id?: string
          recipe_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "plan_recipes_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plan_recipes_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      plan_routines: {
        Row: {
          day_of_week: number
          plan_id: string
          routine_id: number
        }
        Insert: {
          day_of_week: number
          plan_id: string
          routine_id: number
        }
        Update: {
          day_of_week?: number
          plan_id?: string
          routine_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "plan_routines_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plan_routines_routine_id_fkey"
            columns: ["routine_id"]
            isOneToOne: false
            referencedRelation: "routines"
            referencedColumns: ["id"]
          },
        ]
      }
      plans: {
        Row: {
          description: string | null
          diet_recommendation: string | null
          difficulty: string | null
          duration_weeks: number | null
          foods_to_avoid: string[] | null
          foods_to_eat: string[] | null
          goal_id: string | null
          id: string
          meal_plan_description: string | null
          name: string
          routine_id: number | null
        }
        Insert: {
          description?: string | null
          diet_recommendation?: string | null
          difficulty?: string | null
          duration_weeks?: number | null
          foods_to_avoid?: string[] | null
          foods_to_eat?: string[] | null
          goal_id?: string | null
          id: string
          meal_plan_description?: string | null
          name: string
          routine_id?: number | null
        }
        Update: {
          description?: string | null
          diet_recommendation?: string | null
          difficulty?: string | null
          duration_weeks?: number | null
          foods_to_avoid?: string[] | null
          foods_to_eat?: string[] | null
          goal_id?: string | null
          id?: string
          meal_plan_description?: string | null
          name?: string
          routine_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "plans_routine_id_fkey"
            columns: ["routine_id"]
            isOneToOne: false
            referencedRelation: "routines"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          age: number | null
          avatar_url: string | null
          current_plan_id: string | null
          fitness_goal: Database["public"]["Enums"]["fitness_goal_enum"] | null
          gender: string | null
          has_seen_tutorial: boolean | null
          height_cm: number | null
          id: string
          onboarding_completed: boolean | null
          training_days: string | null
          username: string | null
          website: string | null
          weight_kg: number | null
        }
        Insert: {
          age?: number | null
          avatar_url?: string | null
          current_plan_id?: string | null
          fitness_goal?: Database["public"]["Enums"]["fitness_goal_enum"] | null
          gender?: string | null
          has_seen_tutorial?: boolean | null
          height_cm?: number | null
          id: string
          onboarding_completed?: boolean | null
          training_days?: string | null
          username?: string | null
          website?: string | null
          weight_kg?: number | null
        }
        Update: {
          age?: number | null
          avatar_url?: string | null
          current_plan_id?: string | null
          fitness_goal?: Database["public"]["Enums"]["fitness_goal_enum"] | null
          gender?: string | null
          has_seen_tutorial?: boolean | null
          height_cm?: number | null
          id?: string
          onboarding_completed?: boolean | null
          training_days?: string | null
          username?: string | null
          website?: string | null
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_current_plan_id_fkey"
            columns: ["current_plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      recipe_ingredients: {
        Row: {
          ingredient_id: number
          quantity: number
          recipe_id: number
          unit: string
        }
        Insert: {
          ingredient_id: number
          quantity: number
          recipe_id: number
          unit: string
        }
        Update: {
          ingredient_id?: number
          quantity?: number
          recipe_id?: number
          unit?: string
        }
        Relationships: [
          {
            foreignKeyName: "recipe_ingredients_ingredient_id_fkey"
            columns: ["ingredient_id"]
            isOneToOne: false
            referencedRelation: "ingredients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipe_ingredients_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      recipes: {
        Row: {
          calories: number | null
          carbs_g: number | null
          carbs_grams: number | null
          cook_time_minutes: number | null
          description: string | null
          fat_grams: number | null
          fats_g: number | null
          goal: string | null
          id: number
          image_url: string | null
          ingredients: Json | null
          instructions: string[] | null
          name: string
          objective: string | null
          prep_time_minutes: number | null
          protein_g: number | null
          protein_grams: number | null
          servings: number | null
        }
        Insert: {
          calories?: number | null
          carbs_g?: number | null
          carbs_grams?: number | null
          cook_time_minutes?: number | null
          description?: string | null
          fat_grams?: number | null
          fats_g?: number | null
          goal?: string | null
          id?: number
          image_url?: string | null
          ingredients?: Json | null
          instructions?: string[] | null
          name: string
          objective?: string | null
          prep_time_minutes?: number | null
          protein_g?: number | null
          protein_grams?: number | null
          servings?: number | null
        }
        Update: {
          calories?: number | null
          carbs_g?: number | null
          carbs_grams?: number | null
          cook_time_minutes?: number | null
          description?: string | null
          fat_grams?: number | null
          fats_g?: number | null
          goal?: string | null
          id?: number
          image_url?: string | null
          ingredients?: Json | null
          instructions?: string[] | null
          name?: string
          objective?: string | null
          prep_time_minutes?: number | null
          protein_g?: number | null
          protein_grams?: number | null
          servings?: number | null
        }
        Relationships: []
      }
      routine_exercises: {
        Row: {
          created_at: string | null
          exercise_id: number | null
          id: number
          is_adaptive: boolean | null
          prescribed_reps: number
          prescribed_sets: number
          prescribed_weight: number | null
          routine_id: number | null
        }
        Insert: {
          created_at?: string | null
          exercise_id?: number | null
          id?: number
          is_adaptive?: boolean | null
          prescribed_reps: number
          prescribed_sets: number
          prescribed_weight?: number | null
          routine_id?: number | null
        }
        Update: {
          created_at?: string | null
          exercise_id?: number | null
          id?: number
          is_adaptive?: boolean | null
          prescribed_reps?: number
          prescribed_sets?: number
          prescribed_weight?: number | null
          routine_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "routine_exercises_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "routine_exercises_routine_id_fkey"
            columns: ["routine_id"]
            isOneToOne: false
            referencedRelation: "routines"
            referencedColumns: ["id"]
          },
        ]
      }
      routines: {
        Row: {
          body_zone_focus: string[] | null
          category: string | null
          created_at: string
          description: string | null
          difficulty: string | null
          exercises: Json | null
          goal: string | null
          id: number
          name: string
        }
        Insert: {
          body_zone_focus?: string[] | null
          category?: string | null
          created_at?: string
          description?: string | null
          difficulty?: string | null
          exercises?: Json | null
          goal?: string | null
          id?: number
          name: string
        }
        Update: {
          body_zone_focus?: string[] | null
          category?: string | null
          created_at?: string
          description?: string | null
          difficulty?: string | null
          exercises?: Json | null
          goal?: string | null
          id?: number
          name?: string
        }
        Relationships: []
      }
      workout_exercise_logs: {
        Row: {
          created_at: string | null
          exercise_id: number | null
          id: number
          reps: number
          rpe: number | null
          set_number: number
          weight: number
          workout_log_id: string | null
        }
        Insert: {
          created_at?: string | null
          exercise_id?: number | null
          id?: number
          reps: number
          rpe?: number | null
          set_number: number
          weight: number
          workout_log_id?: string | null
        }
        Update: {
          created_at?: string | null
          exercise_id?: number | null
          id?: number
          reps?: number
          rpe?: number | null
          set_number?: number
          weight?: number
          workout_log_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workout_exercise_logs_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_exercise_logs_workout_log_id_fkey"
            columns: ["workout_log_id"]
            isOneToOne: false
            referencedRelation: "workout_logs"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_logs: {
        Row: {
          created_at: string | null
          duration_seconds: number | null
          end_time: string | null
          exercise_id: number | null
          id: string
          notes: string | null
          reps: number | null
          routine_id: number | null
          sets: number | null
          start_time: string | null
          user_id: string | null
          volume: number | null
          weight: number | null
        }
        Insert: {
          created_at?: string | null
          duration_seconds?: number | null
          end_time?: string | null
          exercise_id?: number | null
          id?: string
          notes?: string | null
          reps?: number | null
          routine_id?: number | null
          sets?: number | null
          start_time?: string | null
          user_id?: string | null
          volume?: number | null
          weight?: number | null
        }
        Update: {
          created_at?: string | null
          duration_seconds?: number | null
          end_time?: string | null
          exercise_id?: number | null
          id?: string
          notes?: string | null
          reps?: number | null
          routine_id?: number | null
          sets?: number | null
          start_time?: string | null
          user_id?: string | null
          volume?: number | null
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "workout_logs_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_logs_routine_id_fkey"
            columns: ["routine_id"]
            isOneToOne: false
            referencedRelation: "routines"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_streak: { Args: { p_user_id: string }; Returns: number }
      get_friends: {
        Args: { p_user_id: string }
        Returns: {
          avatar_url: string
          id: string
          username: string
        }[]
      }
      get_leaderboard: {
        Args: { p_filter: string; p_user_id: string }
        Returns: {
          avatar_url: string
          user_id: string
          username: string
          value: number
        }[]
      }
      get_unique_body_zones: {
        Args: never
        Returns: {
          body_zone: string
        }[]
      }
      get_user_profile_stats: { Args: { p_user_id: string }; Returns: Json }
      get_user_prs: {
        Args: { p_user_id: string }
        Returns: {
          exercise_id: number
          exercise_name: string
          max_weight: number
        }[]
      }
    }
    Enums: {
      fitness_goal_enum: "weight_loss" | "muscle_gain" | "maintenance"
    }
    CompositeTypes: {
      weekly_activity_day: {
        day_name: string | null
        workout_count: number | null
      }
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
      fitness_goal_enum: ["weight_loss", "muscle_gain", "maintenance"],
    },
  },
} as const
