
import React, { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { UserProfile, profilesTable } from "@/types/auth";
import { toast } from "sonner";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  isLoading: boolean;
  signUp: (email: string, password: string, userData: Partial<UserProfile>) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (event === 'SIGNED_OUT') {
          setProfile(null);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setIsLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from(profilesTable)
        .select("*")
        .eq("id", userId)
        .single();

      if (error) throw error;
      
      setProfile(data as UserProfile);
    } catch (error) {
      console.error("Error fetching user profile:", error);
      toast.error("Failed to fetch user profile");
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, userData: Partial<UserProfile>) => {
    try {
      console.log("Signing up with:", { email, userData });
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: userData.name,
            phone_number: userData.phone_number,
            career: userData.career,
            payment_receipt_url: userData.payment_receipt_url,
            role: "agent", // Default role for new users
            status: "pending_approval" // Default status for new users
          }
        }
      });

      if (error) throw error;
      
      if (data.user) {
        console.log("User signed up successfully:", data.user);
        navigate("/pending");
        toast.success("Sign up successful! Your account is pending approval.");
      } else {
        console.warn("Sign up returned no user:", data);
        toast.warning("Sign up completed but no user data returned. Please check your email for confirmation.");
      }
    } catch (error: any) {
      console.error("Error during sign up:", error);
      toast.error(error.message || "Failed to sign up");
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log("Attempting to sign in with email:", email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Auth error during sign in:", error);
        throw error;
      }
      
      console.log("Sign in successful:", data);
      
      if (data.user) {
        await fetchProfile(data.user.id);
        toast.success("Signed in successfully!");
        
        // Redirect based on role and status
        if (profile?.role === "super_admin") {
          navigate("/admin-dashboard");
        } else if (profile?.role === "agent" && profile.status === "approved") {
          navigate("/agent-dashboard");
        } else {
          navigate("/pending");
        }
      }
    } catch (error: any) {
      console.error("Error during sign in:", error);
      toast.error(error.message || "Invalid email or password");
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      navigate("/");
      toast.success("Signed out successfully");
    } catch (error: any) {
      console.error("Error during sign out:", error);
      toast.error(error.message || "Failed to sign out");
    }
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from(profilesTable)
        .update(data)
        .eq("id", user.id);

      if (error) throw error;
      
      fetchProfile(user.id);
      toast.success("Profile updated successfully");
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast.error(error.message || "Failed to update profile");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        isLoading,
        signUp,
        signIn,
        signOut,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
