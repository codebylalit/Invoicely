import { Link } from "react-router-dom";
import { Calendar, Clock, User, CheckCircle2 } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import PublicPageLayout from "@/components/PublicPageLayout";

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "GST Invoice Guide: Requirements, Format & How to Generate One",
  description: "Complete guide to Indian GST invoices: mandatory GSTIN fields, CGST, SGST and IGST rules, HSN/SAC codes, and generating GST-compliant PDFs.",
  url: "https://www.getinvoicely.online/blog/gst-invoice-guide",
  datePublished: "2025-08-02T00:00:00Z",
  dateModified: "2025-08-02T00:00:00Z",
  author: { "@type": "Organization", name: "Invoicely Team" },
  publisher: { "@type": "Organization", name: "Invoicely" },
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://www.getinvoicely.online" },
    { "@type": "ListItem", position: 2, name: "Blog", item: "https://www.getinvoicely.online/blog" },
    { "@type": "ListItem", position: 3, name: "GST Invoice Guide", item: "https://www.getinvoicely.online/blog/gst-invoice-guide" },
  ],
};

const GSTInvoiceGuide = () => (
  <>
    <SEOHead
      title="GST Invoice Guide: Rules, Format & How to Create GST Invoices"
      description="Learn GST invoicing requirements in India: mandatory fields, CGST/SGST vs IGST rules, HSN/SAC codes, and how to put a GST invoice together with Invoicely."
      canonical="https://www.getinvoicely.online/blog/gst-invoice-guide"
      ogType="article"
      articlePublishedTime="2025-08-02T00:00:00Z"
      articleModifiedTime="2025-08-02T00:00:00Z"
      structuredData={[articleSchema, breadcrumbSchema]}
    />
    <PublicPageLayout>
      <article className="max-w-3xl mx-auto px-4 py-12">
        <nav aria-label="Breadcrumb" className="text-xs text-stone-400 mb-6 flex items-center gap-1.5">
          <Link to="/" className="hover:text-stone-700">Home</Link>
          <span>›</span>
          <Link to="/blog" className="hover:text-stone-700">Blog</Link>
          <span>›</span>
          <span className="text-stone-600 font-medium">GST Invoice Guide</span>
        </nav>

        <h1 className="text-3xl sm:text-4xl font-black text-[#0A0A0A] tracking-tight mb-4 leading-tight">
          GST Invoice Guide: Requirements, Format & How to Generate One
        </h1>

        <div className="flex items-center gap-4 text-xs text-stone-400 border-b border-stone-200 pb-6 mb-8">
          <span className="flex items-center gap-1"><User className="h-3.5 w-3.5" /> Invoicely Editorial Team</span>
          <span>·</span>
          <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> August 2, 2025</span>
          <span>·</span>
          <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> 8 min read</span>
        </div>

        <div className="prose prose-stone max-w-none text-stone-700 space-y-6 leading-relaxed text-sm sm:text-base">
          <p className="text-lg text-stone-600 font-normal leading-relaxed">
            If your business or freelance agency is GST-registered in India, issuing a valid <strong>GST Tax Invoice</strong> is mandatory by law. A non-compliant tax invoice can prevent your client from claiming Input Tax Credit (ITC) and result in penalties.
          </p>

          <h2 className="text-2xl font-black text-[#0A0A0A] pt-4">Mandatory Fields on a GST Tax Invoice</h2>
          <p>
            Under GST rules established by the Central Board of Indirect Taxes and Customs (CBIC), a valid GST invoice must contain:
          </p>

          <div className="space-y-3 my-4 bg-stone-50 rounded-2xl p-6 border border-stone-200">
            {[
              "Supplier GSTIN: Your 15-digit Goods and Services Tax Identification Number.",
              "Recipient GSTIN: Client's GSTIN (if registered for B2B transactions).",
              "Invoice Number & Date: Consecutive serial number unique for a financial year.",
              "Place of Supply: State name and state code (determines CGST+SGST vs IGST).",
              "HSN / SAC Codes: Harmonized System of Nomenclature (goods) or Services Accounting Code (services).",
              "Tax Rate & Breakdown: Explicit rates for CGST, SGST, or IGST.",
              "Signature: Digital signature or authorized physical signature.",
            ].map((item, idx) => (
              <div key={idx} className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-1" />
                <span className="text-stone-800 text-xs sm:text-sm font-medium">{item}</span>
              </div>
            ))}
          </div>

          <h2 className="text-2xl font-black text-[#0A0A0A] pt-4">Understanding CGST, SGST, and IGST Rules</h2>
          <p>
            Tax calculation depends on whether the transaction is intra-state (within the same state) or inter-state (between different states):
          </p>
          <ul className="list-disc pl-6 space-y-2 text-sm">
            <li><strong>Intra-State (Same State):</strong> Tax is split equally into <strong>CGST</strong> (Central GST) and <strong>SGST</strong> (State GST). For an 18% tax rate, apply 9% CGST + 9% SGST.</li>
            <li><strong>Inter-State (Different States):</strong> Tax is charged entirely as <strong>IGST</strong> (Integrated GST). For an 18% tax rate, apply 18% IGST.</li>
          </ul>

          <h2 className="text-2xl font-black text-[#0A0A0A] pt-4">How Invoicely Automates GST Invoicing</h2>
          <p>
            Instead of manually computing tax splits, <Link to="/invoice-generator" className="text-amber-700 font-semibold hover:underline">Invoicely's free online invoice generator</Link> handles GST calculations automatically. Specify your tax rate, enter supplier/client GSTINs, and export a fully compliant PDF in seconds.
          </p>
        </div>

        <div className="my-10 p-6 bg-amber-50 rounded-2xl border border-amber-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-[#0A0A0A] text-base">Put your GST invoice together in minutes</h3>
            <p className="text-xs text-stone-600">Add CGST and SGST as their own tax lines, or one IGST line. Invoicely does the maths and the print-ready PDF.</p>
          </div>
          <Link to="/auth" className="bg-[#0A0A0A] hover:bg-stone-800 text-white font-bold text-xs px-5 py-3 rounded-full flex-shrink-0 transition-all">
            Create GST Invoice Free
          </Link>
        </div>

        <div className="border-t border-stone-200 pt-8 mt-12">
          <h3 className="font-black text-lg text-[#0A0A0A] mb-4">Related Articles</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <Link to="/blog/how-to-create-an-invoice" className="p-4 bg-white rounded-xl border border-stone-200 hover:border-amber-300 transition-all group">
              <p className="font-bold text-sm text-[#0A0A0A] group-hover:text-amber-600">How to Create an Invoice</p>
              <p className="text-xs text-stone-500 mt-1">Step-by-step invoice creation guide.</p>
            </Link>
            <Link to="/blog/invoice-for-freelancers" className="p-4 bg-white rounded-xl border border-stone-200 hover:border-amber-300 transition-all group">
              <p className="font-bold text-sm text-[#0A0A0A] group-hover:text-amber-600">Freelancer Invoicing Guide</p>
              <p className="text-xs text-stone-500 mt-1">Tips on terms, rates, and getting paid faster.</p>
            </Link>
          </div>
        </div>
      </article>
    </PublicPageLayout>
  </>
);

export default GSTInvoiceGuide;
