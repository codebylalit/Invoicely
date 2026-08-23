import { useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, ChevronDown, ArrowRight, FileText, Zap, Download, Link2, Users, RefreshCw, Mail } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import PublicPageLayout from "@/components/PublicPageLayout";

// ── FAQ ────────────────────────────────────────────────────────────────────────
const faqs = [
  {
    q: "Is Invoicely's invoice generator really free?",
    a: "Yes. The free plan lets you create and email unlimited invoices with 3 professional templates and 3 client slots at no cost. No credit card required to start.",
  },
  {
    q: "Do I need to install software to use Invoicely?",
    a: "No. Invoicely is a fully online invoice generator — it runs in your browser. Nothing to download or install.",
  },
  {
    q: "Can I download invoices as PDF?",
    a: "Yes. Every invoice you create can be exported as a professional, print-ready PDF in one click.",
  },
  {
    q: "Does Invoicely support GST invoices?",
    a: "Yes. Add CGST and SGST as separate tax lines, or a single IGST line, each with its own rate — Invoicely calculates the amounts and the total, and prints your GSTIN on the invoice.",
  },
  {
    q: "Can I send invoices directly to clients from Invoicely?",
    a: "Yes, on every plan. You can email invoices directly from the platform with the PDF attached, and share a pay page carrying your own payment link so clients can pay online right away.",
  },
  {
    q: "What types of businesses use an invoice generator?",
    a: "Freelancers, consultants, web designers, photographers, writers, agencies, tutors, contractors, and any small business that invoices clients for work done.",
  },
];

const FaqItem = ({ q, a }: { q: string; a: string }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-stone-200 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="w-full flex items-center justify-between py-5 text-left gap-4 group cursor-pointer"
      >
        <span className="text-sm font-semibold text-[#0A0A0A] group-hover:text-amber-600 transition-colors">{q}</span>
        <ChevronDown className={`h-4 w-4 text-stone-400 flex-shrink-0 transition-transform duration-200 ${open ? "rotate-180 text-amber-500" : ""}`} aria-hidden="true" />
      </button>
      {open && <div className="pb-5 text-sm text-stone-600 leading-relaxed">{a}</div>}
    </div>
  );
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map(({ q, a }) => ({
    "@type": "Question",
    name: q,
    acceptedAnswer: { "@type": "Answer", text: a },
  })),
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://www.getinvoicely.online" },
    { "@type": "ListItem", position: 2, name: "Invoice Generator", item: "https://www.getinvoicely.online/invoice-generator" },
  ],
};

// ── Features ───────────────────────────────────────────────────────────────────
const features = [
  { icon: Mail, title: "1-Click Direct Email Delivery", desc: "Send invoices straight to your client's email address with the print-ready PDF attached and payment link included." },
  { icon: Zap, title: "Nothing Retyped Twice", desc: "Saved clients, saved business details, and sequential invoice numbers issued for you — you only type what is actually new." },
  { icon: FileText, title: "20 Professional Templates", desc: "Choose from 20 designs covering freelancer, agency, retail, healthcare, consulting, and more." },
  { icon: Download, title: "One-Click PDF Export", desc: "Download a print-ready PDF instantly. Compatible with email, WhatsApp, and any document system." },
  { icon: Link2, title: "Global Payment Links", desc: "Add your Stripe, PayPal, Razorpay, UPI, or any payment link. Clients pay directly into your account." },
  { icon: RefreshCw, title: "Recurring Invoices", desc: "Save a retainer client's schedule and reissue the same invoice each cycle with new dates and a new number instead of rebuilding it." },
];


// ── Steps ──────────────────────────────────────────────────────────────────────
const steps = [
  { n: "01", title: "Create your account", desc: "Sign up free — no credit card required. Takes under 30 seconds." },
  { n: "02", title: "Add your client", desc: "Enter the client's name, email, and billing address. Save them for future invoices." },
  { n: "03", title: "Add services or products", desc: "List what you delivered — quantity, rate, and description. Invoicely totals everything automatically." },
  { n: "04", title: "Apply tax (optional)", desc: "Add named tax lines — GST, VAT, sales tax — each with its own rate. Invoicely calculates every amount." },
  { n: "05", title: "Generate and send", desc: "Download as PDF or send directly to your client's email. Share a payment link for instant online payment." },
];

