import { useEffect, useState } from "react";
import { useSession } from "@supabase/auth-helpers-react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  CheckIcon,
  ZapIcon,
  CreditCard,
  Clock,
  User,
  Menu,
  X,
  ShieldCheck,
  Globe,
  Palette,
  ArrowRight,
  ChevronDown,
  Star,
  XCircle,
  CheckCircle2,
  Send,
  Sparkles,
  TrendingUp,
  Award,
  Lock,
} from "lucide-react";
import Logo from "@/components/Logo";

// ─────────────────────────────────────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────────────────────────────────────

const pricingTiers = [
  {
    name: "Free",
    price: "$0",
    subPrice: "(₹0)",
    period: "/ forever",
    description: "Get started at no cost. No credit card required.",
    badge: null,
    cta: "Get Started Free",
    ctaStyle: "bg-stone-900 hover:bg-black text-white shadow-md hover:shadow-lg",
    features: [
      "5 invoices per month",
      "3 professional invoice templates",
      "Manage up to 3 clients",
      "Bank, PayPal & payment details",
      "Try AI invoice creation (3 uses)",
      "Multi-currency (USD, EUR, INR)",
    ],
  },
  {
    name: "Pro",
    price: "$6",
    subPrice: "(~₹499)",
    period: "/ month",
    yearlyNote: "or $59 / year (~₹4,999) — save 17%",
    description: "For freelancers, agencies & global businesses.",
    badge: "Most Popular",
    cta: "Start Pro — $6/mo",
    ctaStyle: "bg-amber-400 hover:bg-amber-500 text-[#1a1a1a] font-black shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all",
    features: [
      "Unlimited invoices & clients",
      "All 20 premium templates",
      "100% white-label — your brand only",
      "Online payment links (Cards, PayPal, UPI)",
      "Unlimited AI invoice creation",
      "Multi-currency billing (USD, EUR, GBP, INR)",
      "Automatic payment reminders",
    ],
  },
];

const faqs = [
  {
    q: "Can I use Invoicely for free forever?",
    a: "Yes. The Free plan never expires. Create up to 5 invoices per month and manage 3 clients — at no cost, forever.",
  },
  {
    q: "Can my clients pay online?",
    a: "Yes. Share a payment link and your client can pay via UPI, Razorpay, debit card, credit card, or bank transfer — instantly.",
  },
  {
    q: "Can I generate GST-compliant invoices?",
    a: "Yes. CGST, SGST, and IGST are calculated automatically based on your tax rate. No manual math needed.",
  },
  {
    q: "Can I download invoices as PDF?",
    a: "Yes. Every invoice exports as a print-ready, professional PDF in one click.",
  },
  {
    q: "Can I remove the Invoicely branding?",
    a: "Yes. Pro plan users get fully white-label invoices — no Invoicely watermark or badge anywhere.",
  },
  {
    q: "Can I bill clients in foreign currencies?",
    a: "Yes. USD, EUR, GBP, and more are all supported alongside INR.",
  },
];

const features = [
  {
    icon: ZapIcon,
    title: "AI-Powered Generation",
    desc: "Describe your work in plain English — Invoicely's AI builds a complete, itemized invoice in seconds. No blank spreadsheets, ever.",
  },
  {
    icon: Palette,
    title: "20 Smart Templates",
    desc: "20 professionally designed invoice styles — from minimal freelancer to enterprise corporate. Impress every client, every time.",
  },
  {
    icon: Send,
    title: "Clients Pay Instantly",
    desc: "Share a live payment link. Clients pay via UPI, Razorpay, or bank transfer. No more awkward 'just following up' emails.",
  },
  {
    icon: CreditCard,
    title: "Real-Time Payment Tracking",
    desc: "See exactly who's paid and who hasn't. Get notified the moment a payment lands — no manual checking required.",
  },
  {
    icon: Clock,
    title: "Never Chase a Payment Again",
    desc: "Automated email reminders go out before and after due dates. Your clients pay on time. You stay professional.",
  },
  {
    icon: User,
    title: "Always Know Who Owes You",
    desc: "Store client details once. Track total revenue, outstanding balances, and full payment history — all in one place.",
  },
];

