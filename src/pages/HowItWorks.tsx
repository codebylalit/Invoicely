import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Sparkles,
  Zap,
  Palette,
  Send,
  CheckCircle2,
  ArrowRight,
  Code,
  Briefcase,
  Store,
  Stethoscope,
  Clock,
  ShieldCheck,
  FileText,
  CreditCard,
  Building2,
  DollarSign,
  Layers,
  Mail,
  RefreshCw,
  Download,
  BellRing,
  Globe2,
} from "lucide-react";
import SEOHead from "@/components/SEOHead";
import PublicPageLayout from "@/components/PublicPageLayout";

// ── Real-World Use Case Data ──────────────────────────────────────────────────
const useCases = [
  {
    id: "freelancer",
    label: "Freelancers & Creators",
    icon: Code,
    color: "bg-blue-50 text-blue-600 border-blue-200",
    activeTab: "bg-blue-600 text-white",
    headline: "Go from project completion to cash in bank in under 60 seconds",
    description:
      "Stop wasting unpaid hours constructing spreadsheets. Freelancers use Invoicely to email PDF invoices directly to clients, request upfront deposits, and attach direct payment links for 3x faster payment.",
    keyBenefits: [
      "Send PDF invoice directly to client's email inbox in 1 click",
      "Request 50% upfront deposits automatically",
      "Share direct UPI, Razorpay & Card payment links",
      "Export print-ready PDF invoices for offline accounting",
    ],
    example: {
      client: "Acme Studios Inc.",
      type: "Web Development & UI Redesign",
      deliveryMethod: "Emailed directly with PDF attached",
      items: [
        { desc: "React Frontend Development (40 hrs)", rate: "$50/hr", total: "$2,000.00" },
        { desc: "UI/UX Design Systems & Figma File", rate: "Fixed", total: "$800.00" },
      ],
      tax: "0% (International Export)",
      totalDue: "$2,800.00",
      paymentTerm: "Net 7 · Direct Email + Payment Link Attached",
    },
  },
  {
    id: "agency",
    label: "Agencies & Consultants",
    icon: Briefcase,
    color: "bg-amber-50 text-amber-600 border-amber-200",
    activeTab: "bg-amber-500 text-slate-950 font-bold",
    headline: "White-label billing, direct email delivery & recurring retainer schedules",
    description:
      "Maintain a 100% professional enterprise image. Agency owners use Invoicely to send unbranded white-label invoices straight to client inboxes, set automated recurring monthly bills, and trigger auto payment reminders.",
    keyBenefits: [
      "1-Click direct email sending with custom subject & message",
      "Automated background recurring invoice generation for retainers",
      "Remove all Invoicely branding (100% White-Label)",
      "Automated email payment reminders before & after due dates",
    ],
    example: {
      client: "Nexus Global Marketing",
      type: "Monthly Digital Strategy Retainer",
      deliveryMethod: "Auto-generated recurring email with PDF",
      items: [
        { desc: "Monthly Performance Marketing & SEO Retainer", rate: "$1,500/mo", total: "$1,500.00" },
        { desc: "Ad Creative Production & Copywriting", rate: "4 Units", total: "$600.00" },
      ],
      tax: "Standard State Tax (8%)",
      totalDue: "$2,268.00",
      paymentTerm: "Recurring Monthly · Auto Payment Reminders On",
    },
  },
  {
    id: "retail",
    label: "Local Business & GST Sellers",
    icon: Store,
    color: "bg-emerald-50 text-emerald-600 border-emerald-200",
    activeTab: "bg-emerald-600 text-white",
    headline: "Automatic CGST, SGST & IGST tax calculation with instant PDF & email send",
    description:
      "Comply with tax authorities without doing manual math. Local business owners enter their GSTIN and items; Invoicely automatically splits CGST/SGST or IGST based on state codes and emails the GST Tax Invoice.",
    keyBenefits: [
      "Automatic CGST, SGST, and IGST rate splitting",
      "Mandatory GSTIN and HSN/SAC code support",
      "Email GST invoice PDF straight to customer inbox",
      "Instant print-ready PDF export for physical billing counters",
    ],
    example: {
      client: "Sharma Enterprises (GSTIN: 07AAAAA0000A1Z5)",
      type: "B2B Office Supplies Order",
      deliveryMethod: "Direct Email PDF + Counter Print Ready",
      items: [
        { desc: "Ergonomic Mesh Office Chairs (HSN: 9401)", rate: "₹8,000 × 5", total: "₹40,000.00" },
        { desc: "CGST (9%) + SGST (9%)", rate: "18%", total: "₹7,200.00" },
      ],
      tax: "CGST 9% (₹3,600) + SGST 9% (₹3,600)",
      totalDue: "₹47,200.00",
      paymentTerm: "Net 30 · Bank Transfer / UPI / Razorpay",
    },
  },
  {
    id: "healthcare",
    label: "Professional & Healthcare",
    icon: Stethoscope,
    color: "bg-purple-50 text-purple-600 border-purple-200",
    activeTab: "bg-purple-600 text-white",
    headline: "Clean, confidential patient & consultation billing statements via secure email",
    description:
      "Doctors, therapists, tutors, and specialized service providers use Invoicely to issue itemized billing summaries that are emailed securely with attached PDFs for insurance or expense claims.",
    keyBenefits: [
      "Direct secure email delivery to patient/client inbox",
      "Itemized diagnostic or session code billing",
      "Clean, dignified PDF layouts suitable for insurance claims",
      "Secure cloud database storage with row-level security",
    ],
    example: {
      client: "Patient Account #4092",
      type: "Specialist Consultation & Telehealth",
      deliveryMethod: "Secure Direct Email with Claim PDF",
      items: [
        { desc: "Comprehensive Health Evaluation Session", rate: "1 Session", total: "$250.00" },
        { desc: "Diagnostic Report & Follow-up Plan", rate: "Standard", total: "$100.00" },
      ],
      tax: "Exempt / Tax Included",
      totalDue: "$350.00",
      paymentTerm: "Due Upon Receipt · Live Checkout Link Included",
    },
  },
];

