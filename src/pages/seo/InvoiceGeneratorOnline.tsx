import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, ArrowRight, Monitor, Globe, ShieldCheck, CheckCircle2, ArrowUpRight, Lock } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import PublicPageLayout from "@/components/PublicPageLayout";

const faqs = [
  {
    q: "Why use an online invoice generator instead of desktop software?",
    a: "Online invoice generators require no software installation, work on any device (laptop, tablet, or phone), update automatically, and store your invoice history securely in the cloud so you can access it anywhere.",
  },
  {
    q: "Can I access my invoices from mobile devices?",
    a: "Yes. Invoicely is fully responsive. You can generate, view, edit, and send PDF invoices from your iPhone, Android device, or desktop web browser.",
  },
  {
    q: "Are my online invoices secure?",
    a: "Yes. We use standard HTTPS encryption, secure cloud database storage (Supabase), and row-level security policies so only you can access your invoice and client records.",
  },
  {
    q: "Can I share a direct link with my client to view and pay?",
    a: "Yes, on every plan. Each invoice gets a shareable page with a \"Pay Online\" button. Clients click it and pay via your chosen provider — Stripe, PayPal, Razorpay, UPI, or any payment platform you use. Money goes directly to your account; Invoicely never handles it, which is also why you mark the invoice paid once your provider confirms.",
  },
];

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
    { "@type": "ListItem", position: 2, name: "Online Invoice Generator", item: "https://www.getinvoicely.online/invoice-generator-online" },
  ],
};

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

const workflowSteps = [
  { title: "1. Access Online in Browser", desc: "Open Invoicely on desktop or mobile. No app download or installation required." },
  { title: "2. Add Client & Services", desc: "Select or add client details and enter billing line items with custom quantities and prices." },
  { title: "3. Auto-Calculate Tax & Totals", desc: "Add the tax lines you need at the rates you need; every amount and total is computed for you." },
  { title: "4. Direct Email Send & PDF Export", desc: "Email invoices straight to client inboxes with print-ready PDFs attached alongside live checkout links." },
  { title: "5. Track Payment Status", desc: "Monitor paid vs. pending invoices right from your online dashboard." },
];


