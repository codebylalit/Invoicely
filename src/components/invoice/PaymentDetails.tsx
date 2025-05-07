import React from 'react';

interface PaymentDetailsProps {
    showPaymentMethods: boolean;
    paymentMethods: { type: string; isEnabled: boolean }[];
    paymentDetails: { bankTransferDetails: string; paymentMethod: string | null; paymentLink: string };
    theme: string;
}

const themeMap: Record<string, { bg: string; accent: string; border: string; text: string }> = {
    classic: { bg: 'bg-gray-50', accent: 'text-gray-700', border: 'border-gray-200', text: 'text-gray-700' },
    modern: { bg: 'bg-gray-50', accent: 'text-gray-600', border: 'border-gray-200', text: 'text-gray-700' },
    minimal: { bg: 'bg-gray-50', accent: 'text-gray-600', border: 'border-gray-200', text: 'text-gray-700' },
    default: { bg: 'bg-white', accent: 'text-blue-600', border: 'border-gray-200', text: 'text-gray-700' },
    billy: { bg: 'bg-blue-50', accent: 'text-blue-700', border: 'border-blue-200', text: 'text-blue-700' },
    executive: { bg: 'bg-emerald-50', accent: 'text-emerald-600', border: 'border-emerald-200', text: 'text-emerald-700' },
    corporate: { bg: 'bg-slate-50', accent: 'text-slate-700', border: 'border-slate-200', text: 'text-slate-700' },
    elegant: { bg: 'bg-rose-50', accent: 'text-rose-600', border: 'border-rose-200', text: 'text-rose-700' },
    tech: { bg: 'bg-indigo-50', accent: 'text-indigo-600', border: 'border-indigo-200', text: 'text-indigo-700' },
    minimalist: { bg: 'bg-gray-50', accent: 'text-gray-600', border: 'border-gray-200', text: 'text-gray-700' },
    creative: { bg: 'bg-fuchsia-50', accent: 'text-fuchsia-600', border: 'border-fuchsia-200', text: 'text-fuchsia-700' },
    finance: { bg: 'bg-teal-50', accent: 'text-teal-600', border: 'border-teal-200', text: 'text-teal-700' },
    'modern-classic': { bg: 'bg-amber-50', accent: 'text-amber-600', border: 'border-amber-200', text: 'text-amber-700' },
    premium: { bg: 'bg-slate-50', accent: 'text-slate-900', border: 'border-slate-200', text: 'text-slate-900' },
    'business-pro': { bg: 'bg-blue-50', accent: 'text-blue-700', border: 'border-blue-200', text: 'text-blue-700' },
};

const PaymentDetails: React.FC<PaymentDetailsProps> = ({ showPaymentMethods, paymentMethods, paymentDetails, theme }) => {
    const themeClass = themeMap[theme] || themeMap['classic'];
    if (!showPaymentMethods) return null;
    if (!paymentMethods?.some(pm => pm.isEnabled)) return null;
    return (
        <div className={`mt-6 rounded-lg p-6 ${themeClass.bg} ${themeClass.border} border`}>
            <h2 className={`text-base font-semibold mb-3 ${themeClass.accent}`}>Payment Information</h2>
            <div className="space-y-2">
                {paymentMethods?.some(pm => pm.type === "bank" && pm.isEnabled) && paymentDetails.bankTransferDetails && (
                    <div>
                        <span className={`block font-medium mb-1 ${themeClass.text}`}>Bank Transfer</span>
                        <span className={`block text-sm ${themeClass.text} whitespace-pre-line`}>{paymentDetails.bankTransferDetails}</span>
                    </div>
                )}
                {paymentMethods?.some(pm => ["stripe", "online", "razorpay"].includes(pm.type?.toLowerCase()) && pm.isEnabled) && (
                    <div>
                        <span className={`block font-medium mb-1 ${themeClass.text}`}>Online Payment</span>
                        {paymentDetails?.paymentLink ? (
                            <a href={paymentDetails.paymentLink.startsWith("http") ? paymentDetails.paymentLink : `https://${paymentDetails.paymentLink}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`text-sm underline ${themeClass.accent} break-all`}>
                                {paymentDetails.paymentLink}
                            </a>
                        ) : (
                            <span className={`text-sm ${themeClass.text}`}>No payment link provided</span>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PaymentDetails; 