// ── How It Works Detailed Steps (4 Core Pillars) ──────────────────────────────
const detailedSteps = [
  {
    num: "01",
    badge: "INPUT & AI GENERATION",
    title: "Describe Your Work (or let AI draft it)",
    shortDesc: "Type what you did in plain English, or pick items from your saved catalog.",
    longDesc:
      "No more starting at a blank spreadsheet. Simply type a quick description like 'Website redesign for Acme Corp, 20 hours at $60/hr plus 18% GST' — Invoicely's AI extracts line items, quantities, rates, tax splits, and totals in seconds.",
    bullets: [
      "Natural language AI prompt generator",
      "Manual line-item entry with custom item discounts",
      "Auto-calculate GST (CGST, SGST, IGST) or sales tax",
      "Multi-currency support (USD, EUR, GBP, INR, AUD)",
    ],
    icon: Sparkles,
  },
  {
    num: "02",
    badge: "DESIGN & CUSTOMIZATION",
    title: "Pick from 20 Templates & Add Logo",
    shortDesc: "Select a design that matches your brand personality and preview instant PDF output.",
    longDesc:
      "Your invoice is a reflection of your business. Pick from 20 professionally crafted invoice templates — ranging from ultra-minimalist freelancer styles to corporate enterprise layouts. Upload your company logo, pick custom accent colors, and preview print-ready PDFs.",
    bullets: [
      "20 designer-crafted invoice templates",
      "Upload your company logo & custom accent colors",
      "100% White-Label — remove Invoicely watermark (Pro)",
      "Instant A4 / US Letter PDF preview",
    ],
    icon: Palette,
  },
  {
    num: "03",
    badge: "DIRECT EMAIL & PDF EXPORT",
    title: "Send via Direct Email or Export PDF",
    shortDesc: "Deliver invoices straight to your client's inbox with attached PDF in 1 click.",
    longDesc:
      "Skip downloading files and opening email clients. Click 'Send Email' inside Invoicely, customize your message, and your client receives an official email with the invoice PDF attached alongside a direct online payment link.",
    bullets: [
      "1-Click direct email sending to client inbox",
      "Print-ready PDF attached directly to the email",
      "Customizable email subject and body message",
      "Download high-resolution PDF for manual archiving",
    ],
    icon: Mail,
  },
  {
    num: "04",
    badge: "COLLECTION & AUTOMATION",
    title: "Live Payment Links & Auto Reminders",
    shortDesc: "Clients pay via Razorpay, UPI, Card, or PayPal. Invoicely tracks everything.",
    longDesc:
      "Each invoice includes a live payment link where clients can checkout instantly using Razorpay (UPI, Netbanking, Cards) or PayPal. Set automated background reminders for upcoming or overdue invoices, or schedule recurring billing.",
    bullets: [
      "Live payment links (UPI, Razorpay, Cards, PayPal)",
      "Automated email reminders before & after due dates",
      "Auto-recurring invoices for retainer clients",
      "Real-time payment status tracking (Sent, Paid, Overdue)",
    ],
    icon: Send,
  },
];