const InvoiceGeneratorOnline = () => (
  <>
    <SEOHead
      title="Online Invoice Generator — Create Invoices in Your Browser | Invoicely"
      description="Create, edit, and send professional invoices online directly in your browser. No downloads or installations required. Fast, cloud-based, and mobile-friendly."
      canonical="https://www.getinvoicely.online/invoice-generator-online"
      structuredData={[faqSchema, breadcrumbSchema]}
    />
    <PublicPageLayout>
      {/* Hero */}
      <section className="bg-white border-b border-stone-100 py-14 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <nav aria-label="Breadcrumb" className="text-xs text-stone-400 mb-6 flex items-center justify-center gap-1.5">
            <Link to="/" className="hover:text-stone-700">Home</Link>
            <span>›</span>
            <span className="text-stone-600 font-medium">Online Invoice Generator</span>
          </nav>

          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold mb-6">
            <Globe className="h-3.5 w-3.5 text-blue-600" />
            100% BROWSER-BASED & CLOUD-SAVED
          </div>

          <h1 className="text-4xl sm:text-5xl font-black text-[#0A0A0A] tracking-tight mb-4 leading-tight">
            Online Invoice Generator
          </h1>
          <p className="text-lg text-stone-500 max-w-2xl mx-auto mb-8 leading-relaxed">
            Create professional invoices directly in your web browser.
            Instant PDF download, live payment links, and cloud storage—no software installation required.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/auth"
              className="inline-flex items-center justify-center gap-2 bg-[#0A0A0A] hover:bg-stone-700 text-white font-bold px-7 py-3.5 rounded-full shadow-lg text-sm transition-all group"
            >
              Open Online Generator
              <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
            </Link>
          </div>
          <p className="text-xs text-stone-400 mt-4">Works on Desktop, Mac, Windows, iPhone & Android</p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 py-12 space-y-16">
        {/* Why Browser-based */}
        <section>
          <h2 className="text-2xl font-black text-[#0A0A0A] mb-4">Why Use a Web-Based Online Invoice Maker?</h2>
          <p className="text-stone-600 leading-relaxed mb-4">
            Traditional desktop invoicing programs restrict you to a single computer and require manual updates, backups, and file exports.
            An online invoice generator like Invoicely lives in the cloud, giving you instant access to your clients, templates, and billing history from any device, anywhere in the world.
          </p>
          <p className="text-stone-600 leading-relaxed">
            Whether you are working from a desktop at your office, sending a bill from your laptop at a coffee shop, or checking invoice status on your phone, your data stays synced and secure.
          </p>
        </section>

        {/* Realistic Workflow */}
        <section className="bg-stone-50 rounded-3xl border border-stone-200 p-6 sm:p-8">
          <h2 className="text-2xl font-black text-[#0A0A0A] mb-6 flex items-center gap-2">
            <Monitor className="h-6 w-6 text-amber-600" />
            The Complete Online Invoicing Workflow
          </h2>
          <div className="space-y-4">
            {workflowSteps.map((step, idx) => (
              <div key={idx} className="bg-white rounded-xl border border-stone-200 p-4 shadow-sm flex items-start gap-4">
                <CheckCircle2 className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-sm text-[#0A0A0A]">{step.title}</h3>
                  <p className="text-xs text-stone-500 mt-0.5 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Key Features for Web Users */}
        <section>
          <h2 className="text-2xl font-black text-[#0A0A0A] mb-8">Cloud Features Built for Modern Businesses</h2>
          <div className="grid sm:grid-cols-2 gap-5">
            {[
              { title: "Zero Install Needed", desc: "Runs entirely in modern web browsers (Chrome, Safari, Edge, Firefox)." },
              { title: "Bank-Grade Encryption", desc: "HTTPS encryption and isolated database policies keep client data safe." },
              { title: "Live Online Payment Links", desc: "Clients click Pay Online — payment goes directly into your account via Stripe, PayPal, Razorpay, UPI, or any provider you use." },
              { title: "Tax & Discount Lines", desc: "Name each tax or discount, set its rate, and let Invoicely do the arithmetic." },
            ].map((f, i) => (
              <div key={i} className="bg-white rounded-2xl border border-stone-100 p-5 shadow-sm">
                <h3 className="font-bold text-[#0A0A0A] text-sm mb-1">{f.title}</h3>
                <p className="text-xs text-stone-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Internal links */}
        <section className="border-t border-stone-200 pt-8">
          <h2 className="text-xl font-black text-[#0A0A0A] mb-4">Explore More Landing Pages</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { to: "/invoice-generator", label: "Invoice Generator Overview", desc: "Core feature summary & standard workflow" },
              { to: "/how-it-works", label: "How Invoicely Works", desc: "The full workflow from draft to paid" },
              { to: "/free-invoice-generator", label: "Free Invoice Generator", desc: "Free tier features and comparison" },
              { to: "/blog/how-to-generate-invoice-pdf", label: "How to Generate PDF Invoices", desc: "Guide to instant PDF creation" },
            ].map((link, i) => (
              <Link key={i} to={link.to} className="p-4 bg-white rounded-xl border border-stone-100 hover:border-amber-200 hover:shadow-sm transition-all flex items-start justify-between group">
                <div>
                  <p className="font-semibold text-sm text-[#0A0A0A] group-hover:text-amber-600 transition-colors">{link.label}</p>
                  <p className="text-xs text-stone-500">{link.desc}</p>
                </div>
                <ArrowUpRight className="h-4 w-4 text-stone-400 group-hover:text-amber-600 group-hover:translate-x-0.5 transition-all" />
              </Link>
            ))}
          </div>
        </section>

        {/* FAQs */}
        <section>
          <h2 className="text-2xl font-black text-[#0A0A0A] mb-6">Frequently Asked Questions</h2>
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm px-6">
            {faqs.map((f, i) => <FaqItem key={i} q={f.q} a={f.a} />)}
          </div>
        </section>

        {/* Final CTA */}
        <section className="bg-[#0A0A0A] rounded-2xl p-8 sm:p-12 text-center text-white">
          <h2 className="text-3xl font-black mb-3">Create Invoices Online in 30 Seconds</h2>
          <p className="text-stone-400 mb-8 max-w-md mx-auto text-sm leading-relaxed">
            Try Invoicely directly in your browser. No downloads or installations required.
          </p>
          <Link
            to="/auth"
            className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-black font-bold px-8 py-3.5 rounded-full text-sm transition-all"
          >
            Launch Online Generator <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </section>
      </div>
    </PublicPageLayout>
  </>
);

export default InvoiceGeneratorOnline;
