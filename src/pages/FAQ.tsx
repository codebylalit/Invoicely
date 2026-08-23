import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, ArrowRight } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import PublicPageLayout from "@/components/PublicPageLayout";

const faqs = [
  {
    q: "What is Invoicely?",
    a: "Invoicely is a free online invoice generator for freelancers and small businesses. You can create, download, and email professional invoices in under a minute — 20 templates, tax and discount lines, and a shareable page where your client can pay you.",
  },
  {
    q: "Is Invoicely really free?",
    a: "Yes. The Free plan lets you create and email unlimited invoices, save unlimited clients, and use 3 invoice templates at no cost, forever. For all 20 templates, recurring invoices, and no Invoicely branding, the Pro plan starts at $6/month.",
  },
  {
    q: "Who can use Invoicely?",
    a: "Invoicely is built for freelancers, consultants, agencies, and small business owners who need professional invoices without complex accounting software. If you invoice clients for your work, Invoicely works for you.",
  },
  {
    q: "How long does it take to create an invoice?",
    a: "Under a minute once your business details are saved. Pick a saved client, add your line items, and the subtotal, taxes, discounts, and total calculate as you type. Invoice numbers are issued in sequence automatically.",
  },
  {
    q: "Can I add GST or other taxes to an invoice?",
    a: "Yes. Add as many named tax lines as you need — GST, VAT, sales tax — each with its own rate, and Invoicely works out the amounts and the total. Your GSTIN or VAT number prints on the invoice from your business settings. Invoicely does not split CGST/SGST/IGST for you; add those as separate tax lines if you need them shown separately.",
  },
  {
    q: "Can I download invoices as PDF?",
    a: "Yes. Every invoice can be exported as a print-ready, professional PDF in one click. The PDF is suitable for emailing to clients or filing for your own records.",
  },
  {
    q: "Can my clients pay online?",
    a: "Yes, on every plan. Add your own payment link — Stripe, PayPal, Razorpay, UPI, or any provider — in Settings, and every invoice gets a shareable page with a Pay Online button that sends your client to it. Money goes straight to your account; Invoicely never touches it. Because of that, Invoicely can't detect the payment for you — you mark the invoice paid once your provider confirms it.",
  },
  {
    q: "Can I remove the Invoicely branding from my invoices?",
    a: "Yes. On Pro our branding comes off everywhere your client sees it — the invoice, the PDF, the shared pay page, and the invoice email. They show your logo and business details only. The one thing we can't change is the sending email address, which stays on our verified domain.",
  },
  {
    q: "Do you support recurring invoices?",
    a: "Yes, on the Pro plan. Save a recurring schedule for a retainer client — weekly, monthly, or a custom interval — and reissue that invoice each cycle without rebuilding it.",
  },
  {
    q: "How do I contact support?",
    a: "Email us at support@getinvoicely.online or visit our Contact page. We typically respond within one business day.",
  },
];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": faqs.map(({ q, a }) => ({
    "@type": "Question",
    "name": q,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": a,
    },
  })),
};

const FAQItem = ({ q, a }: { q: string; a: string }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-stone-200 last:border-0">
      <button
        className="w-full flex items-center justify-between py-5 text-left gap-4 group cursor-pointer"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <span className="text-base font-semibold text-[#0A0A0A] group-hover:text-amber-600 transition-colors">
          {q}
        </span>
        <ChevronDown
          className={`h-5 w-5 text-stone-400 flex-shrink-0 transition-transform duration-300 ${
            open ? "rotate-180 text-amber-500" : "group-hover:text-stone-600"
          }`}
          aria-hidden="true"
        />
      </button>
      {open && (
        <div className="pb-5 text-sm text-stone-600 leading-relaxed">
          {a}
        </div>
      )}
    </div>
  );
};

const FAQ = () => (
  <>
    <SEOHead
      title="FAQ — Frequently Asked Questions | Invoicely"
      description="Answers to the most common questions about Invoicely — free plan limits, tax and GST lines, PDF export, email delivery, payment links, and more."
      canonical="https://www.getinvoicely.online/faq"
      structuredData={faqSchema}
    />
    <PublicPageLayout>
      {/* Hero */}
      <section className="bg-white border-b border-stone-100 py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-widest text-amber-600 mb-3">Help Center</p>
          <h1 className="text-4xl sm:text-5xl font-black text-[#0A0A0A] tracking-tight mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-lg text-stone-500">
            Everything you need to know about Invoicely's free invoice generator —
            plans, features, GST, payments, and more.
          </p>
        </div>
      </section>

      {/* FAQ List */}
      <section className="max-w-3xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm px-6 sm:px-8">
          {faqs.map((faq, i) => (
            <FAQItem key={i} q={faq.q} a={faq.a} />
          ))}
        </div>

        {/* Internal links */}
        <div className="mt-10 p-6 bg-amber-50 rounded-2xl border border-amber-100">
          <p className="font-bold text-[#0A0A0A] mb-3">More resources</p>
          <ul className="space-y-2 text-sm text-stone-700">
            <li>
              <Link to="/invoice-generator" className="text-amber-700 hover:underline font-medium">
                → Free online invoice generator
              </Link>
            </li>
            <li>
              <Link to="/how-it-works" className="text-amber-700 hover:underline font-medium">
                → How Invoicely works, step by step
              </Link>
            </li>
            <li>
              <Link to="/blog/how-to-create-an-invoice" className="text-amber-700 hover:underline font-medium">
                → How to create an invoice (step-by-step guide)
              </Link>
            </li>
            <li>
              <Link to="/blog/gst-invoice-guide" className="text-amber-700 hover:underline font-medium">
                → GST invoice guide for India
              </Link>
            </li>
          </ul>
        </div>

        {/* CTA */}
        <div className="mt-8 text-center">
          <p className="text-stone-500 text-sm mb-4">Still have questions? We're happy to help.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/contact-us"
              className="inline-flex items-center justify-center gap-2 border border-stone-300 text-stone-700 font-semibold px-5 py-2.5 rounded-full text-sm hover:bg-stone-50 transition-all"
            >
              Contact Support
            </Link>
            <Link
              to="/auth"
              className="inline-flex items-center justify-center gap-2 bg-[#0A0A0A] text-white font-bold px-5 py-2.5 rounded-full text-sm hover:bg-stone-700 transition-all"
            >
              Get Started Free <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </PublicPageLayout>
  </>
);

export default FAQ;