const comparisonRows = [
  { label: "Invoice creation time", without: "20–30 minutes", with: "Under 30 seconds" },
  { label: "GST calculation", without: "Manual, error-prone", with: "Automatic" },
  { label: "Payment collection", without: "Awkward follow-up emails", with: "Share a link, get paid" },
  { label: "Invoice design", without: "Inconsistent & unprofessional", with: "20 polished templates" },
  { label: "Payment reminders", without: "Manual emails you forget", with: "Automatic" },
  { label: "PDF export", without: "Manual formatting", with: "1 click" },
];

const testimonials = [
  {
    stars: 5,
    quote: "I used to spend 30 minutes per invoice in Excel. With Invoicely, it takes 2 minutes and looks 10x more professional.",
    name: "Rahul S.",
    role: "Freelance Designer",
    initials: "RS",
  },
  {
    stars: 5,
    quote: "My clients actually comment on how professional my invoices look. It's made a real difference to how they perceive my work.",
    name: "Priya M.",
    role: "Marketing Consultant",
    initials: "PM",
  },
  {
    stars: 5,
    quote: "The online payment link is a game changer. Clients used to delay for weeks. Now most pay the same day.",
    name: "Arjun T.",
    role: "Web Agency Owner",
    initials: "AT",
  },
];

const metrics = [
  { value: "$2M+", label: "Invoiced Globally", icon: TrendingUp },
  { value: "< 30s", label: "Average Setup Time", icon: ZapIcon },
  { value: "99.2%", label: "On-Time Payments", icon: Award },
  { value: "100%", label: "Bank-Grade Encryption", icon: Lock },
];

