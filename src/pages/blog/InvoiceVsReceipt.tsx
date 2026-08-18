import { Link } from "react-router-dom";
import { Calendar, Clock, User } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import PublicPageLayout from "@/components/PublicPageLayout";

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "Invoice vs Receipt: Key Differences Explained",
  description: "An invoice and a receipt both relate to transactions, but they serve opposite purposes. Learn when to issue an invoice vs a receipt.",
  url: "https://www.getinvoicely.online/blog/invoice-vs-receipt",
  datePublished: "2025-08-08T00:00:00Z",
  dateModified: "2025-08-08T00:00:00Z",
  author: { "@type": "Organization", name: "Invoicely Team" },
  publisher: { "@type": "Organization", name: "Invoicely" },
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://www.getinvoicely.online" },
    { "@type": "ListItem", position: 2, name: "Blog", item: "https://www.getinvoicely.online/blog" },
    { "@type": "ListItem", position: 3, name: "Invoice vs Receipt", item: "https://www.getinvoicely.online/blog/invoice-vs-receipt" },
  ],
};

const InvoiceVsReceipt = () => (
  <>
    <SEOHead
      title="Invoice vs Receipt: Key Differences & When to Use Each"
      description="What is the difference between an invoice and a receipt? Understand the timing, legal purposes, required details, and accounting roles of both documents."
      canonical="https://www.getinvoicely.online/blog/invoice-vs-receipt"
      ogType="article"
      articlePublishedTime="2025-08-08T00:00:00Z"
      articleModifiedTime="2025-08-08T00:00:00Z"
      structuredData={[articleSchema, breadcrumbSchema]}
    />
    <PublicPageLayout>
      <article className="max-w-3xl mx-auto px-4 py-12">
        <nav aria-label="Breadcrumb" className="text-xs text-stone-400 mb-6 flex items-center gap-1.5">
          <Link to="/" className="hover:text-stone-700">Home</Link>
          <span>›</span>
          <Link to="/blog" className="hover:text-stone-700">Blog</Link>
          <span>›</span>
          <span className="text-stone-600 font-medium">Invoice vs Receipt</span>
        </nav>

        <h1 className="text-3xl sm:text-4xl font-black text-[#0A0A0A] tracking-tight mb-4 leading-tight">
          Invoice vs Receipt: Key Differences Explained
        </h1>

        <div className="flex items-center gap-4 text-xs text-stone-400 border-b border-stone-200 pb-6 mb-8">
          <span className="flex items-center gap-1"><User className="h-3.5 w-3.5" /> Invoicely Editorial Team</span>
          <span>·</span>
          <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> August 8, 2025</span>
          <span>·</span>
          <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> 4 min read</span>
        </div>

        <div className="prose prose-stone max-w-none text-stone-700 space-y-6 leading-relaxed text-sm sm:text-base">
          <p className="text-lg text-stone-600 font-normal leading-relaxed">
            Although both invoices and receipts are financial records documenting a transaction between seller and buyer, they represent completely different stages of the payment process.
          </p>

          <h2 className="text-2xl font-black text-[#0A0A0A] pt-4">Side-by-Side Comparison Table</h2>

          <div className="overflow-x-auto my-6">
            <table className="w-full text-xs sm:text-sm border-collapse bg-white rounded-xl border border-stone-200 shadow-sm">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-200 text-left">
                  <th className="py-3 px-4 font-bold text-stone-800">Feature</th>
                  <th className="py-3 px-4 font-bold text-amber-700">Invoice</th>
                  <th className="py-3 px-4 font-bold text-emerald-700">Receipt</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Timing", "Issued BEFORE payment", "Issued AFTER payment"],
                  ["Primary Goal", "Request payment for work/goods", "Confirm payment was received"],
                  ["Issued By", "Seller / Service Provider", "Seller / Business"],
                  ["Key Info", "Due date, payment terms, balance", "Payment date, payment method, zero balance"],
                  ["Accounting", "Records Accounts Receivable", "Records Cash / Revenue Realization"],
                ].map(([feat, inv, rec], idx) => (
                  <tr key={idx} className="border-b border-stone-100 last:border-0">
                    <td className="py-3 px-4 font-semibold text-stone-900">{feat}</td>
                    <td className="py-3 px-4 text-stone-600">{inv}</td>
                    <td className="py-3 px-4 text-stone-600">{rec}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h2 className="text-2xl font-black text-[#0A0A0A] pt-4">When to Issue an Invoice</h2>
          <p>
            Issue an invoice as soon as project milestones are met or goods are shipped. It acts as an official payment demand. Using a tool like an <Link to="/invoice-generator-online" className="text-amber-700 font-semibold hover:underline">online invoice generator</Link> ensures that your payment terms, bank accounts, or digital checkout links are clear to the client.
          </p>

          <h2 className="text-2xl font-black text-[#0A0A0A] pt-4">When to Issue a Receipt</h2>
          <p>
            Once a client pays your invoice via bank transfer, credit card, or UPI, you issue a receipt. The receipt acknowledges full or partial payment, showing a remaining balance of zero.
          </p>
        </div>

        <div className="my-10 p-6 bg-amber-50 rounded-2xl border border-amber-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-[#0A0A0A] text-base">Create and track invoices effortlessly</h3>
            <p className="text-xs text-stone-600">Invoicely lets you track payment status and automatically confirm payments.</p>
          </div>
          <Link to="/auth" className="bg-[#0A0A0A] hover:bg-stone-800 text-white font-bold text-xs px-5 py-3 rounded-full flex-shrink-0 transition-all">
            Get Started Free
          </Link>
        </div>

        <div className="border-t border-stone-200 pt-8 mt-12">
          <h3 className="font-black text-lg text-[#0A0A0A] mb-4">Related Articles</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <Link to="/blog/what-is-an-invoice" className="p-4 bg-white rounded-xl border border-stone-200 hover:border-amber-300 transition-all group">
              <p className="font-bold text-sm text-[#0A0A0A] group-hover:text-amber-600">What Is an Invoice?</p>
              <p className="text-xs text-stone-500 mt-1">Definition and core concepts.</p>
            </Link>
            <Link to="/blog/how-to-create-an-invoice" className="p-4 bg-white rounded-xl border border-stone-200 hover:border-amber-300 transition-all group">
              <p className="font-bold text-sm text-[#0A0A0A] group-hover:text-amber-600">How to Create an Invoice</p>
              <p className="text-xs text-stone-500 mt-1">Step-by-step creation guide.</p>
            </Link>
          </div>
        </div>
      </article>
    </PublicPageLayout>
  </>
);

export default InvoiceVsReceipt;
