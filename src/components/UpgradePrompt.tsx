import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Zap, X, ArrowRight } from "lucide-react";
import { FREE_INVOICE_LIMIT, FREE_CLIENT_LIMIT, FREE_EMAIL_LIMIT } from "@/hooks/useEntitlements";

export type LimitType = "invoices" | "clients" | "emails";

interface UpgradePromptProps {
  open: boolean;
  onClose: () => void;
  limitType: LimitType;
}

const LIMIT_CONTENT: Record<
  LimitType,
  { title: string; message: string; detail: string }
> = {
  invoices: {
    title: "Invoice Limit Reached",
    message: `You've used all ${FREE_INVOICE_LIMIT} invoices for this month.`,
    detail:
      "Upgrade to Pro for unlimited invoices, unlimited clients, automated reminders, and professional branding — all for just $6/month.",
  },
  clients: {
    title: "Client Limit Reached",
    message: `You've reached your ${FREE_CLIENT_LIMIT} client limit on the Free plan.`,
    detail:
      "Upgrade to Pro for unlimited clients, unlimited invoices, and everything you need to manage your invoicing professionally.",
  },
  emails: {
    title: "Email Limit Reached",
    message: `You've sent ${FREE_EMAIL_LIMIT} invoice emails this month — that's your Free plan limit.`,
    detail:
      "Upgrade to Pro for unlimited invoice emails, automatic payment reminders, and custom email signatures.",
  },
};

const UpgradePrompt: React.FC<UpgradePromptProps> = ({
  open,
  onClose,
  limitType,
}) => {
  const navigate = useNavigate();

  if (!open) return null;

  const content = LIMIT_CONTENT[limitType];

  const handleUpgrade = () => {
    onClose();
    navigate("/app/settings?tab=subscription");
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-md rounded-2xl border border-amber-500/30 bg-[#111] shadow-2xl shadow-amber-500/10 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
        {/* Amber glow top bar */}
        <div className="h-1 w-full bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500" />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 h-7 w-7 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="p-6 pt-5">
          {/* Icon + Title */}
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center flex-shrink-0">
              <Zap className="h-5 w-5 text-amber-400" />
            </div>
            <h2 className="text-lg font-bold text-white">{content.title}</h2>
          </div>

          {/* Limit message */}
          <p className="text-sm font-semibold text-gray-200 mb-2">
            {content.message}
          </p>
          <p className="text-sm text-gray-400 leading-relaxed mb-6">
            {content.detail}
          </p>

          {/* Pro feature highlights */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6 space-y-2">
            {[
              "Unlimited invoices, clients & emails",
              "All 20 premium invoice templates",
              "No Invoicely branding anywhere",
              "Automatic payment reminders",
              "Recurring invoices for retainer clients",
            ].map((feat) => (
              <div key={feat} className="flex items-center gap-2.5 text-xs text-gray-300">
                <svg
                  className="h-3.5 w-3.5 text-amber-400 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                {feat}
              </div>
            ))}
          </div>

          {/* Price callout */}
          <div className="flex items-baseline gap-1.5 mb-5">
            <span className="text-2xl font-black text-white">$6</span>
            <span className="text-sm text-gray-400">/ month</span>
            <span className="text-xs text-gray-500 ml-1">(₹499 / mo)</span>
          </div>

          {/* CTAs */}
          <div className="flex flex-col gap-2.5">
            <Button
              onClick={handleUpgrade}
              className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-3 rounded-xl shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
            >
              Upgrade to Pro
              <ArrowRight className="h-4 w-4" />
            </Button>
            <button
              onClick={onClose}
              className="w-full py-2 text-sm text-gray-500 hover:text-gray-300 transition-colors"
            >
              Not now, stay on Free
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpgradePrompt;
