import { useState, useRef, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import {
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  ArrowLeft,
  Mail,
  Lock,
  Loader2,
  Eye,
  EyeOff,
  Circle,
} from "lucide-react";
import Logo from "@/components/Logo";

// ── Redirect URL (dynamic per environment) ─────────────────────────────────
// Points to /auth/callback — a dedicated page that handles all verification
// outcomes (auto-session, expired token, invalid token) cleanly.
const getRedirectUrl = () => `${window.location.origin}/auth/callback`;

// ── Password rules ─────────────────────────────────────────────────────────
interface PasswordRule {
  id: string;
  label: string;
  test: (pw: string) => boolean;
}

const PASSWORD_RULES: PasswordRule[] = [
  { id: "length",    label: "At least 8 characters",    test: (pw) => pw.length >= 8 },
  { id: "upper",     label: "One uppercase letter (A–Z)", test: (pw) => /[A-Z]/.test(pw) },
  { id: "lower",     label: "One lowercase letter (a–z)", test: (pw) => /[a-z]/.test(pw) },
  { id: "number",    label: "One number (0–9)",           test: (pw) => /[0-9]/.test(pw) },
];

// ── User-friendly error messages ───────────────────────────────────────────
function getFriendlyError(error: any, mode: "signup" | "login"): string {
  const msg: string = (error?.message ?? "").toLowerCase();
  const status: number = error?.status ?? 0;

  if (status === 429 || msg.includes("too many") || msg.includes("rate limit") || msg.includes("429")) {
    return mode === "signup"
      ? "Too many signup attempts. Please wait a few minutes and try again."
      : "Too many login attempts. Please wait a few minutes and try again.";
  }
  if (msg.includes("user already registered") || msg.includes("already been registered")) {
    return "This email is already registered. Try signing in instead.";
  }
  if (msg.includes("invalid login credentials") || msg.includes("invalid credentials")) {
    return "Incorrect email or password. Please try again.";
  }
  if (msg.includes("email not confirmed")) {
    return "Please check your inbox and confirm your email address first.";
  }
  if (msg.includes("password should be")) {
    return "Password must be at least 8 characters.";
  }
  return error?.message ?? "Something went wrong. Please try again.";
}

// ── PasswordRuleItem sub-component ────────────────────────────────────────
const PasswordRuleItem = ({
  label,
  met,
  touched,
}: {
  label: string;
  met: boolean;
  touched: boolean;
}) => {
  const color = !touched
    ? "text-slate-400"
    : met
    ? "text-emerald-600"
    : "text-red-500";

  const Icon = met && touched ? CheckCircle2 : Circle;

  return (
    <li className={`flex items-center gap-2 text-xs font-medium transition-colors duration-150 ${color}`}>
      <Icon className={`h-3.5 w-3.5 flex-shrink-0 ${met && touched ? "fill-emerald-100" : ""}`} />
      {label}
    </li>
  );
};

// ── Main Component ─────────────────────────────────────────────────────────
const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [confirmTouched, setConfirmTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  // ── In-flight guard ────────────────────────────────────────────────────────
  const isSubmittingRef = useRef(false);

  // ── Derived password state ─────────────────────────────────────────────────
  const ruleResults = useMemo(
    () => PASSWORD_RULES.map((r) => ({ ...r, met: r.test(password) })),
    [password]
  );
  const allRulesMet = ruleResults.every((r) => r.met);
  const passwordsMatch = password === confirmPassword;
  const showMismatch = confirmTouched && confirmPassword.length > 0 && !passwordsMatch;

  // Signup button is blocked until every rule passes AND passwords match
  const signupReady = allRulesMet && passwordsMatch && confirmPassword.length > 0;

  // ── Reset signup-only fields when switching modes ─────────────────────────
  const handleModeSwitch = () => {
    setIsLogin((prev) => !prev);
    setPassword("");
    setConfirmPassword("");
    setShowPassword(false);
    setShowConfirmPassword(false);
    setPasswordTouched(false);
    setConfirmTouched(false);
  };

  // ── Form submission ────────────────────────────────────────────────────────
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmittingRef.current) return;
    if (!email || !password) return;
    if (!isLogin && !signupReady) return; // extra guard

    isSubmittingRef.current = true;
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate("/app");
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: getRedirectUrl(),
          },
        });
        if (error) throw error;

        // Persist email so /auth/callback can pre-fill the resend field
        try { sessionStorage.setItem("invoicely_signup_email", email.toLowerCase().trim()); }
        catch { /* sessionStorage unavailable — not critical */ }

        // Trigger welcome email automation (non-blocking)
        try {
          await supabase.functions.invoke("trigger-automation-email", {
            body: {
              triggerEvent: "user_registered",
              idempotencyKey: `user_registered_${email.toLowerCase().trim()}`,
              recipientEmail: email.toLowerCase().trim(),
              recipientName: email.split("@")[0],
              variables: {
                userName: email.split("@")[0],
                userEmail: email.toLowerCase().trim(),
              },
            },
          });
        } catch (autoErr) {
          console.warn("[automation] welcome email failed:", autoErr);
        }

        toast({
          title: "Account Created! 🎉",
          description: "Please check your email and click the confirmation link to activate your account.",
        });
      }
    } catch (error: any) {
      const mode = isLogin ? "login" : "signup";
      toast({
        variant: "destructive",
        title: isLogin ? "Sign In Failed" : "Sign Up Failed",
        description: getFriendlyError(error, mode),
        ...(!isLogin && (
          (error?.status === 429 || (error?.message ?? "").toLowerCase().includes("already"))
            ? {
                action: (
                  <button
                    className="underline text-xs font-semibold mt-1"
                    onClick={() => setIsLogin(true)}
                  >
                    Sign in instead →
                  </button>
                ),
              }
            : {}
        )),
      });
    } finally {
      isSubmittingRef.current = false;
      setLoading(false);
    }
  };

  const handleOAuthSignIn = async (provider: "google" | "github") => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: getRedirectUrl(),
        },
      });
      if (error) throw error;
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "OAuth Error",
        description: error.message,
      });
      setLoading(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#F8F9FA] text-slate-900 selection:bg-amber-400 selection:text-slate-950">

      {/* ── Left Column: Auth Form ──────────────────────────────────────────── */}
      <div className="w-full lg:w-1/2 flex flex-col justify-between p-6 sm:p-12 lg:p-16 min-h-screen">
        <div>
          {/* Top Bar */}
          <div className="flex items-center justify-between mb-10">
            <Logo />
            <Link to="/">
              <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-900 text-xs font-semibold">
                <ArrowLeft className="h-4 w-4 mr-1" /> Back to Website
              </Button>
            </Link>
          </div>

          <div className="max-w-md mx-auto w-full space-y-6">
            {/* Heading */}
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                {isLogin ? "Welcome back to Invoicely" : "Create your Invoicely account"}
              </h1>
              <p className="text-sm text-slate-500 mt-2">
                {isLogin
                  ? "Sign in to manage your invoices, payments, and clients."
                  : "Start creating & sending professional invoices in 5 seconds."}
              </p>
            </div>

            {/* Google OAuth */}
            <div>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOAuthSignIn("google")}
                disabled={loading}
                className="w-full border-slate-300 hover:border-slate-900 font-semibold py-5 text-xs flex items-center justify-center gap-2.5 shadow-sm"
              >
                <img
                  src="https://www.svgrepo.com/show/475656/google-color.svg"
                  alt="Google"
                  className="h-4 w-4"
                />
                Continue with Google
              </Button>
            </div>

            <div className="flex items-center my-4">
              <div className="flex-1 h-px bg-slate-200" />
              <span className="mx-3 text-slate-400 text-xs font-semibold uppercase tracking-wider">Or email</span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>

            {/* Form */}
            <form onSubmit={handleAuth} className="space-y-4">

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    type="email"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-10 h-11 bg-white border-slate-300 focus-within:border-slate-900"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (!isLogin) setPasswordTouched(true);
                    }}
                    required
                    className="pl-10 pr-10 h-11 bg-white border-slate-300 focus-within:border-slate-900"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword
                      ? <EyeOff className="h-4 w-4" />
                      : <Eye className="h-4 w-4" />
                    }
                  </button>
                </div>

                {/* Password rules — only shown on signup */}
                {!isLogin && (
                  <div className="mt-2.5 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Password requirements
                    </p>
                    <ul className="space-y-1.5">
                      {ruleResults.map((rule) => (
                        <PasswordRuleItem
                          key={rule.id}
                          label={rule.label}
                          met={rule.met}
                          touched={passwordTouched}
                        />
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Confirm Password — signup only */}
              {!isLogin && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        setConfirmTouched(true);
                      }}
                      required
                      className={`pl-10 pr-10 h-11 bg-white border-slate-300 focus-within:border-slate-900 transition-colors ${
                        showMismatch ? "border-red-400 focus-within:border-red-500" : ""
                      }`}
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setShowConfirmPassword((v) => !v)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors"
                      aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                    >
                      {showConfirmPassword
                        ? <EyeOff className="h-4 w-4" />
                        : <Eye className="h-4 w-4" />
                      }
                    </button>
                  </div>

                  {/* Mismatch error */}
                  {showMismatch && (
                    <p className="text-xs font-semibold text-red-500 flex items-center gap-1.5 mt-1">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                      Passwords don't match
                    </p>
                  )}

                  {/* Match confirmation */}
                  {confirmTouched && confirmPassword.length > 0 && passwordsMatch && (
                    <p className="text-xs font-semibold text-emerald-600 flex items-center gap-1.5 mt-1">
                      <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0" />
                      Passwords match
                    </p>
                  )}
                </div>
              )}

              {/* Submit */}
              <Button
                type="submit"
                disabled={loading || (!isLogin && !signupReady)}
                className="w-full h-11 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-bold shadow-md hover:shadow-lg transition-all text-sm mt-2 flex items-center justify-center gap-2"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {loading
                  ? isLogin ? "Signing in…" : "Creating account…"
                  : isLogin ? "Sign In to Dashboard" : "Create Account"
                }
              </Button>
            </form>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={handleModeSwitch}
                className="text-xs font-bold text-slate-700 hover:text-amber-600 transition-colors"
              >
                {isLogin ? "Don't have an account? Sign up free" : "Already have an account? Sign in"}
              </button>
            </div>
          </div>
        </div>

        <div className="text-center text-xs text-slate-400 mt-8">
          By continuing, you agree to Invoicely's{" "}
          <Link to="/terms" className="underline hover:text-slate-900">Terms of Use</Link> and{" "}
          <Link to="/privacy" className="underline hover:text-slate-900">Privacy Policy</Link>.
        </div>
      </div>

      {/* ── Right Column: Visual Showcase ──────────────────────────────────── */}
      <div className="w-full lg:w-1/2 bg-slate-900 text-white p-8 sm:p-12 lg:p-16 flex flex-col justify-between relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-lg mx-auto w-full my-auto space-y-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-amber-400 text-xs font-bold">
            <Sparkles className="h-3.5 w-3.5" />
            AI-POWERED INVOICING PLATFORM
          </div>

          <h2 className="text-3xl sm:text-4xl font-black leading-tight tracking-tight">
            Get Paid 3x Faster with Live Client Checkout Links & 20 Templates.
          </h2>

          <div className="space-y-4 text-sm text-slate-300">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <p><strong>20 Premium Templates</strong> for freelancers, agencies, consultants, healthcare & retail.</p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <p><strong>Live Client Payment Links</strong> with 1-click Razorpay & UPI online checkout.</p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <p><strong>AI Prompt Generator</strong> with multi-item extraction, GST, & multi-currency support.</p>
            </div>
          </div>

          <div className="rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl">
            <video
              src="/invoicely preview.mp4"
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-auto object-cover"
            />
          </div>
        </div>

        <div className="relative z-10 text-center lg:text-left text-xs text-slate-400 flex items-center gap-2 justify-center lg:justify-start">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          <span>Trusted by freelancers & business owners worldwide</span>
        </div>
      </div>
    </div>
  );
};

export default Auth;
