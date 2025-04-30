import { Plus, Trash, DollarSign, Percent } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "./ui/Button";

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface TaxItem {
  id: string;
  name: string;
  rate: number;
  amount: number;
}

interface DiscountItem {
  id: string;
  name: string;
  rate: number;
  amount: number;
}

interface InvoiceItemsProps {
  items: InvoiceItem[];
  handleItemChange: (id: string, field: string, value: string | number) => void;
  addItem: () => void;
  removeItem: (id: string) => void;
  taxes: TaxItem[];
  discounts: DiscountItem[];
  handleTaxChange: (id: string, field: string, value: string | number) => void;
  handleDiscountChange: (
    id: string,
    field: string,
    value: string | number
  ) => void;
  addTax: () => void;
  addDiscount: () => void;
  removeTax: (id: string) => void;
  removeDiscount: (id: string) => void;
  subtotal: number;
  total: number;
}

export const InvoiceItems = ({
  items,
  handleItemChange,
  addItem,
  removeItem,
  taxes,
  discounts,
  handleTaxChange,
  handleDiscountChange,
  addTax,
  addDiscount,
  removeTax,
  removeDiscount,
  subtotal,
  total,
}: InvoiceItemsProps) => {
  const { toast } = useToast();

  return (
    <>
      {/* Invoice Items Section */}
      <div className="bg-white dark:bg-invoice-darkBg p-6 rounded-lg dark:border-gray-700">
        <h2 className="invoice-section-title mb-3 text-invoice-lightText dark:text-invoice-darkText font-bold text-lg">
          Invoice Items
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full mb-3">
            <thead>
              <tr className="text-left text-invoice-lightText dark:text-invoice-darkText">
                <th className="pb-2">Description</th>
                <th className="pb-2 w-24 text-right">Qty</th>
                <th className="pb-2 w-32 text-right">Rate</th>
                <th className="pb-2 w-32 text-right">Amount</th>
                <th className="pb-2 w-10"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr
                  key={item.id}
                  className="border-t border-gray-200 dark:border-gray-700"
                >
                  <td className="py-2">
                    <input
                      type="text"
                      className="invoice-input-minimal w-full p-1 bg-transparent border-0 focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400 text-gray-900 dark:text-gray-100"
                      placeholder="Item description"
                      value={item.description}
                      onChange={(e) =>
                        handleItemChange(item.id, "description", e.target.value)
                      }
                    />
                  </td>
                  <td className="py-2">
                    <input
                      type="number"
                      className="invoice-input-minimal w-full text-right p-1 bg-transparent border-0 focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400 text-gray-900 dark:text-gray-100"
                      min="1"
                      value={item.quantity}
                      onChange={(e) =>
                        handleItemChange(
                          item.id,
                          "quantity",
                          parseFloat(e.target.value) || 0
                        )
                      }
                    />
                  </td>
                  <td className="py-2">
                    <div className="relative">
                      <DollarSign
                        className="absolute left-1 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500"
                        size={14}
                      />
                      <input
                        type="number"
                        className="invoice-input-minimal w-full text-right pl-6 p-1 bg-transparent border-0 focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400 text-gray-900 dark:text-gray-100"
                        step="0.01"
                        min="0"
                        value={item.unitPrice}
                        onChange={(e) =>
                          handleItemChange(
                            item.id,
                            "unitPrice",
                            parseFloat(e.target.value) || 0
                          )
                        }
                      />
                    </div>
                  </td>
                  <td className="text-right text-gray-900 dark:text-gray-100">
                    ${item.totalPrice.toFixed(2)}
                  </td>
                  <td className="py-2">
                    <Button
                      onClick={() => removeItem(item.id)}
                      title="Remove item"
                      size="icon"
                      className="invoice-trash-btn"
                    >
                      <Trash size={18} />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Button
          onClick={addItem}
          size="lg"
          className="invoice-action-btn"
        >
          <Plus size={18} className="mr-1" /> Add Item
        </Button>
      </div>

      {/* Invoice Totals Section */}
      <div className="bg-white dark:bg-invoice-darkBg p-6 rounded-lg dark:border-gray-700">
        <h2 className="invoice-section-title mb-4 text-invoice-lightText dark:text-invoice-darkText font-bold text-lg">
          Totals & Adjustments
        </h2>
        <div className="flex flex-col items-end">
          <div className="w-64 space-y-2">
            <div className="flex justify-between">
              <span className="text-invoice-lightText dark:text-invoice-darkText">
                Subtotal:
              </span>
              <span className="text-gray-900 dark:text-gray-100">
                ${subtotal.toFixed(2)}
              </span>
            </div>

            {/* Taxes */}
            {taxes.map((tax) => (
              <div
                key={`tax-${tax.id}`}
                className="flex justify-between items-center"
              >
                <div className="flex space-x-2 items-center">
                  <input
                    type="text"
                    className="invoice-input-minimal w-24 p-1 bg-transparent border border-gray-200 dark:border-gray-700 rounded-md focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400 text-gray-900 dark:text-gray-100"
                    placeholder="Tax name"
                    value={tax.name}
                    onChange={(e) =>
                      handleTaxChange(tax.id, "name", e.target.value)
                    }
                  />
                  <div className="relative">
                    <input
                      type="number"
                      className="invoice-input-minimal w-16 pr-6 p-1 bg-transparent border border-gray-200 dark:border-gray-700 rounded-md focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400 text-gray-900 dark:text-gray-100"
                      min="0"
                      max="100"
                      step="0.01"
                      value={tax.rate}
                      onChange={(e) =>
                        handleTaxChange(
                          tax.id,
                          "rate",
                          parseFloat(e.target.value) || 0
                        )
                      }
                    />
                    <Percent
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500"
                      size={12}
                    />
                  </div>
                  <Button
                    onClick={() => removeTax(tax.id)}
                    size="icon"
                    className="invoice-trash-btn"
                  >
                    <Trash size={16} />
                  </Button>
                </div>
                <span className="text-gray-900 dark:text-gray-100">
                  ${tax.amount.toFixed(2)}
                </span>
              </div>
            ))}

            {/* Discounts */}
            {discounts.map((discount) => (
              <div
                key={`discount-${discount.id}`}
                className="flex justify-between items-center"
              >
                <div className="flex space-x-2 items-center">
                  <input
                    type="text"
                    className="invoice-input-minimal w-24 p-1 bg-transparent border border-gray-200 dark:border-gray-700 rounded-md focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400 text-gray-900 dark:text-gray-100"
                    placeholder="Discount name"
                    value={discount.name}
                    onChange={(e) =>
                      handleDiscountChange(discount.id, "name", e.target.value)
                    }
                  />
                  <div className="relative">
                    <input
                      type="number"
                      className="invoice-input-minimal w-16 pr-6 p-1 bg-transparent border border-gray-200 dark:border-gray-700 rounded-md focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400 text-gray-900 dark:text-gray-100"
                      min="0"
                      max="100"
                      step="0.01"
                      value={discount.rate}
                      onChange={(e) =>
                        handleDiscountChange(
                          discount.id,
                          "rate",
                          parseFloat(e.target.value) || 0
                        )
                      }
                    />
                    <Percent
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500"
                      size={12}
                    />
                  </div>
                  <Button
                    onClick={() => removeDiscount(discount.id)}
                    size="icon"
                    className="invoice-trash-btn"
                  >
                    <Trash size={16} />
                  </Button>
                </div>
                <span className="text-gray-900 dark:text-gray-100">
                  -${discount.amount.toFixed(2)}
                </span>
              </div>
            ))}

            <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200 dark:border-gray-700">
              <span className="text-gray-900 dark:text-gray-100">
                Total Due:
              </span>
              <span className="text-gray-900 dark:text-gray-100">
                ${total.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <Button
              onClick={addTax}
              size="lg"
              className="invoice-action-btn"
            >
              <Plus size={18} className="mr-1" /> Tax
            </Button>
            <Button
              onClick={addDiscount}
              size="lg"
              className="invoice-action-btn"
            >
              <Plus size={18} className="mr-1" /> Discount
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default InvoiceItems;