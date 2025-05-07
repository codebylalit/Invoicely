import React from 'react';

interface Item {
    id: string | number;
    description: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    additionalInfo?: string;
}

interface InvoiceItemsTableProps {
    items: Item[];
    theme?: string;
}

const InvoiceItemsTable: React.FC<InvoiceItemsTableProps> = ({ items }) => (
    <div className="w-full">
        <table className="w-full">
            <thead>
                <tr className="border-b border-gray-200">
                    <th className="text-left py-2">Description</th>
                    <th className="text-center py-2">Quantity</th>
                    <th className="text-right py-2">Unit Price</th>
                    <th className="text-right py-2">Amount</th>
                </tr>
            </thead>
            <tbody>
                {items && items.length > 0 ? (
                    items.map((item) => (
                        <tr key={item.id} className="border-b border-gray-100">
                            <td className="py-2">
                                {item.description}
                                {item.additionalInfo && (
                                    <div className="text-xs text-gray-500">{item.additionalInfo}</div>
                                )}
                            </td>
                            <td className="text-center py-2">{item.quantity}</td>
                            <td className="text-right py-2">${item.unitPrice.toFixed(2)}</td>
                            <td className="text-right py-2">${item.totalPrice.toFixed(2)}</td>
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan={4} className="text-center py-8 text-gray-500 italic">
                            No items added to this invoice yet
                        </td>
                    </tr>
                )}
            </tbody>
        </table>
    </div>
);

export default InvoiceItemsTable; 