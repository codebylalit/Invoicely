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
} from "lucide-react";
import Logo from "@/components/Logo";

// ─────────────────────────────────────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────────────────────────────────────

const pricingTiers = [
  {
    name: "Free",
    price: "₹0",
    period: "/ forever",
    description: "Get started at no cost. No credit card required.",
    badge: null,
    cta: "Get Started Free",
    ctaStyle: "bg-[#1a1a1a] hover:bg-black text-white",
    features: [
      "5 invoices per month",
      "3 professional invoice templates",
      "Manage up to 3 clients",
      "Add bank & UPI payment details",
      "Try AI invoice creation (3 uses)",
      "Invoicely-branded invoices",
    ],
  },
  {
    name: "Pro",
    price: "₹499",
    period: "/ month",
    yearlyNote: "or ₹4,999 / year — save 17%",
    description: "For freelancers, agencies & growing businesses.",
    badge: "Most Popular",
    cta: "Start Pro — ₹499/mo",
    ctaStyle: "bg-amber-400 hover:bg-amber-500 text-[#1a1a1a] font-bold",
    features: [
      "Unlimited invoices & clients",
      "All 20 premium templates",
      "100% white-label — your brand only",
      "Online payment collection",
      "Unlimited AI invoice creation",
      "Auto GST + multi-currency billing",
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

// ─────────────────────────────────────────────────────────────────────────────
// FAQ ACCORDION
// ─────────────────────────────────────────────────────────────────────────────
const FAQItem = ({ q, a }: { q: string; a: string }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-stone-200 last:border-0">
      <button
        className="w-full flex items-center justify-between py-5 text-left gap-4 group"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <span className="text-base font-semibold text-[#1a1a1a] group-hover:text-amber-600 transition-colors">
          {q}
        </span>
        <ChevronDown
          className={`h-5 w-5 text-stone-400 flex-shrink-0 transition-transform duration-200 ${open ? "rotate-180 text-amber-500" : ""}`}
        />
      </button>
      {open && (
        <div className="pb-5 text-sm text-stone-500 leading-relaxed">{a}</div>
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
      className="flex flex-col min-h-screen font-sans selection:bg-amber-300 selection:text-[#1a1a1a]"
      style={{ backgroundColor: "#F5F0E8", color: "#1a1a1a" }}
    >
      {/* ════════════════════════════════════════
          HEADER
      ════════════════════════════════════════ */}
      <div
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isHeaderVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
          }`}
        style={{ backgroundColor: "#F5F0E8" }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between border-b border-stone-200/80">
          <Logo href="/" />

          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-stone-500">
            <a href="#howitworks" className="hover:text-[#1a1a1a] transition-colors">How it works</a>
            <a href="#features" className="hover:text-[#1a1a1a] transition-colors">Features</a>
            <a href="#pricing" className="hover:text-[#1a1a1a] transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-[#1a1a1a] transition-colors">FAQ</a>
          </nav>

          <div className="flex items-center gap-2">
            <Button
              onClick={() => navigate("/auth")}
              variant="outline"
              size="sm"
              className="hidden md:flex font-semibold border-stone-300 bg-transparent hover:bg-stone-100 text-stone-600"
            >
              Sign In
            </Button>
            <Button
              onClick={() => navigate("/auth")}
              size="sm"
              className="bg-amber-400 hover:bg-amber-500 text-[#1a1a1a] font-bold px-4 shadow-sm"
            >
              Get Started Free
            </Button>
            <Button
              onClick={toggleMobileMenu}
              size="sm"
              variant="ghost"
              className="md:hidden text-[#1a1a1a] p-2"
              aria-label="Open navigation menu"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 md:hidden" onClick={toggleMobileMenu}>
          <div
            className="fixed top-0 right-0 h-full w-72 p-6 shadow-2xl flex flex-col justify-between"
            style={{ backgroundColor: "#F5F0E8" }}
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
                  <a key={item.href} href={item.href} onClick={toggleMobileMenu}
                    className="py-3 px-3 text-base font-semibold text-stone-700 hover:bg-stone-100 rounded-lg transition-colors">
                    {item.label}
                  </a>
                ))}
              </nav>
            </div>
            <Button
              onClick={() => { navigate("/auth"); toggleMobileMenu(); }}
              className="w-full bg-amber-400 hover:bg-amber-500 text-[#1a1a1a] font-bold py-6"
            >
              Get Started Free
            </Button>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════
          HERO
      ════════════════════════════════════════ */}
      <section className="pt-36 sm:pt-44 pb-16 sm:pb-24 px-4 sm:px-6 relative overflow-hidden">
        {/* Floating decorative squares */}
        <div className="absolute top-24 right-8 sm:right-20 h-12 w-12 sm:h-16 sm:w-16 rounded-2xl bg-amber-400 rotate-12 opacity-80 pointer-events-none" aria-hidden="true" />
        <div className="absolute bottom-10 left-6 sm:left-16 h-8 w-8 sm:h-12 sm:w-12 rounded-xl bg-amber-400 -rotate-12 opacity-50 pointer-events-none" aria-hidden="true" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          {/* SaaS pill badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-stone-200 text-stone-600 text-xs font-semibold mb-8 shadow-sm">
            <Sparkles className="h-3.5 w-3.5 text-amber-500" aria-hidden="true" />
            <span>Trusted by freelancers &amp; businesses across the globe 🌍</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1.08] mb-6 text-[#1a1a1a]">
            Create Professional Invoices in{" "}
            <span className="underline decoration-amber-400 decoration-wavy underline-offset-8">
              30 Seconds
            </span>{" "}
            <br className="hidden sm:block" />
            — and Actually Get Paid.
          </h1>

          {/* Sub-headline */}
          <p className="text-stone-500 text-lg sm:text-xl max-w-xl mx-auto mb-10 leading-relaxed">
            Stop wasting time on manual invoices. Create, send, and track professional invoices with AI, online payments, and beautiful templates—all in minutes.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              onClick={() => navigate("/auth")}
              size="lg"
              className="w-full sm:w-auto bg-amber-400 hover:bg-amber-500 text-[#1a1a1a] font-bold px-10 py-6 text-base rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
            >
              Get Started Free <ArrowRight className="h-5 w-5 ml-2" aria-hidden="true" />
            </Button>
            <a href="#howitworks" className="w-full sm:w-auto">
              <Button
                variant="outline"
                size="lg"
                className="w-full font-semibold px-7 py-6 text-base rounded-xl border-stone-300 bg-transparent hover:bg-stone-100 text-stone-600"
              >
                See How It Works
              </Button>
            </a>
          </div>

          {/* Micro trust badges */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-5 text-xs font-medium text-stone-500">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-amber-500" aria-hidden="true" />
              No credit card required
            </span>
            <span className="flex items-center gap-1.5">
              <CheckIcon className="h-4 w-4 text-amber-500" aria-hidden="true" />
              GST &amp; multi-currency ready
            </span>
            <span className="flex items-center gap-1.5">
              <Globe className="h-4 w-4 text-amber-500" aria-hidden="true" />
              Instant PDF download
            </span>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          VIDEO PREVIEW
      ════════════════════════════════════════ */}
      <section className="pb-4 px-4 sm:px-6 max-w-5xl mx-auto w-full">
        <div className="rounded-2xl overflow-hidden shadow-2xl border border-stone-200/60">
          {/* Browser chrome */}
          <div className="flex items-center gap-2 px-4 py-3 bg-white border-b border-stone-100">
            <div className="flex gap-1.5">
              <span className="h-3 w-3 rounded-full bg-red-400" aria-hidden="true" />
              <span className="h-3 w-3 rounded-full bg-amber-400" aria-hidden="true" />
              <span className="h-3 w-3 rounded-full bg-green-400" aria-hidden="true" />
            </div>
            <div className="flex-1 mx-3 bg-stone-100 rounded px-3 py-1 text-xs text-stone-400 text-center font-mono">
              app.invoicely.me/dashboard
            </div>
          </div>
          <div className="aspect-video">
            <video className="w-full h-full object-cover" autoPlay muted loop playsInline poster="/video-poster.jpg">
              <source src="/invoicely preview.mp4" type="video/mp4" />
            </video>
          </div>
        </div>
        <p className="text-center text-sm text-stone-400 mt-4 font-medium">
          Your entire invoicing workflow — in one beautiful dashboard
        </p>
      </section>

      {/* ════════════════════════════════════════
          WHO IT'S FOR
      ════════════════════════════════════════ */}
      <section className="py-12 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-5">Made for</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {["Freelancers", "Agencies", "Consultants", "Creators", "Startups", "Small Businesses"].map((who) => (
              <span
                key={who}
                className="px-4 py-2 rounded-full bg-white border border-stone-200 text-stone-600 text-sm font-semibold shadow-sm hover:border-amber-400 hover:text-amber-700 transition-colors cursor-default"
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
      <section id="howitworks" className="py-20 sm:py-28 px-4 sm:px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-bold uppercase tracking-widest text-amber-500 mb-3">Simple by design</p>
            <h2 className="text-4xl sm:text-5xl font-black text-[#1a1a1a] mb-4">
              From idea to paid — in under a minute
            </h2>
            <p className="text-stone-500 text-base max-w-md mx-auto">
              No training. No complicated setup. Just describe your work and get paid.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                num: "1",
                title: "Describe Your Work",
                desc: "Type what you did, or let AI generate the invoice from a short prompt. Items, rates, and GST are added automatically.",
              },
              {
                num: "2",
                title: "Pick a Template",
                desc: "Choose from 20 professionally designed invoice styles. Preview instantly. Switch in one click.",
              },
              {
                num: "3",
                title: "Share & Get Paid",
                desc: "Send a payment link. Your client pays online via UPI or card. You're notified the moment payment lands.",
              },
            ].map((step) => (
              <div
                key={step.num}
                className="p-7 bg-white rounded-2xl border border-stone-100 shadow-md hover:shadow-lg transition-shadow flex flex-col"
              >
                <div className="h-11 w-11 rounded-xl bg-amber-400 text-[#1a1a1a] font-black text-lg flex items-center justify-center mb-5 flex-shrink-0">
                  {step.num}
                </div>
                <h3 className="text-lg font-bold text-[#1a1a1a] mb-2">{step.title}</h3>
                <p className="text-sm text-stone-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Button
              onClick={() => navigate("/auth")}
              className="bg-amber-400 hover:bg-amber-500 text-[#1a1a1a] font-bold px-9 py-5 rounded-xl text-sm shadow-md hover:shadow-lg transition-all"
            >
              Try It Free <ArrowRight className="h-4 w-4 ml-2 inline" aria-hidden="true" />
            </Button>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          FEATURES
      ════════════════════════════════════════ */}
      <section id="features" className="py-20 sm:py-28 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-bold uppercase tracking-widest text-amber-500 mb-3">Why Invoicely</p>
            <h2 className="text-4xl sm:text-5xl font-black text-[#1a1a1a] mb-4">
              Built to save you 10+ hours a month
            </h2>
            <p className="text-stone-500 text-base max-w-lg mx-auto">
              Every feature is designed around one goal — less admin, more revenue.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f) => (
              <div
                key={f.title}
                className="p-7 bg-white rounded-2xl border border-stone-100 shadow-md hover:shadow-lg transition-shadow group"
              >
                <f.icon className="h-7 w-7 text-amber-400 mb-5 group-hover:scale-110 transition-transform" aria-hidden="true" />
                <h3 className="text-base font-bold text-[#1a1a1a] mb-2">{f.title}</h3>
                <p className="text-sm text-stone-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          COMPARISON TABLE
      ════════════════════════════════════════ */}
      <section className="py-20 sm:py-28 px-4 sm:px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-bold uppercase tracking-widest text-amber-500 mb-3">The difference</p>
            <h2 className="text-4xl sm:text-5xl font-black text-[#1a1a1a] mb-4">
              Why switch from spreadsheets?
            </h2>
            <p className="text-stone-500 text-base max-w-md mx-auto">
              See what you're leaving on the table every time you invoice manually.
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-stone-200 shadow-md">
            <table className="w-full bg-white text-sm">
              <thead>
                <tr className="border-b border-stone-100">
                  <th className="text-left px-6 py-4 font-bold text-stone-400 text-xs uppercase tracking-wider w-1/3">Task</th>
                  <th className="px-6 py-4 font-bold text-stone-400 text-xs uppercase tracking-wider text-center">
                    <span className="flex items-center justify-center gap-2">
                      <XCircle className="h-4 w-4 text-red-400" aria-hidden="true" /> Without Invoicely
                    </span>
                  </th>
                  <th className="px-6 py-4 font-bold text-amber-600 text-xs uppercase tracking-wider text-center bg-amber-50/60">
                    <span className="flex items-center justify-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-amber-500" aria-hidden="true" /> With Invoicely
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row, i) => (
                  <tr key={row.label} className={i % 2 === 0 ? "bg-white" : "bg-stone-50/40"}>
                    <td className="px-6 py-4 font-semibold text-[#1a1a1a]">{row.label}</td>
                    <td className="px-6 py-4 text-center text-stone-500">{row.without}</td>
                    <td className="px-6 py-4 text-center font-semibold text-emerald-700 bg-amber-50/30">{row.with}</td>
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
            <p className="text-xs font-bold uppercase tracking-widest text-amber-500 mb-3">What people say</p>
            <h2 className="text-4xl sm:text-5xl font-black text-[#1a1a1a] mb-4">
              Freelancers &amp; businesses love Invoicely
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="p-7 bg-white rounded-2xl border border-stone-100 shadow-md hover:shadow-lg transition-shadow flex flex-col gap-4"
              >
                <div className="flex gap-0.5" aria-label={`${t.stars} out of 5 stars`}>
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" aria-hidden="true" />
                  ))}
                </div>
                <p className="text-sm text-stone-600 leading-relaxed flex-1">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs flex-shrink-0">
                    {t.initials}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#1a1a1a]">{t.name}</p>
                    <p className="text-xs text-stone-400">{t.role}</p>
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
      <section id="pricing" className="py-20 sm:py-28 px-4 sm:px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-bold uppercase tracking-widest text-amber-500 mb-3">Pricing</p>
            <h2 className="text-4xl sm:text-5xl font-black text-[#1a1a1a] mb-4">Simple Pricing. Start Free.</h2>
            <p className="text-stone-500 text-base max-w-md mx-auto">
              Use it free forever. Upgrade when your business grows.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 items-stretch">
            {pricingTiers.map((tier) => (
              <div
                key={tier.name}
                className={`p-8 rounded-2xl bg-white flex flex-col justify-between shadow-md hover:shadow-lg transition-shadow relative border ${tier.badge ? "border-2 border-amber-400" : "border-stone-100"
                  }`}
              >
                {tier.badge && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-amber-400 text-[#1a1a1a] text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full whitespace-nowrap">
                    {tier.badge}
                  </span>
                )}
                <div>
                  <h3 className="text-2xl font-black text-[#1a1a1a] mb-1">{tier.name}</h3>
                  <p className="text-xs text-stone-400 mb-5">{tier.description}</p>
                  <div className="mb-1">
                    <span className="text-5xl font-black text-[#1a1a1a]">{tier.price}</span>
                    <span className="text-sm font-semibold text-stone-400 ml-1">{tier.period}</span>
                  </div>
                  {tier.yearlyNote && (
                    <p className="text-xs text-emerald-600 font-semibold mb-6">{tier.yearlyNote}</p>
                  )}
                  {!tier.yearlyNote && <div className="mb-6" />}
                  <ul className="space-y-3">
                    {tier.features.map((feat, idx) => (
                      <li key={idx} className="flex items-center text-sm text-stone-600">
                        <CheckIcon className="h-4 w-4 text-amber-400 mr-2.5 flex-shrink-0" aria-hidden="true" />
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

          <p className="text-center text-xs text-stone-400 mt-6">
            All plans include PDF export, GST support, and bank / UPI payment details. No hidden fees.
          </p>
        </div>
      </section>

      {/* ════════════════════════════════════════
          FAQ
      ════════════════════════════════════════ */}
      <section id="faq" className="py-20 sm:py-28 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-bold uppercase tracking-widest text-amber-500 mb-3">FAQ</p>
            <h2 className="text-4xl sm:text-5xl font-black text-[#1a1a1a] mb-4">Questions? We've got answers.</h2>
          </div>
          <div className="bg-white rounded-2xl border border-stone-100 shadow-md px-6">
            {faqs.map((faq) => (
              <FAQItem key={faq.q} q={faq.q} a={faq.a} />
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          FOOTER
      ════════════════════════════════════════ */}
      <footer className="py-8 bg-[#1a1a1a] text-stone-500 text-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 text-xs text-stone-500">
            <span>Made with</span>
            <span className="text-amber-400">🧡</span>
            <span>© {new Date().getFullYear()} Invoicely. All rights reserved.</span>
          </div>
          <div className="flex flex-wrap justify-center gap-6 text-xs font-medium">
            <Link to="/terms" className="hover:text-white transition-colors">Terms &amp; conditions</Link>
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy policy</Link>
            <Link to="/refunds" className="hover:text-white transition-colors">Cancellation &amp; Refunds</Link>
            <Link to="/contact-us" className="hover:text-white transition-colors">Contact Us</Link>
          </div>
        </div>
      </footer>
    </div >
  );
};

export default Landing;