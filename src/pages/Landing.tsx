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
  "description": "Free online invoice generator for freelancers and small businesses. Create professional invoices, email them with the PDF attached, and get paid through your own payment link.",
  "offers": [
    {
      "@type": "Offer",
      "name": "Free Plan",
      "price": "0",
      "priceCurrency": "USD",
      "description": "Up to 5 invoices per month, 10 clients, 3 professional templates"
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
    "20 professional invoice templates",
    "Direct 1-click email delivery with PDF attachment",
    "Tax and discount line items",
    "PDF export",
    "Shareable pay page with your own payment link (Stripe, PayPal, Razorpay, UPI, and more)",
    "Client management",
    "Recurring invoice setup",
    "Automatic payment reminders (Pro)"
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
    description: "Everything you need to get started.",
    badge: null,
    cta: "Start Free",
    features: [
      "5 invoices / month",
      "10 clients",
      "5 invoice emails / month",
      "3 professional invoice templates",
      "Tax & discount line items with custom rates",
      "Your own payment link (Stripe, PayPal, UPI, any provider)",
      "Shareable invoice page",
      "Basic PDF invoices",
      "Invoicely branding",
    ],
  },
  {
    name: "Pro",
    price: "$6",
    subPrice: "(~₹499)",
    period: "/ month",
    yearlyNote: "or $59 / year (~₹4,999) — save 17%",
    description: "For freelancers, agencies & growing businesses.",
    badge: "Most Popular",
    cta: "Start Pro — $6/mo",
    features: [
      "Everything in Free",
      "Unlimited invoices",
      "Unlimited clients",
      "Unlimited invoice emails",
      "All 20 premium templates",
      "Remove Invoicely branding",
      "Custom invoice branding",
      "Recurring invoices",
      "Automatic payment reminders",
      "Payment / status tracking",
      "Custom email message / signature",
      "Priority support",
    ],
  },
];

const faqs = [
  {
    q: "Can I use Invoicely for free forever?",
    a: "Yes. The Free plan is available indefinitely and includes up to 5 invoices per month, 10 clients, 5 invoice emails per month, and 3 professional templates.",
  },
  {
    q: "What happens when I reach my Free plan limit?",
    a: "You can upgrade to Pro for unlimited invoices, clients, and invoice emails. Your existing invoices and clients remain available.",
  },
  {
    q: "Can I send invoices directly to clients?",
    a: "Yes. Invoicely can send the invoice directly to your client's email with the PDF attached, a custom message, and a direct payment link — in one click.",
  },
  {
    q: "Can my clients pay online?",
    a: "Yes. Each invoice has a shareable live page where your client can click Pay Online and complete payment via your own Stripe, PayPal, Razorpay, UPI, or any provider you use. Works globally.",
  },
  {
    q: "What are automatic payment reminders?",
    a: "Pro can automatically remind clients about upcoming and overdue invoices, helping you follow up without manually tracking every payment.",
  },
  {
    q: "Can I remove Invoicely branding?",
    a: "Yes. Pro removes Invoicely branding from your invoices, PDFs, payment pages, and invoice emails. They carry your logo and business details only.",
  },
  {
    q: "Can I use Invoicely for GST invoices?",
    a: "Yes. You can add GST and other taxes using customizable tax rates. Your GSTIN and business details print on the invoice from your settings.",
  },
  {
    q: "Can I download invoices as PDF?",
    a: "Yes. Every invoice exports as a print-ready, high-resolution PDF in one click.",
  },
  {
    q: "Can I cancel Pro?",
    a: "Yes. You can cancel your Pro subscription anytime and continue using the Free plan.",
  },
];

// Core unique features for Dark Bento Grid
const features = [
  {
    icon: Mail,
    title: "1-Click Direct Email Delivery",
    desc: "Send invoices straight to your client's inbox with a custom message, attached PDF, and payment link.",
    proBadge: false,
  },
  {
    icon: ZapIcon,
    title: "Invoice in Under a Minute",
    desc: "Saved clients, saved business details, automatic invoice numbering, and instant tax and discount calculations.",
    proBadge: false,
  },
  {
    icon: Palette,
    title: "Professional Invoice Templates",
    desc: "Start with 3 professional templates on Free. Upgrade to Pro for all 20 premium designs, custom branding, and more.",
    proBadge: false,
  },
  {
    icon: CreditCard,
    title: "Global Payment Links",
    desc: "Add your own Stripe, PayPal, Razorpay, UPI, or any payment link. Clients click Pay Online — money goes straight to your account.",
    proBadge: false,
  },
  {
    icon: BellRing,
    title: "Automatic Payment Reminders",
    desc: "Stop chasing unpaid invoices. Pro can automatically remind clients about upcoming and overdue payments.",
    proBadge: true,
  },
  {
    icon: TrendingUp,
    title: "Know Who Owes You",
    desc: "See unpaid and overdue invoices in one place, including how much is owed and how late each payment is.",
    proBadge: false,
  },
];