// ── Who it's for ───────────────────────────────────────────────────────────────
const personas = [
  { label: "Freelancers", desc: "Designers, writers, developers, photographers — anyone who invoices per project or per hour." },
  { label: "Consultants", desc: "Management, marketing, HR, or IT consultants billing clients for their expertise." },
  { label: "Agencies", desc: "Web, marketing, and creative agencies managing multiple client accounts and invoices." },
  { label: "Small businesses", desc: "Retailers, service providers, tutors, contractors — any business that bills clients." },
];

const InvoiceGenerator = () => (
  <>
    <SEOHead
      title="Free Online Invoice Generator — Create Invoices in Seconds | Invoicely"
      description="Use Invoicely's free invoice generator to create professional invoices online. 20 templates, PDF export, email delivery, tax lines. No software to install."
      canonical="https://www.getinvoicely.online/invoice-generator"
      structuredData={[faqSchema, breadcrumbSchema]}
    />
    <PublicPageLayout>

      {/* Hero */}
      <section className="bg-white border-b border-stone-100 py-14 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <nav aria-label="Breadcrumb" className="text-xs text-stone-400 mb-6 flex items-center justify-center gap-1.5">
            <Link to="/" className="hover:text-stone-700">Home</Link>
            <span>›</span>
            <span className="text-stone-600 font-medium">Invoice Generator</span>
          </nav>
          <h1 className="text-4xl sm:text-5xl font-black text-[#0A0A0A] tracking-tight mb-4 leading-tight">
            Free Online Invoice Generator
          </h1>
          <p className="text-lg text-stone-500 max-w-2xl mx-auto mb-8 leading-relaxed">
            Create professional invoices online in seconds. Add your client, list your services,
            set a tax rate, and generate a PDF-ready invoice — all from your browser, no software needed.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/auth"
              className="inline-flex items-center justify-center gap-2 bg-[#0A0A0A] hover:bg-stone-700 text-white font-bold px-7 py-3.5 rounded-full shadow-lg text-sm transition-all group"
            >
              Create Your First Invoice Free
              <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
            </Link>
            <Link
              to="/free-invoice-generator"
              className="inline-flex items-center justify-center gap-2 border border-stone-300 text-stone-700 font-semibold px-7 py-3.5 rounded-full text-sm hover:bg-stone-50 transition-all"
            >
              See what's free
            </Link>
          </div>
          <p className="text-xs text-stone-400 mt-4">No credit card required · Unlimited invoices on the free plan</p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 py-12 space-y-16">

        {/* What is an invoice generator */}
        <section>
          <h2 className="text-2xl font-black text-[#0A0A0A] mb-4">What Is an Invoice Generator?</h2>
          <p className="text-stone-600 leading-relaxed mb-4">
            An invoice generator is a tool that helps you create professional payment requests quickly.
            Instead of designing a document from scratch in Word or building one in a spreadsheet,
            an online invoice generator gives you a structured template, handles the calculations,
            and produces a clean, professional output your clients will take seriously.
          </p>
          <p className="text-stone-600 leading-relaxed mb-4">
            A good invoice generator should handle: item line totals, tax calculations, invoice numbering,
            client information, payment terms, and PDF export — all automatically.
          </p>
          <p className="text-stone-600 leading-relaxed">
            Invoicely goes further by <Link to="/how-it-works" className="text-amber-700 font-medium hover:underline">taking the invoice all the way to paid</Link>{" "}
            — email it with the PDF attached, and give your client a page with a Pay Online button.
          </p>
        </section>

        {/* How it works */}
        <section>
          <h2 className="text-2xl font-black text-[#0A0A0A] mb-8">How the Invoice Generator Works</h2>
          <div className="space-y-4">
            {steps.map((step) => (
              <div key={step.n} className="flex gap-5 items-start bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
                <span className="text-3xl font-black text-amber-400 flex-shrink-0 leading-none">{step.n}</span>
                <div>
                  <h3 className="font-bold text-[#0A0A0A] mb-1">{step.title}</h3>
                  <p className="text-sm text-stone-500 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section>
          <h2 className="text-2xl font-black text-[#0A0A0A] mb-8">Invoice Generator Features</h2>
          <div className="grid sm:grid-cols-2 gap-5">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5 flex gap-4">
                <div className="h-10 w-10 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
                  <Icon className="h-5 w-5 text-amber-600" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="font-bold text-[#0A0A0A] mb-1 text-sm">{title}</h3>
                  <p className="text-xs text-stone-500 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Who it's for */}
        <section>
          <h2 className="text-2xl font-black text-[#0A0A0A] mb-8">Who Uses an Invoice Generator?</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {personas.map(({ label, desc }) => (
              <div key={label} className="flex gap-3 items-start">
                <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <p className="font-bold text-[#0A0A0A] text-sm">{label}</p>
                  <p className="text-xs text-stone-500 mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-stone-600 mt-6 text-sm leading-relaxed">
            Invoicely is also popular for <Link to="/blog/gst-invoice-guide" className="text-amber-700 font-medium hover:underline">GST-compliant invoicing in India</Link>{" "}
            and works equally well for international billing in USD, EUR, GBP, and other currencies.
          </p>
        </section>

        {/* Why use an online generator */}
        <section>
          <h2 className="text-2xl font-black text-[#0A0A0A] mb-4">Why Use an Online Invoice Generator Instead of Word or Excel?</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-stone-50">
                  <th className="text-left py-3 px-4 font-bold text-stone-700 border border-stone-200 rounded-tl-xl">Task</th>
                  <th className="text-center py-3 px-4 font-bold text-stone-700 border border-stone-200">Word / Excel</th>
                  <th className="text-center py-3 px-4 font-bold text-amber-700 border border-stone-200 rounded-tr-xl">Invoicely</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Invoice creation time", "20–30 minutes", "Under 60 seconds"],
                  ["Tax calculation", "Manual, error-prone", "Automatic"],
                  ["Professional design", "Inconsistent", "20 polished templates"],
                  ["PDF export", "Manual save + formatting", "One click"],
                  ["Client payment", "Bank transfer only", "UPI, card, Razorpay"],
                  ["Payment reminders", "Manual emails", "Automatic"],
                  ["Invoice numbering", "You track it manually", "Auto-incremented"],
                ].map(([task, before, after]) => (
                  <tr key={task} className="border-b border-stone-100">
                    <td className="py-3 px-4 text-stone-700 border border-stone-200 font-medium">{task}</td>
                    <td className="py-3 px-4 text-center text-stone-500 border border-stone-200">{before}</td>
                    <td className="py-3 px-4 text-center text-emerald-700 font-semibold border border-stone-200">{after}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Related links */}
        <section>
          <h2 className="text-xl font-black text-[#0A0A0A] mb-5">Related Tools & Guides</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { to: "/how-it-works", label: "How Invoicely Works", desc: "The full workflow from draft to paid" },
              { to: "/free-invoice-generator", label: "Free Invoice Generator", desc: "Exactly what's included in the free plan" },
              { to: "/invoice-generator-online", label: "Online Invoice Maker", desc: "No software, no install — works in any browser" },
              { to: "/blog/how-to-create-an-invoice", label: "How to Create an Invoice", desc: "Step-by-step guide for beginners" },
              { to: "/blog/invoice-template", label: "Invoice Templates", desc: "What makes a good invoice template" },
              { to: "/blog/gst-invoice-guide", label: "GST Invoice Guide", desc: "Complete guide for India GST invoicing" },
            ].map(({ to, label, desc }) => (
              <Link key={to} to={to} className="flex items-start gap-3 p-4 bg-white rounded-xl border border-stone-100 hover:border-amber-200 hover:shadow-sm transition-all group">
                <ArrowRight className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
                <div>
                  <p className="font-semibold text-sm text-[#0A0A0A] group-hover:text-amber-700 transition-colors">{label}</p>
                  <p className="text-xs text-stone-500">{desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section>
          <h2 className="text-2xl font-black text-[#0A0A0A] mb-6">Frequently Asked Questions</h2>
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm px-6">
            {faqs.map((f, i) => <FaqItem key={i} q={f.q} a={f.a} />)}
          </div>
        </section>

        {/* Final CTA */}
        <section className="bg-[#0A0A0A] rounded-2xl p-8 sm:p-12 text-center text-white">
          <h2 className="text-3xl font-black mb-3">Create Your First Invoice Today</h2>
          <p className="text-stone-400 mb-8 max-w-md mx-auto text-sm leading-relaxed">
            Invoicely's free online invoice generator takes under 60 seconds to set up.
            No credit card. No software. Just professional invoices.
          </p>
          <Link
            to="/auth"
            className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-black font-bold px-8 py-3.5 rounded-full text-sm transition-all"
          >
            Get Started Free <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </section>
      </div>
    </PublicPageLayout>
  </>
);

export default InvoiceGenerator;