// ── Unique Codebase Features Grid ─────────────────────────────────────────────
const uniqueFeatures = [
  {
    icon: Mail,
    title: "Direct Email Delivery with PDF Attachment",
    desc: "Send invoices straight to your client's email address from Invoicely with the high-res PDF attached and an embedded payment link.",
  },
  {
    icon: CreditCard,
    title: "Dual Payment Gateways (Razorpay & PayPal)",
    desc: "Accept local Indian payments via UPI, Debit/Credit Cards & Netbanking with Razorpay, or bill global clients seamlessly via PayPal.",
  },
  {
    icon: RefreshCw,
    title: "Automated Recurring Invoices",
    desc: "Set up background recurring billing schedules for retainer clients. Invoicely automatically generates and dispatches invoices on time.",
  },
  {
    icon: BellRing,
    title: "Smart Email Payment Reminders",
    desc: "Automated email notifications go out to clients before due dates and after invoices become overdue — so you get paid without awkward follow-ups.",
  },
  {
    icon: Sparkles,
    title: "AI Prompt Invoice Generator",
    desc: "Type what work you completed in natural English text. Our AI extracts line items, quantities, hourly rates, and tax calculations instantly.",
  },
  {
    icon: Globe2,
    title: "Multi-Currency & Automatic Tax Calculations",
    desc: "Bill clients in USD, EUR, GBP, or INR with automatic CGST, SGST, and IGST tax splitting for Indian businesses and VAT for global clients.",
  },
];

