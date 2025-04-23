
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useSession } from "@supabase/auth-helpers-react";

interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  company?: string;
  created_at?: string;
}

const Clients = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [addLoading, setAddLoading] = useState(false);
  const session = useSession();

  useEffect(() => {
    setLoading(true);
    supabase
      .from("clients")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setClients(data ?? []);
        setLoading(false);
      });
  }, []);

  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.id) {
      console.error("No user ID found - user must be logged in");
      return;
    }
    
    setAddLoading(true);
    const { data, error } = await supabase
      .from("clients")
      .insert([{ name, email, user_id: session.user.id }])
      .select();
    setAddLoading(false);
    
    if (!error && data) {
      setClients([data[0], ...clients]);
      setName("");
      setEmail("");
    } else if (error) {
      console.error("Error adding client:", error);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Clients</h1>
      <form onSubmit={handleAddClient} className="flex gap-4 mb-6">
        <Input
          placeholder="Client name"
          value={name}
          onChange={e => setName(e.target.value)}
          required
        />
        <Input
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          type="email"
        />
        <Button type="submit" disabled={addLoading}>
          {addLoading ? "Adding..." : "Add"}
        </Button>
      </form>
      <div className="grid gap-4">
        {loading ? (
          <div>Loading clients...</div>
        ) : clients.length === 0 ? (
          <div>No clients yet.</div>
        ) : (
          clients.map(client => (
            <Card key={client.id}>
              <CardHeader>
                <CardTitle>{client.name}</CardTitle>
              </CardHeader>
              <CardContent>
                {client.email && <div className="text-sm">Email: {client.email}</div>}
                {client.company && <div className="text-sm">Company: {client.company}</div>}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default Clients;
