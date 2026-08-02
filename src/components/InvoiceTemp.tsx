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
    name: "Minimal White",
    preview: "/templates/minimal-white.png",
    description: "Ultra-clean design with generous whitespace and refined typography",
    color: "bg-[#18181b]",
    isDefault: true,
    styles: {
      font: "font-['Inter']",
      background: "bg-white",
      accent: "text-zinc-900",
      layout: "minimal-white",
    },
  },
  {
    id: 1,
    name: "Modern SaaS",
    preview: "/templates/modern-saas.png",
    description: "Gradient top header, violet accents, and pill-badge status indicators",
    color: "bg-[#7c3aed]",
    styles: {
      font: "font-['Inter']",
      background: "bg-white",
      accent: "text-violet-600",
      layout: "modern-saas",
    },
  },
  {
    id: 2,
    name: "Stripe Inspired",
    preview: "/templates/stripe-inspired.png",
    description: "Card-based layout with soft slate background and high visual hierarchy",
    color: "bg-[#6366f1]",
    styles: {
      font: "font-['Inter']",
      background: "bg-[#f6f9fc]",
      accent: "text-indigo-600",
      layout: "stripe-inspired",
    },
  },
  {
    id: 3,
    name: "Apple Minimal",
    preview: "/templates/apple-minimal.png",
    description: "Ultra-thin typography, centered balance, and rounded dark total cards",
    color: "bg-[#000000]",
    styles: {
      font: "font-['SF_Pro_Display']",
      background: "bg-white",
      accent: "text-black",
      layout: "apple-minimal",
    },
  },
  {
    id: 4,
    name: "Corporate Blue",
    preview: "/templates/corporate-blue.png",
    description: "Deep navy header with royal blue accents for traditional enterprises",
    color: "bg-[#1e3a5f]",
    styles: {
      font: "font-['Inter']",
      background: "bg-white",
      accent: "text-[#1e3a5f]",
      layout: "corporate-blue",
    },
  },
  {
    id: 5,
    name: "Elegant Dark",
    preview: "/templates/elegant-dark.png",
    description: "Sleek dark mode template with subtle gold accents and thin borders",
    color: "bg-[#09090b]",
    styles: {
      font: "font-['Inter']",
      background: "bg-zinc-950",
      accent: "text-amber-400",
      layout: "elegant-dark",
    },
  },
  {
    id: 6,
    name: "Luxury Black",
    preview: "/templates/luxury-black.png",
    description: "High-end serif typography with pure black background & luxury monogram",
    color: "bg-[#000000]",
    styles: {
      font: "font-['Georgia']",
      background: "bg-black",
      accent: "text-white",
      layout: "luxury-black",
    },
  },
  {
    id: 7,
    name: "Modern Purple",
    preview: "/templates/modern-purple.png",
    description: "Vibrant purple-indigo header gradient with striped table row styling",
    color: "bg-[#6d28d9]",
    styles: {
      font: "font-['Inter']",
      background: "bg-white",
      accent: "text-purple-700",
      layout: "modern-purple",
    },
  },
  {
    id: 8,
    name: "Creative Agency",
    preview: "/templates/creative-agency.png",
    description: "Distinctive two-column layout with energetic orange brand sidebar",
    color: "bg-[#ff6b35]",
    styles: {
      font: "font-['Inter']",
      background: "bg-white",
      accent: "text-[#ff6b35]",
      layout: "creative-agency",
    },
  },
  {
    id: 9,
    name: "Freelancer",
    preview: "/templates/freelancer.png",
    description: "Friendly, approachable design with rounded cards and personal touches",
    color: "bg-[#44403c]",
    styles: {
      font: "font-['Inter']",
      background: "bg-[#fafaf9]",
      accent: "text-stone-800",
      layout: "freelancer",
    },
  },
  {
    id: 10,
    name: "Startup",
    preview: "/templates/startup.png",
    description: "Fresh green border theme designed for fast-growing modern startups",
    color: "bg-[#00d084]",
    styles: {
      font: "font-['Inter']",
      background: "bg-white",
      accent: "text-[#00d084]",
      layout: "startup",
    },
  },
  {
    id: 11,
    name: "Finance",
    preview: "/templates/finance.png",
    description: "Grid-structured, audit-friendly table layout for financial institutions",
    color: "bg-[#0f4c81]",
    styles: {
      font: "font-['Inter']",
      background: "bg-white",
      accent: "text-[#0f4c81]",
      layout: "finance-pro",
    },
  },
  {
    id: 12,
    name: "Healthcare",
    preview: "/templates/healthcare.png",
    description: "Clean medical teal theme tailored for clinics, doctors & care providers",
    color: "bg-[#0d9488]",
    styles: {
      font: "font-['Inter']",
      background: "bg-white",
      accent: "text-teal-600",
      layout: "healthcare",
    },
  },
  {
    id: 13,
    name: "Construction",
    preview: "/templates/construction.png",
    description: "High-visibility orange & safety stripe header for contractors & builders",
    color: "bg-[#ea580c]",
    styles: {
      font: "font-['Inter']",
      background: "bg-white",
      accent: "text-orange-600",
      layout: "construction",
    },
  },
  {
    id: 14,
    name: "Retail",
    preview: "/templates/retail.png",
    description: "Centered sales receipt layout perfect for physical & online retail stores",
    color: "bg-[#374151]",
    styles: {
      font: "font-['Inter']",
      background: "bg-white",
      accent: "text-gray-800",
      layout: "retail",
    },
  },
  {
    id: 15,
    name: "Restaurant",
    preview: "/templates/restaurant.png",
    description: "Warm dark-wood theme with gold accents for dining & hospitality",
    color: "bg-[#b45309]",
    styles: {
      font: "font-['Georgia']",
      background: "bg-[#1c1005]",
      accent: "text-amber-400",
      layout: "restaurant",
    },
  },
  {
    id: 16,
    name: "Consulting",
    preview: "/templates/consulting.png",
    description: "Executive slate layout for management, legal & strategic consultants",
    color: "bg-[#1e293b]",
    styles: {
      font: "font-['Inter']",
      background: "bg-white",
      accent: "text-[#2c3e50]",
      layout: "consulting",
    },
  },
  {
    id: 17,
    name: "Green Eco",
    preview: "/templates/green-eco.png",
    description: "Forest green sustainability theme for eco-conscious businesses",
    color: "bg-[#15803d]",
    styles: {
      font: "font-['Inter']",
      background: "bg-white",
      accent: "text-[#2d6a4f]",
      layout: "green-eco",
    },
  },
  {
    id: 18,
    name: "Professional Gray",
    preview: "/templates/professional-gray.png",
    description: "Neutral charcoal palette suitable for any professional service firm",
    color: "bg-[#4b5563]",
    styles: {
      font: "font-['Inter']",
      background: "bg-[#f8f8f8]",
      accent: "text-gray-700",
      layout: "professional-gray",
    },
  },
  {
    id: 19,
    name: "International Business",
    preview: "/templates/international-business.png",
    description: "Multi-currency commercial invoice layout for cross-border trade",
    color: "bg-[#1e1b4b]",
    styles: {
      font: "font-['Inter']",
      background: "bg-white",
      accent: "text-[#1a237e]",
      layout: "international-business",
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
