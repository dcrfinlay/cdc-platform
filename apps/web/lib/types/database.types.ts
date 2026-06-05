export type UserRole = 'student' | 'employer' | 'staff' | 'admin'

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
    }
    Enums: {
      user_role: UserRole
    }
  }
}
