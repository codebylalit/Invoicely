import { Link } from "react-router-dom";
import { ArrowRight, FileText, Zap, Users } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import PublicPageLayout from "@/components/PublicPageLayout";

const About = () => (
  <>
    <SEOHead
      title="About Invoicely — Free Invoice Generator for Freelancers"
      description="Invoicely was built to make invoicing simple, fast, and accessible for freelancers and small businesses. Learn about our mission, our team, and why we built an AI-powered invoice generator."
      canonical="https://www.getinvoicely.online/about"
    />
    <PublicPageLayout>
      {/* Hero */}
      <section className="bg-white border-b border-stone-100 py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-widest text-amber-600 mb-3">About Us</p>
          <h1 className="text-4xl sm:text-5xl font-black text-[#0A0A0A] tracking-tight mb-4">
            Invoicing Should Be Simple
          </h1>
          <p className="text-lg text-stone-500 leading-relaxed">
            Invoicely is a free online invoice generator built for freelancers, consultants,
            and small business owners who want to get paid professionally — without the complexity
            of full accounting software.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="max-w-3xl mx-auto px-4 py-12 space-y-8">
        <div>
          <h2 className="text-2xl font-black text-[#0A0A0A] mb-4">Our Mission</h2>
          <p className="text-stone-600 leading-relaxed mb-4">
            We started Invoicely because creating and sending a professional invoice shouldn't
            take 30 minutes in a spreadsheet. Freelancers and small business owners spend too much
            time on admin work that adds no value to their clients.
          </p>
          <p className="text-stone-600 leading-relaxed">
            Our mission is simple: make it possible to go from "I just finished a project" to
            "invoice sent" in under 60 seconds. With AI-powered generation, 20 professional templates,
            automatic GST calculation, and online payment links, Invoicely removes every unnecessary step.
          </p>
        </div>

        {/* Three pillars */}
        <div className="grid sm:grid-cols-3 gap-5">
          {[
            {
              icon: Zap,
              title: "Speed",
              desc: "A good invoice tool should be faster than the alternative. Our AI generates a complete, itemised invoice from a plain-English description.",
            },
            {
              icon: FileText,
              title: "Professionalism",
              desc: "20 clean, professionally designed templates that make any freelancer or business look polished to their clients.",
            },
            {
              icon: Users,
              title: "Accessibility",
              desc: "Professional invoicing tools shouldn't require expensive subscriptions. Our free plan lets anyone get started at no cost.",
            },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-white rounded-2xl border border-stone-100 p-5 shadow-sm">
              <div className="h-10 w-10 rounded-xl bg-amber-50 flex items-center justify-center mb-3">
                <Icon className="h-5 w-5 text-amber-600" aria-hidden="true" />
              </div>
              <h3 className="font-bold text-[#0A0A0A] mb-2">{title}</h3>
              <p className="text-sm text-stone-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        {/* What we build */}
        <div>
          <h2 className="text-2xl font-black text-[#0A0A0A] mb-4">What Invoicely Does</h2>
          <ul className="space-y-3 text-stone-600">
            {[
              "Free online invoice generator — create a professional invoice in under 60 seconds",
              "AI invoice generation — describe your work, get a complete invoice instantly",
              "20 professional invoice templates for freelancers, agencies, and businesses",
              "GST-compliant invoices with automatic CGST, SGST, and IGST calculation",
              "One-click PDF export — every invoice is print-ready",
              "Online payment links — clients pay via UPI, Razorpay, or card",
              "Client management — store client details and track payment history",
              "Recurring invoices for regular clients (Pro plan)",
            ].map((item) => (
              <li key={item} className="flex items-start gap-3">
                <span className="text-amber-500 mt-0.5 flex-shrink-0">✓</span>
                <span className="text-sm">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div className="bg-stone-50 rounded-2xl border border-stone-100 p-6">
          <h2 className="text-xl font-black text-[#0A0A0A] mb-2">Get in Touch</h2>
          <p className="text-stone-600 text-sm mb-4">
            We're a small team passionate about helping freelancers and business owners get paid
            faster. If you have feedback, a feature idea, or a question, we'd genuinely love to
            hear from you.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href="mailto:support@getinvoicely.online"
              className="text-amber-700 font-semibold text-sm hover:underline"
            >
              support@getinvoicely.online
            </a>
            <span className="hidden sm:block text-stone-300">·</span>
            <Link to="/contact-us" className="text-amber-700 font-semibold text-sm hover:underline">
              Contact page
            </Link>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center pt-4">
          <p className="text-stone-500 text-sm mb-4">
            Want to see what Invoicely can do for your invoicing?
          </p>
          <Link
            to="/auth"
            className="inline-flex items-center gap-2 bg-[#0A0A0A] text-white font-bold px-6 py-3 rounded-full text-sm hover:bg-stone-700 transition-all"
          >
            Try Invoicely Free <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </PublicPageLayout>
  </>
);

export default About;