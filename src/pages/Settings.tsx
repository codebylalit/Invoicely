
import { useSession } from "@supabase/auth-helpers-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const Settings = () => {
  // For demo, let's assume the user is free, since checking tier from DB is not implemented yet
  const isFree = true;

  const [upgrading, setUpgrading] = useState(false);

  const handleUpgrade = () => {
    setUpgrading(true);
    setTimeout(() => {
      setUpgrading(false); // Demo only
      alert("Upgrade functionality coming soon!");
    }, 1200);
  };

  return (
    <div className="p-6 max-w-xl mx-auto flex flex-col min-h-[60vh]">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      <div className="mb-8">
        <div className="mb-3 text-sm"> <b>Account Settings:</b> </div>
        <div className="mb-4 text-muted-foreground">Account setting features coming soon.</div>
      </div>
      <div className="mt-auto flex flex-col items-center">
        {isFree && (
          <Button
            size="lg"
            className="bg-invoice-orange hover:bg-invoice-orange/90 w-full"
            onClick={handleUpgrade}
            disabled={upgrading}
          >
            {upgrading ? "Upgrading..." : "Upgrade to Pro"}
          </Button>
        )}
      </div>
    </div>
  );
};

export default Settings;
