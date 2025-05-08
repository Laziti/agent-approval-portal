
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";

const PendingApprovalPage = () => {
  const { user, profile, signOut } = useAuth();

  // Redirect if not logged in
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Redirect if user is not pending approval
  if (profile && (profile.role !== "agent" || profile.status !== "pending_approval")) {
    if (profile.role === "super_admin") {
      return <Navigate to="/admin-dashboard" replace />;
    } else if (profile.role === "agent" && profile.status === "approved") {
      return <Navigate to="/agent-dashboard" replace />;
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <div className="bg-yellow-100 p-3 rounded-full">
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </div>
          <CardTitle className="text-center">Account Pending Approval</CardTitle>
          <CardDescription className="text-center">
            Your account is awaiting administrator approval.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="mb-4">
            Thank you for registering with us. Your account is currently being reviewed
            by our team. This process may take 1-2 business days.
          </p>
          <p className="text-sm text-gray-500">
            You will receive an email notification once your account has been approved.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button variant="outline" onClick={() => signOut()}>
            Sign Out
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default PendingApprovalPage;