const steps = [
  {
    num: "01",
    title: "Add Your Line Items",
    desc: "Pick a saved client, add what you did, and set your rates. Taxes, discounts and totals calculate automatically.",
    icon: Sparkles,
  },
  {
    num: "02",
    title: "Choose a Template",
    desc: "Choose from 3 free templates or unlock all 20 professional designs with Pro. Add your logo and brand details.",
    icon: Palette,
  },
  {
    num: "03",
    title: "Send the Invoice",
    desc: "Send directly to your client's inbox with the PDF attached and your custom message.",
    icon: Mail,
  },
  {
    num: "04",
    title: "Get Paid & Follow Up",
    desc: "Give clients a simple payment page with your own payment link. Pro can automatically remind clients about upcoming and overdue invoices.",
    icon: Send,
  },
];

const comparisonRows = [
  { label: "Invoice creation time", without: "20–30 minutes", with: "Under 30 seconds" },
  { label: "Email sending", without: "Manual export & attachment", with: "1-click email + PDF attached" },
  { label: "Tax & discount maths", without: "Manual and error-prone", with: "Automatic calculations" },
  { label: "Payment collection", without: "Manual follow-ups", with: "Direct payment links + payment tracking" },
  { label: "Payment follow-up", without: "Remembering when to chase clients", with: "Automatic reminders with Pro" },
  { label: "Invoice design", without: "Inconsistent formatting", with: "Professional templates" },
  { label: "Knowing who owes you", without: "Searching through emails and spreadsheets", with: "One list of unpaid & overdue invoices" },
  { label: "PDF export", without: "Manual formatting", with: "One-click PDF generation" },
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
        title="Invoicely — Create Invoices, Get Paid, Stop Chasing"
        description="Create professional invoices in seconds, send them directly to clients with the PDF attached, and let Invoicely help you stay on top of payments. Free to start."
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
                Start Free
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
                Start Free
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
            {/* Pill badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-stone-200 shadow-sm text-xs font-semibold text-stone-600 mb-8 animate-fade-up">
              <Sparkles className="h-3 w-3 text-amber-500" aria-hidden="true" />
              <span>Free to start · No credit card · Upgrade anytime</span>
            </div>

            {/* Headline */}
            <h1
              className="font-black tracking-tight leading-[1.02] mb-6"
              style={{
                fontSize: "clamp(2.6rem, 7vw, 5.5rem)",
                fontFamily: "'Plus Jakarta Sans', 'Poppins', sans-serif",
              }}
            >
              Create Invoices.{" "}
              <span className="italic" style={{ color: "#F59E0B" }}>
                Get Paid.
              </span>
              <br className="hidden sm:block" />
              <span style={{ color: "#0A0A0A" }}>Stop Chasing.</span>
            </h1>

            {/* Sub-headline */}
            <p className="text-stone-500 text-lg sm:text-xl max-w-xl mx-auto mb-10 leading-relaxed font-normal">
              Create professional invoices in seconds, send them directly to clients, and let Invoicely help you stay on top of payments.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-7">
              <button
                id="hero-cta-primary"
                onClick={() => navigate("/auth")}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#0A0A0A] hover:bg-stone-700 text-white font-bold px-8 py-4 text-base rounded-full shadow-xl hover:shadow-2xl transition-all duration-200 group"
              >
                Start Free
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
                GST ready · Direct email &amp; PDF
              </span>
              <span className="text-stone-300" aria-hidden="true">·</span>
              <span className="flex items-center gap-1.5">
                <CheckIcon className="h-3.5 w-3.5 text-amber-500" aria-hidden="true" />
                Your own payment links
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
            HOW IT WORKS — 4 CORE STEPS
        ════════════════════════════════════════ */}
        <section id="howitworks" className="py-20 sm:py-28 px-4 sm:px-6">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <p className="text-xs font-bold uppercase tracking-widest text-amber-500 mb-3">
                Simple &amp; Complete Workflow
              </p>
              <h2 className="text-4xl sm:text-5xl font-black text-[#0A0A0A] mb-4 tracking-tight">
                From Invoice to Paid in 4 Simple Steps
              </h2>
              <p className="text-stone-500 text-base max-w-md mx-auto leading-relaxed">
                Create, send, collect and follow up — without spreadsheets or manual chasing.
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

                  </div>
                );
              })}
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
                Everything you need to create professional invoices, collect payments, and stay on top of what you're owed.
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

              {/* Remaining features */}
              {features.slice(1).map((f) => (
                <div
                  key={f.title}
                  className="p-6 rounded-3xl border border-white/8 flex flex-col group hover:border-amber-400/30 transition-all duration-300"
                  style={{ backgroundColor: "rgba(255,255,255,0.04)" }}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-10 w-10 rounded-xl bg-amber-400/20 text-amber-400 flex items-center justify-center group-hover:bg-amber-400 group-hover:text-[#0A0A0A] transition-all duration-300 flex-shrink-0">
                      <f.icon className="h-5 w-5" aria-hidden="true" />
                    </div>
                    {f.proBadge && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-400 text-[#0A0A0A]">
                        PRO
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">{f.title}</h3>
                  <p className="text-sm text-stone-400 leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════
            PAYMENT REMINDERS SECTION
        ════════════════════════════════════════ */}
        <section className="py-24 sm:py-32 px-4 sm:px-6 bg-white border-t border-stone-100">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Left — copy */}
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 border border-amber-200 text-xs font-black uppercase tracking-wider text-amber-700 mb-6">
                  <BellRing className="h-3.5 w-3.5" />
                  Pro Feature
                </div>
                <h2 className="text-4xl sm:text-5xl font-black text-[#0A0A0A] mb-4 tracking-tight leading-[1.05]">
                  Stop chasing<br />unpaid invoices.
                </h2>
                <p className="text-stone-500 text-lg mb-4 leading-relaxed">
                  Your invoice goes out. Invoicely helps handle the follow-up.
                </p>
                <p className="text-stone-500 text-base mb-6 leading-relaxed">
                  With Pro, you can automatically remind clients about upcoming and overdue invoices, so you don't have to remember who needs a follow-up.
                </p>
                <p className="text-stone-600 text-sm font-semibold italic mb-8">
                  "Spend less time asking 'Did you get my invoice?' and more time doing the work you get paid for."
                </p>
                <button
                  onClick={() => navigate("/auth")}
                  className="inline-flex items-center gap-2 bg-[#0A0A0A] hover:bg-stone-800 text-white font-bold px-7 py-3.5 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 group"
                >
                  Start Pro — $6/mo
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>

              {/* Right — reminder timeline visual */}
              <div className="relative">
                <div className="bg-[#0A0A0A] rounded-3xl p-8 shadow-2xl border border-white/5">
                  <p className="text-xs font-bold uppercase tracking-widest text-stone-500 mb-6">
                    Automatic reminder flow
                  </p>
                  <div className="space-y-0">
                    {[
                      {
                        icon: Send,
                        label: "Invoice Sent",
                        sub: "Client receives invoice with payment link",
                        color: "text-emerald-400",
                        bg: "bg-emerald-400/15",
                        border: "border-emerald-400/30",
                      },
                      {
                        icon: BellRing,
                        label: "3 Days Before Due",
                        sub: "Automatic reminder scheduled",
                        color: "text-amber-400",
                        bg: "bg-amber-400/15",
                        border: "border-amber-400/30",
                      },
                      {
                        icon: Clock,
                        label: "Due Date",
                        sub: "Payment due — client notified",
                        color: "text-amber-500",
                        bg: "bg-amber-500/15",
                        border: "border-amber-500/30",
                      },
                      {
                        icon: BellRing,
                        label: "Overdue",
                        sub: "Automatic follow-up reminder",
                        color: "text-rose-400",
                        bg: "bg-rose-400/15",
                        border: "border-rose-400/30",
                      },
                      {
                        icon: CheckCircle2,
                        label: "Paid",
                        sub: "Reminders stop automatically",
                        color: "text-emerald-400",
                        bg: "bg-emerald-400/15",
                        border: "border-emerald-400/30",
                      },
                    ].map((item, i, arr) => {
                      const Icon = item.icon;
                      return (
                        <div key={item.label} className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <div className={`h-10 w-10 rounded-xl ${item.bg} border ${item.border} flex items-center justify-center flex-shrink-0`}>
                              <Icon className={`h-4 w-4 ${item.color}`} />
                            </div>
                            {i < arr.length - 1 && (
                              <div className="w-px flex-1 bg-white/10 my-1.5" style={{ minHeight: "20px" }} />
                            )}
                          </div>
                          <div className="pb-5">
                            <p className={`text-sm font-bold ${item.color}`}>{item.label}</p>
                            <p className="text-xs text-stone-500 mt-0.5">{item.sub}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                {/* Glow */}
                <div
                  className="absolute -inset-4 -z-10 rounded-3xl opacity-20 blur-2xl"
                  style={{ background: "radial-gradient(ellipse at center, rgba(251,191,36,0.4) 0%, transparent 70%)" }}
                />
              </div>
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

        {/* There was a testimonials section here with three invented customers
            and five-star ratings. Put it back the day there are real quotes
            from real users, with their permission. Not before. */}

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
                Start Free. Upgrade When You Need More.
              </h2>
              <p className="text-stone-500 text-base max-w-md mx-auto leading-relaxed">
                Simple pricing for freelancers and small businesses. No hidden fees.
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

            {/* Pricing microcopy */}
            <p className="text-center text-xs text-stone-400 mt-6 font-medium">
              Free for occasional invoicing. Pro for unlimited invoicing, automation, and professional branding.
            </p>
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
              Ready to stop chasing payments?
            </h2>
            <p className="text-amber-900/70 text-lg mb-8 font-medium">
              Create your first invoice for free. Upgrade when you need unlimited invoicing and automation.
            </p>
            <button
              onClick={() => navigate("/auth")}
              className="inline-flex items-center gap-2 bg-[#0A0A0A] hover:bg-stone-800 text-white font-bold px-10 py-4 rounded-full text-base shadow-xl hover:shadow-2xl transition-all duration-200 group"
            >
              Start Free
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
            </button>
            <p className="mt-4 text-xs font-semibold text-amber-900/60">
              Free to start · No credit card required
            </p>
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