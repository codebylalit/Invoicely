import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, ArrowRight, Sparkles, Zap, Bot, ShieldCheck, CheckCircle2, FileText, ArrowUpRight } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import PublicPageLayout from "@/components/PublicPageLayout";

const faqs = [
  {
    q: "How does the AI invoice generator work?",
    a: "Describe your project or work in plain English (e.g., 'Website redesign for Acme Corp, 20 hours at $50/hr plus $200 hosting fee'). Invoicely's AI extracts line items, quantities, rates, and totals to generate a structured invoice in seconds.",
  },
  {
    q: "Is the AI invoice generator free to use?",
    a: "Yes! Invoicely includes 3 free AI invoice generations on our Free plan with no credit card required. For unlimited AI invoice creation, upgrade to Pro for $6/month.",
  },
  {
    q: "Can I edit the invoice after the AI generates it?",
    a: "Absolutely. Every generated invoice is fully editable. You can modify line items, prices, tax rates, payment terms, client details, and design templates before sending.",
  },
  {
    q: "Does the AI support multi-currency and GST?",
    a: "Yes. You can specify currencies like USD, EUR, GBP, or INR, as well as GST rates (CGST, SGST, IGST), and the AI will calculate tax and totals correctly.",
  },
  {
    q: "Why use an AI invoice generator instead of standard templates?",
    a: "AI eliminates manual typing and math errors. Instead of filling out spreadsheet cells line by line, you type a single prompt and get a print-ready invoice immediately.",
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
    { "@type": "ListItem", position: 2, name: "AI Invoice Generator", item: "https://www.getinvoicely.online/ai-invoice-generator" },
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

const examplePrompts = [
  {
    prompt: "Logo design and brand guidelines for TechFlow Inc. 3 logo concepts ($600) and brand strategy PDF ($400). GST 18%.",
    result: "Itemized invoice with 2 lines ($600 + $400), tax calculated at 18% ($180), total $1,180.",
  },
  {
    prompt: "Monthly SEO maintenance for Bloom Retail. 10 hours work at $75/hr. Due in 15 days.",
    result: "Clean invoice with 1 line item ($750), due date auto-calculated to +15 days.",
  },
  {
    prompt: "React Native mobile app development phase 1. Milestone billing: 50% upfront ($2,500).",
    result: "Formatted deposit invoice for $2,500 with clear payment terms.",
  },
];

const AIInvoiceGenerator = () => (
  <>
    <SEOHead
      title="AI Invoice Generator — Create Invoices with AI | Invoicely"
      description="Use AI to generate professional invoices in seconds. Describe your work in plain English and let Invoicely extract line items, taxes, and totals automatically."
      canonical="https://www.getinvoicely.online/ai-invoice-generator"
      structuredData={[faqSchema, breadcrumbSchema]}
    />
    <PublicPageLayout>
      {/* Hero */}
      <section className="bg-white border-b border-stone-100 py-14 px-4 relative overflow-hidden">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <nav aria-label="Breadcrumb" className="text-xs text-stone-400 mb-6 flex items-center justify-center gap-1.5">
            <Link to="/" className="hover:text-stone-700">Home</Link>
            <span>›</span>
            <span className="text-stone-600 font-medium">AI Invoice Generator</span>
          </nav>

          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold mb-6">
            <Sparkles className="h-3.5 w-3.5 text-amber-600" />
            AI-POWERED INVOICE CREATION
          </div>

          <h1 className="text-4xl sm:text-5xl font-black text-[#0A0A0A] tracking-tight mb-4 leading-tight">
            AI Invoice Generator
          </h1>
          <p className="text-lg text-stone-500 max-w-2xl mx-auto mb-8 leading-relaxed">
            Turn plain English descriptions into print-ready professional invoices.
            No spreadsheet formulas, manual calculations, or tedious form filling.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/auth"
              className="inline-flex items-center justify-center gap-2 bg-[#0A0A0A] hover:bg-stone-700 text-white font-bold px-7 py-3.5 rounded-full shadow-lg text-sm transition-all group"
            >
              Try AI Invoice Generator Free
              <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
            </Link>
            <Link
              to="/invoice-generator"
              className="inline-flex items-center justify-center gap-2 border border-stone-300 text-stone-700 font-semibold px-7 py-3.5 rounded-full text-sm hover:bg-stone-50 transition-all"
            >
              Standard Invoice Generator
            </Link>
          </div>
          <p className="text-xs text-stone-400 mt-4">3 AI generations free on sign up · No credit card required</p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 py-12 space-y-16">
        {/* What is AI Invoice Generator */}
        <section>
          <h2 className="text-2xl font-black text-[#0A0A0A] mb-4">What Is an AI Invoice Generator?</h2>
          <p className="text-stone-600 leading-relaxed mb-4">
            An AI invoice generator uses natural language processing (NLP) to read unstructured text—like an email summary, meeting notes, or a quick project description—and automatically convert it into a structured, itemized invoice.
          </p>
          <p className="text-stone-600 leading-relaxed">
            Instead of manually clicking through multiple input fields, selecting line items, and doing mental math for taxes and totals, you type what you did, and the AI drafts the entire invoice for you in seconds.
          </p>
        </section>

        {/* How Invoicely Uses AI */}
        <section className="bg-amber-50/60 rounded-3xl border border-amber-200/80 p-6 sm:p-8">
          <h2 className="text-2xl font-black text-[#0A0A0A] mb-6 flex items-center gap-2">
            <Bot className="h-6 w-6 text-amber-600" />
            How Invoicely Uses AI to Build Invoices
          </h2>
          <div className="grid sm:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="h-8 w-8 rounded-full bg-amber-500 text-black font-black flex items-center justify-center text-sm">1</div>
              <h3 className="font-bold text-[#0A0A0A]">Type Your Work Summary</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Provide a short prompt detailing the client, tasks, rates, hours, or fixed pricing in plain text.
              </p>
            </div>
            <div className="space-y-2">
              <div className="h-8 w-8 rounded-full bg-amber-500 text-black font-black flex items-center justify-center text-sm">2</div>
              <h3 className="font-bold text-[#0A0A0A]">AI Extracts & Formats</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Invoicely identifies service items, unit costs, quantities, currencies, and applicable GST/taxes.
              </p>
            </div>
            <div className="space-y-2">
              <div className="h-8 w-8 rounded-full bg-amber-500 text-black font-black flex items-center justify-center text-sm">3</div>
              <h3 className="font-bold text-[#0A0A0A]">Review, Export & Send</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Tweak any fields if needed, apply one of 20 templates, export as PDF, or share an online payment link.
              </p>
            </div>
          </div>
        </section>

        {/* Realistic Prompt Examples */}
        <section>
          <h2 className="text-2xl font-black text-[#0A0A0A] mb-6">See Real AI Invoice Prompts & Output</h2>
          <div className="space-y-4">
            {examplePrompts.map((ex, idx) => (
              <div key={idx} className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm space-y-3">
                <div className="flex items-start gap-2 text-xs font-mono bg-stone-100 text-stone-800 p-3 rounded-xl">
                  <span className="font-bold text-amber-600">Prompt:</span> "{ex.prompt}"
                </div>
                <div className="flex items-center gap-2 text-xs text-emerald-700 font-semibold pl-1">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                  <span>AI Output: {ex.result}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Benefits */}
        <section>
          <h2 className="text-2xl font-black text-[#0A0A0A] mb-8">Why Use AI Invoice Generation?</h2>
          <div className="grid sm:grid-cols-2 gap-5">
            {[
              { title: "Save 90% of Creation Time", desc: "Spend seconds instead of minutes per invoice. Type once and let AI construct the entire document." },
              { title: "Zero Arithmetic Errors", desc: "No misplaced decimals or manual calculation mistakes on unit rates, discounts, or multi-line totals." },
              { title: "Smart Tax Handling", desc: "Automatically handles GST (CGST/SGST/IGST) calculations or custom tax rates without manual math." },
              { title: "Seamless Multi-Currency", desc: "Specify rates in USD, EUR, GBP, or INR effortlessly for global client billing." },
            ].map((b, i) => (
              <div key={i} className="bg-white rounded-2xl border border-stone-100 p-5 shadow-sm">
                <h3 className="font-bold text-[#0A0A0A] text-sm mb-1">{b.title}</h3>
                <p className="text-xs text-stone-500 leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Related internal links */}
        <section className="border-t border-stone-200 pt-8">
          <h2 className="text-xl font-black text-[#0A0A0A] mb-4">Explore More Tools & Resources</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { to: "/free-invoice-generator", label: "Free Invoice Generator", desc: "Check out what's included in our free tier" },
              { to: "/invoice-generator-online", label: "Online Invoice Maker", desc: "Browser-based invoice creation workflow" },
              { to: "/blog/how-to-create-an-invoice", label: "How to Create an Invoice", desc: "Step-by-step beginner's guide to invoicing" },
              { to: "/blog/gst-invoice-guide", label: "GST Invoice Guide", desc: "Detailed breakdown of Indian GST requirements" },
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
          <h2 className="text-3xl font-black mb-3">Generate Your Invoice with AI Now</h2>
          <p className="text-stone-400 mb-8 max-w-md mx-auto text-sm leading-relaxed">
            Experience the fastest way to invoice clients. Start with 3 free AI generations right away.
          </p>
          <Link
            to="/auth"
            className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-black font-bold px-8 py-3.5 rounded-full text-sm transition-all"
          >
            Try AI Generator Free <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </section>
      </div>
    </PublicPageLayout>
  </>
);

export default AIInvoiceGenerator;
