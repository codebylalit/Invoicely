import React from "react";

const blogPosts = [
    {
        title: "How to Write a Professional Invoice",
        date: "2024-06-01",
        content: [
            "Creating a professional invoice is essential for getting paid on time and maintaining a good relationship with your clients. Here are some tips:",
            "1. Include all necessary details: Your name, client's name, invoice number, date, and payment terms.",
            "2. Be clear and specific: List each service or product with a description and price.",
            "3. Add your payment information: Make it easy for clients to pay you.",
            "4. Send promptly: The sooner you send your invoice, the sooner you'll get paid.",
            "With Invoicely.me, you can generate invoices in seconds and send them directly to your clients!"
        ]
    },
    {
        title: "Top 5 Invoicing Mistakes to Avoid",
        date: "2024-05-25",
        content: [
            "Invoicing mistakes can delay payments and hurt your business reputation. Here are the top 5 mistakes to avoid:",
            "1. Missing or incorrect details on the invoice.",
            "2. Not specifying payment terms.",
            "3. Sending invoices late.",
            "4. Not following up on overdue payments.",
            "5. Using unprofessional templates.",
            "Invoicely.me helps you avoid these mistakes with smart templates and automated reminders."
        ]
    },
    {
        title: "Why Every Freelancer Needs an Invoice Tool",
        date: "2024-05-15",
        content: [
            "Freelancers often juggle multiple clients and projects. An invoice tool like Invoicely.me saves time, reduces errors, and helps you get paid faster.",
            "You can easily track payments, manage clients, and create professional invoices with just a few clicks.",
            "Try Invoicely.me today and see the difference it makes in your business!"
        ]
    },
    {
        title: "How to Choose the Right Invoice Template for Your Business",
        date: "2024-05-10",
        content: [
            "Choosing the right invoice template can make your business look more professional and help you get paid faster.",
            "Consider your brand colors, the type of services you offer, and the information your clients need most.",
            "With Invoicely.me, you can select from a variety of templates to match your business style."
        ]
    },
    {
        title: "The Importance of Clear Payment Terms",
        date: "2024-05-05",
        content: [
            "Clear payment terms help avoid confusion and ensure you get paid on time.",
            "Always specify due dates, accepted payment methods, and any late fees on your invoices.",
            "Invoicely.me lets you set custom payment terms for every invoice you send."
        ]
    },
    {
        title: "How to Handle Late Payments Professionally",
        date: "2024-04-28",
        content: [
            "Late payments are a common challenge for freelancers and small businesses.",
            "Send polite reminders, offer multiple payment options, and keep communication professional.",
            "Invoicely.me can automate reminders to help you get paid without the awkwardness."
        ]
    }
];

const Blog = () => (
    <div className="max-w-3xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold mb-8 text-[#2D2D2D]">Blog</h1>
        <div className="space-y-12">
            {blogPosts.map((post, idx) => (
                <div key={idx} className="border-b pb-8 mb-8">
                    <h2 className="text-2xl font-semibold mb-2 text-[#2D2D2D]">{post.title}</h2>
                    <p className="text-sm text-[#888] mb-4">{post.date}</p>
                    {post.content.map((para, i) => (
                        <p key={i} className="text-lg text-[#444] mb-2">{para}</p>
                    ))}
                </div>
            ))}
        </div>
    </div>
);

export default Blog; 