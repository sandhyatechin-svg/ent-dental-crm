export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          role: 'admin' | 'doctor' | 'receptionist' | 'pharmacist'
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          role: 'admin' | 'doctor' | 'receptionist' | 'pharmacist'
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          role?: 'admin' | 'doctor' | 'receptionist' | 'pharmacist'
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      patients: {
        Row: {
          id: string
          first_name: string
          last_name: string
          email: string | null
          phone: string | null
          date_of_birth: string | null
          gender: 'male' | 'female' | 'other' | null
          address: string | null
          emergency_contact: string | null
          medical_history: string | null
          allergies: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          first_name: string
          last_name: string
          email?: string | null
          phone?: string | null
          date_of_birth?: string | null
          gender?: 'male' | 'female' | 'other' | null
          address?: string | null
          emergency_contact?: string | null
          medical_history?: string | null
          allergies?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          first_name?: string
          last_name?: string
          email?: string | null
          phone?: string | null
          date_of_birth?: string | null
          gender?: 'male' | 'female' | 'other' | null
          address?: string | null
          emergency_contact?: string | null
          medical_history?: string | null
          allergies?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      visits: {
        Row: {
          id: string
          patient_id: string
          doctor_id: string
          visit_date: string
          visit_time: string
          visit_type: 'consultation' | 'follow_up' | 'emergency' | 'routine_checkup'
          status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
          diagnosis: string | null
          treatment_plan: string | null
          notes: string | null
          prescription: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          patient_id: string
          doctor_id: string
          visit_date: string
          visit_time: string
          visit_type: 'consultation' | 'follow_up' | 'emergency' | 'routine_checkup'
          status?: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
          diagnosis?: string | null
          treatment_plan?: string | null
          notes?: string | null
          prescription?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          patient_id?: string
          doctor_id?: string
          visit_date?: string
          visit_time?: string
          visit_type?: 'consultation' | 'follow_up' | 'emergency' | 'routine_checkup'
          status?: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
          diagnosis?: string | null
          treatment_plan?: string | null
          notes?: string | null
          prescription?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "visits_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visits_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      medicines: {
        Row: {
          id: string
          name: string
          generic_name: string | null
          manufacturer: string | null
          dosage_form: 'tablet' | 'capsule' | 'syrup' | 'injection' | 'cream' | 'other'
          strength: string | null
          unit: string | null
          stock_quantity: number
          min_stock_level: number
          price_per_unit: number
          expiry_date: string | null
          batch_number: string | null
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          generic_name?: string | null
          manufacturer?: string | null
          dosage_form: 'tablet' | 'capsule' | 'syrup' | 'injection' | 'cream' | 'other'
          strength?: string | null
          unit?: string | null
          stock_quantity?: number
          min_stock_level?: number
          price_per_unit?: number
          expiry_date?: string | null
          batch_number?: string | null
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          generic_name?: string | null
          manufacturer?: string | null
          dosage_form?: 'tablet' | 'capsule' | 'syrup' | 'injection' | 'cream' | 'other'
          strength?: string | null
          unit?: string | null
          stock_quantity?: number
          min_stock_level?: number
          price_per_unit?: number
          expiry_date?: string | null
          batch_number?: string | null
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      prescriptions: {
        Row: {
          id: string
          visit_id: string
          medicine_id: string
          dosage: string
          frequency: string
          duration: string
          instructions: string | null
          quantity: number
          created_at: string
        }
        Insert: {
          id?: string
          visit_id: string
          medicine_id: string
          dosage: string
          frequency: string
          duration: string
          instructions?: string | null
          quantity: number
          created_at?: string
        }
        Update: {
          id?: string
          visit_id?: string
          medicine_id?: string
          dosage?: string
          frequency?: string
          duration?: string
          instructions?: string | null
          quantity?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "prescriptions_visit_id_fkey"
            columns: ["visit_id"]
            isOneToOne: false
            referencedRelation: "visits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prescriptions_medicine_id_fkey"
            columns: ["medicine_id"]
            isOneToOne: false
            referencedRelation: "medicines"
            referencedColumns: ["id"]
          }
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
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
