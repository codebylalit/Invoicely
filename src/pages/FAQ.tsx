import React from "react";

const faqs = [
    {
        question: "What is Invoicely.me?",
        answer: "Invoicely.me is an online tool that helps you create, send, and manage invoices easily."
    },
    {
        question: "Who can use Invoicely.me?",
        answer: "Freelancers, small businesses, and anyone who needs to send invoices can use our platform."
    },
    {
        question: "Is there a free plan?",
        answer: "Yes! Our free plan lets you create basic invoices and manage up to 10 clients."
    },
    {
        question: "How does the AI-powered invoice generation work?",
        answer: "Just enter a prompt describing your work, and our AI will draft a professional invoice for you."
    },
    {
        question: "Can I customize my invoices?",
        answer: "Absolutely! Choose from multiple templates and add your logo for a personalized touch."
    },
    {
        question: "How do I send invoices to clients?",
        answer: "You can email invoices directly from our platform with just one click."
    },
    {
        question: "Is my data secure?",
        answer: "We use industry-standard security practices to keep your data safe and private."
    },
    {
        question: "Can I track payments?",
        answer: "Yes, you can monitor payment status and send reminders for overdue invoices."
    },
    {
        question: "Do you offer recurring invoices?",
        answer: "Yes, recurring invoices are available on our Pro plan for regular clients and subscriptions."
    },
    {
        question: "How do I contact support?",
        answer: "Email us at support@invoicely.me or use our contact form for assistance."
    },
];

const FAQ = () => (
    <div className="max-w-3xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold mb-8 text-[#2D2D2D]">Frequently Asked Questions</h1>
        <div className="space-y-8">
            {faqs.map((faq, idx) => (
                <div key={idx}>
                    <h2 className="text-xl font-semibold mb-2 text-[#2D2D2D]">{faq.question}</h2>
                    <p className="text-lg text-[#444]">{faq.answer}</p>
                </div>
            ))}
        </div>
    </div>
);

export default FAQ; 