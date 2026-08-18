import { Link } from "react-router-dom";
import { ArrowRight, Calendar, Clock, CheckCircle2, User, FileText, ArrowUpRight } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import PublicPageLayout from "@/components/PublicPageLayout";

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "How to Create an Invoice: A Complete Step-by-Step Guide",
  description: "Learn what to include on a professional invoice, how to number them correctly, and how to send them to get paid on time.",
  url: "https://www.getinvoicely.online/blog/how-to-create-an-invoice",
  datePublished: "2025-08-15T00:00:00Z",
  dateModified: "2025-08-15T00:00:00Z",
  author: {
    "@type": "Organization",
    name: "Invoicely Team",
    url: "https://www.getinvoicely.online",
  },
  publisher: {
    "@type": "Organization",
    name: "Invoicely",
    url: "https://www.getinvoicely.online",
  },
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://www.getinvoicely.online" },
    { "@type": "ListItem", position: 2, name: "Blog", item: "https://www.getinvoicely.online/blog" },
    { "@type": "ListItem", position: 3, name: "How to Create an Invoice", item: "https://www.getinvoicely.online/blog/how-to-create-an-invoice" },
  ],
};

const HowToCreateAnInvoice = () => (
  <>
    <SEOHead
      title="How to Create an Invoice: A Step-by-Step Guide for 2026"
      description="Learn how to create professional invoices that get paid faster. Step-by-step breakdown of required fields, invoice numbering, payment terms, and PDF export."
      canonical="https://www.getinvoicely.online/blog/how-to-create-an-invoice"
      ogType="article"
      articlePublishedTime="2025-08-15T00:00:00Z"
      articleModifiedTime="2025-08-15T00:00:00Z"
      structuredData={[articleSchema, breadcrumbSchema]}
    />
    <PublicPageLayout>
      <article className="max-w-3xl mx-auto px-4 py-12">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="text-xs text-stone-400 mb-6 flex items-center gap-1.5">
          <Link to="/" className="hover:text-stone-700">Home</Link>
          <span>›</span>
          <Link to="/blog" className="hover:text-stone-700">Blog</Link>
          <span>›</span>
          <span className="text-stone-600 font-medium">How to Create an Invoice</span>
        </nav>

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl font-black text-[#0A0A0A] tracking-tight mb-4 leading-tight">
          How to Create an Invoice: A Complete Step-by-Step Guide
        </h1>

        {/* Meta */}
        <div className="flex items-center gap-4 text-xs text-stone-400 border-b border-stone-200 pb-6 mb-8">
          <span className="flex items-center gap-1"><User className="h-3.5 w-3.5" /> Invoicely Editorial Team</span>
          <span>·</span>
          <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> August 15, 2025</span>
          <span>·</span>
          <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> 6 min read</span>
        </div>

        {/* Content */}
        <div className="prose prose-stone max-w-none text-stone-700 space-y-6 leading-relaxed text-sm sm:text-base">
          <p className="text-lg text-stone-600 font-normal leading-relaxed">
            Creating a professional invoice is one of the most vital tasks for freelancers, contractors, and business owners. A clear, accurate invoice ensures you get paid promptly, prevents disputes, and maintains an immaculate paper trail for accounting and taxes.
          </p>

          <h2 className="text-2xl font-black text-[#0A0A0A] pt-4">Essential Elements Every Invoice Must Include</h2>
          <p>
            Regardless of whether you use an <Link to="/invoice-generator" className="text-amber-700 font-semibold hover:underline">online invoice generator</Link> or design your own template, every valid commercial invoice needs 8 core components:
          </p>

          <div className="space-y-3 my-4 bg-stone-50 rounded-2xl p-6 border border-stone-200">
            {[
              "Header & Logo: Clearly identify your business name and brand.",
              "Your Contact Details: Full name/business name, address, email, phone number, and tax registration (e.g., GSTIN).",
              "Client Details: Client name, company name, billing address, and contact email.",
              "Unique Invoice Number: Sequential identifier (e.g., INV-2026-001) for accounting tracking.",
              "Key Dates: Invoice issue date and the specific payment due date (e.g., Net 15 or Net 30).",
              "Itemized Goods / Services: Description of work performed, quantity/hours, rate, and line totals.",
              "Taxes & Total Due: Applicable tax rates (GST, CGST, SGST, IGST, VAT), discounts, and final total balance.",
              "Payment Details: How to pay—bank transfer details, PayPal email, or a live payment link.",
            ].map((item, idx) => (
              <div key={idx} className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-amber-500 flex-shrink-0 mt-1" />
                <span className="text-stone-800 text-xs sm:text-sm font-medium">{item}</span>
              </div>
            ))}
          </div>

          <h2 className="text-2xl font-black text-[#0A0A0A] pt-4">Step 1: Header and Business Contact Info</h2>
          <p>
            Position your company logo in the top left or top right corner. Include your business legal name, contact email, and telephone. If you are registered under GST or VAT, display your GSTIN or Tax ID right under your business address.
          </p>

          <h2 className="text-2xl font-black text-[#0A0A0A] pt-4">Step 2: Add Client Information</h2>
          <p>
            Address the invoice directly to the primary accounting or project contact at your client's firm. Always verify the correct corporate billing address to prevent administrative delays when accounts payable processes your document.
          </p>

          <h2 className="text-2xl font-black text-[#0A0A0A] pt-4">Step 3: Assign Invoice Number & Dates</h2>
          <p>
            Never repeat invoice numbers. Maintain a consistent sequential format like <code>INV-001</code> or year-prefixed <code>2026-042</code>. Clearly mark the <strong>Issue Date</strong> and <strong>Due Date</strong>. Common billing cycles include:
          </p>
          <ul className="list-disc pl-6 space-y-1 text-sm">
            <li><strong>Due Upon Receipt:</strong> Payment is expected immediately when delivered.</li>
            <li><strong>Net 15 / Net 30:</strong> Payment is due 15 or 30 days after the invoice issue date.</li>
          </ul>

          <h2 className="text-2xl font-black text-[#0A0A0A] pt-4">Step 4: Itemize Services Rendered</h2>
          <p>
            Break down your project into distinct line items instead of listing a vague single sum. For hourly projects, state the total hours and hourly rate. For fixed-rate projects, outline milestone deliverables clearly.
          </p>

          <h2 className="text-2xl font-black text-[#0A0A0A] pt-4">Step 5: Compute Subtotal, Taxes & Total</h2>
          <p>
            Calculate the subtotal of all line items. Add relevant sales tax or GST (CGST/SGST for intra-state or IGST for inter-state in India). Display discounts clearly before calculating the final net payable sum.
          </p>

          <h2 className="text-2xl font-black text-[#0A0A0A] pt-4">Step 6: Choose Format & Send</h2>
          <p>
            Always send invoices as PDF documents rather than editable Word or Excel files. A PDF preserves formatting on mobile screens and computers. With an <Link to="/invoice-generator-online" className="text-amber-700 font-semibold hover:underline">online invoice maker</Link> like Invoicely, you can export a PDF or share a live online payment link instantly.
          </p>
        </div>

        {/* Callout box */}
        <div className="my-10 p-6 bg-amber-50 rounded-2xl border border-amber-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-[#0A0A0A] text-base">Want to generate an invoice in under 30 seconds?</h3>
            <p className="text-xs text-stone-600">Try Invoicely's free invoice generator or use AI to draft your invoice automatically.</p>
          </div>
          <Link
            to="/auth"
            className="bg-[#0A0A0A] hover:bg-stone-800 text-white font-bold text-xs px-5 py-3 rounded-full flex-shrink-0 transition-all"
          >
            Create Invoice Free
          </Link>
        </div>

        {/* Related Articles */}
        <div className="border-t border-stone-200 pt-8 mt-12">
          <h3 className="font-black text-lg text-[#0A0A0A] mb-4">Related Articles</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <Link to="/blog/what-is-an-invoice" className="p-4 bg-white rounded-xl border border-stone-200 hover:border-amber-300 transition-all group">
              <p className="font-bold text-sm text-[#0A0A0A] group-hover:text-amber-600">What Is an Invoice?</p>
              <p className="text-xs text-stone-500 mt-1">Definition, types, and legal requirements explained.</p>
            </Link>
            <Link to="/blog/invoice-template" className="p-4 bg-white rounded-xl border border-stone-200 hover:border-amber-300 transition-all group">
              <p className="font-bold text-sm text-[#0A0A0A] group-hover:text-amber-600">Invoice Templates Guide</p>
              <p className="text-xs text-stone-500 mt-1">How to select and customize invoice layouts.</p>
            </Link>
          </div>
        </div>
      </article>
    </PublicPageLayout>
  </>
);

export default HowToCreateAnInvoice;
