
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, CheckIcon, StarIcon, ImageIcon, CircleDollarSign } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import { useSupabaseClient } from '@supabase/auth-helpers-react';

const features = [
  {
    title: "Intelligent Invoicing",
    description: "Let our AI understand your billing effortlessly. Just describe what you need, and get the perfect invoice.",
    icon: StarIcon
  },
  {
    title: "Real-Time Invoice Tracking",
    description: "Monitor the status of your invoices in real-time. Get instant updates on payments and overdue notices.",
    icon: FileText
  },
  {
    title: "Automated Invoice Delivery",
    description: "Schedule and automate your invoice delivery. Set it once and let the system handle the rest.",
    icon: ImageIcon
  },
  {
    title: "Flexible Payment Collection",
    description: "Accept payments through multiple channels. Make it easy for your clients to pay you.",
    icon: CircleDollarSign
  }
];

const Landing = () => {
  const supabase = useSupabaseClient();

  const handleSignIn = async () => {
    if (supabase) {
      await supabase.auth.signInWithOAuth({
        provider: 'github',
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#1A1F2C] text-white">
      <Header />
      
      {/* Hero Section */}
      <section className="py-24 px-6 md:px-12 max-w-6xl mx-auto text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
          AI-Powered Invoicing Made Effortless.
        </h1>
        <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-8">
          Say goodbye to tedious invoice drafting. With InvoiceAI, a simple prompt is all it takes.
        </p>
        <Button 
          onClick={handleSignIn}
          size="lg" 
          className="bg-[#0FA0CE] hover:bg-[#0FA0CE]/90 text-white px-8 py-6 text-lg h-auto"
        >
          Get Started for Free
        </Button>
        <p className="text-sm text-gray-500 mt-4">
          30-day free trial. No credit card required
        </p>
      </section>
      
      {/* Features Section */}
      <section className="py-20 px-6 md:px-12 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">Features</h2>
        <div className="grid md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="bg-[#242937] border-[#353B4B] hover:border-[#0FA0CE] transition-colors">
              <CardContent className="p-6">
                <feature.icon className="h-8 w-8 text-[#0FA0CE] mb-4" />
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-6 md:px-12 max-w-6xl mx-auto text-center">
        <h2 className="text-3xl font-bold mb-4">One low price</h2>
        <p className="text-gray-400 mb-8">Unlock a suite of incredible features for just $5/month.</p>
        <div className="max-w-md mx-auto">
          <Card className="bg-[#242937] border-[#353B4B]">
            <CardContent className="p-8">
              <div className="flex justify-center items-baseline gap-2 mb-6">
                <span className="text-4xl font-bold">$5</span>
                <span className="text-gray-400">/month</span>
              </div>
              <ul className="space-y-3 text-left mb-8">
                <li className="flex items-center gap-2">
                  <CheckIcon className="h-5 w-5 text-[#0FA0CE]" />
                  <span>Unlimited Invoices</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckIcon className="h-5 w-5 text-[#0FA0CE]" />
                  <span>AI-Powered Generation</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckIcon className="h-5 w-5 text-[#0FA0CE]" />
                  <span>PDF Export</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckIcon className="h-5 w-5 text-[#0FA0CE]" />
                  <span>Email Delivery</span>
                </li>
              </ul>
              <Button
                onClick={handleSignIn}
                className="w-full bg-[#0FA0CE] hover:bg-[#0FA0CE]/90"
              >
                Start Free Trial
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 md:px-12 border-t border-[#353B4B]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <FileText className="text-[#0FA0CE]" size={20} />
            <span className="font-bold">InvoiceAI</span>
          </div>
          <p className="text-sm text-gray-400">© 2025 InvoiceAI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
