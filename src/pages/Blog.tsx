import { Link } from "react-router-dom";
import { ArrowRight, Calendar, Clock } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import PublicPageLayout from "@/components/PublicPageLayout";

// ── Blog index data ────────────────────────────────────────────────────────────
const posts = [
  {
    slug: "how-to-create-an-invoice",
    title: "How to Create an Invoice: A Complete Step-by-Step Guide",
    excerpt:
      "Learn exactly what to include on a professional invoice, how to number them correctly, and how to send them to get paid on time.",
    date: "2025-08-15",
    readTime: "6 min read",
    category: "Invoicing Basics",
  },
  {
    slug: "what-is-an-invoice",
    title: "What Is an Invoice? Definition, Types, and Required Fields",
    excerpt:
      "An invoice is a legal document requesting payment for goods or services delivered. Understand the difference between an invoice, a receipt, and a quote.",
    date: "2025-08-12",
    readTime: "5 min read",
    category: "Invoicing Basics",
  },
  {
    slug: "invoice-template",
    title: "Invoice Templates: What to Use and What to Include",
    excerpt:
      "Choosing the right invoice template sets the tone for how clients perceive your business. Here's what makes a good template and how to customise it.",
    date: "2025-08-10",
    readTime: "5 min read",
    category: "Templates",
  },
  {
    slug: "invoice-vs-receipt",
    title: "Invoice vs Receipt: Key Differences Explained",
    excerpt:
      "An invoice and a receipt both relate to a transaction, but they serve opposite purposes. Here's how to tell them apart and when to use each one.",
    date: "2025-08-08",
    readTime: "4 min read",
    category: "Invoicing Basics",
  },
  {
    slug: "invoice-for-freelancers",
    title: "How to Invoice as a Freelancer: Templates, Terms & Tips",
    excerpt:
      "Freelance invoicing can be confusing. This guide covers payment terms, what to charge, how to handle GST, and how to get paid faster.",
    date: "2025-08-05",
    readTime: "7 min read",
    category: "Freelancing",
  },
  {
    slug: "gst-invoice-guide",
    title: "GST Invoice Guide: Requirements, Format & How to Generate One",
    excerpt:
      "If you're GST-registered in India, your invoices must include specific fields. This guide explains CGST, SGST and IGST, and how to set them up as tax lines in Invoicely.",
    date: "2025-08-02",
    readTime: "8 min read",
    category: "Tax & Compliance",
  },
  {
    slug: "how-to-generate-invoice-pdf",
    title: "How to Generate an Invoice PDF Online (in Under 30 Seconds)",
    excerpt:
      "A PDF invoice is professional, tamper-proof, and universally readable. Here's why PDFs are the standard format and how to generate one instantly with Invoicely.",
    date: "2025-07-29",
    readTime: "4 min read",
    category: "How-To",
  },
];

const categoryColors: Record<string, string> = {
  "Invoicing Basics": "bg-blue-50 text-blue-700",
  "Templates": "bg-purple-50 text-purple-700",
  "Freelancing": "bg-amber-50 text-amber-700",
  "Tax & Compliance": "bg-emerald-50 text-emerald-700",
  "How-To": "bg-rose-50 text-rose-700",
};

const blogSchema = {
  "@context": "https://schema.org",
  "@type": "Blog",
  "name": "Invoicely Blog — Invoicing Guides & Resources",
  "url": "https://www.getinvoicely.online/blog",
  "description": "Practical guides on invoicing, freelancing, GST compliance, and getting paid faster.",
  "publisher": {
    "@type": "Organization",
    "name": "Invoicely",
    "url": "https://www.getinvoicely.online"
  }
};

const Blog = () => (
  <>
    <SEOHead
      title="Invoicing Blog — Guides, Templates & Tips | Invoicely"
      description="Practical guides on how to create invoices, invoice templates, GST compliance, freelancer invoicing, and getting paid faster. Written for freelancers and small businesses."
      canonical="https://www.getinvoicely.online/blog"
      structuredData={blogSchema}
    />
    <PublicPageLayout>
      {/* Hero */}
      <section className="bg-white border-b border-stone-100 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-widest text-amber-600 mb-3">Resources</p>
          <h1 className="text-4xl sm:text-5xl font-black text-[#0A0A0A] tracking-tight mb-4">
            Invoicing Guides & Resources
          </h1>
          <p className="text-lg text-stone-500 max-w-2xl">
            Practical, no-fluff articles to help you invoice professionally, stay compliant,
            and get paid faster — whether you're a freelancer or running a small business.
          </p>
        </div>
      </section>

      {/* Article Grid */}
      <section className="max-w-4xl mx-auto px-4 py-12">
        <div className="grid gap-6 sm:grid-cols-2">
          {posts.map((post) => (
            <Link
              key={post.slug}
              to={`/blog/${post.slug}`}
              className="group bg-white rounded-2xl border border-stone-100 shadow-sm hover:shadow-md hover:border-stone-200 transition-all p-6 flex flex-col"
            >
              <div className="flex items-center justify-between mb-4">
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${categoryColors[post.category] ?? "bg-stone-100 text-stone-600"}`}>
                  {post.category}
                </span>
                <span className="flex items-center gap-1 text-xs text-stone-400">
                  <Clock className="h-3 w-3" aria-hidden="true" />
                  {post.readTime}
                </span>
              </div>

              <h2 className="text-base font-bold text-[#0A0A0A] group-hover:text-amber-600 transition-colors mb-2 leading-snug">
                {post.title}
              </h2>
              <p className="text-sm text-stone-500 leading-relaxed flex-1 mb-4">
                {post.excerpt}
              </p>

              <div className="flex items-center justify-between text-xs text-stone-400">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" aria-hidden="true" />
                  {new Date(post.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </span>
                <span className="flex items-center gap-1 text-amber-600 font-semibold group-hover:gap-2 transition-all">
                  Read article <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-4 pb-16">
        <div className="bg-[#0A0A0A] rounded-2xl p-8 text-center text-white">
          <h2 className="text-2xl font-black mb-2">Ready to create your first invoice?</h2>
          <p className="text-stone-400 mb-6 text-sm">
            Use Invoicely's free{" "}
            <Link to="/invoice-generator" className="text-amber-400 hover:underline">online invoice generator</Link>
            {" "}— no signup required to explore.
          </p>
          <Link
            to="/auth"
            className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-black font-bold px-6 py-3 rounded-full transition-all text-sm"
          >
            Get Started Free <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </PublicPageLayout>
  </>
);

export default Blog;