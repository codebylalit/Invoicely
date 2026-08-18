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
  Mail,
  RefreshCw,
  Download,
  BellRing,
} from "lucide-react";
import Logo from "@/components/Logo";
import SEOHead from "@/components/SEOHead";

// ── Homepage structured data ──────────────────────────────────────────────────
const homepageSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "@id": "https://www.getinvoicely.online/#software",
  "name": "Invoicely",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web",
  "url": "https://www.getinvoicely.online",
  "description": "Free online invoice generator for freelancers and small businesses. Create, send, and track professional invoices with AI, GST support, and online payment links.",
  "offers": [
    {
      "@type": "Offer",
      "name": "Free Plan",
      "price": "0",
      "priceCurrency": "USD",
      "description": "5 invoices per month, 3 templates, 3 clients"
    },
    {
      "@type": "Offer",
      "name": "Pro Plan",
      "price": "6",
      "priceCurrency": "USD",
      "billingIncrement": 1,
      "priceSpecification": {
        "@type": "UnitPriceSpecification",
        "price": "6",
        "priceCurrency": "USD",
        "unitCode": "MON"
      }
    }
  ],
  "featureList": [
    "AI invoice generation",
    "20 professional invoice templates",
    "Direct 1-click email delivery with PDF attachment",
    "GST/tax calculation",
    "PDF export",
    "Online payment links (Razorpay & PayPal)",
    "Client management",
    "Automatic payment reminders",
    "Multi-currency support"
  ]
};

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
    features: [
      "5 invoices per month",
      "1-Click direct email sending (PDF attached)",
      "3 professional invoice templates",
      "Manage up to 3 clients",
      "Bank & payment link details",
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
    features: [
      "Unlimited invoices & clients",
      "Direct email delivery with attached PDFs",
      "All 20 premium templates",
      "100% white-label — your brand only",
      "Online payment links (Cards, PayPal, Razorpay, UPI)",
      "Unlimited AI invoice creation",
      "Automatic payment reminders & recurring billing",
      "Multi-currency billing (USD, EUR, GBP, INR)",
    ],
  },
];

const faqs = [
  {
    q: "Can I use Invoicely for free forever?",
    a: "Yes. The Free plan never expires. Create up to 5 invoices per month, email them directly to clients with attached PDFs, and manage 3 clients — at no cost, forever.",
  },
  {
    q: "Can I send invoices directly to client emails?",
    a: "Yes! You can email invoices directly to your client's email inbox from Invoicely with one click. The email includes a custom message, an attached print-ready PDF invoice, and a direct online payment link.",
  },
  {
    q: "Can my clients pay online?",
    a: "Yes. Invoicely integrates with Razorpay (UPI, Debit/Credit Cards, Netbanking) and PayPal for global payments in USD/EUR.",
  },
  {
    q: "Can I generate GST-compliant invoices?",
    a: "Yes. CGST, SGST, and IGST are calculated automatically based on your state code and tax rate. HSN/SAC codes and GSTIN numbers are supported.",
  },
  {
    q: "Can I download invoices as PDF?",
    a: "Yes. Every invoice exports as a print-ready, high-resolution PDF in one click.",
  },
  {
    q: "Can I remove the Invoicely branding?",
    a: "Yes. Pro plan users get fully white-label invoices — no Invoicely watermark or badge anywhere.",
  },
];

