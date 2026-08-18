import React, { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  Download,
  Printer,
  ExternalLink,
  ShieldCheck,
  Check,
  Send,
  MessageSquare,
  Globe,
} from "lucide-react";
import { renderInvoiceElementToPdf } from "@/utils/pdfUtils";

// Initialize standalone Supabase client for unauthenticated access
const supabaseUrl = "https://mrmjkdxerrpwrrmmymmv.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ybWprZHhlcnJwd3JybW15bW12Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE1OTMwNDAsImV4cCI6MjA5NzE2OTA0MH0.G0nuJd44Ib6rBKgBSgpPn_6SSUBY0lRBYY3muGj6GTw";
const supabase = createClient(supabaseUrl, supabaseKey);

// ─── Confetti Animation Overlay ─────────────────────────────────────────────
const ConfettiOverlay = () => {
  const pieces = Array.from({ length: 50 });
  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {pieces.map((_, i) => {
        const left = Math.random() * 100;
        const delay = Math.random() * 2;
        const duration = 2.5 + Math.random() * 2;
        const colors = [
          "#eab308",
          "#22c55e",
          "#3b82f6",
          "#ec4899",
          "#8b5cf6",
          "#f97316",
        ];
        const color = colors[i % colors.length];

        return (
          <div
            key={i}
            className="absolute top-0 w-3 h-3 rounded-sm opacity-90 animate-fall"
            style={{
              left: `${left}%`,
              backgroundColor: color,
              animationDelay: `${delay}s`,
              animationDuration: `${duration}s`,
              transform: `rotate(${Math.random() * 360}deg)`,
            }}
          />
        );
      })}
    </div>
  );
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
const fmtCurrency = (amount: number, currency: string = "INR") => {
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currency || "INR",
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `₹${amount.toFixed(2)}`;
  }
};

const fmtDate = (d?: string) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const STATUS_CONFIG: Record<
  string,
  { label: string; bg: string; text: string; icon: React.ReactNode }
> = {
  paid: {
    label: "PAID",
    bg: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400",
    icon: <CheckCircle2 className="h-4 w-4" />,
  },
  pending: {
    label: "PAYMENT DUE",
    bg: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400",
    icon: <Clock className="h-4 w-4" />,
  },
  overdue: {
    label: "OVERDUE",
    bg: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400",
    icon: <AlertCircle className="h-4 w-4" />,
  },
  partial: {
    label: "PARTIAL",
    bg: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400",
    icon: <Clock className="h-4 w-4" />,
  },
  cancelled: {
    label: "CANCELLED",
    bg: "bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400",
    icon: <AlertCircle className="h-4 w-4" />,
  },
};

