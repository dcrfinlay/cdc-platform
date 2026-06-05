export type UserRole = 'student' | 'employer' | 'staff' | 'admin'

export type EventType = 'workshop' | 'speaker' | 'career_fair' | 'webinar' | 'other'

export type BookingStatus    = 'pending' | 'confirmed' | 'cancelled' | 'completed'
export type NotificationType =
  | 'letter_submitted' | 'letter_under_review' | 'letter_approved'
  | 'letter_rejected'  | 'letter_collected'
  | 'application_reviewed' | 'application_shortlisted'
  | 'application_rejected' | 'application_hired'
  | 'employer_approved' | 'booking_confirmed' | 'booking_cancelled'
  | 'event_registered'  | 'general'
export type JobType          = 'job' | 'internship'
export type JobStatus        = 'draft' | 'published' | 'closed'
export type ApplicationStatus = 'submitted' | 'reviewed' | 'shortlisted' | 'rejected' | 'hired'

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
      jobs: {
        Row: {
          id: string
          employer_id: string
          title: string
          description: string | null
          type: JobType
          location: string | null
          is_remote: boolean
          salary_range: string | null
          deadline: string | null
          status: JobStatus
          created_at: string
          updated_at: string
        }
        Insert: {
          employer_id: string
          title: string
          description?: string | null
          type?: JobType
          location?: string | null
          is_remote?: boolean
          salary_range?: string | null
          deadline?: string | null
          status?: JobStatus
        }
        Update: {
          title?: string
          description?: string | null
          type?: JobType
          location?: string | null
          is_remote?: boolean
          salary_range?: string | null
          deadline?: string | null
          status?: JobStatus
        }
      }
      applications: {
        Row: {
          id: string
          job_id: string
          student_id: string
          cover_letter: string | null
          status: ApplicationStatus
          employer_note: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          job_id: string
          student_id: string
          cover_letter?: string | null
          status?: ApplicationStatus
        }
        Update: {
          status?: ApplicationStatus
          employer_note?: string | null
        }
      }
      saved_jobs: {
        Row: {
          id: string
          job_id: string
          student_id: string
          saved_at: string
        }
        Insert: {
          job_id: string
          student_id: string
        }
        Update: Record<string, never>
      }
      resumes: {
        Row: {
          id: string
          student_id: string
          file_path: string
          file_name: string
          file_size: number | null
          cv_visible: boolean
          uploaded_at: string
          updated_at: string
        }
        Insert: {
          student_id: string
          file_path: string
          file_name: string
          file_size?: number | null
          cv_visible?: boolean
        }
        Update: {
          file_path?: string
          file_name?: string
          file_size?: number | null
          cv_visible?: boolean
        }
      }
    }
      announcements: {
        Row: {
          id: string
          title: string
          body: string
          icon: string
          color: string
          is_published: boolean
          sort_order: number
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          title: string
          body: string
          icon?: string
          color?: string
          is_published?: boolean
          sort_order?: number
          created_by?: string | null
        }
        Update: {
          title?: string
          body?: string
          icon?: string
          color?: string
          is_published?: boolean
          sort_order?: number
        }
      }
      audit_logs: {
        Row: {
          id: string
          actor_id: string | null
          actor_email: string | null
          action: string
          target_table: string | null
          target_id: string | null
          metadata: Record<string, unknown> | null
          created_at: string
        }
        Insert: {
          actor_id?: string | null
          actor_email?: string | null
          action: string
          target_table?: string | null
          target_id?: string | null
          metadata?: Record<string, unknown> | null
        }
        Update: Record<string, never>
      }
      appointment_slots: {
        Row: {
          id: string
          staff_id: string
          slot_date: string
          start_time: string
          end_time: string
          label: string | null
          is_available: boolean
          created_at: string
        }
        Insert: {
          staff_id: string
          slot_date: string
          start_time: string
          end_time: string
          label?: string | null
          is_available?: boolean
        }
        Update: {
          is_available?: boolean
          label?: string | null
        }
      }
      bookings: {
        Row: {
          id: string
          slot_id: string
          student_id: string
          reason: string | null
          status: BookingStatus
          staff_notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          slot_id: string
          student_id: string
          reason?: string | null
          status?: BookingStatus
        }
        Update: {
          status?: BookingStatus
          staff_notes?: string | null
        }
      }
    }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: NotificationType
          title: string
          body: string | null
          link: string | null
          is_read: boolean
          created_at: string
        }
        Insert: {
          user_id: string
          type?: NotificationType
          title: string
          body?: string | null
          link?: string | null
          is_read?: boolean
        }
        Update: {
          is_read?: boolean
        }
      }
    }
    Enums: {
      user_role: UserRole
      letter_status: LetterStatus
      event_type: EventType
      job_type: JobType
      job_status: JobStatus
      application_status: ApplicationStatus
      booking_status: BookingStatus
      notification_type: NotificationType
    }
  }
}
