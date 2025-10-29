// Auto-generated Supabase types for better type inference
// This file provides proper TypeScript types for database operations

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// Helper types for better type safety
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Inserts<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type Updates<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']

// Export individual types for easier imports
export type UserRole = 'investor' | 'advisor' | 'admin'
export type AdvisorStatus = 'pending' | 'approved' | 'rejected' | 'suspended'
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded'
export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'
export type ExpertiseArea =
  | 'mutual_funds'
  | 'stocks'
  | 'tax_planning'
  | 'retirement_planning'
  | 'insurance'
  | 'real_estate'
  | 'portfolio_management'
  | 'debt_management'
  | 'wealth_management'

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          role: 'investor' | 'advisor' | 'admin'
          phone: string | null
          avatar_url: string | null
          email_verified: boolean
          onboarding_completed: boolean
          onboarding_data: any
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          role?: 'investor' | 'advisor' | 'admin'
          phone?: string | null
          avatar_url?: string | null
          email_verified?: boolean
          onboarding_completed?: boolean
          onboarding_data?: any
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          role?: 'investor' | 'advisor' | 'admin'
          phone?: string | null
          avatar_url?: string | null
          email_verified?: boolean
          onboarding_completed?: boolean
          onboarding_data?: any
          created_at?: string
          updated_at?: string
        }
      }
      advisors: {
        Row: {
          id: string
          user_id: string
          bio: string | null
          experience_years: number | null
          sebi_reg_no: string | null
          linkedin_url: string | null
          expertise: string[]
          hourly_rate: number
          status: 'pending' | 'approved' | 'rejected' | 'suspended'
          avg_rating: number
          total_reviews: number
          total_bookings: number
          total_revenue: number
          created_at: string
          updated_at: string
          users?: {
            email: string
            full_name: string | null
          }
        }
        Insert: {
          id?: string
          user_id: string
          bio?: string | null
          experience_years?: number | null
          sebi_reg_no?: string | null
          linkedin_url?: string | null
          expertise?: string[]
          hourly_rate: number
          status?: 'pending' | 'approved' | 'rejected' | 'suspended'
          avg_rating?: number
          total_reviews?: number
          total_bookings?: number
          total_revenue?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          bio?: string | null
          experience_years?: number | null
          sebi_reg_no?: string | null
          linkedin_url?: string | null
          expertise?: string[]
          hourly_rate?: number
          status?: 'pending' | 'approved' | 'rejected' | 'suspended'
          avg_rating?: number
          total_reviews?: number
          total_bookings?: number
          total_revenue?: number
          created_at?: string
          updated_at?: string
        }
      }
      bookings: {
        Row: {
          id: string
          investor_id: string
          advisor_id: string
          meeting_time: string
          duration_minutes: number
          status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
          meeting_link: string | null
          daily_room_name: string | null
          notes: string | null
          created_at: string
          updated_at: string
          advisors?: {
            hourly_rate: number
            users: {
              email: string
              full_name: string | null
            }
          }
        }
        Insert: {
          id?: string
          investor_id: string
          advisor_id: string
          meeting_time: string
          duration_minutes: number
          status?: 'pending' | 'confirmed' | 'completed' | 'cancelled'
          meeting_link?: string | null
          daily_room_name?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          investor_id?: string
          advisor_id?: string
          meeting_time?: string
          duration_minutes?: number
          status?: 'pending' | 'confirmed' | 'completed' | 'cancelled'
          meeting_link?: string | null
          daily_room_name?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      payments: {
        Row: {
          id: string
          booking_id: string
          razorpay_order_id: string
          razorpay_payment_id: string | null
          razorpay_signature: string | null
          amount: number
          currency: string
          status: 'created' | 'completed' | 'failed' | 'refunded'
          commission_percentage: number
          platform_commission: number
          advisor_payout: number
          idempotency_key: string
          error_code: string | null
          error_description: string | null
          refund_amount: number | null
          refunded_at: string | null
          created_at: string
          updated_at: string
          bookings?: {
            advisor_id: string
          }
        }
        Insert: {
          id?: string
          booking_id: string
          razorpay_order_id: string
          razorpay_payment_id?: string | null
          razorpay_signature?: string | null
          amount: number
          currency?: string
          status?: 'created' | 'completed' | 'failed' | 'refunded'
          commission_percentage: number
          platform_commission: number
          advisor_payout: number
          idempotency_key: string
          error_code?: string | null
          error_description?: string | null
          refund_amount?: number | null
          refunded_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          booking_id?: string
          razorpay_order_id?: string
          razorpay_payment_id?: string | null
          razorpay_signature?: string | null
          amount?: number
          currency?: string
          status?: 'created' | 'completed' | 'failed' | 'refunded'
          commission_percentage?: number
          platform_commission?: number
          advisor_payout?: number
          idempotency_key?: string
          error_code?: string | null
          error_description?: string | null
          refund_amount?: number | null
          refunded_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      reviews: {
        Row: {
          id: string
          booking_id: string
          investor_id: string
          advisor_id: string
          rating: number
          comment: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          booking_id: string
          investor_id: string
          advisor_id: string
          rating: number
          comment?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          booking_id?: string
          investor_id?: string
          advisor_id?: string
          rating?: number
          comment?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      admin_actions: {
        Row: {
          id: string
          admin_id: string
          action: string
          target_id: string
          target_type: string
          details: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          admin_id: string
          action: string
          target_id: string
          target_type: string
          details?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          admin_id?: string
          action?: string
          target_id?: string
          target_type?: string
          details?: Json | null
          created_at?: string
        }
      }
      events: {
        Row: {
          id: string
          user_id: string
          event_type: string
          event_data: Json | null
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          event_type: string
          event_data?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          event_type?: string
          event_data?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
      }
      consent_logs: {
        Row: {
          id: string
          user_id: string
          consent_type: string
          consented: boolean
          consent_text: string
          ip_address: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          consent_type: string
          consented: boolean
          consent_text: string
          ip_address?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          consent_type?: string
          consented?: boolean
          consent_text?: string
          ip_address?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: 'investor' | 'advisor' | 'admin'
      advisor_status: 'pending' | 'approved' | 'rejected' | 'suspended'
      booking_status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
      payment_status: 'created' | 'completed' | 'failed' | 'refunded'
      expertise_area: ExpertiseArea
    }
  }
}