// Core unique features for Dark Bento Grid
const features = [
  {
    icon: Mail,
    title: "1-Click Direct Email Delivery",
    desc: "Send invoices straight to your client's email inbox with your custom message, attached print-ready PDF, and payment link.",
  },
  {
    icon: ZapIcon,
    title: "AI-Powered Generation",
    desc: "Describe your work in plain English — Invoicely's AI builds a complete, itemized invoice in seconds with tax calculations.",
  },
  {
    icon: Palette,
    title: "20 Professional Templates",
    desc: "20 designer-crafted invoice styles — from minimal freelancer to corporate enterprise. Add your logo and brand colors.",
  },
  {
    icon: CreditCard,
    title: "Razorpay & PayPal Payment Checkout",
    desc: "Accept local Indian UPI, Cards, and Netbanking via Razorpay or bill global international clients in USD/EUR via PayPal.",
  },
  {
    icon: RefreshCw,
    title: "Automated Recurring Invoices",
    desc: "Set up background recurring billing for retainer clients. Invoicely automatically generates and dispatches invoices on schedule.",
  },
  {
    icon: BellRing,
    title: "Smart Email Payment Reminders",
    desc: "Automated friendly payment reminders go out before and after due dates so clients pay on time without awkward emails.",
  },
];

const steps = [
  {
    num: "01",
    title: "Describe Your Work",
    desc: "Type what you did or let AI generate line items. Rates, quantities, and GST calculated for you automatically.",
    icon: Sparkles,
  },
  {
    num: "02",
    title: "Choose a Template",
    desc: "Select from 20 modern invoice designs. Add your logo, customize accent colors, and preview instant PDF output.",
    icon: Palette,
  },
  {
    num: "03",
    title: "Send Email & PDF",
    desc: "Send directly to your client's email inbox in 1 click with the print-ready PDF attached and custom message.",
    icon: Mail,
  },
  {
    num: "04",
    title: "Share Payment Link & Get Paid",
    desc: "Clients pay via Razorpay, UPI, Cards, or PayPal. Get notified the second payment arrives with auto-tracking.",
    icon: Send,
  },
];

const comparisonRows = [
  { label: "Invoice creation time", without: "20–30 minutes", with: "Under 30 seconds" },
  { label: "Email sending", without: "Manual export & attachment", with: "1-Click direct email + PDF attached" },
  { label: "GST & Tax calculation", without: "Manual, error-prone", with: "Automatic CGST, SGST & IGST" },
  { label: "Payment collection", without: "Awkward follow-up emails", with: "Razorpay (UPI/Card) & PayPal links" },
  { label: "Invoice design", without: "Inconsistent & unprofessional", with: "20 polished templates" },
  { label: "Payment reminders", without: "Manual emails you forget", with: "Automated reminders before/after due date" },
  { label: "PDF export", without: "Manual formatting", with: "1 click high-res PDF" },
];

