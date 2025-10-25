/**
 * TypeScript types for Supabase database schema
 * Generated from Supabase migrations
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

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
          full_name: string
          phone: string | null
          role: UserRole
          avatar_url: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name: string
          phone?: string | null
          role?: UserRole
          avatar_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          phone?: string | null
          role?: UserRole
          avatar_url?: string | null
          is_active?: boolean
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
          expertise: ExpertiseArea[]
          hourly_rate: number
          photo_url: string | null
          status: AdvisorStatus
          verified_at: string | null
          average_rating: number
          total_reviews: number
          total_bookings: number
          total_revenue: number
          rejection_reason: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          bio?: string | null
          experience_years?: number | null
          sebi_reg_no?: string | null
          linkedin_url?: string | null
          expertise: ExpertiseArea[]
          hourly_rate: number
          photo_url?: string | null
          status?: AdvisorStatus
          verified_at?: string | null
          average_rating?: number
          total_reviews?: number
          total_bookings?: number
          total_revenue?: number
          rejection_reason?: string | null
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
          expertise?: ExpertiseArea[]
          hourly_rate?: number
          photo_url?: string | null
          status?: AdvisorStatus
          verified_at?: string | null
          average_rating?: number
          total_reviews?: number
          total_bookings?: number
          total_revenue?: number
          rejection_reason?: string | null
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
          meeting_link: string | null
          daily_room_name: string | null
          notes: string | null
          status: BookingStatus
          investor_joined_at: string | null
          advisor_joined_at: string | null
          ended_at: string | null
          cancellation_reason: string | null
          cancelled_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          investor_id: string
          advisor_id: string
          meeting_time: string
          duration_minutes?: number
          meeting_link?: string | null
          daily_room_name?: string | null
          notes?: string | null
          status?: BookingStatus
          investor_joined_at?: string | null
          advisor_joined_at?: string | null
          ended_at?: string | null
          cancellation_reason?: string | null
          cancelled_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          investor_id?: string
          advisor_id?: string
          meeting_time?: string
          duration_minutes?: number
          meeting_link?: string | null
          daily_room_name?: string | null
          notes?: string | null
          status?: BookingStatus
          investor_joined_at?: string | null
          advisor_joined_at?: string | null
          ended_at?: string | null
          cancellation_reason?: string | null
          cancelled_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      payments: {
        Row: {
          id: string
          booking_id: string
          razorpay_order_id: string | null
          razorpay_payment_id: string | null
          razorpay_signature: string | null
          amount: number
          currency: string
          status: PaymentStatus
          advisor_payout: number | null
          platform_commission: number | null
          commission_percentage: number
          refund_amount: number | null
          refunded_at: string | null
          payment_method: string | null
          error_code: string | null
          error_description: string | null
          webhook_processed_at: string | null
          idempotency_key: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          booking_id: string
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          razorpay_signature?: string | null
          amount: number
          currency?: string
          status?: PaymentStatus
          advisor_payout?: number | null
          platform_commission?: number | null
          commission_percentage?: number
          refund_amount?: number | null
          refunded_at?: string | null
          payment_method?: string | null
          error_code?: string | null
          error_description?: string | null
          webhook_processed_at?: string | null
          idempotency_key?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          booking_id?: string
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          razorpay_signature?: string | null
          amount?: number
          currency?: string
          status?: PaymentStatus
          advisor_payout?: number | null
          platform_commission?: number | null
          commission_percentage?: number
          refund_amount?: number | null
          refunded_at?: string | null
          payment_method?: string | null
          error_code?: string | null
          error_description?: string | null
          webhook_processed_at?: string | null
          idempotency_key?: string | null
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
          is_visible: boolean
          flagged: boolean
          flag_reason: string | null
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
          is_visible?: boolean
          flagged?: boolean
          flag_reason?: string | null
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
          is_visible?: boolean
          flagged?: boolean
          flag_reason?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      admin_actions: {
        Row: {
          id: string
          admin_id: string
          action: string
          target_id: string | null
          target_type: string | null
          details: Json | null
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          admin_id: string
          action: string
          target_id?: string | null
          target_type?: string | null
          details?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          admin_id?: string
          action?: string
          target_id?: string | null
          target_type?: string | null
          details?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
      }
      events: {
        Row: {
          id: string
          user_id: string | null
          event_name: string
          properties: Json | null
          session_id: string | null
          ip_address: string | null
          user_agent: string | null
          referrer: string | null
          timestamp: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          event_name: string
          properties?: Json | null
          session_id?: string | null
          ip_address?: string | null
          user_agent?: string | null
          referrer?: string | null
          timestamp?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          event_name?: string
          properties?: Json | null
          session_id?: string | null
          ip_address?: string | null
          user_agent?: string | null
          referrer?: string | null
          timestamp?: string
        }
      }
      consent_logs: {
        Row: {
          id: string
          user_id: string
          consent_type: string
          consent_given: boolean
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          consent_type: string
          consent_given: boolean
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          consent_type?: string
          consent_given?: boolean
          ip_address?: string | null
          user_agent?: string | null
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
      user_role: UserRole
      advisor_status: AdvisorStatus
      payment_status: PaymentStatus
      booking_status: BookingStatus
      expertise_area: ExpertiseArea
    }
  }
}

