import { useEffect, useState } from "react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import AdSenseAd from "./AdSenseAd";

interface ConditionalAdProps {
  adSlot: string;
  className?: string;
}

const ConditionalAd = ({ adSlot, className = "" }: ConditionalAdProps) => {
  const [userTier, setUserTier] = useState<string>("free");
  const [loading, setLoading] = useState(true);
  const session = useSession();
  const supabase = useSupabaseClient();

  useEffect(() => {
    const fetchUserTier = async () => {
      if (!session?.user?.id) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("tier")
          .eq("user_id", session.user.id)
          .single();

        if (error && error.code !== "PGRST116") {
          console.error("Error fetching user tier:", error);
        }

        setUserTier(data?.tier || "free");
      } catch (error) {
        console.error("Error in fetchUserTier:", error);
        setUserTier("free");
      } finally {
        setLoading(false);
      }
    };

    fetchUserTier();
  }, [session, supabase]);

  // Don't show ads for pro users
  if (loading || userTier === "pro") {
    return null;
  }

  // Only show ads for free users
  return (
    <div className={`ad-container ${className}`}>
      <AdSenseAd adSlot={adSlot} />
    </div>
  );
};

export default ConditionalAd; 