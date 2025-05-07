import { useEffect, useState } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckIcon, FileText, ZapIcon, CreditCard, Clock, Send, User } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import { PricingTier } from "@/types/subscription";

const pricingTiers: PricingTier[] = [
  {
    name: "Free",
    price: "$0",
    description: "Perfect for getting started",
    features: [
      { name: "Basic invoice creation", free: true, pro: true },
      { name: "Store up to 10 clients", free: true, pro: true },
      { name: "3 templates", free: true, pro: true },
      { name: "PDF export with watermark", free: true, pro: true },
      { name: "Logo branding", free: true, pro: true },
      { name: "Basic email support (72hr)", free: true, pro: true },
    ]
  },
  {
    name: "Pro",
    price: "$99",
    description: "For growing businesses",
    features: [
      { name: "AI-powered invoice generation", free: false, pro: true },
      { name: "Unlimited clients in portal", free: false, pro: true },
      { name: "10+ premium templates", free: false, pro: true },
      { name: "Watermark-free exports", free: false, pro: true },
      { name: "Recurring invoices", free: false, pro: true },
      { name: "Send invoices directly via email", free: false, pro: true },
      { name: "Priority support (24hr)", free: false, pro: true },
    ]
  }
];

const Landing = () => {
  const supabase = useSupabaseClient();
  const session = useSession();
  const navigate = useNavigate();
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    if (session) {
      navigate("/app", { replace: true });
    }
  }, [session, navigate]);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Show header when scrolling up or at the top of the page
      if (currentScrollY < lastScrollY || currentScrollY < 100) {
        setIsHeaderVisible(true);
      } else {
        setIsHeaderVisible(false);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const handleSignIn = async () => {
    if (supabase) {
      await supabase.auth.signInWithOAuth({
        provider: "github",
      });
    } else {
      console.error("Supabase client is not available");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F6F5F1]">
      <div
        className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-sm border-b border-[#F6F5F1] transition-all duration-300 ${isHeaderVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
          }`}
      >
        <div className="max-w-5xl mx-auto px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#2D2D2D] text-2xl tracking-tight">Invoicelly</span>
          </div>
          <Button
            onClick={() => navigate('/auth')}
            size="sm"
            variant="ghost"
            className="text-[#2D2D2D] border hover:text-[#2D2D2D]/80 hover:bg-[#F6F5F1]/50"
          >
            Sign In
          </Button>
        </div>
      </div>

      {/* Hero Section */}
      <section className="pt-48 pb-16 relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-8">
          {/* Invoice themed decorative elements */}
          <div className="absolute top-20 right-[20%] transform rotate-12">
            <div className="w-16 h-16 border bg-[#FFB800] rounded-2xl shadow-lg transform hover:rotate-6 transition-transform duration-300" />
          </div>
          <div className="absolute bottom-20 left-[15%] transform -rotate-12">
            <div className="w-12 h-12 border bg-[#FFB800] rounded-2xl shadow-lg transform hover:-rotate-6 transition-transform duration-300" />
          </div>
          <div className="absolute top-40 left-[10%] transform rotate-45">
            <div className="w-8 h-8 border bg-[#FFB800]/70 rounded-2xl shadow-lg transform hover:rotate-12 transition-transform duration-300" />
          </div>

          <div className="text-center relative">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-[#2D2D2D]">
              A smarter way to invoice awaits.
            </h1>
            <p className="text-[#6B6B6B] text-lg mb-8 max-w-3xl mx-auto">
              Say goodbye to tedious invoice drafting. With invoicelly, a simple prompt is all it takes.
            </p>
            <Button
              onClick={() => navigate('/auth')}
              size="lg"
              className="bg-[#FFB800] border hover:bg-[#FFB800]/90 text-[#2D2D2D] font-medium px-6 py-6 rounded-xl shadow-lg transform transition-transform hover:scale-105 hover:rotate-1"
            >
              Get Started!
            </Button>
          </div>
        </div>
      </section>

      {/* Preview Section */}
      <section className="py-18">
        <div className="max-w-4xl mx-auto p-6">
          <div className="bg-black rounded-2xl p-66 overflow-hidden">
            <div className="p-10 pb-0">
              <div className="aspect-video rounded-t-xl overflow-hidden w-full">
                <video
                  className="w-full h-full object-cover"
                  autoPlay
                  muted
                  loop
                  playsInline
                  poster="/video-poster.jpg"
                >
                  <source src="/invoicely preview.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-[#F6F5F1]">
        <div className="max-w-5xl mx-auto px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4 text-[#2D2D2D]">Features</h2>
            <p className="text-[#6B6B6B]">
              We provide all the features an individual or small business needs to manage invoices.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 rounded-xl border bg-white shadow-lg transform hover:-rotate-2 transition-transform">
              <ZapIcon className="h-8 w-8 text-[#FFB800] mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-[#2D2D2D]">AI-Powered Generation</h3>
              <p className="text-[#6B6B6B]">Generate professional invoices instantly using AI, saving you time and effort.</p>
            </div>
            <div className="p-6 rounded-xl  border bg-white shadow-lg transform hover:rotate-2 transition-transform">
              <FileText className="h-8 w-8 text-[#FFB800] mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-[#2D2D2D]">Smart Templates</h3>
              <p className="text-[#6B6B6B]">Choose from a variety of professional templates that adapt to your business needs.</p>
            </div>
            <div className="p-6 rounded-xl  border bg-white shadow-lg transform hover:-rotate-2 transition-transform">
              <Send className="h-8 w-8 text-[#FFB800] mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-[#2D2D2D]">Instant Delivery</h3>
              <p className="text-[#6B6B6B]">Send invoices directly to clients via email with just one click.</p>
            </div>
            <div className="p-6 rounded-xl  border bg-white shadow-lg transform hover:rotate-2 transition-transform">
              <CreditCard className="h-8 w-8 text-[#FFB800] mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-[#2D2D2D]">Payment Tracking</h3>
              <p className="text-[#6B6B6B]">Monitor payment status and send automatic reminders for overdue invoices.</p>
            </div>
            <div className="p-6 rounded-xl  border bg-white shadow-lg transform hover:-rotate-2 transition-transform">
              <Clock className="h-8 w-8 text-[#FFB800] mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-[#2D2D2D]">Recurring Invoices</h3>
              <p className="text-[#6B6B6B]">Set up automatic recurring invoices for regular clients and subscriptions.</p>
            </div>
            <div className="p-6 rounded-xl border bg-white shadow-lg transform hover:rotate-2 transition-transform">
              <User className="h-8 w-8 text-[#FFB800] mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-[#2D2D2D]">Client Management</h3>
              <p className="text-[#6B6B6B]">
                Add client details once and reuse them for future invoices.
              </p>
            </div>

          </div>
        </div>
      </section>
      {/* Pricing Section */}
      <section className="py-20 bg-[#F6F5F1]">
        <div className="max-w-5xl mx-auto px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4 text-[#2D2D2D]">One simple price</h2>
            <p className="text-[#6B6B6B]">
              Unlock a suite of incredible features for a one-time payment of just $99 — yours forever.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {pricingTiers.map((tier) => (
              <div
                key={tier.name}
                className="p-8 rounded-xl border bg-white shadow-lg transform hover:rotate-1 transition-transform"
              >
                <h3 className="text-2xl font-bold mb-2 text-[#2D2D2D]">{tier.name}</h3>
                <div className="flex items-baseline mb-4">
                  <span className="text-4xl font-bold text-[#2D2D2D]">{tier.price}</span>
                  {tier.price !== "$0" && (
                    <span className="text-[#6B6B6B] ml-1">/one-time</span>
                  )}
                </div>
                <ul className="space-y-3 mb-6">
                  {tier.features.map((feature) => (
                    <li key={feature.name} className="flex items-center text-[#6B6B6B]">
                      <CheckIcon className={`h-5 w-5 mr-2 ${(tier.name === "Free" && feature.free) ||
                        (tier.name === "Pro" && feature.pro)
                        ? "text-[#FFB800]"
                        : "text-gray-300"
                        }`} />
                      {feature.name}
                    </li>
                  ))}
                </ul>
                <Button
                  onClick={() => navigate('/auth')}
                  className={`w-full ${tier.name === "Pro"
                    ? "bg-[#FFB800] hover:bg-[#FFB800]/90 text-[#2D2D2D]"
                    : "bg-[#F6F5F1] hover:bg-[#F6F5F1]/90 text-[#2D2D2D]"
                    } shadow-lg transform transition-transform hover:scale-105`}
                >
                  {tier.name === "Free" ? "Get Started" : "Subscribe Now"}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="py-8 bg-[#F6F5F1] border-t">
        <div className="max-w-5xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <span className="text-sm text-gray-600 font-medium">Made with <span className="text-yellow-500">💛</span></span>

          </div>
          <div className="flex flex-wrap justify-center gap-6 text-sm text-[#6B6B6B]">
            <Link to="/terms" className="hover:text-[#2D2D2D]">Terms and conditions</Link>
            <Link to="/privacy" className="hover:text-[#2D2D2D]">Privacy policy</Link>
            <Link to="/refunds" className="hover:text-[#2D2D2D]">Cancellation & Refunds</Link>
            <Link to="/contact-us" className="hover:text-[#2D2D2D]">Contact Us</Link>

          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;