// ─────────────────────────────────────────────────────────────────────────────
// FAQ ACCORDION
// ─────────────────────────────────────────────────────────────────────────────
const FAQItem = ({ q, a }: { q: string; a: string }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-stone-200/80 last:border-0">
      <button
        className="w-full flex items-center justify-between py-5 text-left gap-4 group cursor-pointer"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <span className="text-base font-semibold text-[#1a1a1a] group-hover:text-amber-600 transition-colors">
          {q}
        </span>
        <ChevronDown
          className={`h-5 w-5 text-stone-400 flex-shrink-0 transition-transform duration-300 ${
            open ? "rotate-180 text-amber-500" : "group-hover:text-stone-600"
          }`}
        />
      </button>
      {open && (
        <div className="pb-5 text-sm text-stone-600 leading-relaxed animate-in fade-in-50 duration-200">
          {a}
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
const Landing = () => {
  const session = useSession();
  const navigate = useNavigate();
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"ai" | "payment" | "gst">("ai");

  useEffect(() => {
    if (session) navigate("/app", { replace: true });
  }, [session, navigate]);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsHeaderVisible(currentScrollY < lastScrollY || currentScrollY < 80);
      setLastScrollY(currentScrollY);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const toggleMobileMenu = () => setIsMobileMenuOpen((v) => !v);

  return (
    <div
      className="flex flex-col min-h-screen font-sans selection:bg-amber-300 selection:text-[#1a1a1a] relative overflow-hidden"
      style={{ backgroundColor: "#F5F0E8", color: "#1a1a1a" }}
    >
      {/* Dynamic Background Glow Orbs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-amber-200/40 via-amber-100/20 to-transparent blur-3xl pointer-events-none -z-10" />

      {/* ════════════════════════════════════════
          GLASSMORPHIC HEADER
      ════════════════════════════════════════ */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 backdrop-blur-md bg-[#F5F0E8]/85 border-b border-stone-200/70 ${
          isHeaderVisible ? "opacity-100 translate-y-0 shadow-sm" : "opacity-0 -translate-y-4"
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <Logo href="/" />

          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-stone-600">
            <a href="#howitworks" className="hover:text-amber-600 transition-colors">How it works</a>
            <a href="#features" className="hover:text-amber-600 transition-colors">Features</a>
            <a href="#pricing" className="hover:text-amber-600 transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-amber-600 transition-colors">FAQ</a>
          </nav>

          <div className="flex items-center gap-3">
            <Button
              onClick={() => navigate("/auth")}
              variant="outline"
              size="sm"
              className="hidden md:flex font-semibold border-stone-300/80 bg-white/50 hover:bg-white text-stone-700 backdrop-blur-sm transition-all"
            >
              Sign In
            </Button>
            <Button
              onClick={() => navigate("/auth")}
              size="sm"
              className="bg-amber-400 hover:bg-amber-500 text-[#1a1a1a] font-bold px-4 shadow-sm hover:shadow transition-all hover:scale-[1.02]"
            >
              Get Started Free
            </Button>
            <Button
              onClick={toggleMobileMenu}
              size="sm"
              variant="ghost"
              className="md:hidden text-[#1a1a1a] p-2 hover:bg-stone-200/50"
              aria-label="Open navigation menu"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Glass Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs md:hidden" onClick={toggleMobileMenu}>
          <div
            className="fixed top-0 right-0 h-full w-72 p-6 shadow-2xl flex flex-col justify-between backdrop-blur-xl bg-[#F5F0E8]/95 border-l border-stone-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <div className="flex items-center justify-between pb-5 border-b border-stone-200">
                <Logo size="sm" href="/" />
                <button onClick={toggleMobileMenu} className="p-1.5 text-stone-500 hover:text-[#1a1a1a] rounded-lg" aria-label="Close menu">
                  <X size={18} />
                </button>
              </div>
              <nav className="flex flex-col gap-1 mt-5">
                {[
                  { label: "How it works", href: "#howitworks" },
                  { label: "Features", href: "#features" },
                  { label: "Pricing", href: "#pricing" },
                  { label: "FAQ", href: "#faq" },
                ].map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={toggleMobileMenu}
                    className="py-3 px-3 text-base font-semibold text-stone-700 hover:bg-amber-100/50 hover:text-amber-800 rounded-xl transition-all"
                  >
                    {item.label}
                  </a>
                ))}
              </nav>
            </div>
            <div className="space-y-2">
              <Button
                onClick={() => { navigate("/auth"); toggleMobileMenu(); }}
                className="w-full bg-amber-400 hover:bg-amber-500 text-[#1a1a1a] font-bold py-6 rounded-xl shadow-md"
              >
                Get Started Free
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════
          HERO SECTION
      ════════════════════════════════════════ */}
      <section className="pt-36 sm:pt-44 pb-16 sm:pb-24 px-4 sm:px-6 relative">
        {/* Floating Decorative Glass Accents */}
        <div className="absolute top-28 right-6 sm:right-24 h-14 w-14 sm:h-20 sm:w-20 rounded-2xl bg-amber-400/80 rotate-12 blur-[1px] shadow-lg pointer-events-none animate-pulse duration-1000" aria-hidden="true" />
        <div className="absolute bottom-12 left-4 sm:left-20 h-10 w-10 sm:h-14 sm:w-14 rounded-xl bg-amber-300/60 -rotate-12 blur-[1px] shadow-md pointer-events-none" aria-hidden="true" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          {/* SaaS Pill Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 border border-stone-200/90 text-stone-700 text-xs font-semibold mb-8 shadow-sm backdrop-blur-sm hover:border-amber-400 transition-colors">
            <Sparkles className="h-4 w-4 text-amber-500 animate-spin" style={{ animationDuration: '6s' }} aria-hidden="true" />
            <span>Trusted by 10,000+ freelancers &amp; agencies worldwide 🌍</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1.08] mb-6 text-[#1a1a1a]">
            Create Professional Invoices in{" "}
            <span className="relative inline-block px-2 py-0.5 rounded-lg bg-amber-300/60 text-[#1a1a1a] border border-amber-400/40">
              30 Seconds
            </span>{" "}
            <br className="hidden sm:block" />
            — and Get Paid Faster.
          </h1>

          {/* Sub-headline */}
          <p className="text-stone-600 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
            Stop wasting hours on manual spreadsheets. Create, send, and track stunning invoices with AI prompts, instant payment links, and auto-tax calculation.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              onClick={() => navigate("/auth")}
              size="lg"
              className="w-full sm:w-auto bg-amber-400 hover:bg-amber-500 text-[#1a1a1a] font-extrabold px-10 py-6 text-base rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-200 group"
            >
              Get Started Free <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
            </Button>
            <a href="#howitworks" className="w-full sm:w-auto">
              <Button
                variant="outline"
                size="lg"
                className="w-full font-semibold px-8 py-6 text-base rounded-xl border-stone-300 bg-white/60 hover:bg-white text-stone-700 shadow-xs backdrop-blur-xs transition-all"
              >
                See How It Works
              </Button>
            </a>
          </div>

          {/* Trust Badges */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs font-semibold text-stone-500">
            <span className="flex items-center gap-2 bg-white/70 px-3 py-1.5 rounded-lg border border-stone-200/60">
              <ShieldCheck className="h-4 w-4 text-amber-500" aria-hidden="true" />
              No credit card required
            </span>
            <span className="flex items-center gap-2 bg-white/70 px-3 py-1.5 rounded-lg border border-stone-200/60">
              <CheckIcon className="h-4 w-4 text-amber-500" aria-hidden="true" />
              GST &amp; Multi-currency ready
            </span>
            <span className="flex items-center gap-2 bg-white/70 px-3 py-1.5 rounded-lg border border-stone-200/60">
              <Globe className="h-4 w-4 text-amber-500" aria-hidden="true" />
              Instant 1-Click PDF export
            </span>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          METRICS BANNER
      ════════════════════════════════════════ */}
      <section className="pb-12 px-4 sm:px-6 max-w-5xl mx-auto w-full">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-white/80 backdrop-blur-md rounded-2xl border border-stone-200/80 shadow-md">
          {metrics.map((m) => (
            <div key={m.label} className="text-center p-3">
              <m.icon className="h-5 w-5 text-amber-500 mx-auto mb-2" />
              <div className="text-2xl sm:text-3xl font-black text-stone-900">{m.value}</div>
              <div className="text-xs font-semibold text-stone-500 mt-1">{m.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════
          VIDEO / INTERACTIVE PREVIEW
      ════════════════════════════════════════ */}
      <section className="pb-16 px-4 sm:px-6 max-w-5xl mx-auto w-full">
        {/* Interactive Feature Pills */}
        <div className="flex items-center justify-center gap-2 mb-6 flex-wrap">
          {[
            { id: "ai", label: "✨ AI Invoice Generator" },
            { id: "payment", label: "💳 Instant Payment Link" },
            { id: "gst", label: "🧾 Auto GST & Currency" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === tab.id
                  ? "bg-stone-900 text-white shadow-md"
                  : "bg-white/80 text-stone-600 hover:bg-white border border-stone-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Browser Mockup Shell */}
        <div className="rounded-2xl overflow-hidden shadow-2xl border border-stone-300/80 bg-white group hover:shadow-3xl transition-shadow duration-500">
          {/* Browser Top Chrome */}
          <div className="flex items-center gap-2 px-4 py-3 bg-stone-100/90 border-b border-stone-200">
            <div className="flex gap-1.5">
              <span className="h-3 w-3 rounded-full bg-red-400" aria-hidden="true" />
              <span className="h-3 w-3 rounded-full bg-amber-400" aria-hidden="true" />
              <span className="h-3 w-3 rounded-full bg-green-400" aria-hidden="true" />
            </div>
            <div className="flex-1 mx-3 bg-white border border-stone-200 rounded-md px-3 py-1 text-xs text-stone-500 text-center font-mono shadow-inner flex items-center justify-center gap-2">
              <Lock className="h-3 w-3 text-emerald-600" /> app.invoicely.me/dashboard
            </div>
          </div>

          <div className="aspect-video relative bg-stone-900">
            <video
              className="w-full h-full object-cover"
              autoPlay
              muted
              loop
              playsInline
              poster="/video-poster.jpg"
            >
              <source src="/invoicely preview.mp4" type="video/mp4" />
            </video>
          </div>
        </div>
        <p className="text-center text-sm text-stone-500 mt-4 font-medium">
          ⚡ Create, customize, and deliver invoices seamlessly from one intuitive dashboard.
        </p>
      </section>

      {/* ════════════════════════════════════════
          WHO IT'S FOR
      ════════════════════════════════════════ */}
      <section className="py-10 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-5">Designed Specifically For</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {["Freelancers", "Agencies", "Consultants", "Creators", "Startups", "Small Businesses"].map((who) => (
              <span
                key={who}
                className="px-4 py-2.5 rounded-xl bg-white border border-stone-200 text-stone-700 text-sm font-semibold shadow-xs hover:border-amber-400 hover:bg-amber-50 hover:text-amber-900 transition-all cursor-default"
              >
                {who}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          HOW IT WORKS
      ════════════════════════════════════════ */}
      <section id="howitworks" className="py-20 sm:py-28 px-4 sm:px-6 bg-white border-y border-stone-200/70">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-bold uppercase tracking-widest text-amber-600 mb-3">Simple by Design</p>
            <h2 className="text-4xl sm:text-5xl font-black text-[#1a1a1a] mb-4">
              From Idea to Paid — in 3 Easy Steps
            </h2>
            <p className="text-stone-600 text-base max-w-md mx-auto">
              No manual formatting. No spreadsheets. Get paid faster in minutes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                num: "1",
                title: "Describe Your Work",
                desc: "Type what you did or let AI generate your line items automatically. Rates, quantities, and GST are calculated for you.",
              },
              {
                num: "2",
                title: "Choose a Template",
                desc: "Select from 20 modern invoice designs. Customize colors, add your brand logo, and preview instant PDF output.",
              },
              {
                num: "3",
                title: "Share & Get Paid",
                desc: "Send a live payment link. Clients pay via UPI, Razorpay, or credit card. Get notified the second payment arrives.",
              },
            ].map((step) => (
              <div
                key={step.num}
                className="p-8 bg-[#F5F0E8]/50 rounded-2xl border border-stone-200/80 shadow-xs hover:shadow-md transition-all flex flex-col group"
              >
                <div className="h-12 w-12 rounded-xl bg-amber-400 text-[#1a1a1a] font-black text-xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
                  {step.num}
                </div>
                <h3 className="text-xl font-bold text-[#1a1a1a] mb-3">{step.title}</h3>
                <p className="text-sm text-stone-600 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button
              onClick={() => navigate("/auth")}
              className="bg-amber-400 hover:bg-amber-500 text-[#1a1a1a] font-bold px-10 py-6 rounded-xl text-base shadow-md hover:shadow-lg transition-all"
            >
              Try It Free Now <ArrowRight className="h-5 w-5 ml-2 inline" aria-hidden="true" />
            </Button>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          FEATURES GRID
      ════════════════════════════════════════ */}
      <section id="features" className="py-20 sm:py-28 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-bold uppercase tracking-widest text-amber-600 mb-3">Why Invoicely</p>
            <h2 className="text-4xl sm:text-5xl font-black text-[#1a1a1a] mb-4">
              Everything You Need to Run Your Invoicing
            </h2>
            <p className="text-stone-600 text-base max-w-lg mx-auto">
              Save 10+ hours every month while maintaining a polished professional brand image.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div
                key={f.title}
                className="p-8 bg-white rounded-2xl border border-stone-200/80 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
              >
                <div className="h-12 w-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-6 group-hover:bg-amber-400 group-hover:text-[#1a1a1a] transition-colors">
                  <f.icon className="h-6 w-6" aria-hidden="true" />
                </div>
                <h3 className="text-lg font-bold text-[#1a1a1a] mb-2">{f.title}</h3>
                <p className="text-sm text-stone-600 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          COMPARISON TABLE
      ════════════════════════════════════════ */}
      <section className="py-20 sm:py-28 px-4 sm:px-6 bg-white border-y border-stone-200/70">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-bold uppercase tracking-widest text-amber-600 mb-3">The Difference</p>
            <h2 className="text-4xl sm:text-5xl font-black text-[#1a1a1a] mb-4">
              Why Switch from Spreadsheets?
            </h2>
            <p className="text-stone-600 text-base max-w-md mx-auto">
              See what manual invoicing is costing your business every single week.
            </p>
          </div>

          <div className="overflow-hidden rounded-2xl border border-stone-200 shadow-md">
            <table className="w-full bg-white text-sm">
              <thead>
                <tr className="border-b border-stone-200 bg-stone-50/80">
                  <th className="text-left px-6 py-4 font-bold text-stone-500 text-xs uppercase tracking-wider w-1/3">Task</th>
                  <th className="px-6 py-4 font-bold text-red-600 text-xs uppercase tracking-wider text-center bg-red-50/40">
                    <span className="flex items-center justify-center gap-2">
                      <XCircle className="h-4 w-4 text-red-500" aria-hidden="true" /> Without Invoicely
                    </span>
                  </th>
                  <th className="px-6 py-4 font-bold text-amber-800 text-xs uppercase tracking-wider text-center bg-amber-100/60">
                    <span className="flex items-center justify-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-amber-600" aria-hidden="true" /> With Invoicely
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row, i) => (
                  <tr key={row.label} className={`border-b border-stone-100 last:border-0 ${i % 2 === 0 ? "bg-white" : "bg-stone-50/30"}`}>
                    <td className="px-6 py-4 font-semibold text-[#1a1a1a]">{row.label}</td>
                    <td className="px-6 py-4 text-center text-stone-500 bg-red-50/10">{row.without}</td>
                    <td className="px-6 py-4 text-center font-bold text-emerald-800 bg-amber-50/50">{row.with}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          TESTIMONIALS
      ════════════════════════════════════════ */}
      <section className="py-20 sm:py-28 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-bold uppercase tracking-widest text-amber-600 mb-3">Community Love</p>
            <h2 className="text-4xl sm:text-5xl font-black text-[#1a1a1a] mb-4">
              Loved by Freelancers &amp; Business Owners
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="p-8 bg-white rounded-2xl border border-stone-200/80 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex gap-1 mb-4" aria-label={`${t.stars} out of 5 stars`}>
                    {Array.from({ length: t.stars }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" aria-hidden="true" />
                    ))}
                  </div>
                  <p className="text-sm text-stone-700 leading-relaxed font-medium mb-6">"{t.quote}"</p>
                </div>
                <div className="flex items-center gap-3 pt-4 border-t border-stone-100">
                  <div className="h-10 w-10 rounded-full bg-amber-200 text-amber-900 flex items-center justify-center font-extrabold text-xs flex-shrink-0 shadow-xs">
                    {t.initials}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#1a1a1a]">{t.name}</p>
                    <p className="text-xs text-stone-500 font-medium">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          PRICING
      ════════════════════════════════════════ */}
      <section id="pricing" className="py-20 sm:py-28 px-4 sm:px-6 bg-white border-y border-stone-200/70">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-bold uppercase tracking-widest text-amber-600 mb-3">Transparent Pricing</p>
            <h2 className="text-4xl sm:text-5xl font-black text-[#1a1a1a] mb-4">Start Free. Upgrade Anytime.</h2>
            <p className="text-stone-600 text-base max-w-md mx-auto">
              No hidden fees. Pick the plan that fits your current workflow.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-stretch">
            {pricingTiers.map((tier) => (
              <div
                key={tier.name}
                className={`p-8 rounded-2xl bg-white flex flex-col justify-between shadow-md hover:shadow-xl transition-all relative border ${
                  tier.badge ? "border-2 border-amber-400 bg-amber-50/10" : "border-stone-200"
                }`}
              >
                {tier.badge && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-amber-400 text-[#1a1a1a] text-[10px] font-black uppercase tracking-widest px-4 py-1 rounded-full shadow-sm">
                    {tier.badge}
                  </span>
                )}
                <div>
                  <h3 className="text-2xl font-black text-[#1a1a1a] mb-1">{tier.name}</h3>
                  <p className="text-xs text-stone-500 mb-6">{tier.description}</p>
                  <div className="mb-2 flex items-baseline gap-1.5 flex-wrap">
                    <span className="text-5xl font-black text-[#1a1a1a]">{tier.price}</span>
                    {tier.subPrice && (
                      <span className="text-xl font-bold text-stone-500">{tier.subPrice}</span>
                    )}
                    <span className="text-sm font-semibold text-stone-500">{tier.period}</span>
                  </div>
                  {tier.yearlyNote && (
                    <p className="text-xs text-emerald-700 font-bold mb-6">{tier.yearlyNote}</p>
                  )}
                  {!tier.yearlyNote && <div className="mb-6" />}
                  <ul className="space-y-3.5 border-t border-stone-100 pt-6">
                    {tier.features.map((feat, idx) => (
                      <li key={idx} className="flex items-center text-sm font-medium text-stone-700">
                        <CheckIcon className="h-4 w-4 text-amber-500 mr-3 flex-shrink-0" aria-hidden="true" />
                        {feat}
                      </li>
                    ))}
                  </ul>
                </div>
                <Button
                  onClick={() => navigate("/auth")}
                  className={`w-full mt-8 py-6 rounded-xl font-bold text-sm ${tier.ctaStyle}`}
                >
                  {tier.cta}
                </Button>
              </div>
            ))}
          </div>

          <p className="text-center text-xs text-stone-500 mt-8 font-medium">
            🔒 All plans include PDF exports, GST calculations, and custom bank/UPI payment setup.
          </p>
        </div>
      </section>

      {/* ════════════════════════════════════════
          FAQ
      ════════════════════════════════════════ */}
      <section id="faq" className="py-20 sm:py-28 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-bold uppercase tracking-widest text-amber-600 mb-3">Got Questions?</p>
            <h2 className="text-4xl sm:text-5xl font-black text-[#1a1a1a] mb-4">Frequently Asked Questions</h2>
          </div>
          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm px-8 py-2">
            {faqs.map((faq) => (
              <FAQItem key={faq.q} q={faq.q} a={faq.a} />
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          FOOTER
      ════════════════════════════════════════ */}
      <footer className="py-10 bg-[#1a1a1a] text-stone-400 text-sm border-t border-stone-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 text-xs text-stone-400 font-medium">
            <span>Built with</span>
            <span className="text-amber-400">🧡</span>
            <span>© {new Date().getFullYear()} Invoicely. All rights reserved.</span>
          </div>
          <div className="flex flex-wrap justify-center gap-6 text-xs font-semibold">
            <Link to="/terms" className="hover:text-amber-400 transition-colors">Terms &amp; Conditions</Link>
            <Link to="/privacy" className="hover:text-amber-400 transition-colors">Privacy Policy</Link>
            <Link to="/refunds" className="hover:text-amber-400 transition-colors">Cancellation &amp; Refunds</Link>
            <Link to="/contact-us" className="hover:text-amber-400 transition-colors">Contact Us</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;