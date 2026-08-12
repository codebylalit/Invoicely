import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { LogIn, Sparkles, CheckCircle2, ShieldCheck, ArrowLeft, Mail, Lock } from "lucide-react";
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
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        navigate("/app");
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/app`,
          },
        });
        if (error) throw error;
        // ── Trigger welcome email automation ─────────────────────────────────
        try {
          await supabase.functions.invoke('trigger-automation-email', {
            body: {
              triggerEvent: 'user_registered',
              idempotencyKey: `user_registered_${email.toLowerCase().trim()}`,
              recipientEmail: email.toLowerCase().trim(),
              recipientName: email.split('@')[0],
              variables: {
                userName: email.split('@')[0],
                userEmail: email.toLowerCase().trim(),
              },
            },
          });
        } catch (autoErr) {
          // Non-blocking — don't fail registration if email fails
          console.warn('[automation] welcome email failed:', autoErr);
        }
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
        options: {
          redirectTo: `${window.location.origin}/app`,
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

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#F8F9FA] text-slate-900 selection:bg-amber-400 selection:text-slate-950">
      {/* ── Left Column: Auth Form ─────────────────────────────────────────── */}
      <div className="w-full lg:w-1/2 flex flex-col justify-between p-6 sm:p-12 lg:p-16 min-h-screen">
        <div>
          {/* Top Bar Navigation */}
          <div className="flex items-center justify-between mb-10">
            <Logo />
            <Link to="/">
              <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-900 text-xs font-semibold">
                <ArrowLeft className="h-4 w-4 mr-1" /> Back to Website
              </Button>
            </Link>
          </div>

          <div className="max-w-md mx-auto w-full space-y-6">
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

            {/* Social OAuth Buttons */}
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
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Email Address</label>
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

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pl-10 h-11 bg-white border-slate-300 focus-within:border-slate-900"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold shadow-md hover:shadow-lg transition-all text-sm mt-2"
              >
                {loading ? "Processing…" : isLogin ? "Sign In to Dashboard" : "Create Account"}
              </Button>
            </form>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
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

      {/* ── Right Column: Visual Showcase Banner ─────────────────────────── */}
      <div className="w-full lg:w-1/2 bg-slate-900 text-white p-8 sm:p-12 lg:p-16 flex flex-col justify-between relative overflow-hidden">
        {/* Background glow effects */}
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

          {/* Embedded Video Mockup */}
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
