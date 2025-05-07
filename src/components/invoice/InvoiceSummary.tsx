import React from 'react';

interface Discount {
    id?: string | number;
    rate: number;
    amount: number;
}
interface Tax {
    id?: string | number;
    rate: number;
    amount: number;
}

interface InvoiceSummaryProps {
    subtotal: number;
    discounts: Discount[];
    taxes: Tax[];
    total: number;
    theme?: string; // Optional for future theme support
}

const InvoiceSummary: React.FC<InvoiceSummaryProps> = ({ subtotal, discounts, taxes, total }) => (
    <div>
        <div className="flex justify-between text-sm py-1">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
        </div>
        {Array.isArray(discounts) && discounts.length > 0 && discounts.map((discount, index) => (
            <div key={`discount-${discount.id || index}`} className="flex justify-between text-sm py-1 text-red-600">
                <span>Discount ({discount.rate.toFixed(0)}%)</span>
                <span>-${discount.amount.toFixed(2)}</span>
            </div>
        ))}
        {Array.isArray(taxes) && taxes.length > 0 && taxes.map((tax, index) => (
            <div key={`tax-${tax.id || index}`} className="flex justify-between text-sm py-1">
                <span>Tax ({tax.rate ? tax.rate.toFixed(0) : 0}%)</span>
                <span>${tax.amount ? tax.amount.toFixed(2) : "0.00"}</span>
            </div>
        ))}
        <div className="flex justify-between font-bold text-sm border-t border-gray-300 pt-1 mt-2">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
        </div>
    </div>
);

export default InvoiceSummary; 