import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, ArrowRight, CheckCircle2, ShieldCheck, FileText, Gift, ArrowUpRight } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import PublicPageLayout from "@/components/PublicPageLayout";

const faqs = [
  {
    q: "Is Invoicely really 100% free to start?",
    a: "Yes. Invoicely offers a genuine forever-free tier. You can create up to 5 invoices per month, manage up to 3 clients, and export high-resolution PDFs without entering a credit card.",
  },
  {
    q: "Are there any hidden fees or charges on the free plan?",
    a: "No hidden fees. Free accounts have explicit usage limits (5 invoices/mo, 3 clients), but we never auto-charge or ask for payment details unless you choose to upgrade to Pro.",
  },
  {
    q: "Can I download PDF invoices on the free plan?",
    a: "Yes. Every invoice generated on the free plan can be downloaded as a print-ready PDF file or emailed to clients directly.",
  },
  {
    q: "What features are included in the Free tier versus Pro?",
    a: "Free includes 5 invoices/mo, 3 templates, 3 clients, multi-currency support, and 3 free AI generations. Pro ($6/mo) unlocks unlimited invoices, all 20 templates, custom branding/white-labeling, online payment links, and recurring invoices.",
  },
  {
    q: "Who is the free invoice generator best suited for?",
    a: "Freelancers, part-time contractors, micro-consultants, and newly started small businesses who invoice occasionally and need a clean, professional template.",
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
    { "@type": "ListItem", position: 2, name: "Free Invoice Generator", item: "https://www.getinvoicely.online/free-invoice-generator" },
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

const freeFeatures = [
  "5 Professional invoices per month",
  "3 Clean invoice templates",
  "Manage up to 3 active client profiles",
  "1-Click print-ready PDF exports",
  "Automatic GST / Tax calculations",
  "Multi-currency support (USD, EUR, INR, etc.)",
  "Try AI invoice generation (3 uses free)",
  "No credit card required to start",
];

const FreeInvoiceGenerator = () => (
  <>
    <SEOHead
      title="Free Invoice Generator — Create Professional Invoices Online | Invoicely"
      description="Looking for a free invoice generator? Invoicely lets you create, send, and download PDF invoices for free. No credit card required. Perfect for freelancers and small businesses."
      canonical="https://www.getinvoicely.online/free-invoice-generator"
      structuredData={[faqSchema, breadcrumbSchema]}
    />
    <PublicPageLayout>
      {/* Hero */}
      <section className="bg-white border-b border-stone-100 py-14 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <nav aria-label="Breadcrumb" className="text-xs text-stone-400 mb-6 flex items-center justify-center gap-1.5">
            <Link to="/" className="hover:text-stone-700">Home</Link>
            <span>›</span>
            <span className="text-stone-600 font-medium">Free Invoice Generator</span>
          </nav>

          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold mb-6">
            <Gift className="h-3.5 w-3.5 text-emerald-600" />
            100% FREE TIER AVAILABLE
          </div>

          <h1 className="text-4xl sm:text-5xl font-black text-[#0A0A0A] tracking-tight mb-4 leading-tight">
            Free Invoice Generator for Freelancers & Small Business
          </h1>
          <p className="text-lg text-stone-500 max-w-2xl mx-auto mb-8 leading-relaxed">
            Create and send beautiful PDF invoices without paying a cent.
            No credit card, no forced trials, no gimmicks.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/auth"
              className="inline-flex items-center justify-center gap-2 bg-[#0A0A0A] hover:bg-stone-700 text-white font-bold px-7 py-3.5 rounded-full shadow-lg text-sm transition-all group"
            >
              Start Free — No Credit Card Needed
              <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
            </Link>
          </div>
          <p className="text-xs text-stone-400 mt-4">Includes 5 free invoices/mo · Free forever</p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 py-12 space-y-16">
        {/* Exactly What You Get for Free */}
        <section>
          <h2 className="text-2xl font-black text-[#0A0A0A] mb-4">What Can You Do for Free on Invoicely?</h2>
          <p className="text-stone-600 leading-relaxed mb-6">
            Many "free" invoice generators lock PDF downloads behind paywalls or require a credit card upfront.
            Invoicely is different. Our Free plan gives freelancers and micro-businesses everything needed to bill clients professionally.
          </p>

          <div className="grid sm:grid-cols-2 gap-4">
            {freeFeatures.map((item, idx) => (
              <div key={idx} className="flex items-center gap-3 bg-white rounded-xl border border-stone-200 p-4 shadow-sm">
                <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                <span className="text-sm font-semibold text-[#0A0A0A]">{item}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Free vs Pro Comparison */}
        <section>
          <h2 className="text-2xl font-black text-[#0A0A0A] mb-6">Free Plan vs Pro Plan Comparison</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse bg-white rounded-2xl border border-stone-200 shadow-sm">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-200">
                  <th className="text-left py-3.5 px-4 font-bold text-stone-700">Feature</th>
                  <th className="text-center py-3.5 px-4 font-bold text-stone-800 bg-emerald-50/50">Free ($0/mo)</th>
                  <th className="text-center py-3.5 px-4 font-bold text-amber-700 bg-amber-50/50">Pro ($6/mo)</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Monthly Invoices", "5 per month", "Unlimited"],
                  ["Client Directory", "Up to 3 clients", "Unlimited clients"],
                  ["Templates", "3 standard templates", "All 20 premium templates"],
                  ["PDF Export", "Included", "Included"],
                  ["AI Generations", "3 trial uses", "Unlimited AI generation"],
                  ["Branding / Watermark", "Invoicely branding", "100% White-label (Your brand)"],
                  ["Online Payment Links", "—", "Razorpay, UPI, Card checkout"],
                  ["Recurring Invoices", "—", "Automated recurring schedules"],
                ].map(([feature, freeVal, proVal], i) => (
                  <tr key={i} className="border-b border-stone-100 last:border-0">
                    <td className="py-3 px-4 text-stone-700 font-medium">{feature}</td>
                    <td className="py-3 px-4 text-center text-stone-600 bg-emerald-50/20">{freeVal}</td>
                    <td className="py-3 px-4 text-center font-semibold text-amber-900 bg-amber-50/20">{proVal}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* How to create an invoice for free */}
        <section>
          <h2 className="text-2xl font-black text-[#0A0A0A] mb-4">How to Generate a Free Invoice in 3 Steps</h2>
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-stone-100 p-5 flex gap-4 items-start">
              <div className="h-8 w-8 rounded-full bg-stone-900 text-white font-black flex items-center justify-center text-sm flex-shrink-0">1</div>
              <div>
                <h3 className="font-bold text-[#0A0A0A] mb-1">Create a Free Account</h3>
                <p className="text-xs text-stone-500">Sign up with email or Google in seconds. No payment information needed.</p>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-stone-100 p-5 flex gap-4 items-start">
              <div className="h-8 w-8 rounded-full bg-stone-900 text-white font-black flex items-center justify-center text-sm flex-shrink-0">2</div>
              <div>
                <h3 className="font-bold text-[#0A0A0A] mb-1">Fill in Client & Invoice Details</h3>
                <p className="text-xs text-stone-500">Add invoice items, quantity, prices, and optional tax rates (GST / VAT).</p>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-stone-100 p-5 flex gap-4 items-start">
              <div className="h-8 w-8 rounded-full bg-stone-900 text-white font-black flex items-center justify-center text-sm flex-shrink-0">3</div>
              <div>
                <h3 className="font-bold text-[#0A0A0A] mb-1">Download PDF & Send</h3>
                <p className="text-xs text-stone-500">Click to export your print-ready PDF or email it straight to your client.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Internal Navigation Links */}
        <section className="border-t border-stone-200 pt-8">
          <h2 className="text-xl font-black text-[#0A0A0A] mb-4">Explore Related Solutions</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { to: "/invoice-generator", label: "Standard Invoice Generator", desc: "Overview of our core invoice generator" },
              { to: "/ai-invoice-generator", label: "AI Invoice Generator", desc: "Draft invoices from plain text descriptions" },
              { to: "/invoice-generator-online", label: "Online Invoice Maker", desc: "Browser-based invoicing with zero setup" },
              { to: "/blog/invoice-for-freelancers", label: "Freelancer Invoicing Guide", desc: "Tips and templates for freelance billing" },
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
          <h2 className="text-3xl font-black mb-3">Start Creating Free Invoices Now</h2>
          <p className="text-stone-400 mb-8 max-w-md mx-auto text-sm leading-relaxed">
            Join thousands of freelancers and small business owners creating professional invoices on Invoicely.
          </p>
          <Link
            to="/auth"
            className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-black font-bold px-8 py-3.5 rounded-full text-sm transition-all"
          >
            Create Free Invoice <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </section>
      </div>
    </PublicPageLayout>
  </>
);

export default FreeInvoiceGenerator;
