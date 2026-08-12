import React from "react";

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
    <table className="w-full table-fixed border-collapse">
      <colgroup>
        <col className="w-[54%]" />
        <col className="w-[14%]" />
        <col className="w-[16%]" />
        <col className="w-[16%]" />
      </colgroup>
      <thead>
        <tr className="border-b border-gray-200">
          <th className="text-left py-2 pr-4 align-top">Description</th>
          <th className="text-center py-2 px-2 align-top whitespace-nowrap">
            Quantity
          </th>
          <th className="text-right py-2 px-2 align-top whitespace-nowrap">
            Unit Price
          </th>
          <th className="text-right py-2 pl-2 align-top whitespace-nowrap">
            Amount
          </th>
        </tr>
      </thead>
      <tbody>
        {items && items.length > 0 ? (
          items.map((item) => (
            <tr key={item.id} className="border-b border-gray-100">
              <td className="py-2 pr-4 align-top break-words whitespace-normal min-w-0">
                <div className="leading-5">{item.description}</div>
                {item.additionalInfo && (
                  <div className="text-xs text-gray-500 mt-1 break-words whitespace-normal">
                    {item.additionalInfo}
                  </div>
                )}
              </td>
              <td className="text-center py-2 px-2 align-top whitespace-nowrap tabular-nums">
                {item.quantity}
              </td>
              <td className="text-right py-2 px-2 align-top whitespace-nowrap tabular-nums">
                ${item.unitPrice.toFixed(2)}
              </td>
              <td className="text-right py-2 pl-2 align-top whitespace-nowrap tabular-nums">
                ${item.totalPrice.toFixed(2)}
              </td>
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
