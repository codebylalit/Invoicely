import { Link } from "react-router-dom";
import { ArrowRight, Calendar, Clock, User } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import PublicPageLayout from "@/components/PublicPageLayout";

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "What Is an Invoice? Definition, Types, and Required Fields",
  description: "Understand the legal definition of an invoice, key types (proforma, recurring, commercial), and how an invoice differs from a receipt.",
  url: "https://www.getinvoicely.online/blog/what-is-an-invoice",
  datePublished: "2025-08-12T00:00:00Z",
  dateModified: "2025-08-12T00:00:00Z",
  author: { "@type": "Organization", name: "Invoicely Team" },
  publisher: { "@type": "Organization", name: "Invoicely" },
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://www.getinvoicely.online" },
    { "@type": "ListItem", position: 2, name: "Blog", item: "https://www.getinvoicely.online/blog" },
    { "@type": "ListItem", position: 3, name: "What Is an Invoice?", item: "https://www.getinvoicely.online/blog/what-is-an-invoice" },
  ],
};

const WhatIsAnInvoice = () => (
  <>
    <SEOHead
      title="What Is an Invoice? Definition, Meaning & Types Explained"
      description="What is an invoice? Learn what an invoice is, why businesses need them, common types of invoices, and how to issue one using an online invoice generator."
      canonical="https://www.getinvoicely.online/blog/what-is-an-invoice"
      ogType="article"
      articlePublishedTime="2025-08-12T00:00:00Z"
      articleModifiedTime="2025-08-12T00:00:00Z"
      structuredData={[articleSchema, breadcrumbSchema]}
    />
    <PublicPageLayout>
      <article className="max-w-3xl mx-auto px-4 py-12">
        <nav aria-label="Breadcrumb" className="text-xs text-stone-400 mb-6 flex items-center gap-1.5">
          <Link to="/" className="hover:text-stone-700">Home</Link>
          <span>›</span>
          <Link to="/blog" className="hover:text-stone-700">Blog</Link>
          <span>›</span>
          <span className="text-stone-600 font-medium">What Is an Invoice?</span>
        </nav>

        <h1 className="text-3xl sm:text-4xl font-black text-[#0A0A0A] tracking-tight mb-4 leading-tight">
          What Is an Invoice? Definition, Types, and Required Fields
        </h1>

        <div className="flex items-center gap-4 text-xs text-stone-400 border-b border-stone-200 pb-6 mb-8">
          <span className="flex items-center gap-1"><User className="h-3.5 w-3.5" /> Invoicely Editorial Team</span>
          <span>·</span>
          <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> August 12, 2025</span>
          <span>·</span>
          <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> 5 min read</span>
        </div>

        <div className="prose prose-stone max-w-none text-stone-700 space-y-6 leading-relaxed text-sm sm:text-base">
          <p className="text-lg text-stone-600 font-normal leading-relaxed">
            An <strong>invoice</strong> is a time-stamped commercial document issued by a seller to a buyer. It itemizes the products or services provided, details agreed prices, specifies payment terms, and explicitly requests payment.
          </p>

          <h2 className="text-2xl font-black text-[#0A0A0A] pt-4">Why Are Invoices Important for Businesses?</h2>
          <p>
            Invoices serve three critical corporate functions:
          </p>
          <ol className="list-decimal pl-6 space-y-2 text-sm">
            <li><strong>Legal Evidence of Obligation:</strong> They act as formal proof of debt owed by the client for fulfilled work.</li>
            <li><strong>Tax & Accounting Compliance:</strong> Tax authorities (such as the IRS or Indian GST department) require verified sales invoices for calculating tax liabilities and deductions.</li>
            <li><strong>Financial Tracking:</strong> Invoices enable business owners to monitor accounts receivable and maintain accurate cash flow projections.</li>
          </ol>

          <h2 className="text-2xl font-black text-[#0A0A0A] pt-4">Common Types of Invoices</h2>
          <div className="space-y-4 my-4">
            <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm">
              <h3 className="font-bold text-[#0A0A0A] text-sm mb-1">1. Standard Commercial Invoice</h3>
              <p className="text-xs text-stone-600">The most common billing document, sent after goods or services are delivered, requesting payment within standard payment terms (e.g. 15 or 30 days).</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm">
              <h3 className="font-bold text-[#0A0A0A] text-sm mb-1">2. Proforma Invoice</h3>
              <p className="text-xs text-stone-600">A preliminary bill sent prior to delivery of goods. It acts as an estimate or quotation outlining expected scope and cost.</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm">
              <h3 className="font-bold text-[#0A0A0A] text-sm mb-1">3. Recurring Invoice</h3>
              <p className="text-xs text-stone-600">Issued at regular intervals (monthly or quarterly) for retainer contracts, web hosting, or subscription services.</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm">
              <h3 className="font-bold text-[#0A0A0A] text-sm mb-1">4. Tax Invoice (GST Invoice)</h3>
              <p className="text-xs text-stone-600">A specialized invoice required for GST-registered entities containing legal tax identifiers, tax breakdown (CGST/SGST/IGST), and HSN/SAC codes.</p>
            </div>
          </div>

          <h2 className="text-2xl font-black text-[#0A0A0A] pt-4">Difference Between Invoice and Receipt</h2>
          <p>
            While many people confuse them, an invoice is a <strong>request for payment</strong> issued <em>before</em> payment is received. A <Link to="/blog/invoice-vs-receipt" className="text-amber-700 font-semibold hover:underline">receipt</Link> is legal <strong>proof of payment</strong> issued <em>after</em> money has been collected.
          </p>

          <h2 className="text-2xl font-black text-[#0A0A0A] pt-4">How to Create an Invoice Quickly</h2>
          <p>
            You can create invoices manually or use an <Link to="/free-invoice-generator" className="text-amber-700 font-semibold hover:underline">online invoice generator</Link> like Invoicely to produce professionally formatted PDFs in under a minute.
          </p>
        </div>

        <div className="my-10 p-6 bg-amber-50 rounded-2xl border border-amber-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-[#0A0A0A] text-base">Ready to issue your first invoice?</h3>
            <p className="text-xs text-stone-600">Create clean, professional PDF invoices in seconds with Invoicely.</p>
          </div>
          <Link to="/auth" className="bg-[#0A0A0A] hover:bg-stone-800 text-white font-bold text-xs px-5 py-3 rounded-full flex-shrink-0 transition-all">
            Get Started Free
          </Link>
        </div>

        <div className="border-t border-stone-200 pt-8 mt-12">
          <h3 className="font-black text-lg text-[#0A0A0A] mb-4">Related Articles</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <Link to="/blog/how-to-create-an-invoice" className="p-4 bg-white rounded-xl border border-stone-200 hover:border-amber-300 transition-all group">
              <p className="font-bold text-sm text-[#0A0A0A] group-hover:text-amber-600">How to Create an Invoice</p>
              <p className="text-xs text-stone-500 mt-1">Step-by-step creation guide.</p>
            </Link>
            <Link to="/blog/invoice-vs-receipt" className="p-4 bg-white rounded-xl border border-stone-200 hover:border-amber-300 transition-all group">
              <p className="font-bold text-sm text-[#0A0A0A] group-hover:text-amber-600">Invoice vs Receipt</p>
              <p className="text-xs text-stone-500 mt-1">Key differences and when to use each.</p>
            </Link>
          </div>
        </div>
      </article>
    </PublicPageLayout>
  </>
);

export default WhatIsAnInvoice;
