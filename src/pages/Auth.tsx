import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { LogIn, FileText, Check, Mail } from "lucide-react";

const features = [
  "Unlimited clients and projects",
  "Invoices and online payments",
  "Proposals and contracts",
  "Operate several businesses",
  "Personalized support",
  "Customizable invoice templates",
  "Automated payment reminders",
  "Multi-currency support",
  "Detailed analytics & reports",
  "Seamless client management",
  "Fast PDF export",
  "Team collaboration",
];

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate("/app");
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        toast({
          title: "Success!",
          description: "Please check your email to confirm your account.",
        });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left Side */}
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center bg-[#F8F8F8] px-6 py-12">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-2 mb-8">
            <div className="bg-primary h-8 w-8 rounded-md flex items-center justify-center">
              <div className="bg-gray-800 h-4 w-5 rounded-r-full"></div>
            </div>
            <span className="text-2xl font-bold text-[#2D2D2D]">invoicelly</span>
          </div>
          <h1 className="text-3xl font-bold text-[#2D2D2D] mb-2">
            {isLogin ? "Sign in to invoicelly" : "Get started with invoicelly"}
          </h1>
          <p className="text-[#6B6B6B] mb-6">
            {isLogin
              ? "Access your account to manage invoices and clients."
              : "Sign up in seconds. No credit card required."}
          </p>

          {/* Social Login (Google) */}
          <Button
            className="w-full flex items-center justify-center gap-2 bg-[#222] hover:bg-[#111] text-white mb-4"
            type="button"
            // onClick={handleGoogleSignIn} // Uncomment and implement if you add Google OAuth
            disabled
          >
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="h-5 w-5" />
            Continue with Google
          </Button>

          {/* Divider */}
          <div className="flex items-center my-4">
            <div className="flex-1 h-px bg-[#E0E0E0]" />
            <span className="mx-3 text-[#B0B0B0] text-xs font-medium">OR</span>
            <div className="flex-1 h-px bg-[#E0E0E0]" />
          </div>

          {/* Email Form */}
          <Card className="p-2 border">
            <CardContent className="p-2">
              <form onSubmit={handleAuth} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-[#2D2D2D]">
                    Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="JohnSmith@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-[#F6F5F1]/50 dark:bg-gray-700 dark:border-gray-600 outline-none focus-within:border-yellow-400"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium text-[#2D2D2D]">
                    Password
                  </label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-[#F6F5F1]/50 focus-within:border-yellow-400 outline-none"
                  />
                </div>
                <Button
                  className="w-full bg-[#FFB800] hover:bg-[#FFB800]/90 text-[#2D2D2D] font-medium"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? "Loading..." : isLogin ? "Sign In" : "Continue"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Terms and toggle */}
          <p className="text-xs text-[#6B6B6B] mt-6 text-center">
            Signing up for invoicelly means that you agree with our{' '}
            <Link to="/terms" className="underline hover:text-[#FFB800]">Terms of Use</Link> and{' '}
            <Link to="/privacy" className="underline hover:text-[#FFB800]">Privacy Policy</Link>.
          </p>
          <div className="mt-6 text-center">
            <Button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-[#4CAF50] hover:underline bg-transparent p-0 h-auto"
              variant="ghost"
            >
              {isLogin ? "Need an account? Sign up" : "Have an account? Sign in"}
            </Button>
          </div>
        </div>
      </div>

      <div className="w-full md:w-1/2 flex flex-col justify-center items-center bg-[#F5FCEB] px-16 py-12">
        <div className="w-full max-w-5xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-[#222] mb-4 text-center">
            Get Paid On Time, Every Time
          </h2>
          <p className="text-lg text-[#555] mb-10 text-center">
            Smart invoicing that eliminates delays and excuses
          </p>

          <div className="relative w-full max-w-4xl mx-auto mt-10">
            {/* MacBook Mockup */}
            <img
              src="./MacBook.png"
              alt="MacBook Mockup"
              className="w-full h-auto"
            />

            {/* Embedded Video positioned inside screen */}
            <div className="absolute top-[2%] left-[9.3%] w-[82%] h-[90%] overflow-hidden rounded">
              <video
                src="/invoicely preview.mp4"
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-contain"
              />
            </div>
          </div>

        </div>


      </div>

    </div>
  );
};

export default Auth;
