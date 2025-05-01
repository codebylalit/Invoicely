import React from "react";
import { Button } from "@/components/ui/Button";
import { useNavigate } from "react-router-dom";

export interface InvoiceTemplate {
  id: number;
  name: string;
  preview: string;
  description: string;
  color: string;
  isDefault?: boolean;
  styles: {
    font: string;
    background: string;
    accent: string;
    layout: string;
  };
}

export const invoiceTemplates: InvoiceTemplate[] = [
  {
    id: 0,
    name: "Classic",
    preview: "/templates/classic.png",
    description: "Traditional layout with clear sections and professional styling",
    color: "bg-blue-600",
    isDefault: true,
    styles: {
      font: "font-['Inter']",
      background: "bg-white",
      accent: "text-blue-600",
      layout: "classic",
    },
  },
  {
    id: 1,
    name: "Modern",
    preview: "/templates/modern.png",
    description: "Contemporary design with bold accents and clean typography",
    color: "bg-purple-600",
    styles: {
      font: "font-['Poppins']",
      background: "bg-gray-50",
      accent: "text-purple-600",
      layout: "modern",
    },
  },
  {
    id: 2,
    name: "Minimal",
    preview: "/templates/minimal.png",
    description: "Simplistic design with maximum whitespace and minimal elements",
    color: "bg-gray-800",
    styles: {
      font: "font-['Montserrat']",
      background: "bg-white",
      accent: "text-gray-800",
      layout: "minimal",
    },
  },
  {
    id: 3,
    name: "Default",
    preview: "/templates/default.png",
    description: "Standard layout with balanced spacing and clear hierarchy",
    color: "bg-blue-500",
    styles: {
      font: "font-['Poppins']",
      background: "bg-white",
      accent: "text-blue-500",
      layout: "default",
    },
  },
  {
    id: 4,
    name: "Billy",
    preview: "/templates/billy.png",
    description: "Clean, modern, and centered layout with status badge and summary.",
    color: "bg-white",
    styles: {
      font: "font-['Open_Sans']",
      background: "bg-white",
      accent: "text-blue-400",
      layout: "billy",
    },
  },
];

interface TemplateSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: InvoiceTemplate) => void;
  selectedTemplate: InvoiceTemplate | null;
  userSubscription?: { tier: string }; // Add this prop
}

export const TemplateSelectionModal: React.FC<TemplateSelectionModalProps> = ({
  isOpen,
  onClose,
  onSelectTemplate,
  selectedTemplate,
  userSubscription = { tier: "free" }, // Default to free if not provided
}) => {
  if (!isOpen) return null;

  const navigate = useNavigate();

  const goToSubscription = () => {
    navigate("/app/settings?tab=subscription");
  };

  const containerClasses = `
    ${selectedTemplate?.styles.layout === "billy" ? "bg-white" : "bg-white dark:bg-invoice-darkBg"}
    p-6 rounded-md shadow-sm w-full h-full overflow-auto
    ${selectedTemplate ? selectedTemplate.styles.font : ""}
    ${selectedTemplate && selectedTemplate.styles.layout !== "billy" ? selectedTemplate.styles.background : ""}
  `;

  return (
    <div className="fixed inset-0 bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded-md shadow-lg max-w-3xl w-full p-6 max-h-[90vh] overflow-auto">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-medium dark:text-white">
            Select Template
          </h2>
          <Button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:text-gray-500"
          >
            ×
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {invoiceTemplates.map((template) => {
            const isPremium = template.id > 3;
            const isDisabled = isPremium && userSubscription.tier !== "pro";

            return (
              <div
                key={template.id}
                className={`relative border rounded-lg p-4 cursor-pointer hover:border-blue-500 transition-all ${selectedTemplate?.id === template.id
                  ? "border-blue-500 ring-2 ring-blue-200"
                  : ""
                  } ${isDisabled ? "opacity-70" : ""}`}
                onClick={() => !isDisabled && onSelectTemplate(template)}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">{template.name}</h3>
                  {isPremium && (
                    <span className="bg-gradient-to-r from-purple-500 to-blue-500 text-xs text-white px-2 py-1 rounded-full">
                      PRO
                    </span>
                  )}
                </div>
                <div className="h-32 bg-gray-100 dark:bg-gray-800 rounded flex items-center justify-center">
                  {/* Template preview image or placeholder */}
                  <div
                    className={`w-full h-full ${template.styles.font} ${template.styles.background} flex items-center justify-center`}
                  >
                    <span
                      className={`text-2xl font-bold ${template.styles.accent}`}
                    >
                      Preview
                    </span>
                  </div>
                </div>
                {isDisabled && (
                  <div className="absolute inset-0 bg-black bg-opacity-10 dark:bg-opacity-40 flex items-center justify-center rounded-lg">
                    <div className="bg-white dark:bg-gray-800 px-3 py-1 rounded shadow-sm">
                      <span className="text-sm font-medium">Pro only</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {userSubscription.tier !== "pro" && (
          <div className="mt-6 bg-blue-50 p-4 rounded-md">
            <div className="flex items-center gap-3">
              <div className="text-blue-600 dark:text-blue-400 flex-shrink-0">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 2l2.4 7.4H22l-6 4.6 2.3 7-6.3-4.6L5.7 21l2.3-7-6-4.6h7.6z" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-blue-700 dark:text-blue-300">
                  Upgrade to Pro
                </h3>
                <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                  Get access to all premium templates and remove branding from
                  your invoices.
                </p>
              </div>
              <div className="ml-auto">
                <Button
                  onClick={goToSubscription}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Upgrade
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
