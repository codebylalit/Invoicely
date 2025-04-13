
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckIcon, FileText, ZapIcon } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";

const Landing = () => {
  return (
    <div className="flex flex-col min-h-screen bg-invoice-light dark:bg-invoice-darkBg">
      <Header />
      
      {/* Hero Section */}
      <section className="py-16 px-6 md:px-12 flex flex-col items-center text-center">
        <div className="animate-fade-in">
          <ZapIcon className="h-14 w-14 text-invoice-orange mb-6" />
          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-invoice-lightText dark:text-invoice-darkText">
            Simple Invoice Generator
          </h1>
          <p className="text-lg md:text-xl text-invoice-gray max-w-2xl mx-auto mb-6">
            Just describe your work and get a professional invoice in seconds
          </p>
          <Button asChild size="lg" className="bg-invoice-orange hover:bg-invoice-orange/90">
            <Link to="/app">Create Invoice Now</Link>
          </Button>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-12 px-6 md:px-12 bg-invoice-dark/5 dark:bg-invoice-darkBg/50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8 text-invoice-lightText dark:text-invoice-darkText">
            How it works
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="flex flex-col items-center text-center">
              <div className="bg-invoice-orange/10 dark:bg-invoice-orange/20 rounded-full p-3 mb-3">
                <FileText className="h-6 w-6 text-invoice-orange" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-invoice-lightText dark:text-invoice-darkText">
                Describe your work
              </h3>
              <p className="text-invoice-gray text-sm">
                Type what you did, for whom, and how much it cost
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="bg-invoice-orange/10 dark:bg-invoice-orange/20 rounded-full p-3 mb-3">
                <ZapIcon className="h-6 w-6 text-invoice-orange" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-invoice-lightText dark:text-invoice-darkText">
                AI generates invoice
              </h3>
              <p className="text-invoice-gray text-sm">
                Our AI formats everything into a professional invoice
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="bg-invoice-orange/10 dark:bg-invoice-orange/20 rounded-full p-3 mb-3">
                <FileText className="h-6 w-6 text-invoice-orange" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-invoice-lightText dark:text-invoice-darkText">
                Download PDF
              </h3>
              <p className="text-invoice-gray text-sm">
                Get your invoice as a PDF ready to send
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Pricing Section - Simplified */}
      <section className="py-12 px-6 md:px-12">
        <div className="max-w-md mx-auto">
          <h2 className="text-2xl font-bold text-center mb-4 text-invoice-lightText dark:text-invoice-darkText">
            Simple pricing
          </h2>
          <p className="text-center text-invoice-gray mb-6">
            Start generating professional invoices today
          </p>
          
          <Card className="border-invoice-orange">
            <CardHeader>
              <CardTitle>Early Access</CardTitle>
              <div className="flex items-baseline mt-2">
                <span className="text-3xl font-bold">$5</span>
                <span className="text-sm text-muted-foreground ml-1">/month</span>
              </div>
              <CardDescription>Perfect for solopreneurs and freelancers</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <CheckIcon className="text-invoice-orange h-5 w-5 mr-2 flex-shrink-0" />
                  <span className="text-sm">Unlimited invoices</span>
                </li>
                <li className="flex items-center">
                  <CheckIcon className="text-invoice-orange h-5 w-5 mr-2 flex-shrink-0" />
                  <span className="text-sm">PDF export</span>
                </li>
                <li className="flex items-center">
                  <CheckIcon className="text-invoice-orange h-5 w-5 mr-2 flex-shrink-0" />
                  <span className="text-sm">Custom branding</span>
                </li>
                <li className="flex items-center">
                  <CheckIcon className="text-invoice-orange h-5 w-5 mr-2 flex-shrink-0" />
                  <span className="text-sm">Cancel anytime</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full bg-invoice-orange hover:bg-invoice-orange/90">
                Subscribe Now
              </Button>
            </CardFooter>
          </Card>
          
          <div className="text-center mt-4">
            <Link to="/app" className="text-invoice-orange hover:underline text-sm">
              Try it free first
            </Link>
          </div>
        </div>
      </section>
      
      <footer className="py-6 px-6 md:px-12 border-t border-border mt-auto">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <FileText className="text-invoice-orange" size={20} />
            <h1 className="text-lg font-bold text-invoice-lightText dark:text-invoice-darkText">
              InvoiceAI
            </h1>
          </div>
          <p className="text-sm text-invoice-gray">© 2025 InvoiceAI</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
