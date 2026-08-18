import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, FileText, Sparkles } from "lucide-react";
import Logo from "@/components/Logo";

interface PublicPageLayoutProps {
  children: React.ReactNode;
}

/**
 * Shared layout for SEO landing pages and blog articles.
 * Provides a consistent header + footer without the full Landing.tsx complexity.
 */
const PublicPageLayout = ({ children }: PublicPageLayoutProps) => {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        backgroundColor: "#FAFAF9",
        color: "#0A0A0A",
        fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
      }}
    >
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-stone-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <Logo href="/" size="sm" />

          <nav className="hidden md:flex items-center gap-1 text-sm font-semibold text-stone-500">
            <Link
              to="/invoice-generator"
              className="px-3 py-1.5 rounded-full hover:bg-stone-100 hover:text-stone-900 transition-all whitespace-nowrap"
            >
              Invoice Generator
            </Link>
            <Link
              to="/ai-invoice-generator"
              className="px-3 py-1.5 rounded-full hover:bg-stone-100 hover:text-stone-900 transition-all whitespace-nowrap"
            >
              AI Generator
            </Link>
            <Link
              to="/free-invoice-generator"
              className="px-3 py-1.5 rounded-full hover:bg-stone-100 hover:text-stone-900 transition-all whitespace-nowrap"
            >
              Free Plan
            </Link>
            <Link
              to="/blog"
              className="px-3 py-1.5 rounded-full hover:bg-stone-100 hover:text-stone-900 transition-all whitespace-nowrap"
            >
              Blog
            </Link>
          </nav>

          <button
            onClick={() => navigate("/auth")}
            className="flex items-center gap-1.5 bg-[#0A0A0A] hover:bg-stone-700 text-white font-bold text-sm px-4 py-2 rounded-full shadow-sm hover:shadow-md transition-all group"
          >
            Get Started Free
            <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
          </button>
        </div>
      </header>

      {/* ── Main Content ─────────────────────────────────────────────────── */}
      <main className="flex-1">{children}</main>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer className="bg-[#0A0A0A] text-white mt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">

            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <div className="mb-3">
                <Logo href="/" size="sm" textColor="text-white" />
              </div>
              <p className="text-stone-400 text-sm leading-relaxed">
                Free online invoice generator for freelancers and small businesses.
              </p>
            </div>


            {/* Product */}
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-3">Product</p>
              <ul className="space-y-2 text-sm text-stone-400">
                <li><Link to="/invoice-generator" className="hover:text-white transition-colors">Invoice Generator</Link></li>
                <li><Link to="/ai-invoice-generator" className="hover:text-white transition-colors">AI Invoice Generator</Link></li>
                <li><Link to="/free-invoice-generator" className="hover:text-white transition-colors">Free Invoice Generator</Link></li>
                <li><Link to="/invoice-generator-online" className="hover:text-white transition-colors">Online Invoice Maker</Link></li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-3">Resources</p>
              <ul className="space-y-2 text-sm text-stone-400">
                <li><Link to="/blog" className="hover:text-white transition-colors">Blog</Link></li>
                <li><Link to="/blog/how-to-create-an-invoice" className="hover:text-white transition-colors">How to Create an Invoice</Link></li>
                <li><Link to="/blog/what-is-an-invoice" className="hover:text-white transition-colors">What Is an Invoice?</Link></li>
                <li><Link to="/blog/invoice-template" className="hover:text-white transition-colors">Invoice Templates</Link></li>
                <li><Link to="/blog/gst-invoice-guide" className="hover:text-white transition-colors">GST Invoice Guide</Link></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-3">Company</p>
              <ul className="space-y-2 text-sm text-stone-400">
                <li><Link to="/about" className="hover:text-white transition-colors">About</Link></li>
                <li><Link to="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
                <li><Link to="/contact-us" className="hover:text-white transition-colors">Contact</Link></li>
                <li><Link to="/terms" className="hover:text-white transition-colors">Terms</Link></li>
                <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-stone-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-stone-500">
              © {new Date().getFullYear()} Invoicely. All rights reserved.
            </p>
            <p className="text-xs text-stone-600 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" aria-hidden="true" />
              Free online invoice generator
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicPageLayout;
