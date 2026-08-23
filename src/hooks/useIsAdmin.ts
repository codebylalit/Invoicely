import { useCallback, useEffect, useState } from "react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";

/**
 * Admin status comes from the database (`profiles.is_admin`), not from a list of
 * emails shipped in the JS bundle. The bundle is public, so an email allowlist
 * told every visitor who the admins were while protecting nothing. The real
 * enforcement lives in the admin RPCs, which each call `require_admin()`; this
 * hook only decides whether to render the admin UI.
 */
export function useIsAdmin() {
  const supabase = useSupabaseClient();
  const session = useSession();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const check = useCallback(async () => {
    if (!session?.user?.id) {
      setIsAdmin(false);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("user_id", session.user.id)
      .maybeSingle();

    if (error) {
      console.warn("[useIsAdmin] Admin check failed, denying access:", error.message);
      setIsAdmin(false);
    } else {
      setIsAdmin((data as { is_admin?: boolean } | null)?.is_admin === true);
    }
    setIsLoading(false);
  }, [session?.user?.id, supabase]);

  useEffect(() => {
    check();
  }, [check]);

  return { isAdmin, isLoading };
}
