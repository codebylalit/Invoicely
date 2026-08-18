import { useEffect, useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  CheckCircle2,
  XCircle,
  Loader2,
  MailCheck,
  ArrowRight,
  RefreshCw,
  LogIn,
} from "lucide-react";
import Logo from "@/components/Logo";

// ── Types ──────────────────────────────────────────────────────────────────────
type CallbackState =
  | "loading"      // Processing the verification token from the URL
  | "success"      // Session established — about to redirect
  | "confirmed"    // Email confirmed but session could not be auto-established
  | "expired"      // Token is expired
  | "invalid"      // Token is missing or malformed
  | "error";       // Any other Supabase error

// ── Helpers ────────────────────────────────────────────────────────────────────

/** Parse the URL hash/search string into a plain key→value map. */
function parseFragment(raw: string): Record<string, string> {
  const params = new URLSearchParams(raw.startsWith("#") ? raw.slice(1) : raw);
  const out: Record<string, string> = {};
  params.forEach((v, k) => { out[k] = v; });
  return out;
}

/** Retrieve any email the signup form persisted so we can offer "resend". */
function getStoredEmail(): string {
  try { return sessionStorage.getItem("invoicely_signup_email") ?? ""; }
  catch { return ""; }
}

/** Map a Supabase error message to a CallbackState. */
function classifyError(msg: string): CallbackState {
  const m = msg.toLowerCase();
  if (m.includes("expired") || m.includes("otp expired")) return "expired";
  if (m.includes("invalid") || m.includes("not found")) return "invalid";
  return "error";
}

// ── Component ──────────────────────────────────────────────────────────────────