// ─── Main Component ──────────────────────────────────────────────────────────
const PublicInvoicePay = () => {
  const { id } = useParams<{ id: string }>();
  const [invoice, setInvoice] = useState<any>(null);
  const [businessDetails, setBusinessDetails] = useState<any>(null);
  const [sellerPaymentLink, setSellerPaymentLink] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [justPaid, setJustPaid] = useState(false);
  const [downloading, setDownloading] = useState(false);

  // Client comment state
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState<any[]>([]);
  const [sendingComment, setSendingComment] = useState(false);

  const printRef = useRef<HTMLDivElement>(null);

  // Fetch invoice details
  useEffect(() => {
    const fetchInvoiceData = async () => {
      if (!id) return;
      setLoading(true);
      try {
        // Fetch invoice
        const { data: invData, error: invErr } = await supabase
          .from("invoices")
          .select("*")
          .eq("id", id)
          .maybeSingle();

        if (invErr || !invData) throw new Error("Invoice not found or link has expired.");
        setInvoice(invData);

        // Fetch seller business details + payment link in parallel
        if (invData?.user_id) {
          const [bRes, pRes] = await Promise.all([
            supabase
              .from("business_details")
              .select("*")
              .eq("user_id", invData.user_id)
              .maybeSingle(),
            supabase
              .from("profiles")
              .select("payment_link")
              .eq("user_id", invData.user_id)
              .maybeSingle(),
          ]);
          if (bRes.data) setBusinessDetails(bRes.data);
          if (pRes.data?.payment_link) setSellerPaymentLink(pRes.data.payment_link);
        }
      } catch (err: any) {
        setError(err.message || "Failed to load invoice");
      } finally {
        setLoading(false);
      }
    };

    fetchInvoiceData();
  }, [id]);

  // Handle "Pay Online" — opens seller's own payment link in a new tab.
  // Shows confetti to celebrate the action. The seller marks the invoice
  // as paid manually once they receive confirmation from their payment provider.
  const handlePayOnline = () => {
    if (!sellerPaymentLink) return;
    setJustPaid(true); // Show confetti celebration
    window.open(sellerPaymentLink, "_blank", "noopener,noreferrer");
  };

  // Handle PDF Download
  const handleDownloadPDF = async () => {
    if (!printRef.current) return;
    setDownloading(true);
    try {
      const pdf = await renderInvoiceElementToPdf(printRef.current, {
        scale: 2,
        backgroundColor: "#ffffff",
      });
      pdf.save(`Invoice_${invoice.invoice_number || "Payment"}.pdf`);
    } catch (e) {
      alert("Failed to generate PDF. Please try browser print instead.");
    } finally {
      setDownloading(false);
    }
  };

  // Handle Client Comment Submission
  const handleSendComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setSendingComment(true);
    try {
      const newComment = {
        id: Date.now(),
        text: commentText,
        sender: invoice.client_name || "Client",
        created_at: new Date().toISOString(),
      };
      setComments((prev) => [...prev, newComment]);
      setCommentText("");
    } catch (e) {
      // ignore
    } finally {
      setSendingComment(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="h-12 w-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-500 font-medium text-sm">
          Loading invoice portal…
        </p>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 max-w-md w-full text-center shadow-lg">
          <div className="h-14 w-14 bg-red-100 dark:bg-red-950/40 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-7 w-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            Invoice Not Available
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
            {error ||
              "The invoice you are trying to view does not exist or has been deleted."}
          </p>
          <Link to="/">
            <Button variant="outline" className="w-full">
              Go to Home Page
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const items = Array.isArray(invoice.items) ? invoice.items : [];
  const statusKey = invoice.status?.toLowerCase() || "pending";
  const statusConfig = STATUS_CONFIG[statusKey] || STATUS_CONFIG.pending;
  const isPaid = statusKey === "paid" || justPaid;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans pb-16">
      {/* Confetti celebration if just paid */}
      {(justPaid || isPaid) && <ConfettiOverlay />}

      {/* ── Top Header ──────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 sm:px-8 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-amber-500 flex items-center justify-center text-slate-900 font-black text-sm shadow-sm">
              I
            </div>
            <div>
              <p className="font-bold text-sm text-slate-900 dark:text-white leading-tight">
                {businessDetails?.business_name || "Secure Invoice Portal"}
              </p>
              <p className="text-xs text-slate-400">Powered by invoicelly</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.print()}
              className="hidden sm:flex items-center gap-1.5"
            >
              <Printer className="h-3.5 w-3.5" />
              Print
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadPDF}
              disabled={downloading}
              className="flex items-center gap-1.5"
            >
              <Download className="h-3.5 w-3.5" />
              {downloading ? "PDF…" : "Download PDF"}
            </Button>
          </div>
        </div>
      </header>

      {/* ── Main Content Container ──────────────────────────────────────────── */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        {/* Redirected to payment provider banner */}
        {justPaid && (
          <div className="bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-700 rounded-2xl p-6 text-center space-y-2">
            <div className="h-12 w-12 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto shadow-md">
              <Check className="h-7 w-7 stroke-[3]" />
            </div>
            <h2 className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">
              Redirected to Payment Page 🎉
            </h2>
            <p className="text-sm text-emerald-700 dark:text-emerald-300 max-w-sm mx-auto">
              Complete your payment in the tab that just opened. The seller will
              mark this invoice as paid once they receive your payment.
            </p>
          </div>
        )}

        {/* Hero Payment Action Card */}
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <CardContent className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div>
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border mb-3 ${statusConfig.bg}`}
                >
                  {statusConfig.icon}
                  {statusConfig.label}
                </span>
                <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold mb-1">
                  Amount Due
                </p>
                <p className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white tabular-nums tracking-tight">
                  {fmtCurrency(Number(invoice.total) || 0)}
                </p>
                <p className="text-xs text-slate-400 mt-2">
                  Invoice #{invoice.invoice_number} · Due{" "}
                  {fmtDate(invoice.due_date)}
                </p>
              </div>

              {/* Action Side */}
              <div className="flex flex-col gap-3 sm:w-64 flex-shrink-0">
                {isPaid ? (
                  <div className="bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 p-4 rounded-xl text-center">
                    <CheckCircle2 className="h-6 w-6 text-emerald-600 mx-auto mb-1" />
                    <p className="font-bold text-sm">Invoice Settled</p>
                    <p className="text-xs opacity-80 mt-0.5">No action required</p>
                  </div>
                ) : sellerPaymentLink ? (
                  <>
                    <Button
                      onClick={handlePayOnline}
                      className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold py-6 text-base shadow-md hover:shadow-lg transition-all duration-200"
                    >
                      <Globe className="h-5 w-5 mr-2" />
                      Pay Online
                      <ExternalLink className="h-4 w-4 ml-2 opacity-70" />
                    </Button>
                    <p className="text-xs text-slate-400 text-center">
                      You'll be redirected to the seller's secure payment page.
                    </p>
                  </>
                ) : (
                  <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-center space-y-2">
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Pay via Bank Transfer</p>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Contact the sender for bank details or use the reference number
                      <span className="font-mono font-bold text-slate-600 dark:text-slate-300"> #{invoice?.invoice_number}</span> when making your payment.
                    </p>
                  </div>
                )}
                <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400">
                  <ShieldCheck className="h-4 w-4 text-emerald-500" />
                  <span>Payment processed by seller's provider</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Printable Invoice Document ──────────────────────────────────────── */}
        <div
          ref={printRef}
          className="invoice-print-root bg-white text-slate-900 rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-10 space-y-8"
        >
          {/* Document Header */}
          <div className="flex flex-col sm:flex-row justify-between gap-6 pb-6 border-b border-slate-200">
            <div>
              {businessDetails?.logo_url ? (
                <img
                  src={businessDetails.logo_url}
                  alt="Business logo"
                  className="h-12 object-contain mb-3"
                />
              ) : (
                <h2 className="text-xl font-bold text-slate-900 mb-1">
                  {businessDetails?.business_name || "Your Company"}
                </h2>
              )}
              <p className="text-sm text-slate-500">{businessDetails?.email}</p>
              <p className="text-sm text-slate-500">
                {businessDetails?.phone_number}
              </p>
              <p className="text-sm text-slate-500">
                {businessDetails?.address}
              </p>
              {businessDetails?.vat_number && (
                <p className="text-xs text-slate-400 mt-1">
                  Tax ID: {businessDetails.vat_number}
                </p>
              )}
            </div>

            <div className="text-left sm:text-right">
              <p className="text-xs uppercase tracking-widest text-slate-400 font-semibold mb-1">
                {invoice.invoice_title || "INVOICE"}
              </p>
              <p className="text-2xl font-bold text-slate-900 mb-2">
                #{invoice.invoice_number}
              </p>
              <div className="text-sm text-slate-500 space-y-0.5">
                <p>
                  Issued:{" "}
                  <strong>
                    {fmtDate(invoice.issued_date || invoice.created_at)}
                  </strong>
                </p>
                <p>
                  Due Date: <strong>{fmtDate(invoice.due_date)}</strong>
                </p>
              </div>
            </div>
          </div>

          {/* From / Bill To Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 text-sm">
            <div>
              <p className="text-xs uppercase tracking-widest text-slate-400 font-bold mb-2">
                From
              </p>
              <p className="font-bold text-slate-900">
                {businessDetails?.business_name || "Seller"}
              </p>
              <p className="text-slate-500">{businessDetails?.email}</p>
              <p className="text-slate-500">{businessDetails?.address}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-slate-400 font-bold mb-2">
                Billed To
              </p>
              <p className="font-bold text-slate-900">
                {invoice.client_name || "Client"}
              </p>
              <p className="text-slate-500">{invoice.client_email}</p>
              <p className="text-slate-500">{invoice.details}</p>
            </div>
          </div>

          {/* Line Items Table */}
          <div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-slate-900 text-slate-900">
                  <th className="text-left py-3 font-bold">Item Description</th>
                  <th className="text-center py-3 font-bold">Qty</th>
                  <th className="text-right py-3 font-bold">Rate</th>
                  <th className="text-right py-3 font-bold">Amount</th>
                </tr>
              </thead>
              <tbody>
                {items.length > 0 ? (
                  items.map((item: any, i: number) => (
                    <tr key={i} className="border-b border-slate-100">
                      <td className="py-3 text-slate-800">
                        <p className="font-medium">{item.description}</p>
                        {item.additionalInfo && (
                          <p className="text-xs text-slate-400">
                            {item.additionalInfo}
                          </p>
                        )}
                      </td>
                      <td className="py-3 text-center text-slate-500">
                        {item.quantity}
                      </td>
                      <td className="py-3 text-right text-slate-500">
                        ${item.unitPrice?.toFixed(2)}
                      </td>
                      <td className="py-3 text-right font-semibold text-slate-900">
                        ${item.totalPrice?.toFixed(2)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={4}
                      className="text-center py-6 text-slate-400 italic"
                    >
                      No items specified
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Totals Section */}
          <div className="flex justify-end pt-2">
            <div className="w-72 space-y-2 text-sm">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal</span>
                <span>
                  $
                  {(
                    Number(invoice.subtotal) ||
                    Number(invoice.total) ||
                    0
                  ).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between font-bold text-slate-900 text-lg border-t-2 border-slate-900 pt-3">
                <span>Total Amount</span>
                <span className="text-amber-600">
                  ${(Number(invoice.total) || 0).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Notes / Terms */}
          {invoice.notes && (
            <div className="pt-4 border-t border-slate-100 text-sm">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
                Notes & Terms
              </p>
              <p className="text-slate-600 italic">{invoice.notes}</p>
            </div>
          )}

          {/* Document Footer */}
          <div className="pt-6 border-t border-slate-100 text-center text-xs text-slate-400 flex flex-col sm:flex-row justify-between items-center gap-2">
            <span>{businessDetails?.business_name || "Company"}</span>
            <span>Thank you for your business!</span>
          </div>
        </div>

        {/* ── Client Comments / Question Box ──────────────────────────────────── */}
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
          <CardContent className="p-6">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
              <MessageSquare className="h-4 w-4 text-amber-500" />
              Have a question about this invoice?
            </h3>

            {/* List of comments */}
            {comments.length > 0 && (
              <div className="space-y-3 mb-4">
                {comments.map((c) => (
                  <div
                    key={c.id}
                    className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm"
                  >
                    <p className="font-semibold text-xs text-slate-500 mb-1">
                      {c.sender}
                    </p>
                    <p className="text-slate-800 dark:text-slate-200">
                      {c.text}
                    </p>
                  </div>
                ))}
              </div>
            )}

            <form onSubmit={handleSendComment} className="flex gap-2">
              <Input
                placeholder="Leave a message or payment reference note…"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" disabled={sendingComment}>
                <Send className="h-4 w-4 mr-1" />
                Send
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default PublicInvoicePay;
