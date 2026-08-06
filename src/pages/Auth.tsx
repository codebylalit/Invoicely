import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import {
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  ArrowLeft,
  Mail,
  Lock,
  ArrowRight,
} from "lucide-react";
import Logo from "@/components/Logo";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
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
          options: { emailRedirectTo: `${window.location.origin}/app` },
        });
        if (error) throw error;
        toast({
          title: "Account Created! 🎉",
          description: "Please check your email to confirm your account.",
        });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Authentication Failed",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthSignIn = async (provider: "google" | "github") => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: `${window.location.origin}/app` },
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

  return (
    <div
      className="min-h-screen flex flex-col lg:flex-row selection:bg-amber-200 selection:text-[#0A0A0A]"
      style={{ fontFamily: "'Plus Jakarta Sans', 'Poppins', sans-serif" }}
    >
      {/* ── Left Column: Auth Form ─────────────────────────────────────────── */}
      <div
        className="w-full lg:w-1/2 flex flex-col justify-between p-6 sm:p-12 lg:p-16 min-h-screen"
        style={{ backgroundColor: "#FAFAF9" }}
      >
        <div>
          {/* Top Bar */}
          <div className="flex items-center justify-between mb-12">
            <Logo />
            <Link to="/">
              <button className="flex items-center gap-1.5 text-sm font-semibold text-stone-500 hover:text-stone-900 px-3 py-1.5 rounded-full hover:bg-stone-100 transition-all">
                <ArrowLeft className="h-3.5 w-3.5" />
                Back
              </button>
            </Link>
          </div>

          <div className="max-w-sm mx-auto w-full space-y-6">
            {/* Heading */}
            <div>
              <h1
                className="text-3xl font-black tracking-tight"
                style={{ color: "#0A0A0A" }}
              >
                {isLogin ? "Welcome back" : "Create your account"}
              </h1>
              <p className="text-sm text-stone-500 mt-2 leading-relaxed">
                {isLogin
                  ? "Sign in to manage your invoices, payments, and clients."
                  : "Start creating & sending professional invoices in seconds."}
              </p>
            </div>

            {/* Google OAuth */}
            <button
              type="button"
              onClick={() => handleOAuthSignIn("google")}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl border border-stone-200 bg-white hover:border-stone-400 hover:bg-stone-50 font-semibold text-sm text-stone-700 shadow-sm transition-all duration-200 disabled:opacity-60"
            >
              <img
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                alt="Google"
                className="h-4 w-4"
              />
              Continue with Google
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-stone-200" />
              <span className="text-xs text-stone-400 font-semibold uppercase tracking-wider">
                or email
              </span>
              <div className="flex-1 h-px bg-stone-200" />
            </div>

            {/* Form */}
            <form onSubmit={handleAuth} className="space-y-4">
              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-600 uppercase tracking-wider">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                  <Input
                    type="email"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-10 h-11 bg-white border-stone-200 rounded-xl focus:border-stone-900 focus:ring-1 focus:ring-stone-900"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-600 uppercase tracking-wider">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pl-10 h-11 bg-white border-stone-200 rounded-xl focus:border-stone-900 focus:ring-1 focus:ring-stone-900"
                  />
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 h-11 rounded-full font-bold text-sm text-white shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-60 group"
                style={{ backgroundColor: "#0A0A0A" }}
              >
                {loading ? (
                  "Processing…"
                ) : (
                  <>
                    {isLogin ? "Sign In to Dashboard" : "Create Account"}
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                  </>
                )}
              </button>
            </form>

            {/* Toggle */}
            <div className="text-center">
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-xs font-bold text-stone-600 hover:text-amber-600 transition-colors"
              >
                {isLogin
                  ? "Don't have an account? Sign up free"
                  : "Already have an account? Sign in"}
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-stone-400 mt-8">
          By continuing, you agree to Invoicely's{" "}
          <Link to="/terms" className="underline hover:text-stone-700">
            Terms of Use
          </Link>{" "}
          and{" "}
          <Link to="/privacy" className="underline hover:text-stone-700">
            Privacy Policy
          </Link>
          .
        </p>
      </div>

      {/* ── Right Column: Visual Showcase ─────────────────────────────────── */}
      <div
        className="w-full lg:w-1/2 text-white p-8 sm:p-12 lg:p-16 flex flex-col justify-between relative overflow-hidden"
        style={{ backgroundColor: "#0A0A0A" }}
      >
        {/* Amber glow orb */}
        <div
          className="absolute top-0 right-0 w-96 h-96 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, rgba(251,191,36,0.12) 0%, transparent 70%)",
          }}
        />

        <div className="relative z-10 max-w-lg mx-auto w-full my-auto space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/8 border border-white/10 text-amber-400 text-xs font-bold">
            <Sparkles className="h-3.5 w-3.5" />
            AI-POWERED INVOICING PLATFORM
          </div>

          <h2 className="text-3xl sm:text-4xl font-black leading-tight tracking-tight">
            Get Paid 3× Faster with Live Client Checkout Links & 20 Templates.
          </h2>

          <div className="space-y-4 text-sm text-stone-300">
            {[
              {
                title: "20 Premium Templates",
                desc: "for freelancers, agencies, consultants, healthcare & retail.",
              },
              {
                title: "Live Client Payment Links",
                desc: "with 1-click Razorpay & UPI online checkout.",
              },
              {
                title: "AI Prompt Generator",
                desc: "with multi-item extraction, GST, & multi-currency support.",
              },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <p>
                  <strong className="text-white">{item.title}</strong>{" "}
                  {item.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Video mockup */}
          <div className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
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

        <div className="relative z-10 flex items-center gap-2 justify-center lg:justify-start text-xs text-stone-400 mt-6">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          <span>Trusted by freelancers & business owners worldwide</span>
        </div>
      </div>
    </div>
  );
};

export default Auth;
