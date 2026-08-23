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
    headline: "Go from project completion to invoice in your client's inbox in under a minute",
    description:
      "Stop wasting unpaid hours constructing spreadsheets. Freelancers use Invoicely to email PDF invoices directly to clients and include a link where the client can pay right away instead of waiting for bank details.",
    keyBenefits: [
      "Send PDF invoice directly to client's email inbox in 1 click",
      "Bill a deposit as its own line item on the invoice",
      "Share your payment link — Stripe, PayPal, UPI, or any provider",
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
    headline: "Unbranded invoices, direct email delivery & saved retainer schedules",
    description:
      "Keep a clean, professional face in front of clients. Agency owners use Invoicely to email invoices with no Invoicely watermark straight to client inboxes, and to save retainer schedules so the monthly bill doesn't get rebuilt from scratch.",
    keyBenefits: [
      "1-Click direct email sending with custom subject & message",
      "Saved recurring schedules for retainer clients",
      "No Invoicely watermark on your invoices or PDFs (Pro)",
      "One list of who is unpaid and how overdue they are",
    ],
    example: {
      client: "Nexus Global Marketing",
      type: "Monthly Digital Strategy Retainer",
      deliveryMethod: "Recurring schedule, emailed with PDF attached",
      items: [
        { desc: "Monthly Performance Marketing & SEO Retainer", rate: "$1,500/mo", total: "$1,500.00" },
        { desc: "Ad Creative Production & Copywriting", rate: "4 Units", total: "$600.00" },
      ],
      tax: "Standard State Tax (8%)",
      totalDue: "$2,268.00",
      paymentTerm: "Recurring Monthly · Net 15",
    },
  },
  {
    id: "retail",
    label: "Local Business & GST Sellers",
    icon: Store,
    color: "bg-emerald-50 text-emerald-600 border-emerald-200",
    activeTab: "bg-emerald-600 text-white",
    headline: "Named GST tax lines, your GSTIN on the invoice, instant PDF & email send",
    description:
      "Stop doing tax maths by hand. Add the tax lines your invoice needs — CGST and SGST as separate lines, or a single IGST line — each with its own rate, and Invoicely calculates every amount and the total. Your GSTIN prints on the invoice from your business settings.",
    keyBenefits: [
      "Add as many named tax lines as you need, each with its own rate",
      "Your GSTIN / VAT number printed on every invoice",
      "Email the invoice PDF straight to the customer's inbox",
      "Instant print-ready PDF export for physical billing counters",
    ],
    example: {
      client: "Sharma Enterprises (GSTIN: 07AAAAA0000A1Z5)",
      type: "B2B Office Supplies Order",
      deliveryMethod: "Direct Email PDF + Counter Print Ready",
      items: [
        { desc: "Ergonomic Mesh Office Chairs", rate: "₹8,000 × 5", total: "₹40,000.00" },
      ],
      tax: "CGST 9% (₹3,600) + SGST 9% (₹3,600) — two tax lines",
      totalDue: "₹47,200.00",
      paymentTerm: "Net 30 · Bank Transfer / UPI / Online Payment Link",
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
    badge: "BUILD THE INVOICE",
    title: "Add Your Client & Line Items",
    shortDesc: "Pick a saved client, list what you did, and let the totals work themselves out.",
    longDesc:
      "No more starting at a blank spreadsheet. Your clients and business details are saved, invoice numbers are issued in sequence automatically, and every total — subtotal, tax, discount, amount due — recalculates as you type.",
    bullets: [
      "Saved clients and business details, filled in for you",
      "Line-item entry with quantities, rates, and discounts",
      "Named tax lines with custom rates — GST, VAT, sales tax",
      "Automatic sequential invoice numbering with your own prefix",
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
      "Remove the Invoicely watermark from your invoices (Pro)",
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
    badge: "GET PAID & TRACK IT",
    title: "Share a Pay Page & Track Who Owes You",
    shortDesc: "Clients click Pay Online and pay directly into your account via their preferred method.",
    longDesc:
      "Every invoice gets a shareable page with a \"Pay Online\" button pointing at your own payment link — Stripe, PayPal, Razorpay, UPI, or any platform you use. Money goes directly to your account, anywhere in the world; Invoicely never handles it. Because the payment happens at your provider, you mark the invoice paid once they confirm it — and until then it sits in your unpaid list with the amount and days overdue.",
    bullets: [
      "Shareable pay page using your own payment link",
      "Works with any provider (Stripe, PayPal, Razorpay, UPI)",
      "Recurring schedules for retainer clients",
      "Status tracking — Draft, Sent, Paid, Overdue",
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
    title: "Bring Your Own Payment Provider",
    desc: "Paste your Stripe, PayPal, Razorpay, or UPI link once. Every invoice's pay page points your client at it, and the money lands in your account — Invoicely never sits in the middle and takes no cut.",
  },
  {
    icon: RefreshCw,
    title: "Recurring Invoices for Retainers",
    desc: "Save a retainer client's schedule — weekly, monthly, or a custom interval — and reissue the same invoice each cycle with new dates and a new number instead of rebuilding it.",
  },
  {
    icon: BellRing,
    title: "One List of Who Owes You",
    desc: "Every unpaid and overdue invoice in one place with the amount and how late it is, so chasing payment starts with knowing exactly who to chase.",
  },
  {
    icon: Sparkles,
    title: "Sequential Invoice Numbering",
    desc: "Set your own prefix and starting number once. Every invoice gets the next number in order, issued by the database — no duplicates, no gaps, no remembering where you left off.",
  },
  {
    icon: Globe2,
    title: "Named Tax & Discount Lines",
    desc: "Add as many tax and discount lines as an invoice needs — GST, VAT, sales tax, an early-payment discount — each with its own rate, all calculated for you.",
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
            Here is the exact step-by-step workflow, from a blank invoice to money in your account.
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
            More Than a PDF Generator — Delivery, Payment & Tracking
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
                <span>Built in under a minute from saved clients and business details</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>Every total calculated for you — taxes, discounts, amount due</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>1-Click direct email delivery to client inbox with attached PDF</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>A pay page pointing at your own link (UPI, Razorpay, Card, PayPal)</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>Recurring schedules for retainers, plus unpaid & overdue tracking</span>
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
            Create your first invoice free — no credit card required, no trial clock.
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
