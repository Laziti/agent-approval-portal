
import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { UserProfile, profilesTable } from "@/types/auth";
import { CheckCircle, XCircle, LogOut, Eye, User } from "lucide-react";
import { toast } from "sonner";

const AdminDashboard = () => {
  const { user, profile, signOut } = useAuth();
  const [agents, setAgents] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Redirect if not logged in
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Redirect if not a super_admin
  if (profile && profile.role !== "super_admin") {
    if (profile.role === "agent" && profile.status === "approved") {
      return <Navigate to="/agent-dashboard" replace />;
    } else if (profile.role === "agent" && profile.status === "pending_approval") {
      return <Navigate to="/pending" replace />;
    }
  }

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        setIsLoading(true);
        // Use type assertion for the table name
        const { data, error } = await supabase
          .from(profilesTable as any)
          .select("*")
          .eq("role", "agent")
          .order("created_at", { ascending: false });

        if (error) throw error;
        setAgents(data as UserProfile[]);
      } catch (error: any) {
        console.error("Error fetching agents:", error);
        toast.error(error.message || "Failed to fetch agents");
      } finally {
        setIsLoading(false);
      }
    };

    if (profile?.role === "super_admin") {
      fetchAgents();
    }
  }, [profile]);

  const updateAgentStatus = async (agentId: string, status: "approved" | "rejected") => {
    try {
      // Use type assertion for the table name
      const { error } = await supabase
        .from(profilesTable as any)
        .update({ status } as any)
        .eq("id", agentId);

      if (error) throw error;

      // Update the local state
      setAgents((prevAgents) =>
        prevAgents.map((agent) =>
          agent.id === agentId ? { ...agent, status } : agent
        )
      );

      toast.success(`Agent ${status === "approved" ? "approved" : "rejected"} successfully`);
    } catch (error: any) {
      console.error("Error updating agent status:", error);
      toast.error(error.message || "Failed to update agent status");
    }
  };

  const viewReceipt = (url: string | undefined) => {
    if (!url) {
      toast.error("No payment receipt available");
      return;
    }
    window.open(url, "_blank");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-gray-500">Manage agent applications and approvals</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="bg-primary h-8 w-8 rounded-full flex items-center justify-center text-white">
                <User size={18} />
              </div>
              <div>
                <p className="font-medium text-sm">{profile?.name}</p>
                <p className="text-xs text-gray-500">Super Admin</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => signOut()}>
              <LogOut className="h-4 w-4 mr-2" /> Sign Out
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Agent Applications</CardTitle>
            <CardDescription>View and manage agent applications</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-center py-4">Loading agents...</p>
            ) : agents.length === 0 ? (
              <p className="text-center py-4">No agents found</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Career</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {agents.map((agent) => (
                    <TableRow key={agent.id}>
                      <TableCell className="font-medium">{agent.name}</TableCell>
                      <TableCell>{agent.phone_number}</TableCell>
                      <TableCell>{agent.career || "N/A"}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            agent.status === "approved"
                              ? "default"
                              : agent.status === "rejected"
                              ? "destructive"
                              : "outline"
                          }
                        >
                          {agent.status.replace("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {new Date(agent.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => viewReceipt(agent.payment_receipt_url)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {agent.status === "pending_approval" && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                className="bg-green-50 hover:bg-green-100 text-green-600 border-green-200"
                                onClick={() => updateAgentStatus(agent.id, "approved")}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" /> Approve
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="bg-red-50 hover:bg-red-100 text-red-600 border-red-200"
                                onClick={() => updateAgentStatus(agent.id, "rejected")}
                              >
                                <XCircle className="h-4 w-4 mr-1" /> Reject
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
