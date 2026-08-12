import React from "react";
import { Link } from "react-router-dom";

const About = () => (
    <div className="max-w-3xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold mb-6 text-[#2D2D2D]">About Invoicely</h1>
        <p className="mb-4 text-lg text-[#444]">
            Invoicely was founded to make invoicing simple, fast, and accessible for freelancers and small businesses. Our mission is to empower entrepreneurs to focus on their work, not paperwork.
        </p>
        <p className="mb-4 text-lg text-[#444]">
            We believe that everyone deserves professional tools, regardless of their business size. That's why we built Invoicely — to provide a smarter, AI-powered way to create, send, and manage invoices. Our platform is designed to save you time, reduce errors, and help you get paid faster.
        </p>
        <h2 className="text-2xl font-semibold mt-8 mb-4 text-[#2D2D2D]">Our Mission</h2>
        <p className="mb-4 text-lg text-[#444]">
            Our mission is to simplify business operations for freelancers and small businesses by providing easy-to-use, innovative invoicing solutions. We are committed to continuous improvement and listening to our users' feedback to make invoicing even better.
        </p>
        <h2 className="text-2xl font-semibold mt-8 mb-4 text-[#2D2D2D]">Our Team</h2>
        <p className="mb-4 text-lg text-[#444]">
            We are a small group of developers, designers, and business experts passionate about helping others succeed. If you have feedback or ideas, we'd love to hear from you!
        </p>
        <p className="mb-4 text-lg text-[#444]">
            <strong>Contact us:</strong> Visit our{" "}
            <Link to="/contact" className="text-amber-600 underline font-medium">
                Contact Page
            </Link>{" "}
            or email us at{" "}
            <a href="mailto:support@getinvoicely.online" className="text-amber-600 underline">
                support@getinvoicely.online
            </a>
        </p>
    </div>
);

export default About; 