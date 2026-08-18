import { Link } from "react-router-dom";
import { Calendar, Clock, User, CheckCircle2 } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import PublicPageLayout from "@/components/PublicPageLayout";

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "Invoice Templates: What to Use and What to Include",
  description: "Choosing the right invoice template sets the tone for your client relationships. Learn what makes a great template and how to customize one.",
  url: "https://www.getinvoicely.online/blog/invoice-template",
  datePublished: "2025-08-10T00:00:00Z",
  dateModified: "2025-08-10T00:00:00Z",
  author: { "@type": "Organization", name: "Invoicely Team" },
  publisher: { "@type": "Organization", name: "Invoicely" },
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://www.getinvoicely.online" },
    { "@type": "ListItem", position: 2, name: "Blog", item: "https://www.getinvoicely.online/blog" },
    { "@type": "ListItem", position: 3, name: "Invoice Templates", item: "https://www.getinvoicely.online/blog/invoice-template" },
  ],
};

const InvoiceTemplate = () => (
  <>
    <SEOHead
      title="Invoice Templates Guide: Choosing & Customizing Invoice Designs"
      description="Learn what elements make a great invoice template. Discover 20+ professional invoice styles for freelancers, agencies, and businesses with Invoicely."
      canonical="https://www.getinvoicely.online/blog/invoice-template"
      ogType="article"
      articlePublishedTime="2025-08-10T00:00:00Z"
      articleModifiedTime="2025-08-10T00:00:00Z"
      structuredData={[articleSchema, breadcrumbSchema]}
    />
    <PublicPageLayout>
      <article className="max-w-3xl mx-auto px-4 py-12">
        <nav aria-label="Breadcrumb" className="text-xs text-stone-400 mb-6 flex items-center gap-1.5">
          <Link to="/" className="hover:text-stone-700">Home</Link>
          <span>›</span>
          <Link to="/blog" className="hover:text-stone-700">Blog</Link>
          <span>›</span>
          <span className="text-stone-600 font-medium">Invoice Templates</span>
        </nav>

        <h1 className="text-3xl sm:text-4xl font-black text-[#0A0A0A] tracking-tight mb-4 leading-tight">
          Invoice Templates: What to Use and What to Include
        </h1>

        <div className="flex items-center gap-4 text-xs text-stone-400 border-b border-stone-200 pb-6 mb-8">
          <span className="flex items-center gap-1"><User className="h-3.5 w-3.5" /> Invoicely Editorial Team</span>
          <span>·</span>
          <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> August 10, 2025</span>
          <span>·</span>
          <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> 5 min read</span>
        </div>

        <div className="prose prose-stone max-w-none text-stone-700 space-y-6 leading-relaxed text-sm sm:text-base">
          <p className="text-lg text-stone-600 font-normal leading-relaxed">
            Your invoice is often the final document a client sees upon project completion. An unorganized, badly aligned invoice signals amateurism, whereas a crisp, modern template reinforces your brand's authority.
          </p>

          <h2 className="text-2xl font-black text-[#0A0A0A] pt-4">What Makes a Great Invoice Template?</h2>
          <p>
            A high-converting, professional invoice template requires three core visual design features:
          </p>

          <div className="space-y-3 my-4">
            <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-stone-900 text-sm">Visual Hierarchy:</strong>
                <p className="text-xs text-stone-600">The total amount due, payment due date, and payment instructions should immediately catch the reader's eye.</p>
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-stone-900 text-sm">Brand Customization:</strong>
                <p className="text-xs text-stone-600">Ability to upload your logo and match corporate brand colors without cluttering line items.</p>
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-stone-900 text-sm">Print & PDF Readiness:</strong>
                <p className="text-xs text-stone-600">Perfect alignment across standard A4 / US Letter PDF page layouts.</p>
              </div>
            </div>
          </div>

          <h2 className="text-2xl font-black text-[#0A0A0A] pt-4">Choosing Templates for Different Industries</h2>
          <p>
            Different business types benefit from specific template layouts:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-sm">
            <li><strong>Freelancer & Minimalist Templates:</strong> Clean typography focusing on hours worked, rates, and quick payment buttons.</li>
            <li><strong>Agency & Enterprise Templates:</strong> Formal designs with space for purchase orders (PO numbers), client tax identifiers, and detailed milestone breakdowns.</li>
            <li><strong>Retail & Service Templates:</strong> Structured grids with quantity, unit cost, discount columns, and tax summary tables.</li>
          </ul>

          <h2 className="text-2xl font-black text-[#0A0A0A] pt-4">Why Pre-Built Generator Templates Beat Manual Word Documents</h2>
          <p>
            Building invoice templates in Word or Google Docs inevitably leads to broken table boundaries and manual math errors. Using an <Link to="/invoice-generator" className="text-amber-700 font-semibold hover:underline">online invoice generator</Link> like Invoicely lets you pick from 20 professionally formatted templates with automatic calculations built in.
          </p>
        </div>

        <div className="my-10 p-6 bg-amber-50 rounded-2xl border border-amber-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-[#0A0A0A] text-base">Explore 20 Professional Invoice Templates</h3>
            <p className="text-xs text-stone-600">Pick your favorite style and export print-ready PDFs in seconds.</p>
          </div>
          <Link to="/auth" className="bg-[#0A0A0A] hover:bg-stone-800 text-white font-bold text-xs px-5 py-3 rounded-full flex-shrink-0 transition-all">
            Try Templates Free
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

export default InvoiceTemplate;
