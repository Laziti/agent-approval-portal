
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LogOut, User, Home } from "lucide-react";

const AgentDashboard = () => {
  const { user, profile, signOut } = useAuth();

  // Redirect if not logged in
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Redirect if not an approved agent
  if (profile && (profile.role !== "agent" || profile.status !== "approved")) {
    if (profile.role === "super_admin") {
      return <Navigate to="/admin-dashboard" replace />;
    } else if (profile.role === "agent" && profile.status === "pending_approval") {
      return <Navigate to="/pending" replace />;
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Agent Dashboard</h1>
            <p className="text-gray-500">Welcome to your agent dashboard</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="bg-primary h-8 w-8 rounded-full flex items-center justify-center text-white">
                <User size={18} />
              </div>
              <div>
                <p className="font-medium text-sm">{profile?.name}</p>
                <p className="text-xs text-gray-500">Agent</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => signOut()}>
              <LogOut className="h-4 w-4 mr-2" /> Sign Out
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Welcome, {profile?.name}!</CardTitle>
              <CardDescription>Your agent account has been approved</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                You now have access to all agent features. Browse properties, manage clients, and more from your dashboard.
              </p>
              <div className="mt-6">
                <Button className="w-full">
                  <Home className="mr-2 h-4 w-4" /> Explore Properties
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Your Profile</CardTitle>
              <CardDescription>Your personal information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <p className="text-sm font-medium text-gray-500">Name</p>
                  <p>{profile?.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Phone Number</p>
                  <p>{profile?.phone_number}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Career</p>
                  <p>{profile?.career || "Not specified"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  <p className="capitalize">{profile?.status.replace("_", " ")}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
              <CardDescription>Your activity summary</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-md">
                  <p className="text-sm font-medium text-gray-500">Properties Viewed</p>
                  <p className="text-2xl font-bold">0</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-md">
                  <p className="text-sm font-medium text-gray-500">Clients</p>
                  <p className="text-2xl font-bold">0</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AgentDashboard;