const HowItWorksContent = () => {
  const [selectedUseCase, setSelectedUseCase] = useState("freelancer");
  const navigate = useNavigate();

  const activeCase = useCases.find((c) => c.id === selectedUseCase) || useCases[0];

  return (
    <div className="space-y-24">
      {/* ── SECTION 1: HERO & 4-STEP PROCESS ───────────────────────────────── */}
      <section className="text-center">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold mb-6">
            <Zap className="h-3.5 w-3.5 text-amber-600" />
            SIMPLE & COMPLETE WORKFLOW
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#0A0A0A] tracking-tight mb-6 leading-tight">
            How Invoicely Works: From Creation to Direct Delivery & Payment
          </h1>
          <p className="text-lg text-stone-500 max-w-2xl mx-auto leading-relaxed mb-10">
            No spreadsheets, zero manual math errors, and no bloated software.
            Here is the exact step-by-step workflow that helps 10,000+ businesses send invoices and get paid 3x faster.
          </p>
        </div>

        {/* 4 Step Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto text-left relative">
          {detailedSteps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.num}
                className="bg-white rounded-3xl border border-stone-200 p-6 shadow-sm hover:shadow-xl hover:border-amber-400 transition-all duration-300 flex flex-col justify-between relative z-10 group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="h-11 w-11 rounded-2xl bg-amber-100 text-[#0A0A0A] font-black text-lg flex items-center justify-center group-hover:bg-amber-400 transition-colors">
                      {step.num}
                    </span>
                    <span className="text-[9px] font-extrabold uppercase tracking-widest text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                      {step.badge}
                    </span>
                  </div>

                  <h2 className="text-base font-black text-[#0A0A0A] mb-2 leading-snug group-hover:text-amber-600 transition-colors">
                    {step.title}
                  </h2>
                  <p className="text-xs text-stone-500 leading-relaxed mb-4 font-medium">
                    {step.longDesc}
                  </p>
                </div>

                <div className="border-t border-stone-100 pt-3 space-y-1.5">
                  {step.bullets.map((bullet, i) => (
                    <div key={i} className="flex items-center gap-2 text-[11px] text-stone-700">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />
                      <span>{bullet}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── SECTION 2: POWERFUL BUILT-IN FEATURES GRID ──────────────────────── */}
      <section className="bg-stone-900 text-white rounded-3xl p-8 sm:p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center mb-12 relative z-10">
          <p className="text-xs font-bold uppercase tracking-widest text-amber-400 mb-2">
            Built-In Invoicely Superpowers
          </p>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-3">
            More Than Just Payment Links — Full Delivery & Automation
          </h2>
          <p className="text-sm text-stone-400 leading-relaxed max-w-xl mx-auto">
            Everything you need to create, deliver, collect, and manage invoices smoothly in one place.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
          {uniqueFeatures.map((f, i) => {
            const Icon = f.icon;
            return (
              <div key={i} className="bg-stone-950/80 border border-stone-800 rounded-2xl p-6 hover:border-amber-400/50 transition-all group">
                <div className="h-10 w-10 rounded-xl bg-amber-400/10 text-amber-400 flex items-center justify-center mb-4 group-hover:bg-amber-400 group-hover:text-black transition-all">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-white mb-2">{f.title}</h3>
                <p className="text-xs text-stone-400 leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── SECTION 3: REAL-WORLD USE CASES & INTERACTIVE DEMO ───────────────── */}
      <section className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-10 shadow-sm">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <p className="text-xs font-bold uppercase tracking-widest text-amber-600 mb-2">
            Tailored For Your Business Type
          </p>
          <h2 className="text-3xl sm:text-4xl font-black text-[#0A0A0A] tracking-tight mb-3">
            Real-World Use Cases & Invoice Examples
          </h2>
          <p className="text-sm text-stone-500 leading-relaxed">
            See how freelancers, agency founders, GST merchants, and professionals use Invoicely to deliver invoices and collect payments.
          </p>
        </div>

        {/* Industry Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {useCases.map((uc) => {
            const Icon = uc.icon;
            const isSelected = uc.id === selectedUseCase;
            return (
              <button
                key={uc.id}
                onClick={() => setSelectedUseCase(uc.id)}
                className={`flex items-center gap-2 px-5 py-3 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? uc.activeTab + " shadow-md scale-105"
                    : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                }`}
              >
                <Icon className="h-4 w-4" />
                {uc.label}
              </button>
            );
          })}
        </div>

        {/* Selected Use Case Details */}
        <div className="grid lg:grid-cols-12 gap-8 items-center bg-stone-50 rounded-2xl p-6 sm:p-8 border border-stone-200">
          {/* Left info column */}
          <div className="lg:col-span-6 space-y-6">
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border ${activeCase.color}`}>
              {activeCase.label} Workflow
            </div>

            <h3 className="text-2xl font-black text-[#0A0A0A] tracking-tight leading-snug">
              {activeCase.headline}
            </h3>

            <p className="text-sm text-stone-600 leading-relaxed">
              {activeCase.description}
            </p>

            <div className="space-y-2.5 pt-2">
              <p className="text-xs font-bold uppercase tracking-wider text-stone-400">Key Advantages:</p>
              {activeCase.keyBenefits.map((benefit, idx) => (
                <div key={idx} className="flex items-center gap-2.5 text-xs text-stone-800 font-medium">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>

            <div className="pt-2">
              <button
                onClick={() => navigate("/auth")}
                className="inline-flex items-center gap-2 bg-[#0A0A0A] hover:bg-stone-800 text-white text-xs font-bold px-6 py-3 rounded-full transition-all"
              >
                Create {activeCase.label} Invoice Free
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Right interactive invoice preview card */}
          <div className="lg:col-span-6 bg-white rounded-2xl border border-stone-300 p-6 shadow-lg space-y-4">
            <div className="flex justify-between items-start border-b border-stone-100 pb-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Billed To</p>
                <p className="text-sm font-bold text-[#0A0A0A]">{activeCase.example.client}</p>
                <p className="text-xs text-stone-500">{activeCase.example.type}</p>
              </div>
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                SAMPLE INVOICE
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs bg-amber-50 border border-amber-200 text-amber-900 p-2.5 rounded-xl">
              <Mail className="h-4 w-4 text-amber-600 flex-shrink-0" />
              <span className="font-semibold">{activeCase.example.deliveryMethod}</span>
            </div>

            <div className="space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Line Items</p>
              {activeCase.example.items.map((item, i) => (
                <div key={i} className="flex justify-between items-center text-xs py-1.5 border-b border-stone-50 last:border-0">
                  <div className="max-w-[220px]">
                    <p className="font-semibold text-stone-800">{item.desc}</p>
                    <p className="text-[10px] text-stone-400">{item.rate}</p>
                  </div>
                  <span className="font-bold text-stone-900">{item.total}</span>
                </div>
              ))}
            </div>

            <div className="bg-stone-50 rounded-xl p-3 space-y-1.5 text-xs border border-stone-200">
              <div className="flex justify-between text-stone-500">
                <span>Tax Breakdown:</span>
                <span>{activeCase.example.tax}</span>
              </div>
              <div className="flex justify-between font-black text-[#0A0A0A] text-sm pt-1 border-t border-stone-200">
                <span>Total Balance Due:</span>
                <span className="text-amber-600">{activeCase.example.totalDue}</span>
              </div>
            </div>

            <div className="text-[11px] text-stone-500 flex items-center gap-1.5 justify-between pt-1">
              <span className="flex items-center gap-1 font-semibold text-stone-700">
                <Clock className="h-3 w-3 text-amber-500" />
                {activeCase.example.paymentTerm}
              </span>
              <span className="text-emerald-600 font-bold">PDF Attached + Pay Link</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 4: COMPARISON BEFORE VS AFTER INVOICELY ─────────────────── */}
      <section className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <p className="text-xs font-bold uppercase tracking-widest text-amber-600 mb-2">
            The Difference
          </p>
          <h2 className="text-3xl sm:text-4xl font-black text-[#0A0A0A] tracking-tight">
            Traditional Invoicing vs. The Invoicely Way
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Traditional */}
          <div className="bg-rose-50/50 rounded-3xl border border-rose-200 p-6 sm:p-8 space-y-4">
            <h3 className="text-lg font-black text-rose-900 flex items-center gap-2">
              <span className="h-7 w-7 rounded-full bg-rose-200 text-rose-800 text-xs flex items-center justify-center font-bold">✕</span>
              Without Invoicely (Excel / Word)
            </h3>
            <ul className="space-y-3 text-xs sm:text-sm text-rose-950">
              <li className="flex items-start gap-2">
                <span className="text-rose-500 mt-0.5">•</span>
                <span>Takes 20–30 minutes per invoice to format cells manually</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-500 mt-0.5">•</span>
                <span>Manual math errors in GST, tax percentages, or subtotal additions</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-500 mt-0.5">•</span>
                <span>Have to open your mail app manually to attach PDFs</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-500 mt-0.5">•</span>
                <span>No direct online payment link — clients delay bank transfers for weeks</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-500 mt-0.5">•</span>
                <span>Manual email follow-ups you feel awkward writing</span>
              </li>
            </ul>
          </div>

          {/* With Invoicely */}
          <div className="bg-emerald-50/50 rounded-3xl border border-emerald-200 p-6 sm:p-8 space-y-4">
            <h3 className="text-lg font-black text-emerald-900 flex items-center gap-2">
              <span className="h-7 w-7 rounded-full bg-emerald-200 text-emerald-800 text-xs flex items-center justify-center font-bold">✓</span>
              With Invoicely
            </h3>
            <ul className="space-y-3 text-xs sm:text-sm text-emerald-950">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>Generated in under 30 seconds via simple prompt or template</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>100% automated math for GST (CGST/SGST/IGST), VAT, & discounts</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>1-Click direct email delivery to client inbox with attached PDF</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>Instant payment links (UPI, Razorpay, Debit/Credit Card, PayPal)</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>Automated friendly payment reminders & background recurring billing</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* ── SECTION 5: CALL TO ACTION ───────────────────────────────────────── */}
      <section className="bg-[#0A0A0A] rounded-3xl p-8 sm:p-14 text-center text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-xl mx-auto space-y-6">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
            Ready to experience 30-second invoicing & direct delivery?
          </h2>
          <p className="text-stone-400 text-sm leading-relaxed">
            Create your first invoice free — no credit card required. Join 10,000+ freelancers and business owners invoicing smarter.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <button
              onClick={() => navigate("/auth")}
              className="inline-flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold px-8 py-4 rounded-full text-sm shadow-xl transition-all"
            >
              Get Started Free Now
              <ArrowRight className="h-4 w-4" />
            </button>
            <Link
              to="/free-invoice-generator"
              className="inline-flex items-center justify-center gap-2 border border-stone-700 text-stone-300 hover:text-white font-semibold px-6 py-4 rounded-full text-sm hover:bg-stone-800 transition-all"
            >
              See Free Tier Details
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

// ── Standalone Page Component ────────────────────────────────────────────────
const HowItWorksPage = () => (
  <>
    <SEOHead
      title="How It Works — 4-Step Invoicing, Direct Email Delivery & Use Cases | Invoicely"
      description="See how Invoicely works in 4 simple steps. Learn how freelancers, agency owners, GST merchants, and professionals create, email PDFs directly, and collect online payments."
      canonical="https://www.getinvoicely.online/how-it-works"
    />
    <PublicPageLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14">
        <HowItWorksContent />
      </div>
    </PublicPageLayout>
  </>
);

export { HowItWorksContent };
export default HowItWorksPage;