const testimonials = [
  {
    stars: 5,
    quote: "I used to spend 30 minutes per invoice in Excel. With Invoicely, it takes 2 minutes and I can email the PDF straight to my client.",
    name: "Rahul S.",
    role: "Freelance Designer",
    initials: "RS",
  },
  {
    stars: 5,
    quote: "My clients actually comment on how professional my invoices look. The direct payment link has made a huge difference.",
    name: "Priya M.",
    role: "Marketing Consultant",
    initials: "PM",
  },
  {
    stars: 5,
    quote: "The Razorpay and PayPal payment links are game changers. Clients pay the same day they receive the email.",
    name: "Arjun T.",
    role: "Web Agency Owner",
    initials: "AT",
  },
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
        <span className="text-base font-semibold text-[#0A0A0A] group-hover:text-amber-600 transition-colors">
          {q}
        </span>
        <ChevronDown
          className={`h-5 w-5 text-stone-400 flex-shrink-0 transition-transform duration-300 ${open ? "rotate-180 text-amber-500" : "group-hover:text-stone-600"
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
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (session) navigate("/app", { replace: true });
  }, [session, navigate]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMobileMenu = () => setIsMobileMenuOpen((v) => !v);

  return (
    <>
      <SEOHead
        title="Invoicely — Free Online Invoice Generator with Direct Email & Payment Links"
        description="Create professional invoices online in seconds. Direct 1-click email delivery with PDF attached, AI-powered generation, GST calculations, Razorpay & PayPal payment links."
        canonical="https://www.getinvoicely.online"
        structuredData={homepageSchema}
      />
      <div
        className="flex flex-col min-h-screen selection:bg-amber-200 selection:text-[#0A0A0A]"
        style={{
          backgroundColor: "#FAFAF9",
          color: "#0A0A0A",
          fontFamily: "'Plus Jakarta Sans', 'Poppins', sans-serif",
        }}
      >
        {/* ════════════════════════════════════════
            FLOATING PILL NAVBAR
        ════════════════════════════════════════ */}
        <div className="fixed top-4 inset-x-0 z-50 flex justify-center px-4">
          <header
            className={`w-full max-w-4xl flex items-center justify-between gap-2 px-3 py-2.5 rounded-full border transition-all duration-300 ${scrolled
              ? "bg-white/95 backdrop-blur-2xl border-stone-200 shadow-xl shadow-stone-200/70"
              : "bg-white/80 backdrop-blur-xl border-stone-200/60 shadow-lg shadow-stone-200/40"
              }`}
          >
            {/* Logo */}
            <div className="flex-shrink-0 pl-1">
              <Logo href="/" size="sm" />
            </div>

            {/* Nav links — desktop */}
            <nav className="hidden md:flex items-center gap-0.5 text-sm font-semibold text-stone-500">
              {[
                { label: "How it works", href: "#howitworks" },
                { label: "Features", href: "#features" },
                { label: "Pricing", href: "#pricing" },
                { label: "FAQ", href: "#faq" },
              ].map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="px-3.5 py-1.5 rounded-full hover:bg-stone-100 hover:text-stone-900 transition-all duration-200 whitespace-nowrap"
                >
                  {item.label}
                </a>
              ))}
            </nav>

            {/* CTAs */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => navigate("/auth")}
                className="hidden md:block text-sm font-semibold text-stone-500 hover:text-stone-900 px-3 py-1.5 rounded-full hover:bg-stone-100 transition-all duration-200"
              >
                Sign In
              </button>
              <button
                onClick={() => navigate("/auth")}
                className="flex items-center gap-1.5 bg-[#0A0A0A] hover:bg-stone-700 text-white font-bold text-sm px-4 py-2 rounded-full shadow-sm hover:shadow-md transition-all duration-200 group"
              >
                Get Started
                <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
              </button>
              <button
                onClick={toggleMobileMenu}
                className="md:hidden p-2 rounded-full hover:bg-stone-100 transition-all"
                aria-label="Open navigation menu"
              >
                {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
            </div>
          </header>
        </div>

        {/* Mobile Drawer */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 z-50 bg-black/25 backdrop-blur-sm md:hidden"
            onClick={toggleMobileMenu}
          >
            <div
              className="fixed top-0 right-0 h-full w-72 p-6 shadow-2xl flex flex-col justify-between bg-white border-l border-stone-100"
              onClick={(e) => e.stopPropagation()}
            >
              <div>
                <div className="flex items-center justify-between pb-5 border-b border-stone-100">
                  <Logo size="sm" href="/" />
                  <button
                    onClick={toggleMobileMenu}
                    className="p-1.5 text-stone-400 hover:text-stone-900 rounded-full hover:bg-stone-100"
                    aria-label="Close menu"
                  >
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
                      className="py-3 px-4 text-base font-semibold text-stone-700 hover:bg-amber-50 hover:text-amber-900 rounded-xl transition-all"
                    >
                      {item.label}
                    </a>
                  ))}
                </nav>
              </div>
              <button
                onClick={() => {
                  navigate("/auth");
                  toggleMobileMenu();
                }}
                className="w-full bg-[#0A0A0A] hover:bg-stone-800 text-white font-bold py-4 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 group"
              >
                Get Started Free
                <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════
            HERO SECTION
        ════════════════════════════════════════ */}
        <section className="relative pt-32 sm:pt-40 pb-0 px-4 sm:px-6 overflow-hidden">
          {/* Ambient glow */}
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[700px] pointer-events-none -z-10"
            style={{
              background:
                "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(251,191,36,0.13) 0%, transparent 70%)",
            }}
          />

          <div className="max-w-5xl mx-auto text-center relative z-10">
            {/* Social proof pill */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-stone-200 shadow-sm text-xs font-semibold text-stone-600 mb-8 animate-fade-up">
              <div className="flex gap-0.5" aria-label="5 stars">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" aria-hidden="true" />
                ))}
              </div>
              <span className="text-stone-300">·</span>
              <span>Trusted by 10,000+ freelancers & businesses</span>
            </div>

            {/* Headline */}
            <h1
              className="font-black tracking-tight leading-[1.02] mb-6"
              style={{
                fontSize: "clamp(2.6rem, 7vw, 5.5rem)",
                fontFamily: "'Plus Jakarta Sans', 'Poppins', sans-serif",
              }}
            >
              Create Invoices in{" "}
              <span className="italic" style={{ color: "#F59E0B" }}>
                30 Seconds
              </span>
              <br className="hidden sm:block" />
              <span style={{ color: "#0A0A0A" }}>{"— and Get Paid Faster."}</span>
            </h1>

            {/* Sub-headline */}
            <p className="text-stone-500 text-lg sm:text-xl max-w-xl mx-auto mb-10 leading-relaxed font-normal">
              Stop wasting hours on spreadsheets. AI-powered invoicing with auto-tax calculation, direct email delivery, instant payment links, and beautiful templates.
            </p>



            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-7">
              <button
                id="hero-cta-primary"
                onClick={() => navigate("/auth")}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#0A0A0A] hover:bg-stone-700 text-white font-bold px-8 py-4 text-base rounded-full shadow-xl hover:shadow-2xl transition-all duration-200 group"
              >
                Get Started Free
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
              </button>
              <a href="#howitworks" className="w-full sm:w-auto">
                <button className="w-full flex items-center justify-center gap-2 font-semibold px-8 py-4 text-base rounded-full border border-stone-300 bg-white hover:border-stone-400 hover:bg-stone-50 text-stone-700 shadow-sm hover:shadow-md transition-all duration-200">
                  See How It Works
                </button>
              </a>
            </div>

            {/* Trust micro-badges */}
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-stone-500 mb-6">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" aria-hidden="true" />
                No credit card required
              </span>
              <span className="text-stone-300" aria-hidden="true">·</span>
              <span className="flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-amber-500" aria-hidden="true" />
                Direct Email &amp; PDF Attached
              </span>
              <span className="text-stone-300" aria-hidden="true">·</span>
              <span className="flex items-center gap-1.5">
                <CheckIcon className="h-3.5 w-3.5 text-amber-500" aria-hidden="true" />
                GST &amp; Razorpay/PayPal ready
              </span>
            </div>
          </div>

          {/* Floating Dashboard Mockup */}
          <div className="max-w-5xl mx-auto px-0 sm:px-4 relative mt-8">
            <div
              className="rounded-2xl overflow-hidden border border-stone-200/80 bg-white"
              style={{
                transform: "perspective(1400px) rotateX(4deg)",
                transformOrigin: "top center",
                boxShadow: "0 40px 100px rgba(0,0,0,0.15), 0 8px 24px rgba(0,0,0,0.08)",
              }}
            >
              {/* Browser chrome */}
              <div className="flex items-center gap-2 px-4 py-3 bg-stone-50/90 border-b border-stone-200/60">
                <div className="flex gap-1.5">
                  <span className="h-3 w-3 rounded-full bg-red-400" aria-hidden="true" />
                  <span className="h-3 w-3 rounded-full bg-amber-400" aria-hidden="true" />
                  <span className="h-3 w-3 rounded-full bg-green-400" aria-hidden="true" />
                </div>
                <div className="flex-1 mx-3 bg-white border border-stone-200 rounded-md px-3 py-1 text-xs text-stone-400 text-center font-mono flex items-center justify-center gap-1.5">
                  <Lock className="h-2.5 w-2.5 text-emerald-500" aria-hidden="true" />
                  getinvoicely.online/app
                </div>
              </div>
              {/* Video */}
              <div className="aspect-video bg-stone-900">
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
            <div
              className="absolute bottom-0 left-0 right-0 h-40 pointer-events-none"
              style={{ background: "linear-gradient(to top, #FAFAF9 0%, transparent 100%)" }}
            />
          </div>
        </section>

        {/* ════════════════════════════════════════
            WHO IT'S FOR
        ════════════════════════════════════════ */}
        <section className="py-6 px-4 sm:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-4">
              Designed For
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {["Freelancers", "Agencies", "Consultants", "Creators", "GST Businesses", "Small Businesses"].map((who) => (
                <span
                  key={who}
                  className="px-4 py-2 rounded-full bg-white border border-stone-200 text-stone-700 text-sm font-semibold shadow-sm hover:border-amber-400 hover:bg-amber-50 hover:text-amber-900 transition-all duration-200 cursor-default"
                >
                  {who}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════
            HOW IT WORKS — 4 CORE STEPS (NON-REPETITIVE)
        ════════════════════════════════════════ */}
        <section id="howitworks" className="py-20 sm:py-28 px-4 sm:px-6">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <p className="text-xs font-bold uppercase tracking-widest text-amber-500 mb-3">
                Simple &amp; Complete Workflow
              </p>
              <h2 className="text-4xl sm:text-5xl font-black text-[#0A0A0A] mb-4 tracking-tight">
                From Creation to Direct Delivery in 4 Steps
              </h2>
              <p className="text-stone-500 text-base max-w-md mx-auto leading-relaxed">
                No manual formatting. No spreadsheets. Email PDFs directly &amp; get paid faster.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {steps.map((step) => {
                const Icon = step.icon;
                return (
                  <div
                    key={step.num}
                    className="bg-white rounded-3xl border border-stone-200 p-6 shadow-sm hover:shadow-xl hover:border-amber-400 transition-all duration-300 flex flex-col justify-between group"
                  >
                    <div>
                      <div className="h-12 w-12 rounded-2xl bg-amber-100 text-[#0A0A0A] font-black text-xl flex items-center justify-center mb-5 group-hover:bg-amber-400 transition-colors">
                        {step.num}
                      </div>
                      <h3 className="text-lg font-bold text-[#0A0A0A] mb-2 group-hover:text-amber-600 transition-colors">
                        {step.title}
                      </h3>
                      <p className="text-xs text-stone-500 leading-relaxed">{step.desc}</p>
                    </div>
                    <div className="mt-6 pt-4 border-t border-stone-100 flex items-center gap-1.5 text-xs font-bold text-stone-700">
                      <Icon className="h-4 w-4 text-amber-500" />
                      <span>Built-in Feature</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="text-center mt-12">
              <Link
                to="/how-it-works"
                className="inline-flex items-center gap-2 font-bold text-amber-700 hover:text-amber-800 text-sm hover:underline"
              >
                Explore Detailed Industry Use Cases &amp; Sample Invoices →
              </Link>
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════
            FEATURES — DARK BENTO GRID
        ════════════════════════════════════════ */}
        <section id="features" className="py-24 sm:py-32 px-4 sm:px-6" style={{ backgroundColor: "#0A0A0A" }}>
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14">
              <p className="text-xs font-bold uppercase tracking-widest text-amber-400 mb-3">
                Why Invoicely
              </p>
              <h2 className="text-4xl sm:text-5xl font-black text-white mb-4 tracking-tight">
                Everything You Need to Invoice &amp; Collect
              </h2>
              <p className="text-stone-400 text-base max-w-lg mx-auto leading-relaxed">
                Save 10+ hours every month while maintaining a polished professional brand.
              </p>
            </div>

            {/* Bento grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-auto">
              {/* Hero feature — spans 2 cols on large */}
              {(() => {
                const HeroIcon = features[0].icon;
                return (
                  <div
                    className="lg:col-span-2 p-8 rounded-3xl border border-white/8 flex flex-col justify-between group hover:border-amber-400/30 transition-all duration-300 min-h-[180px]"
                    style={{ backgroundColor: "rgba(255,255,255,0.04)" }}
                  >
                    <div className="h-12 w-12 rounded-2xl bg-amber-400/20 text-amber-400 flex items-center justify-center mb-6 group-hover:bg-amber-400 group-hover:text-[#0A0A0A] transition-all duration-300 flex-shrink-0">
                      <HeroIcon className="h-6 w-6" aria-hidden="true" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">{features[0].title}</h3>
                      <p className="text-sm text-stone-400 leading-relaxed max-w-md">{features[0].desc}</p>
                    </div>
                  </div>
                );
              })()}

              {/* Remaining 5 features */}
              {features.slice(1).map((f) => (
                <div
                  key={f.title}
                  className="p-6 rounded-3xl border border-white/8 flex flex-col group hover:border-amber-400/30 transition-all duration-300"
                  style={{ backgroundColor: "rgba(255,255,255,0.04)" }}
                >
                  <div className="h-10 w-10 rounded-xl bg-amber-400/20 text-amber-400 flex items-center justify-center mb-4 group-hover:bg-amber-400 group-hover:text-[#0A0A0A] transition-all duration-300 flex-shrink-0">
                    <f.icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">{f.title}</h3>
                  <p className="text-sm text-stone-400 leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════
            COMPARISON TABLE
        ════════════════════════════════════════ */}
        <section className="py-24 sm:py-32 px-4 sm:px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-14">
              <p className="text-xs font-bold uppercase tracking-widest text-amber-500 mb-3">
                The Difference
              </p>
              <h2 className="text-4xl sm:text-5xl font-black text-[#0A0A0A] mb-4 tracking-tight">
                Why Switch from Spreadsheets?
              </h2>
              <p className="text-stone-500 text-base max-w-md mx-auto leading-relaxed">
                See what manual invoicing is costing your business every single week.
              </p>
            </div>

            <div className="overflow-hidden rounded-2xl border border-stone-200 shadow-sm bg-white">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-stone-100 bg-stone-50/50">
                    <th className="text-left px-6 py-4 font-bold text-stone-400 text-xs uppercase tracking-wider w-1/3">
                      Task
                    </th>
                    <th className="px-6 py-4 font-bold text-red-500 text-xs uppercase tracking-wider text-center">
                      <span className="flex items-center justify-center gap-1.5">
                        <XCircle className="h-3.5 w-3.5" aria-hidden="true" /> Without Invoicely
                      </span>
                    </th>
                    <th className="px-6 py-4 font-bold text-amber-700 text-xs uppercase tracking-wider text-center bg-amber-50/60">
                      <span className="flex items-center justify-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-amber-500" aria-hidden="true" /> With Invoicely
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonRows.map((row, i) => (
                    <tr
                      key={row.label}
                      className={`border-b border-stone-100 last:border-0 ${i % 2 === 0 ? "bg-white" : "bg-stone-50/20"
                        }`}
                    >
                      <td className="px-6 py-4 font-semibold text-[#0A0A0A] text-sm">{row.label}</td>
                      <td className="px-6 py-4 text-center text-stone-400 text-xs">{row.without}</td>
                      <td className="px-6 py-4 text-center font-bold text-emerald-700 text-xs bg-amber-50/30">
                        {row.with}
                      </td>
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
        <section className="py-24 sm:py-32 px-4 sm:px-6" style={{ backgroundColor: "#F5F4F2" }}>
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14">
              <p className="text-xs font-bold uppercase tracking-widest text-amber-500 mb-3">
                Community Love
              </p>
              <h2 className="text-4xl sm:text-5xl font-black text-[#0A0A0A] mb-4 tracking-tight">
                Loved by Freelancers &amp; Business Owners
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
              {testimonials.map((t, i) => (
                <div
                  key={t.name}
                  className={`p-7 bg-white rounded-3xl border shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between relative overflow-hidden ${i === 1 ? "md:mt-6 border-amber-200 shadow-amber-50" : "border-stone-200/80"
                    }`}
                >
                  <div
                    className="absolute top-3 right-5 select-none pointer-events-none font-serif leading-none text-stone-100"
                    style={{ fontSize: "7rem" }}
                    aria-hidden="true"
                  >
                    "
                  </div>
                  <div>
                    <div className="flex gap-0.5 mb-4" aria-label={`${t.stars} out of 5 stars`}>
                      {Array.from({ length: t.stars }).map((_, idx) => (
                        <Star key={idx} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" aria-hidden="true" />
                      ))}
                    </div>
                    <p className="text-sm text-stone-700 leading-relaxed font-medium mb-6 relative z-10">
                      "{t.quote}"
                    </p>
                  </div>
                  <div className="flex items-center gap-3 pt-4 border-t border-stone-100">
                    <div className="h-9 w-9 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-extrabold text-xs flex-shrink-0">
                      {t.initials}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#0A0A0A]">{t.name}</p>
                      <p className="text-xs text-stone-400 font-medium">{t.role}</p>
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
        <section id="pricing" className="py-24 sm:py-32 px-4 sm:px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-14">
              <p className="text-xs font-bold uppercase tracking-widest text-amber-500 mb-3">
                Transparent Pricing
              </p>
              <h2 className="text-4xl sm:text-5xl font-black text-[#0A0A0A] mb-4 tracking-tight">
                Start Free. Upgrade Anytime.
              </h2>
              <p className="text-stone-500 text-base max-w-md mx-auto leading-relaxed">
                No hidden fees. Pick the plan that fits your current workflow.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 items-stretch">
              {/* Free tier */}
              <div className="p-8 rounded-3xl bg-white border border-stone-200 shadow-sm flex flex-col justify-between hover:shadow-lg transition-all duration-300">
                <div>
                  <h3 className="text-2xl font-black text-[#0A0A0A] mb-1">{pricingTiers[0].name}</h3>
                  <p className="text-xs text-stone-400 mb-6">{pricingTiers[0].description}</p>
                  <div className="flex items-baseline gap-1.5 mb-8 flex-wrap">
                    <span className="text-5xl font-black text-[#0A0A0A]">{pricingTiers[0].price}</span>
                    <span className="text-xl font-bold text-stone-400">{pricingTiers[0].subPrice}</span>
                    <span className="text-sm font-semibold text-stone-400">{pricingTiers[0].period}</span>
                  </div>
                  <ul className="space-y-3 border-t border-stone-100 pt-6">
                    {pricingTiers[0].features.map((feat, idx) => (
                      <li key={idx} className="flex items-center text-sm font-medium text-stone-600">
                        <CheckIcon className="h-4 w-4 text-amber-400 mr-3 flex-shrink-0" aria-hidden="true" />
                        {feat}
                      </li>
                    ))}
                  </ul>
                </div>
                <button
                  onClick={() => navigate("/auth")}
                  className="w-full mt-8 py-4 rounded-2xl font-bold text-sm bg-stone-900 hover:bg-black text-white shadow-md hover:shadow-lg transition-all"
                >
                  {pricingTiers[0].cta}
                </button>
              </div>

              {/* Pro tier */}
              <div
                className="p-8 rounded-3xl flex flex-col justify-between relative overflow-hidden shadow-xl"
                style={{
                  background: "linear-gradient(145deg, #111 0%, #1e1200 55%, #0f0f0f 100%)",
                }}
              >
                <div className="absolute top-5 right-5 bg-amber-400 text-[#0A0A0A] text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-sm">
                  Most Popular
                </div>
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background:
                      "radial-gradient(ellipse 70% 40% at 50% 0%, rgba(251,191,36,0.12) 0%, transparent 70%)",
                  }}
                />

                <div className="relative z-10">
                  <h3 className="text-2xl font-black text-white mb-1">{pricingTiers[1].name}</h3>
                  <p className="text-xs text-stone-400 mb-6">{pricingTiers[1].description}</p>
                  <div className="flex items-baseline gap-1.5 mb-1 flex-wrap">
                    <span className="text-5xl font-black text-white">{pricingTiers[1].price}</span>
                    <span className="text-xl font-bold text-amber-400">{pricingTiers[1].subPrice}</span>
                    <span className="text-sm font-semibold text-stone-400">{pricingTiers[1].period}</span>
                  </div>
                  <p className="text-xs text-amber-400 font-semibold mb-8">{pricingTiers[1].yearlyNote}</p>

                  <ul className="space-y-3 border-t border-white/10 pt-6">
                    {pricingTiers[1].features.map((feat, idx) => (
                      <li key={idx} className="flex items-center text-sm font-medium text-stone-200">
                        <CheckIcon className="h-4 w-4 text-amber-400 mr-3 flex-shrink-0" aria-hidden="true" />
                        {feat}
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => navigate("/auth")}
                  className="w-full mt-8 py-4 rounded-2xl font-bold text-sm bg-amber-400 hover:bg-amber-500 text-[#0A0A0A] shadow-lg hover:shadow-xl transition-all relative z-10"
                >
                  {pricingTiers[1].cta}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════
            FAQ
        ════════════════════════════════════════ */}
        <section id="faq" className="py-24 sm:py-32 px-4 sm:px-6 bg-white border-t border-stone-100">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-14">
              <p className="text-xs font-bold uppercase tracking-widest text-amber-500 mb-3">
                Got Questions?
              </p>
              <h2 className="text-4xl sm:text-5xl font-black text-[#0A0A0A] mb-4 tracking-tight">
                Frequently Asked Questions
              </h2>
            </div>

            <div className="divide-y divide-stone-200/80">
              {faqs.map((faq, i) => (
                <FAQItem key={i} q={faq.q} a={faq.a} />
              ))}
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════
            PRE-FOOTER CTA STRIP
        ════════════════════════════════════════ */}
        <section className="py-24 px-4 sm:px-6 bg-amber-400 relative overflow-hidden">
          <div className="max-w-3xl mx-auto text-center relative z-10">
            <h2 className="text-4xl sm:text-5xl font-black text-[#0A0A0A] mb-4 tracking-tight">
              Ready to get paid faster?
            </h2>
            <p className="text-amber-900/70 text-lg mb-8 font-medium">
              Join 10,000+ freelancers and businesses who invoice smarter with Invoicely.
            </p>
            <button
              onClick={() => navigate("/auth")}
              className="inline-flex items-center gap-2 bg-[#0A0A0A] hover:bg-stone-800 text-white font-bold px-10 py-4 rounded-full text-base shadow-xl hover:shadow-2xl transition-all duration-200 group"
            >
              Get Started Free
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
            </button>
          </div>
        </section>

        {/* ════════════════════════════════════════
            FOOTER
        ════════════════════════════════════════ */}
        <footer className="py-10 text-stone-400 text-sm border-t border-stone-800" style={{ backgroundColor: "#0A0A0A" }}>
          <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2 text-xs text-stone-500 font-medium">
              <Logo href="/" size="sm" textColor="text-white" />
              <span className="ml-2">© {new Date().getFullYear()} Invoicely. All rights reserved.</span>
            </div>
            <div className="flex flex-wrap justify-center gap-6 text-xs font-semibold">
              <Link to="/how-it-works" className="hover:text-amber-400 transition-colors">
                How It Works
              </Link>
              <Link to="/terms" className="hover:text-amber-400 transition-colors">
                Terms &amp; Conditions
              </Link>
              <Link to="/privacy" className="hover:text-amber-400 transition-colors">
                Privacy Policy
              </Link>
              <Link to="/refunds" className="hover:text-amber-400 transition-colors">
                Cancellation &amp; Refunds
              </Link>
              <Link to="/contact-us" className="hover:text-amber-400 transition-colors">
                Contact Us
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default Landing;