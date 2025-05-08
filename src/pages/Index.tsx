
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Link, Navigate } from "react-router-dom";
import { LogIn, UserPlus, ArrowRight } from "lucide-react";

const Index = () => {
  const { user, profile } = useAuth();

  // If user is authenticated, redirect to appropriate dashboard
  if (user && profile) {
    if (profile.role === "super_admin") {
      return <Navigate to="/admin-dashboard" replace />;
    } else if (profile.role === "agent" && profile.status === "approved") {
      return <Navigate to="/agent-dashboard" replace />;
    } else if (profile.role === "agent" && profile.status === "pending_approval") {
      return <Navigate to="/pending" replace />;
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4">
        <header className="py-6 flex justify-between items-center">
          <div className="text-2xl font-bold">REE</div>
          <div className="flex gap-4">
            <Button variant="outline" asChild>
              <Link to="/auth">
                <LogIn className="h-4 w-4 mr-2" /> Login
              </Link>
            </Button>
            <Button asChild>
              <Link to="/auth?tab=signup">
                <UserPlus className="h-4 w-4 mr-2" /> Sign Up
              </Link>
            </Button>
          </div>
        </header>

        <main className="py-20">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Welcome to REE
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Join our platform for real estate professionals. Create an account or sign in to access our services.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link to="/auth?tab=signup">
                  Get Started <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/auth">Sign In</Link>
              </Button>
            </div>
          </div>

          <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h2 className="text-xl font-semibold mb-4">For Agents</h2>
              <p className="text-gray-600 mb-4">
                Access to exclusive property listings and tools to help you manage your real estate business.
              </p>
              <Button variant="link" asChild className="p-0">
                <Link to="/auth?tab=signup">
                  Sign up as an agent <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h2 className="text-xl font-semibold mb-4">Easy Management</h2>
              <p className="text-gray-600 mb-4">
                Powerful tools to manage your properties, clients, and transactions all in one place.
              </p>
              <Button variant="link" className="p-0">
                <Link to="/auth">
                  Learn more <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h2 className="text-xl font-semibold mb-4">Support</h2>
              <p className="text-gray-600 mb-4">
                Our team is here to help you succeed. Get support whenever you need it.
              </p>
              <Button variant="link" className="p-0">
                <Link to="/auth">
                  Contact us <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;
