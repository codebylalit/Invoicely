import React from 'react';
import InvoiceItemsTable from './InvoiceItemsTable';
import InvoiceSummary from './InvoiceSummary';
import PaymentDetails from './PaymentDetails';
import {
    MinimalWhiteTemplate,
    ModernSaasTemplate,
    StripeInspiredTemplate,
    AppleMinimalTemplate,
    CorporateBlueTemplate,
    ElegantDarkTemplate,
    LuxuryBlackTemplate,
    ModernPurpleTemplate,
    CreativeAgencyTemplate,
    FreelancerTemplate,
    StartupTemplate,
    FinanceTemplate,
    HealthcareTemplate,
    ConstructionTemplate,
    RetailTemplate,
    RestaurantTemplate,
    ConsultingTemplate,
    GreenEcoTemplate,
    ProfessionalGrayTemplate,
    InternationalBusinessTemplate
} from './InvoicePremiumTemplates';

interface InvoiceLayoutProps {
    layout: string;
    businessDetails: any;
    displayInvoice: any;
    calculatedInvoice: any;
    paymentDetails: any;
    isPro?: boolean;
}

const InvoiceLayout: React.FC<InvoiceLayoutProps> = ({ layout, businessDetails, displayInvoice, calculatedInvoice, paymentDetails, isPro }) => {
    switch (layout) {
        case 'default':
            return (
                <div className="space-y-8">
                    <div className="flex justify-between items-center mb-8">
                        <div className="flex items-center space-x-4">
                            {businessDetails.logo_url && (
                                <img src={businessDetails.logo_url} alt="Business logo" className="h-14 w-14 object-contain" crossOrigin="anonymous" />
                            )}
                            <div>
                                <h1 className="text-2xl font-bold text-invoice-lightText dark:text-invoice-darkText">
                                    {displayInvoice.invoiceTitle || "Invoice"}
                                </h1>
                                <p className="text-sm text-gray-600">Issued: {displayInvoice.issuedDate}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-600">Invoice# {displayInvoice.invoiceNumber || "00000"}</p>
                        </div>
                    </div>
                    <div className="flex justify-between">
                        <div className="w-1/2">
                            <div className="mb-6">
                                <p className="text-sm text-gray-600 mb-1">Issued</p>
                                <p className="text-sm">{displayInvoice.issuedDate}</p>
                            </div>
                            <div className="mb-6">
                                <p className="text-sm text-gray-600 mb-1">From</p>
                                <p className="text-sm">{businessDetails.business_name}</p>
                                <p className="text-sm">{businessDetails.email || "N/A"}</p>
                                <p className="text-sm">
                                    {businessDetails.address && `${businessDetails.address}, `}
                                    {businessDetails.city && `${businessDetails.city}, `}
                                    {businessDetails.postal_code}
                                </p>
                            </div>
                        </div>
                        <div className="w-1/2 text-right">
                            <div className="mb-6">
                                <p className="text-sm text-gray-600 mb-1">Due</p>
                                <p className="text-sm">{displayInvoice.dueDate}</p>
                            </div>
                            <div className="mb-6">
                                <p className="text-sm text-gray-600 mb-1">Invoice For</p>
                                <p className="text-sm">{displayInvoice.name || "N/A"}</p>
                                <p className="text-sm">{displayInvoice.email || "N/A"}</p>
                                <p className="text-sm">{displayInvoice.details || "N/A"}</p>
                            </div>
                        </div>
                    </div>
                    <InvoiceItemsTable items={displayInvoice.items} />
                    <div className="flex justify-end mb-8">
                        <div className="w-1/3">
                            <InvoiceSummary
                                subtotal={calculatedInvoice.subtotal}
                                discounts={calculatedInvoice.discounts}
                                taxes={calculatedInvoice.taxes}
                                total={calculatedInvoice.total}
                            />
                        </div>
                    </div>
                    <PaymentDetails
                        showPaymentMethods={displayInvoice.showPaymentMethods !== false}
                        paymentMethods={displayInvoice.paymentMethods}
                        paymentDetails={paymentDetails}
                        theme="default"
                    />
                </div>
            );
        case 'classic':
            return (
                <div className="space-y-8">
                    <div className="flex justify-between items-start">
                        <div className="space-y-2">
                            <h1 className="text-3xl font-bold">{displayInvoice.invoiceTitle}</h1>
                            <p className="text-gray-600">Invoice #{displayInvoice.invoiceNumber}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-gray-600">Issued: {displayInvoice.issuedDate}</p>
                            <p className="text-gray-600">Due: {displayInvoice.dueDate}</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <h2 className="font-semibold">From</h2>
                            <p>{businessDetails.business_name}</p>
                            <p>{businessDetails.address}</p>
                            <p>{businessDetails.email}</p>
                        </div>
                        <div className="space-y-2">
                            <h2 className="font-semibold">To</h2>
                            <p>{displayInvoice.name}</p>
                            <p>{displayInvoice.details}</p>
                            <p>{displayInvoice.email}</p>
                        </div>
                    </div>
                    <InvoiceItemsTable items={displayInvoice.items} />
                    <div className="flex justify-end">
                        <div className="w-1/3">
                            <InvoiceSummary
                                subtotal={calculatedInvoice.subtotal}
                                discounts={calculatedInvoice.discounts}
                                taxes={calculatedInvoice.taxes}
                                total={calculatedInvoice.total}
                            />
                        </div>
                    </div>
                    <PaymentDetails
                        showPaymentMethods={displayInvoice.showPaymentMethods !== false}
                        paymentMethods={displayInvoice.paymentMethods}
                        paymentDetails={paymentDetails}
                        theme="classic"
                    />
                </div>
            );
        case 'modern':
            return (
                <div className="space-y-12">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-4xl font-bold mb-2">{displayInvoice.invoiceTitle}</h1>
                            <div className="flex gap-4 text-gray-600">
                                <p>#{displayInvoice.invoiceNumber}</p>
                                <p>•</p>
                                <p>Issued: {displayInvoice.issuedDate}</p>
                                <p>•</p>
                                <p>Due: {displayInvoice.dueDate}</p>
                            </div>
                        </div>
                        {businessDetails.logo_url && (
                            <img src={businessDetails.logo_url} alt="Logo" className="h-16" crossOrigin="anonymous" />
                        )}
                    </div>
                    <div className="grid grid-cols-2 gap-12">
                        <div>
                            <h2 className="text-lg font-semibold mb-4">From</h2>
                            <div className="space-y-2">
                                <p className="font-medium">{businessDetails.business_name}</p>
                                <p className="text-gray-600">{businessDetails.address}</p>
                                <p className="text-gray-600">{businessDetails.email}</p>
                            </div>
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold mb-4">To</h2>
                            <div className="space-y-2">
                                <p className="font-medium">{displayInvoice.name}</p>
                                <p className="text-gray-600">{displayInvoice.details}</p>
                                <p className="text-gray-600">{displayInvoice.email}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-6">
                        <InvoiceItemsTable items={displayInvoice.items} />
                    </div>
                    <div className="flex justify-end">
                        <div className="w-1/3">
                            <InvoiceSummary
                                subtotal={calculatedInvoice.subtotal}
                                discounts={calculatedInvoice.discounts}
                                taxes={calculatedInvoice.taxes}
                                total={calculatedInvoice.total}
                            />
                        </div>
                    </div>
                    <PaymentDetails
                        showPaymentMethods={displayInvoice.showPaymentMethods !== false}
                        paymentMethods={displayInvoice.paymentMethods}
                        paymentDetails={paymentDetails}
                        theme="modern"
                    />
                </div>
            );
        case 'minimal':
            return (
                <div className="space-y-16">
                    <div className="text-center">
                        <h1 className="text-4xl font-light mb-2">{displayInvoice.invoiceTitle}</h1>
                        <p className="text-gray-600">#{displayInvoice.invoiceNumber}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-16">
                        <div>
                            <h2 className="text-sm font-medium mb-4">FROM</h2>
                            <div className="space-y-1">
                                <p>{businessDetails.business_name}</p>
                                <p className="text-gray-600">{businessDetails.address}</p>
                                <p className="text-gray-600">{businessDetails.email}</p>
                            </div>
                        </div>
                        <div>
                            <h2 className="text-sm font-medium mb-4">TO</h2>
                            <div className="space-y-1">
                                <p>{displayInvoice.name}</p>
                                <p className="text-gray-600">{displayInvoice.details}</p>
                                <p className="text-gray-600">{displayInvoice.email}</p>
                            </div>
                        </div>
                    </div>
                    <InvoiceItemsTable items={displayInvoice.items} />
                    <div className="flex justify-end">
                        <div className="w-1/3">
                            <InvoiceSummary
                                subtotal={calculatedInvoice.subtotal}
                                discounts={calculatedInvoice.discounts}
                                taxes={calculatedInvoice.taxes}
                                total={calculatedInvoice.total}
                            />
                        </div>
                    </div>
                    <PaymentDetails
                        showPaymentMethods={displayInvoice.showPaymentMethods !== false}
                        paymentMethods={displayInvoice.paymentMethods}
                        paymentDetails={paymentDetails}
                        theme="minimal"
                    />
                </div>
            );
        case 'billy':
            return (
                <div className="p-8 rounded-lg bg-blue-50">
                    <div className="max-w-xl mx-auto flex flex-col items-center">
                        <h1 className="text-xl font-semibold mb-2 text-center text-blue-900">
                            Invoice from {businessDetails.business_name || 'Your Company'}
                        </h1>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-blue-900">{displayInvoice.items[0]?.description || ''}</span>
                        </div>
                        <div className="text-center text-sm text-blue-700 mb-2">Total amount</div>
                        <div className="text-center text-3xl font-bold text-blue-900 mb-6">
                            ${calculatedInvoice.total.toFixed(2)}
                        </div>
                        <div className="w-full mb-6">
                            <InvoiceItemsTable items={displayInvoice.items} />
                        </div>
                        <div className="w-full mb-6">
                            <InvoiceSummary
                                subtotal={calculatedInvoice.subtotal}
                                discounts={calculatedInvoice.discounts}
                                taxes={calculatedInvoice.taxes}
                                total={calculatedInvoice.total}
                            />
                        </div>
                        <PaymentDetails
                            showPaymentMethods={displayInvoice.showPaymentMethods !== false}
                            paymentMethods={displayInvoice.paymentMethods}
                            paymentDetails={paymentDetails}
                            theme="billy"
                        />
                    </div>
                </div>
            );
        case 'executive':
            return (
                <div className="p-10 bg-gray-900 text-white rounded-lg space-y-8">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold">{displayInvoice.invoiceTitle}</h1>
                            <p className="text-gray-300">Invoice #{displayInvoice.invoiceNumber}</p>
                        </div>
                        {businessDetails.logo_url && (
                            <img src={businessDetails.logo_url} alt="Logo" className="h-16 bg-white rounded-full p-2" crossOrigin="anonymous" />
                        )}
                    </div>
                    <div className="grid grid-cols-2 gap-8">
                        <div>
                            <h2 className="font-semibold">From</h2>
                            <p>{businessDetails.business_name}</p>
                            <p>{businessDetails.address}</p>
                            <p>{businessDetails.email}</p>
                        </div>
                        <div>
                            <h2 className="font-semibold">To</h2>
                            <p>{displayInvoice.name}</p>
                            <p>{displayInvoice.details}</p>
                            <p>{displayInvoice.email}</p>
                        </div>
                    </div>
                    <InvoiceItemsTable items={displayInvoice.items} />
                    <div className="flex justify-end">
                        <div className="w-1/3">
                            <InvoiceSummary
                                subtotal={calculatedInvoice.subtotal}
                                discounts={calculatedInvoice.discounts}
                                taxes={calculatedInvoice.taxes}
                                total={calculatedInvoice.total}
                                theme="executive"
                            />
                        </div>
                    </div>
                    <PaymentDetails
                        showPaymentMethods={displayInvoice.showPaymentMethods !== false}
                        paymentMethods={displayInvoice.paymentMethods}
                        paymentDetails={paymentDetails}
                        theme="executive"
                    />
                </div>
            );
        case 'corporate':
            return (
                <div className="p-8 bg-white border border-gray-200 rounded-lg space-y-8">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold text-blue-800">{displayInvoice.invoiceTitle}</h1>
                            <p className="text-gray-500">Invoice #{displayInvoice.invoiceNumber}</p>
                        </div>
                        {businessDetails.logo_url && (
                            <img src={businessDetails.logo_url} alt="Logo" className="h-12" crossOrigin="anonymous" />
                        )}
                    </div>
                    <div className="grid grid-cols-2 gap-8">
                        <div>
                            <h2 className="font-semibold">From</h2>
                            <p>{businessDetails.business_name}</p>
                            <p>{businessDetails.address}</p>
                            <p>{businessDetails.email}</p>
                        </div>
                        <div>
                            <h2 className="font-semibold">To</h2>
                            <p>{displayInvoice.name}</p>
                            <p>{displayInvoice.details}</p>
                            <p>{displayInvoice.email}</p>
                        </div>
                    </div>
                    <InvoiceItemsTable items={displayInvoice.items} />
                    <div className="flex justify-end">
                        <div className="w-1/3">
                            <InvoiceSummary
                                subtotal={calculatedInvoice.subtotal}
                                discounts={calculatedInvoice.discounts}
                                taxes={calculatedInvoice.taxes}
                                total={calculatedInvoice.total}
                                theme="corporate"
                            />
                        </div>
                    </div>
                    <PaymentDetails
                        showPaymentMethods={displayInvoice.showPaymentMethods !== false}
                        paymentMethods={displayInvoice.paymentMethods}
                        paymentDetails={paymentDetails}
                        theme="corporate"
                    />
                </div>
            );
        case 'elegant':
            return (
                <div className="p-10 bg-gradient-to-br from-gray-50 to-white rounded-lg shadow space-y-8">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-serif font-bold text-gray-800">{displayInvoice.invoiceTitle}</h1>
                            <p className="text-gray-500">Invoice #{displayInvoice.invoiceNumber}</p>
                        </div>
                        {businessDetails.logo_url && (
                            <img src={businessDetails.logo_url} alt="Logo" className="h-14 rounded shadow" crossOrigin="anonymous" />
                        )}
                    </div>
                    <div className="grid grid-cols-2 gap-8">
                        <div>
                            <h2 className="font-semibold">From</h2>
                            <p>{businessDetails.business_name}</p>
                            <p>{businessDetails.address}</p>
                            <p>{businessDetails.email}</p>
                        </div>
                        <div>
                            <h2 className="font-semibold">To</h2>
                            <p>{displayInvoice.name}</p>
                            <p>{displayInvoice.details}</p>
                            <p>{displayInvoice.email}</p>
                        </div>
                    </div>
                    <InvoiceItemsTable items={displayInvoice.items} />
                    <div className="flex justify-end">
                        <div className="w-1/3">
                            <InvoiceSummary
                                subtotal={calculatedInvoice.subtotal}
                                discounts={calculatedInvoice.discounts}
                                taxes={calculatedInvoice.taxes}
                                total={calculatedInvoice.total}
                                theme="elegant"
                            />
                        </div>
                    </div>
                    <PaymentDetails
                        showPaymentMethods={displayInvoice.showPaymentMethods !== false}
                        paymentMethods={displayInvoice.paymentMethods}
                        paymentDetails={paymentDetails}
                        theme="elegant"
                    />
                </div>
            );
        case 'tech':
            return (
                <div className="p-8 bg-gray-900 text-green-400 rounded-lg space-y-8">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-mono font-bold">{displayInvoice.invoiceTitle}</h1>
                            <p className="text-green-300">Invoice #{displayInvoice.invoiceNumber}</p>
                        </div>
                        {businessDetails.logo_url && (
                            <img src={businessDetails.logo_url} alt="Logo" className="h-14" crossOrigin="anonymous" />
                        )}
                    </div>
                    <div className="grid grid-cols-2 gap-8">
                        <div>
                            <h2 className="font-semibold">From</h2>
                            <p>{businessDetails.business_name}</p>
                            <p>{businessDetails.address}</p>
                            <p>{businessDetails.email}</p>
                        </div>
                        <div>
                            <h2 className="font-semibold">To</h2>
                            <p>{displayInvoice.name}</p>
                            <p>{displayInvoice.details}</p>
                            <p>{displayInvoice.email}</p>
                        </div>
                    </div>
                    <InvoiceItemsTable items={displayInvoice.items} />
                    <div className="flex justify-end">
                        <div className="w-1/3">
                            <InvoiceSummary
                                subtotal={calculatedInvoice.subtotal}
                                discounts={calculatedInvoice.discounts}
                                taxes={calculatedInvoice.taxes}
                                total={calculatedInvoice.total}
                                theme="tech"
                            />
                        </div>
                    </div>
                    <PaymentDetails
                        showPaymentMethods={displayInvoice.showPaymentMethods !== false}
                        paymentMethods={displayInvoice.paymentMethods}
                        paymentDetails={paymentDetails}
                        theme="tech"
                    />
                </div>
            );
        case 'minimalist':
            return (
                <div className="p-8 bg-white border border-gray-100 rounded-lg space-y-8">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-light">{displayInvoice.invoiceTitle}</h1>
                            <p className="text-gray-400">Invoice #{displayInvoice.invoiceNumber}</p>
                        </div>
                        {businessDetails.logo_url && (
                            <img src={businessDetails.logo_url} alt="Logo" className="h-10" crossOrigin="anonymous" />
                        )}
                    </div>
                    <div className="grid grid-cols-2 gap-8">
                        <div>
                            <h2 className="font-semibold">From</h2>
                            <p>{businessDetails.business_name}</p>
                            <p>{businessDetails.address}</p>
                            <p>{businessDetails.email}</p>
                        </div>
                        <div>
                            <h2 className="font-semibold">To</h2>
                            <p>{displayInvoice.name}</p>
                            <p>{displayInvoice.details}</p>
                            <p>{displayInvoice.email}</p>
                        </div>
                    </div>
                    <InvoiceItemsTable items={displayInvoice.items} />
                    <div className="flex justify-end">
                        <div className="w-1/3">
                            <InvoiceSummary
                                subtotal={calculatedInvoice.subtotal}
                                discounts={calculatedInvoice.discounts}
                                taxes={calculatedInvoice.taxes}
                                total={calculatedInvoice.total}
                                theme="minimalist"
                            />
                        </div>
                    </div>
                    <PaymentDetails
                        showPaymentMethods={displayInvoice.showPaymentMethods !== false}
                        paymentMethods={displayInvoice.paymentMethods}
                        paymentDetails={paymentDetails}
                        theme="minimalist"
                    />
                </div>
            );
        case 'creative':
            return (
                <div className="p-10 bg-gradient-to-br from-pink-100 to-yellow-100 rounded-lg shadow space-y-8">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-pink-700">{displayInvoice.invoiceTitle}</h1>
                            <p className="text-pink-500">Invoice #{displayInvoice.invoiceNumber}</p>
                        </div>
                        {businessDetails.logo_url && (
                            <img src={businessDetails.logo_url} alt="Logo" className="h-14 rounded shadow" crossOrigin="anonymous" />
                        )}
                    </div>
                    <div className="grid grid-cols-2 gap-8">
                        <div>
                            <h2 className="font-semibold">From</h2>
                            <p>{businessDetails.business_name}</p>
                            <p>{businessDetails.address}</p>
                            <p>{businessDetails.email}</p>
                        </div>
                        <div>
                            <h2 className="font-semibold">To</h2>
                            <p>{displayInvoice.name}</p>
                            <p>{displayInvoice.details}</p>
                            <p>{displayInvoice.email}</p>
                        </div>
                    </div>
                    <InvoiceItemsTable items={displayInvoice.items} />
                    <div className="flex justify-end">
                        <div className="w-1/3">
                            <InvoiceSummary
                                subtotal={calculatedInvoice.subtotal}
                                discounts={calculatedInvoice.discounts}
                                taxes={calculatedInvoice.taxes}
                                total={calculatedInvoice.total}
                                theme="creative"
                            />
                        </div>
                    </div>
                    <PaymentDetails
                        showPaymentMethods={displayInvoice.showPaymentMethods !== false}
                        paymentMethods={displayInvoice.paymentMethods}
                        paymentDetails={paymentDetails}
                        theme="creative"
                    />
                </div>
            );
        case 'finance':
            return (
                <div className="p-8 bg-green-50 rounded-lg space-y-8">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-green-900">{displayInvoice.invoiceTitle}</h1>
                            <p className="text-green-700">Invoice #{displayInvoice.invoiceNumber}</p>
                        </div>
                        {businessDetails.logo_url && (
                            <img src={businessDetails.logo_url} alt="Logo" className="h-14" crossOrigin="anonymous" />
                        )}
                    </div>
                    <div className="grid grid-cols-2 gap-8">
                        <div>
                            <h2 className="font-semibold">From</h2>
                            <p>{businessDetails.business_name}</p>
                            <p>{businessDetails.address}</p>
                            <p>{businessDetails.email}</p>
                        </div>
                        <div>
                            <h2 className="font-semibold">To</h2>
                            <p>{displayInvoice.name}</p>
                            <p>{displayInvoice.details}</p>
                            <p>{displayInvoice.email}</p>
                        </div>
                    </div>
                    <InvoiceItemsTable items={displayInvoice.items} />
                    <div className="flex justify-end">
                        <div className="w-1/3">
                            <InvoiceSummary
                                subtotal={calculatedInvoice.subtotal}
                                discounts={calculatedInvoice.discounts}
                                taxes={calculatedInvoice.taxes}
                                total={calculatedInvoice.total}
                                theme="finance"
                            />
                        </div>
                    </div>
                    <PaymentDetails
                        showPaymentMethods={displayInvoice.showPaymentMethods !== false}
                        paymentMethods={displayInvoice.paymentMethods}
                        paymentDetails={paymentDetails}
                        theme="finance"
                    />
                </div>
            );
        case 'modern-classic':
            return (
                <div className="p-8 bg-white border-l-8 border-blue-600 rounded-lg space-y-8">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-blue-800">{displayInvoice.invoiceTitle}</h1>
                            <p className="text-blue-500">Invoice #{displayInvoice.invoiceNumber}</p>
                        </div>
                        {businessDetails.logo_url && (
                            <img src={businessDetails.logo_url} alt="Logo" className="h-14" crossOrigin="anonymous" />
                        )}
                    </div>
                    <div className="grid grid-cols-2 gap-8">
                        <div>
                            <h2 className="font-semibold">From</h2>
                            <p>{businessDetails.business_name}</p>
                            <p>{businessDetails.address}</p>
                            <p>{businessDetails.email}</p>
                        </div>
                        <div>
                            <h2 className="font-semibold">To</h2>
                            <p>{displayInvoice.name}</p>
                            <p>{displayInvoice.details}</p>
                            <p>{displayInvoice.email}</p>
                        </div>
                    </div>
                    <InvoiceItemsTable items={displayInvoice.items} />
                    <div className="flex justify-end">
                        <div className="w-1/3">
                            <InvoiceSummary
                                subtotal={calculatedInvoice.subtotal}
                                discounts={calculatedInvoice.discounts}
                                taxes={calculatedInvoice.taxes}
                                total={calculatedInvoice.total}
                                theme="modern-classic"
                            />
                        </div>
                    </div>
                    <PaymentDetails
                        showPaymentMethods={displayInvoice.showPaymentMethods !== false}
                        paymentMethods={displayInvoice.paymentMethods}
                        paymentDetails={paymentDetails}
                        theme="modern-classic"
                    />
                </div>
            );
        case 'premium':
            return (
                <div className="p-10 bg-gradient-to-br from-yellow-100 to-yellow-50 rounded-lg shadow space-y-8">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-yellow-800">{displayInvoice.invoiceTitle}</h1>
                            <p className="text-yellow-600">Invoice #{displayInvoice.invoiceNumber}</p>
                        </div>
                        {businessDetails.logo_url && (
                            <img src={businessDetails.logo_url} alt="Logo" className="h-14 rounded shadow" crossOrigin="anonymous" />
                        )}
                    </div>
                    <div className="grid grid-cols-2 gap-8">
                        <div>
                            <h2 className="font-semibold">From</h2>
                            <p>{businessDetails.business_name}</p>
                            <p>{businessDetails.address}</p>
                            <p>{businessDetails.email}</p>
                        </div>
                        <div>
                            <h2 className="font-semibold">To</h2>
                            <p>{displayInvoice.name}</p>
                            <p>{displayInvoice.details}</p>
                            <p>{displayInvoice.email}</p>
                        </div>
                    </div>
                    <InvoiceItemsTable items={displayInvoice.items} />
                    <div className="flex justify-end">
                        <div className="w-1/3">
                            <InvoiceSummary
                                subtotal={calculatedInvoice.subtotal}
                                discounts={calculatedInvoice.discounts}
                                taxes={calculatedInvoice.taxes}
                                total={calculatedInvoice.total}
                                theme="premium"
                            />
                        </div>
                    </div>
                    <PaymentDetails
                        showPaymentMethods={displayInvoice.showPaymentMethods !== false}
                        paymentMethods={displayInvoice.paymentMethods}
                        paymentDetails={paymentDetails}
                        theme="premium"
                    />
                </div>
            );
        case 'business-pro':
            return (
                <div className="p-8 bg-gradient-to-br from-blue-100 to-blue-50 rounded-lg shadow space-y-8">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-blue-900">{displayInvoice.invoiceTitle}</h1>
                            <p className="text-blue-700">Invoice #{displayInvoice.invoiceNumber}</p>
                        </div>
                        {businessDetails.logo_url && (
                            <img src={businessDetails.logo_url} alt="Logo" className="h-14 rounded shadow" crossOrigin="anonymous" />
                        )}
                    </div>
                    <div className="grid grid-cols-2 gap-8">
                        <div>
                            <h2 className="font-semibold">From</h2>
                            <p>{businessDetails.business_name}</p>
                            <p>{businessDetails.address}</p>
                            <p>{businessDetails.email}</p>
                        </div>
                        <div>
                            <h2 className="font-semibold">To</h2>
                            <p>{displayInvoice.name}</p>
                            <p>{displayInvoice.details}</p>
                            <p>{displayInvoice.email}</p>
                        </div>
                    </div>
                    <InvoiceItemsTable items={displayInvoice.items} />
                    <div className="flex justify-end">
                        <div className="w-1/3">
                            <InvoiceSummary
                                subtotal={calculatedInvoice.subtotal}
                                discounts={calculatedInvoice.discounts}
                                taxes={calculatedInvoice.taxes}
                                total={calculatedInvoice.total}
                                theme="business-pro"
                            />
                        </div>
                    </div>
                    <PaymentDetails
                        showPaymentMethods={displayInvoice.showPaymentMethods !== false}
                        paymentMethods={displayInvoice.paymentMethods}
                        paymentDetails={paymentDetails}
                        theme="business-pro"
                    />
                </div>
            );
        case 'minimal-white':
            return <MinimalWhiteTemplate businessDetails={businessDetails} displayInvoice={displayInvoice} calculatedInvoice={calculatedInvoice} paymentDetails={paymentDetails} />;
        case 'modern-saas':
            return <ModernSaasTemplate businessDetails={businessDetails} displayInvoice={displayInvoice} calculatedInvoice={calculatedInvoice} paymentDetails={paymentDetails} />;
        case 'stripe-inspired':
            return <StripeInspiredTemplate businessDetails={businessDetails} displayInvoice={displayInvoice} calculatedInvoice={calculatedInvoice} paymentDetails={paymentDetails} />;
        case 'apple-minimal':
            return <AppleMinimalTemplate businessDetails={businessDetails} displayInvoice={displayInvoice} calculatedInvoice={calculatedInvoice} paymentDetails={paymentDetails} />;
        case 'corporate-blue':
            return <CorporateBlueTemplate businessDetails={businessDetails} displayInvoice={displayInvoice} calculatedInvoice={calculatedInvoice} paymentDetails={paymentDetails} />;
        case 'elegant-dark':
            return <ElegantDarkTemplate businessDetails={businessDetails} displayInvoice={displayInvoice} calculatedInvoice={calculatedInvoice} paymentDetails={paymentDetails} />;
        case 'luxury-black':
            return <LuxuryBlackTemplate businessDetails={businessDetails} displayInvoice={displayInvoice} calculatedInvoice={calculatedInvoice} paymentDetails={paymentDetails} />;
        case 'modern-purple':
            return <ModernPurpleTemplate businessDetails={businessDetails} displayInvoice={displayInvoice} calculatedInvoice={calculatedInvoice} paymentDetails={paymentDetails} />;
        case 'creative-agency':
            return <CreativeAgencyTemplate businessDetails={businessDetails} displayInvoice={displayInvoice} calculatedInvoice={calculatedInvoice} paymentDetails={paymentDetails} />;
        case 'freelancer':
            return <FreelancerTemplate businessDetails={businessDetails} displayInvoice={displayInvoice} calculatedInvoice={calculatedInvoice} paymentDetails={paymentDetails} />;
        case 'startup':
            return <StartupTemplate businessDetails={businessDetails} displayInvoice={displayInvoice} calculatedInvoice={calculatedInvoice} paymentDetails={paymentDetails} />;
        case 'finance-pro':
            return <FinanceTemplate businessDetails={businessDetails} displayInvoice={displayInvoice} calculatedInvoice={calculatedInvoice} paymentDetails={paymentDetails} />;
        case 'healthcare':
            return <HealthcareTemplate businessDetails={businessDetails} displayInvoice={displayInvoice} calculatedInvoice={calculatedInvoice} paymentDetails={paymentDetails} />;
        case 'construction':
            return <ConstructionTemplate businessDetails={businessDetails} displayInvoice={displayInvoice} calculatedInvoice={calculatedInvoice} paymentDetails={paymentDetails} />;
        case 'retail':
            return <RetailTemplate businessDetails={businessDetails} displayInvoice={displayInvoice} calculatedInvoice={calculatedInvoice} paymentDetails={paymentDetails} />;
        case 'restaurant':
            return <RestaurantTemplate businessDetails={businessDetails} displayInvoice={displayInvoice} calculatedInvoice={calculatedInvoice} paymentDetails={paymentDetails} />;
        case 'consulting':
            return <ConsultingTemplate businessDetails={businessDetails} displayInvoice={displayInvoice} calculatedInvoice={calculatedInvoice} paymentDetails={paymentDetails} />;
        case 'green-eco':
            return <GreenEcoTemplate businessDetails={businessDetails} displayInvoice={displayInvoice} calculatedInvoice={calculatedInvoice} paymentDetails={paymentDetails} />;
        case 'professional-gray':
            return <ProfessionalGrayTemplate businessDetails={businessDetails} displayInvoice={displayInvoice} calculatedInvoice={calculatedInvoice} paymentDetails={paymentDetails} />;
        case 'international-business':
            return <InternationalBusinessTemplate businessDetails={businessDetails} displayInvoice={displayInvoice} calculatedInvoice={calculatedInvoice} paymentDetails={paymentDetails} />;
        default:
            return <MinimalWhiteTemplate businessDetails={businessDetails} displayInvoice={displayInvoice} calculatedInvoice={calculatedInvoice} paymentDetails={paymentDetails} />;
    }
};

export default InvoiceLayout; 