const AuthCallback = () => {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<CallbackState>("loading");
  const [errorMsg, setErrorMsg] = useState("");
  const [resendEmail, setResendEmail] = useState(getStoredEmail);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSent, setResendSent] = useState(false);
  const processedRef = useRef(false); // Guard — run once only

  useEffect(() => {
    if (processedRef.current) return;
    processedRef.current = true;

    // ── Step 1: check if there's already an active session ──────────────────
    // This covers the case where detectSessionInUrl already processed the hash
    // before this component mounted (fast machines / cached JS bundles).
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        // Session is live — redirect straight to dashboard
        setPhase("success");
        setTimeout(() => navigate("/app", { replace: true }), 1200);
        return;
      }

      // ── Step 2: inspect the raw URL fragment ─────────────────────────────
      // Supabase verification links look like:
      //   /auth/callback#access_token=...&refresh_token=...&type=signup
      // Error cases look like:
      //   /auth/callback#error=access_denied&error_description=Token+has+expired
      const fragment = parseFragment(window.location.hash || window.location.search);

      if (fragment.error) {
        const desc = decodeURIComponent(fragment.error_description ?? fragment.error);
        setErrorMsg(desc);
        setPhase(classifyError(desc));
        return;
      }

      // No error fragment, no session yet → wait for onAuthStateChange
      // which fires when supabase-js finishes exchanging the token from the hash.
      if (!fragment.access_token && !fragment.token_hash && !fragment.code) {
        // No token at all in the URL — user navigated here directly
        setPhase("invalid");
        return;
      }

      // ── Step 3: listen for the auth state change ─────────────────────────
      // supabase-js with detectSessionInUrl:true will emit SIGNED_IN once it
      // has exchanged the URL token for a real session. We wait up to 8 s.
      let timer: ReturnType<typeof setTimeout>;

      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (event, session) => {
          if (event === "SIGNED_IN" && session) {
            clearTimeout(timer);
            subscription.unsubscribe();
            setPhase("success");
            setTimeout(() => navigate("/app", { replace: true }), 1200);
          } else if (event === "TOKEN_REFRESHED" && session) {
            clearTimeout(timer);
            subscription.unsubscribe();
            setPhase("success");
            setTimeout(() => navigate("/app", { replace: true }), 1200);
          } else if (event === "PASSWORD_RECOVERY") {
            clearTimeout(timer);
            subscription.unsubscribe();
            // Password-reset flow — send back to auth page
            navigate("/auth", { replace: true });
          }
        }
      );

      // Fallback timeout — if SIGNED_IN never fires within 8 s, do a final check
      timer = setTimeout(() => {
        subscription.unsubscribe();
        supabase.auth.getSession().then(({ data: { session: s } }) => {
          if (s) {
            setPhase("success");
            setTimeout(() => navigate("/app", { replace: true }), 1200);
          } else {
            // Token was processed (no error fragment) but session can't be established
            // Likely Supabase confirmed the email but didn't issue a session
            setPhase("confirmed");
          }
        });
      }, 8000);

      // Return cleanup in case component unmounts
      return () => {
        clearTimeout(timer);
        subscription.unsubscribe();
      };
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Resend verification email ──────────────────────────────────────────────
  const handleResend = async () => {
    if (!resendEmail) return;
    setResendLoading(true);
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: resendEmail,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) throw error;
      setResendSent(true);
    } catch {
      setResendSent(false);
    } finally {
      setResendLoading(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8F9FA] px-4">
      {/* Logo */}
      <div className="mb-10">
        <Logo />
      </div>

      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-slate-100 p-8 sm:p-10 space-y-6 text-center">

        {/* ── Loading ────────────────────────────────────────────────────── */}
        {phase === "loading" && (
          <>
            <div className="flex justify-center">
              <div className="h-16 w-16 rounded-full bg-amber-50 flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-amber-500 animate-spin" />
              </div>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Verifying your email…
            </h1>
            <p className="text-sm text-slate-500">
              This only takes a moment. Please don't close this tab.
            </p>
          </>
        )}

        {/* ── Success (session live, redirecting) ────────────────────────── */}
        {phase === "success" && (
          <>
            <div className="flex justify-center">
              <div className="h-16 w-16 rounded-full bg-emerald-50 flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-emerald-500" />
              </div>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Email verified!
            </h1>
            <p className="text-sm text-slate-500">
              Your account is ready. Taking you to your dashboard…
            </p>
            <div className="flex justify-center">
              <Loader2 className="h-5 w-5 text-amber-500 animate-spin" />
            </div>
          </>
        )}

        {/* ── Confirmed but no auto-session (manual login needed) ─────────── */}
        {phase === "confirmed" && (
          <>
            <div className="flex justify-center">
              <div className="h-16 w-16 rounded-full bg-emerald-50 flex items-center justify-center">
                <MailCheck className="h-8 w-8 text-emerald-500" />
              </div>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Email verified successfully!
            </h1>
            <p className="text-sm text-slate-500 leading-relaxed">
              Your account is ready. Continue to Invoicely to sign in and start
              creating invoices.
            </p>
            <Link to="/auth">
              <Button className="w-full h-11 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold shadow-md text-sm flex items-center justify-center gap-2">
                Continue to Invoicely
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </>
        )}

        {/* ── Expired token ─────────────────────────────────────────────── */}
        {phase === "expired" && (
          <>
            <div className="flex justify-center">
              <div className="h-16 w-16 rounded-full bg-amber-50 flex items-center justify-center">
                <XCircle className="h-8 w-8 text-amber-500" />
              </div>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Verification link expired
            </h1>
            <p className="text-sm text-slate-500 leading-relaxed">
              This link is only valid for 24 hours. Enter your email below and
              we'll send you a fresh one.
            </p>

            {resendSent ? (
              <div className="rounded-xl bg-emerald-50 border border-emerald-100 px-4 py-3 text-sm text-emerald-700 font-medium">
                ✓ New verification email sent! Check your inbox.
              </div>
            ) : (
              <div className="space-y-3 text-left">
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={resendEmail}
                  onChange={(e) => setResendEmail(e.target.value)}
                  className="h-11 bg-white border-slate-300"
                />
                <Button
                  onClick={handleResend}
                  disabled={resendLoading || !resendEmail}
                  className="w-full h-11 bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-slate-950 font-bold text-sm flex items-center justify-center gap-2"
                >
                  {resendLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                  {resendLoading ? "Sending…" : (
                    <>
                      <RefreshCw className="h-4 w-4" />
                      Resend verification email
                    </>
                  )}
                </Button>
              </div>
            )}

            <Link
              to="/auth"
              className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 font-semibold transition-colors"
            >
              <LogIn className="h-3.5 w-3.5" />
              Already verified? Sign in
            </Link>
          </>
        )}

        {/* ── Invalid / missing token ───────────────────────────────────── */}
        {(phase === "invalid" || phase === "error") && (
          <>
            <div className="flex justify-center">
              <div className="h-16 w-16 rounded-full bg-red-50 flex items-center justify-center">
                <XCircle className="h-8 w-8 text-red-400" />
              </div>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              {phase === "invalid"
                ? "Invalid verification link"
                : "Verification failed"}
            </h1>
            <p className="text-sm text-slate-500 leading-relaxed">
              {phase === "invalid"
                ? "This link is not valid. It may have already been used or the URL was copied incorrectly."
                : "Something went wrong verifying your email. Please try again or request a new link."}
            </p>
            {errorMsg && (
              <p className="text-xs text-slate-400 bg-slate-50 rounded-lg px-3 py-2 font-mono break-all">
                {errorMsg}
              </p>
            )}

            <div className="flex flex-col gap-3">
              {resendSent ? (
                <div className="rounded-xl bg-emerald-50 border border-emerald-100 px-4 py-3 text-sm text-emerald-700 font-medium">
                  ✓ New verification email sent! Check your inbox.
                </div>
              ) : (
                <div className="space-y-3 text-left">
                  <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Resend to your email:
                  </p>
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    value={resendEmail}
                    onChange={(e) => setResendEmail(e.target.value)}
                    className="h-11 bg-white border-slate-300"
                  />
                  <Button
                    onClick={handleResend}
                    disabled={resendLoading || !resendEmail}
                    variant="outline"
                    className="w-full h-11 border-slate-300 font-semibold text-sm flex items-center justify-center gap-2"
                  >
                    {resendLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                    {resendLoading ? "Sending…" : (
                      <>
                        <RefreshCw className="h-4 w-4" />
                        Resend verification email
                      </>
                    )}
                  </Button>
                </div>
              )}

              <Link to="/auth">
                <Button className="w-full h-11 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-sm flex items-center justify-center gap-2">
                  <LogIn className="h-4 w-4" />
                  Back to Sign In
                </Button>
              </Link>
            </div>
          </>
        )}
      </div>

      <p className="mt-8 text-xs text-slate-400">
        Need help?{" "}
        <Link to="/contact-us" className="underline hover:text-slate-700">
          Contact support
        </Link>
      </p>
    </div>
  );
};

export default AuthCallback;
