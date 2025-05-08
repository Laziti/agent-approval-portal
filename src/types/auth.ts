
export type UserRole = 'super_admin' | 'agent';
export type UserStatus = 'pending_approval' | 'approved' | 'rejected';

export interface UserProfile {
  id: string;
  name: string;
  phone_number: string;
  career?: string;
  role: UserRole;
  status: UserStatus;
  payment_receipt_url?: string;
  created_at: string;
  updated_at: string;
}

// Helper functions for type-safe Supabase queries
export const profilesTable = 'profiles';

// Type for the Supabase table
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: UserProfile;
        Insert: Partial<UserProfile>;
        Update: Partial<UserProfile>;
      };
    };
  };
}
