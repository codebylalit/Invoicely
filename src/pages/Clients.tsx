import { useEffect, useState } from "react";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Trash,
  Edit,
  Plus,
  Phone,
  Mail,
  Building,
  MapPin,
  AlertTriangle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";
import { useSession } from "@supabase/auth-helpers-react";

interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  company?: string;
  created_at?: string;
  invoice_count?: number;
}

const FREE_TIER_LIMIT = 5; // Maximum clients for free tier users

const Clients = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentClient, setCurrentClient] = useState<Client | null>(null);
  const [limitReached, setLimitReached] = useState(false);
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [company, setCompany] = useState("");
  const session = useSession();
  const supabase = useSupabaseClient();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [userSubscription, setUserSubscription] = useState({
    tier: "free", // Default to free
  });

  const fetchUserSubscription = async () => {
    try {
      if (!session?.user?.id) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("tier")
        .eq("user_id", session.user.id)
        .single();

      if (error) throw error;

      if (data) {
        setUserSubscription({
          tier: data.tier || "free",
        });
      }
    } catch (error) {
      console.error("Error fetching user subscription:", error);
      toast({
        title: "Error",
        description: "Failed to load subscription details",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (session?.user?.id) {
      fetchUserSubscription();
    }
  }, [session]);

  const fetchClients = async () => {
    setLoading(true);
    try {
      // First get all clients
      const { data: clientsData, error: clientsError } = await supabase
        .from("clients")
        .select("*")
        .order("name", { ascending: true });

      if (clientsError) throw clientsError;

      // Then count invoices for each client
      const clientsWithCounts = await Promise.all(
        (clientsData || []).map(async (client) => {
          const { count, error: countError } = await supabase
            .from("invoices")
            .select("*", { count: "exact", head: true })
            .eq("client_name", client.name);

          if (countError) throw countError;

          return {
            ...client,
            invoice_count: count || 0,
          };
        })
      );

      setClients(clientsWithCounts);

      // Check if free tier limit is reached
      if (
        userSubscription.tier === "free" &&
        clientsWithCounts.length >= FREE_TIER_LIMIT
      ) {
        setLimitReached(true);
      } else {
        setLimitReached(false);
      }
    } catch (error: any) {
      toast({
        title: "Error loading clients",
        description: error.message || "Failed to load clients",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, [userSubscription]);

  const resetForm = () => {
    setName("");
    setEmail("");
    setPhone("");
    setAddress("");
    setCompany("");
    setCurrentClient(null);
    setIsEditing(false);
  };

  const openAddDialog = () => {
    // Check if free user has reached client limit
    if (userSubscription.tier === "free" && clients.length >= FREE_TIER_LIMIT) {
      setUpgradeDialogOpen(true);
      return;
    }

    resetForm();
    setFormOpen(true);
  };

  const openEditDialog = (client: Client) => {
    setCurrentClient(client);
    setName(client.name);
    setEmail(client.email || "");
    setPhone(client.phone || "");
    setAddress(client.address || "");
    setCompany(client.company || "");
    setIsEditing(true);
    setFormOpen(true);
  };

  const goToSubscription = () => {
    navigate("/app/settings?tab=subscription");
    setUpgradeDialogOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Double check limit for free users trying to add clients
    if (
      !isEditing &&
      userSubscription.tier === "free" &&
      clients.length >= FREE_TIER_LIMIT
    ) {
      setUpgradeDialogOpen(true);
      return;
    }

    const clientData = {
      name,
      email: email || null,
      phone: phone || null,
      address: address || null,
      company: company || null,
    };

    try {
      if (isEditing && currentClient) {
        // Update existing client
        const { error } = await supabase
          .from("clients")
          .update(clientData)
          .eq("id", currentClient.id);

        if (error) throw error;

        // Also update any invoices that reference this client if the name has changed
        if (name !== currentClient.name) {
          const { error: invoiceUpdateError } = await supabase
            .from("invoices")
            .update({ client_name: name })
            .eq("client_name", currentClient.name);

          if (invoiceUpdateError) throw invoiceUpdateError;
        }

        toast({
          title: "Client updated",
          description: `${name} has been updated successfully`,
        });
      } else {
        // Add new client
        const { data, error } = await supabase
          .from("clients")
          .insert([clientData])
          .select();

        if (error) throw error;

        toast({
          title: "Client added",
          description: `${name} has been added successfully`,
        });
      }

      // Refresh client list
      await fetchClients();
      setFormOpen(false);
      resetForm();
    } catch (error: any) {
      toast({
        title: isEditing ? "Error updating client" : "Error adding client",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
    }
  };

  const handleDeleteClient = async (client: Client) => {
    // Check if client has invoices
    const { count, error: countError } = await supabase
      .from("invoices")
      .select("*", { count: "exact", head: true })
      .eq("client_name", client.name);

    if (countError) {
      toast({
        title: "Error checking invoices",
        description:
          countError.message || "Failed to check for related invoices",
        variant: "destructive",
      });
      return;
    }

    if (count && count > 0) {
      toast({
        title: "Cannot delete client",
        description: `${client.name} has ${count} invoices. Please delete those invoices first.`,
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from("clients")
        .delete()
        .eq("id", client.id);

      if (error) throw error;

      setClients(clients.filter((c) => c.id !== client.id));

      toast({
        title: "Client deleted",
        description: `${client.name} has been deleted successfully`,
      });
    } catch (error: any) {
      toast({
        title: "Error deleting client",
        description: error.message || "Failed to delete client",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="flex items-start justify-between mb-6">
        <h1 className="text-3xl font-bold">Clients</h1>
        <Button onClick={openAddDialog}>
          <Plus className="h-4 w-4 mr-2" /> Add Client
        </Button>
      </div>

      {/* Subscription Tier Banner */}
      {userSubscription.tier === "free" && (
        <Card className="mb-6 bg-blue-50 dark:bg-blue-900 border-blue-200 dark:border-blue-800">
          <CardContent className="p-4 flex justify-between items-center">
            <div>
              <h3 className="font-medium">
                {limitReached
                  ? "You've reached the 5 client limit on the free plan"
                  : `Free plan: ${clients.length}/${FREE_TIER_LIMIT} clients`}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Upgrade to Pro for unlimited clients
              </p>
            </div>
            <Button onClick={goToSubscription} variant="default">
              Upgrade to Pro
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Total Clients
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {clients.length}
              {userSubscription.tier === "free" && (
                <span className="text-sm font-normal text-gray-500 ml-2">
                  of {FREE_TIER_LIMIT}
                </span>
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              With Invoices
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {clients.filter((c) => (c.invoice_count || 0) > 0).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              No Invoices
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {clients.filter((c) => (c.invoice_count || 0) === 0).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {loading ? (
        <div className="flex justify-center p-8">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
        </div>
      ) : clients.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h3 className="text-xl font-medium mb-2">No clients yet</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Add your first client to get started
          </p>
          <Button onClick={openAddDialog}>
            <Plus className="h-4 w-4 mr-2" /> Add Client
          </Button>
        </div>
      ) : (
        <div className="grid gap-4">
          {clients.map((client) => (
            <Card key={client.id} className="overflow-hidden">
              <CardHeader className="bg-gray-50 dark:bg-gray-800 flex flex-row items-center justify-between p-4">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    {client.name}
                    {(client.invoice_count || 0) > 0 && (
                      <Badge className="bg-blue-500">
                        {client.invoice_count}{" "}
                        {client.invoice_count === 1 ? "Invoice" : "Invoices"}
                      </Badge>
                    )}
                  </CardTitle>
                  {client.company && (
                    <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                      <Building className="h-3 w-3 mr-1" /> {client.company}
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openEditDialog(client)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-500 hover:text-red-700"
                    onClick={() => handleDeleteClient(client)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                  {client.email && (
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-2 text-gray-400" />
                      <span>{client.email}</span>
                    </div>
                  )}
                  {client.phone && (
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-2 text-gray-400" />
                      <span>{client.phone}</span>
                    </div>
                  )}
                  {client.address && (
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                      <span>{client.address}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Client Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Edit Client" : "Add New Client"}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? "Update the client information. This will also update any invoices associated with this client."
                : "Add a new client to your system."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium" htmlFor="name">
                Name*
              </label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Client name"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium" htmlFor="email">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
              />
            </div>
            <div>
              <label className="text-sm font-medium" htmlFor="phone">
                Phone
              </label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Phone number"
              />
            </div>
            <div>
              <label className="text-sm font-medium" htmlFor="company">
                Company
              </label>
              <Input
                id="company"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Company name"
              />
            </div>
            <div>
              <label className="text-sm font-medium" htmlFor="address">
                Address
              </label>
              <Textarea
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Full address"
                rows={3}
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setFormOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                {isEditing ? "Save Changes" : "Add Client"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Upgrade Dialog */}
      <Dialog open={upgradeDialogOpen} onOpenChange={setUpgradeDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upgrade to Pro</DialogTitle>
            <DialogDescription>
              You've reached the limit of {FREE_TIER_LIMIT} clients on the free
              plan. Upgrade to Pro for unlimited clients and additional
              features.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center p-4">
            <AlertTriangle className="h-16 w-16 text-yellow-500" />
          </div>
          <div className="text-center mb-4">
            <h3 className="font-bold text-lg">Free Plan Limit Reached</h3>
            <p className="text-gray-500">
              You can manage up to {FREE_TIER_LIMIT} clients on the free plan.
              Delete existing clients or upgrade to Pro for unlimited clients.
            </p>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setUpgradeDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={goToSubscription}>Upgrade to Pro</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Clients;
