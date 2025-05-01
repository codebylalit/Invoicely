import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";

export const SupabaseCode = ({
  userTier = "free",
  onSubscriptionUpdate,
}: {
  userTier: string;
  onSubscriptionUpdate: (newTier: string) => void;
}) => {
  const supabase = useSupabaseClient();

  const handleSubscription = async (plan: string) => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Error",
          description: "Please login to subscribe",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke(
        "create-checkout",
        {
          body: { plan },
        }
      );

      if (error) throw error;

      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Subscription error:", error);
      toast({
        title: "Error",
        description:
          "Failed to start subscription process. Make sure your Supabase Edge Functions are deployed and the STRIPE_SECRET_KEY is set in your Supabase secrets.",
        variant: "destructive",
      });
    }
  };

  const handlePortalAccess = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Error",
          description: "Please login to access portal",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke(
        "customer-portal",
        {
          body: {},
        }
      );

      if (error) throw error;

      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Portal access error:", error);
      toast({
        title: "Error",
        description:
          "Failed to access customer portal. Make sure your Supabase Edge Functions are deployed and the STRIPE_SECRET_KEY is set in your Supabase secrets.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      {userTier !== "free" && (
        <Button
          onClick={handlePortalAccess}
          variant="outline"
          className="w-full"
        >
          Manage Subscription
        </Button>
      )}
      {userTier === "free" && (
        <Button
          onClick={() => handleSubscription("pro")}
          className="w-full bg-green-600 hover:bg-green-700 text-white"
        >
          Upgrade to Pro
        </Button>
      )}
    </div>
  );
};
