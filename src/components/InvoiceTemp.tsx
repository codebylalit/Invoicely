import React from "react";
import { Button } from "@/components/ui/button";
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
  {
    id: 5,
    name: "Executive",
    preview: "/templates/executive.png",
    description: "Professional layout with two-column design and prominent company branding",
    color: "bg-emerald-600",
    styles: {
      font: "font-['Roboto']",
      background: "bg-white",
      accent: "text-emerald-600",
      layout: "executive",
    },
  },
  {
    id: 6,
    name: "Corporate",
    preview: "/templates/corporate.png",
    description: "Business-focused design with clear hierarchy and professional spacing",
    color: "bg-slate-700",
    styles: {
      font: "font-['Source_Sans_Pro']",
      background: "bg-white",
      accent: "text-slate-700",
      layout: "corporate",
    },
  },
  {
    id: 7,
    name: "Elegant",
    preview: "/templates/elegant.png",
    description: "Sophisticated design with subtle patterns and refined typography",
    color: "bg-rose-600",
    styles: {
      font: "font-['Playfair_Display']",
      background: "bg-white",
      accent: "text-rose-600",
      layout: "elegant",
    },
  },
  {
    id: 8,
    name: "Tech",
    preview: "/templates/tech.png",
    description: "Modern tech-inspired layout with geometric accents and bold typography",
    color: "bg-indigo-600",
    styles: {
      font: "font-['Space_Grotesk']",
      background: "bg-white",
      accent: "text-indigo-600",
      layout: "tech",
    },
  },
  {
    id: 9,
    name: "Minimalist",
    preview: "/templates/minimalist.png",
    description: "Ultra-clean design with maximum whitespace and essential information only",
    color: "bg-zinc-800",
    styles: {
      font: "font-['DM_Sans']",
      background: "bg-white",
      accent: "text-zinc-800",
      layout: "minimalist",
    },
  },
  {
    id: 10,
    name: "Creative",
    preview: "/templates/creative.png",
    description: "Artistic layout with dynamic elements and creative typography",
    color: "bg-fuchsia-600",
    styles: {
      font: "font-['Outfit']",
      background: "bg-white",
      accent: "text-fuchsia-600",
      layout: "creative",
    },
  },
  {
    id: 11,
    name: "Finance",
    preview: "/templates/finance.png",
    description: "Financial-focused design with clear data presentation and professional styling",
    color: "bg-teal-600",
    styles: {
      font: "font-['IBM_Plex_Sans']",
      background: "bg-white",
      accent: "text-teal-600",
      layout: "finance",
    },
  },
  {
    id: 12,
    name: "Modern Classic",
    preview: "/templates/modern-classic.png",
    description: "Contemporary take on traditional invoice design with modern elements",
    color: "bg-amber-600",
    styles: {
      font: "font-['Lora']",
      background: "bg-white",
      accent: "text-amber-600",
      layout: "modern-classic",
    },
  },
  {
    id: 13,
    name: "Premium",
    preview: "/templates/premium.png",
    description: "High-end design with luxury elements and sophisticated layout",
    color: "bg-slate-900",
    styles: {
      font: "font-['Cormorant']",
      background: "bg-white",
      accent: "text-slate-900",
      layout: "premium",
    },
  },
  {
    id: 14,
    name: "Business Pro",
    preview: "/templates/business-pro.png",
    description: "Professional business layout with clear sections and modern styling",
    color: "bg-blue-700",
    styles: {
      font: "font-['Work_Sans']",
      background: "bg-white",
      accent: "text-blue-700",
      layout: "business-pro",
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
  userSubscription = { tier: "free" },
}) => {
  if (!isOpen) return null;

  const navigate = useNavigate();

  const goToSubscription = () => {
    navigate("/app/settings?tab=subscription");
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-invoice-darkBg rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Choose Invoice Template
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Select a template that best matches your brand
            </p>
          </div>
          <Button
            onClick={onClose}
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
          >
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
              className="h-4 w-4"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </Button>
        </div>

        {/* Template Grid */}
        <div className="flex-1 overflow-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {invoiceTemplates.map((template) => {
              const isPremium = template.id > 3;
              const isDisabled = isPremium && userSubscription.tier !== "pro";
              const isSelected = selectedTemplate?.id === template.id;

              return (
                <div
                  key={template.id}
                  className={`group relative rounded-xl border transition-all duration-200 ${isSelected
                    ? "border-blue-500 ring-2 ring-blue-200 dark:ring-blue-800"
                    : "border-gray-200 dark:border-gray-800 hover:border-blue-300 dark:hover:border-blue-700"
                    } ${isDisabled ? "opacity-70" : ""}`}
                  onClick={() => !isDisabled && onSelectTemplate(template)}
                >
                  {/* Template Preview */}
                  <div className="aspect-[4/3] bg-gray-50 dark:bg-gray-900 rounded-t-xl overflow-hidden">
                    <div
                      className={`w-full h-full ${template.styles.font} ${template.styles.background} dark:bg-gray-800 flex items-center justify-center p-4`}
                    >
                      <div className="text-center">
                        <span className={`text-2xl font-bold ${template.styles.accent} dark:text-invoice-darkText`}>
                          {template.name}
                        </span>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                          {template.description}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Template Info */}
                  <div className="p-4 bg-white dark:bg-gray-900 rounded-b-xl">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {template.name}
                      </h3>
                      {isPremium && (
                        <span className="bg-gradient-to-r from-purple-500 to-blue-500 text-xs text-white px-2.5 py-1 rounded-full font-medium">
                          PRO
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Selected Indicator */}
                  {isSelected && (
                    <div className="absolute top-2 right-2">
                      <div className="bg-blue-500 rounded-full p-1">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="white"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                    </div>
                  )}

                  {/* Disabled Overlay */}
                  {isDisabled && (
                    <div className="absolute inset-0 bg-black/5 dark:bg-black/20 backdrop-blur-[2px] rounded-xl flex items-center justify-center">
                      <div className="bg-white dark:bg-gray-800 px-4 py-2 rounded-lg shadow-lg">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          Pro only
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer with Upgrade CTA */}
        {userSubscription.tier !== "pro" && (
          <div className="border-t border-gray-100 dark:border-gray-800 p-6">
            <div className="flex flex-col sm:flex-row items-center gap-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 p-4 rounded-xl">
              <div className="flex items-center gap-3 flex-1">
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
                  <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                    Unlock Premium Templates
                  </h3>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                    Get access to all premium templates and remove branding
                  </p>
                </div>
              </div>
              <Button
                onClick={goToSubscription}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Upgrade to Pro
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
