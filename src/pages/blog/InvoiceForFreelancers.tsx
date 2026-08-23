import { Link } from "react-router-dom";
import { Calendar, Clock, User, CheckCircle2 } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import PublicPageLayout from "@/components/PublicPageLayout";

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "How to Invoice as a Freelancer: Templates, Terms & Tips",
  description: "Learn how freelancers can set clear payment terms, bill hourly or fixed-rate projects, handle GST, and avoid late payments.",
  url: "https://www.getinvoicely.online/blog/invoice-for-freelancers",
  datePublished: "2025-08-05T00:00:00Z",
  dateModified: "2025-08-05T00:00:00Z",
  author: { "@type": "Organization", name: "Invoicely Team" },
  publisher: { "@type": "Organization", name: "Invoicely" },
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://www.getinvoicely.online" },
    { "@type": "ListItem", position: 2, name: "Blog", item: "https://www.getinvoicely.online/blog" },
    { "@type": "ListItem", position: 3, name: "Freelancer Invoicing", item: "https://www.getinvoicely.online/blog/invoice-for-freelancers" },
  ],
};

const InvoiceForFreelancers = () => (
  <>
    <SEOHead
      title="How to Invoice as a Freelancer: Complete Guide & Free Generator"
      description="Freelancer invoicing guide: how to set payment terms, charge deposits, handle GST/taxes, and get paid sooner by sending a payment link with the invoice."
      canonical="https://www.getinvoicely.online/blog/invoice-for-freelancers"
      ogType="article"
      articlePublishedTime="2025-08-05T00:00:00Z"
      articleModifiedTime="2025-08-05T00:00:00Z"
      structuredData={[articleSchema, breadcrumbSchema]}
    />
    <PublicPageLayout>
      <article className="max-w-3xl mx-auto px-4 py-12">
        <nav aria-label="Breadcrumb" className="text-xs text-stone-400 mb-6 flex items-center gap-1.5">
          <Link to="/" className="hover:text-stone-700">Home</Link>
          <span>›</span>
          <Link to="/blog" className="hover:text-stone-700">Blog</Link>
          <span>›</span>
          <span className="text-stone-600 font-medium">Freelancer Invoicing Guide</span>
        </nav>

        <h1 className="text-3xl sm:text-4xl font-black text-[#0A0A0A] tracking-tight mb-4 leading-tight">
          How to Invoice as a Freelancer: Templates, Terms & Tips
        </h1>

        <div className="flex items-center gap-4 text-xs text-stone-400 border-b border-stone-200 pb-6 mb-8">
          <span className="flex items-center gap-1"><User className="h-3.5 w-3.5" /> Invoicely Editorial Team</span>
          <span>·</span>
          <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> August 5, 2025</span>
          <span>·</span>
          <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> 7 min read</span>
        </div>

        <div className="prose prose-stone max-w-none text-stone-700 space-y-6 leading-relaxed text-sm sm:text-base">
          <p className="text-lg text-stone-600 font-normal leading-relaxed">
            As a freelancer, your income depends on getting paid on time. Yet many freelancers struggle with late client payments, awkward payment reminders, and confusing tax rules.
          </p>

          <h2 className="text-2xl font-black text-[#0A0A0A] pt-4">5 Golden Rules for Freelance Invoicing</h2>

          <div className="space-y-3 my-4">
            <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-stone-900 text-sm">1. Always Request an Upfront Deposit:</strong>
                <p className="text-xs text-stone-600">For projects over $500 / ₹40,000, ask for a 25% to 50% deposit before beginning work.</p>
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-stone-900 text-sm">2. Shorten Payment Terms:</strong>
                <p className="text-xs text-stone-600">Instead of Net 30, state "Net 7" or "Net 14" to accelerate cash flow.</p>
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-stone-900 text-sm">3. Include Direct Online Payment Links:</strong>
                <p className="text-xs text-stone-600">Allowing clients to click and pay via UPI, Credit Card, or Razorpay reduces delays dramatically.</p>
              </div>
            </div>
          </div>

          <h2 className="text-2xl font-black text-[#0A0A0A] pt-4">Hourly vs. Fixed-Rate Invoicing</h2>
          <p>
            For hourly projects, attach a concise breakdown of hours worked per day or feature. For fixed-rate projects, clearly specify milestone completion percentages so the client understands what deliverable they are funding.
          </p>

          <h2 className="text-2xl font-black text-[#0A0A0A] pt-4">Handling Taxes (GST / International Rates)</h2>
          <p>
            If you are invoicing local clients in India, ensure you calculate <Link to="/blog/gst-invoice-guide" className="text-amber-700 font-semibold hover:underline">GST (CGST/SGST or IGST)</Link>. If billing foreign clients in USD or EUR, use multi-currency invoicing tools.
          </p>

          <h2 className="text-2xl font-black text-[#0A0A0A] pt-4">Automate Your Freelance Invoicing</h2>
          <p>
            Instead of spending hours in Word or Excel, use a <Link to="/free-invoice-generator" className="text-amber-700 font-semibold hover:underline">free invoice generator for freelancers</Link> like Invoicely to build clean, professional PDFs in seconds and email them to your client with the PDF attached.
          </p>
        </div>

        <div className="my-10 p-6 bg-amber-50 rounded-2xl border border-amber-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-[#0A0A0A] text-base">Invoicing as a freelancer doesn't have to be hard</h3>
            <p className="text-xs text-stone-600">Create clean, professional PDF invoices free with Invoicely.</p>
          </div>
          <Link to="/auth" className="bg-[#0A0A0A] hover:bg-stone-800 text-white font-bold text-xs px-5 py-3 rounded-full flex-shrink-0 transition-all">
            Start Free
          </Link>
        </div>

        <div className="border-t border-stone-200 pt-8 mt-12">
          <h3 className="font-black text-lg text-[#0A0A0A] mb-4">Related Articles</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <Link to="/blog/gst-invoice-guide" className="p-4 bg-white rounded-xl border border-stone-200 hover:border-amber-300 transition-all group">
              <p className="font-bold text-sm text-[#0A0A0A] group-hover:text-amber-600">GST Invoice Guide</p>
              <p className="text-xs text-stone-500 mt-1">Requirements for Indian GST compliance.</p>
            </Link>
            <Link to="/blog/how-to-create-an-invoice" className="p-4 bg-white rounded-xl border border-stone-200 hover:border-amber-300 transition-all group">
              <p className="font-bold text-sm text-[#0A0A0A] group-hover:text-amber-600">How to Create an Invoice</p>
              <p className="text-xs text-stone-500 mt-1">Step-by-step invoice creation guide.</p>
            </Link>
          </div>
        </div>
      </article>
    </PublicPageLayout>
  </>
);

export default InvoiceForFreelancers;
