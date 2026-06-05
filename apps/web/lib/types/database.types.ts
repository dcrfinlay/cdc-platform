export type UserRole = 'student' | 'employer' | 'staff' | 'admin'

export type EventType = 'workshop' | 'speaker' | 'career_fair' | 'webinar' | 'other'

export type LetterStatus =
  | 'submitted'
  | 'under_review'
  | 'approved'
  | 'rejected'
  | 'collected'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          role: UserRole
          full_name: string | null
          phone: string | null
          faculty: string | null
          year_of_study: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          role?: UserRole
          full_name?: string | null
          phone?: string | null
          faculty?: string | null
          year_of_study?: string | null
        }
        Update: {
          role?: UserRole
          full_name?: string | null
          phone?: string | null
          faculty?: string | null
          year_of_study?: string | null
        }
      }
      employers: {
        Row: {
          id: string
          company_name: string
          industry: string | null
          website: string | null
          company_size: string | null
          contact_title: string | null
          approved: boolean
          approved_at: string | null
          approved_by: string | null
        }
        Insert: {
          id: string
          company_name: string
          industry?: string | null
          website?: string | null
          company_size?: string | null
          contact_title?: string | null
          approved?: boolean
        }
        Update: {
          company_name?: string
          industry?: string | null
          website?: string | null
          company_size?: string | null
          contact_title?: string | null
          approved?: boolean
          approved_at?: string | null
          approved_by?: string | null
        }
      }
      internship_letters: {
        Row: {
          id: string
          student_id: string
          full_name: string
          student_id_no: string
          faculty: string
          year_of_study: string
          phone: string
          email: string
          company_name: string
          start_date: string
          end_date: string
          delivery_method: string
          notes: string | null
          status: LetterStatus
          staff_notes: string | null
          reviewed_by: string | null
          reviewed_at: string | null
          collected_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          student_id: string
          full_name: string
          student_id_no: string
          faculty: string
          year_of_study: string
          phone: string
          email: string
          company_name: string
          start_date: string
          end_date: string
          delivery_method?: string
          notes?: string | null
          status?: LetterStatus
        }
        Update: {
          status?: LetterStatus
          staff_notes?: string | null
          reviewed_by?: string | null
          reviewed_at?: string | null
          collected_at?: string | null
        }
      }
    }
      events: {
        Row: {
          id: string
          title: string
          description: string | null
          type: EventType
          event_date: string
          end_date: string | null
          location: string | null
          is_online: boolean
          capacity: number | null
          is_published: boolean
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          title: string
          description?: string | null
          type?: EventType
          event_date: string
          end_date?: string | null
          location?: string | null
          is_online?: boolean
          capacity?: number | null
          is_published?: boolean
          created_by?: string | null
        }
        Update: {
          title?: string
          description?: string | null
          type?: EventType
          event_date?: string
          end_date?: string | null
          location?: string | null
          is_online?: boolean
          capacity?: number | null
          is_published?: boolean
        }
      }
      event_registrations: {
        Row: {
          id: string
          event_id: string
          student_id: string
          qr_token: string
          registered_at: string
          attended_at: string | null
        }
        Insert: {
          event_id: string
          student_id: string
        }
        Update: {
          attended_at?: string | null
        }
      }
    }
    Enums: {
      user_role: UserRole
      letter_status: LetterStatus
      event_type: EventType
    }
  }
}
