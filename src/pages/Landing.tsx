
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckIcon, FileText, ZapIcon } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";

const PricingCard = ({ 
  title, 
  price, 
  description, 
  features, 
  buttonText, 
  popular = false 
}: { 
  title: string, 
  price: string, 
  description: string, 
  features: string[], 
  buttonText: string, 
  popular?: boolean 
}) => (
  <Card className={`w-full ${popular ? 'border-invoice-orange ring-2 ring-invoice-orange/20' : ''}`}>
    <CardHeader>
      <CardTitle className="flex items-center justify-between">
        <span>{title}</span>
        {popular && (
          <span className="bg-invoice-orange text-white text-xs font-medium py-1 px-2 rounded">Popular</span>
        )}
      </CardTitle>
      <div className="flex items-baseline mt-2">
        <span className="text-3xl font-bold">{price}</span>
        {price !== "Free" && <span className="text-sm text-muted-foreground ml-1">/month</span>}
      </div>
      <CardDescription>{description}</CardDescription>
    </CardHeader>
    <CardContent>
      <ul className="space-y-2">
        {features.map((feature, i) => (
          <li key={i} className="flex items-center">
            <CheckIcon className="text-invoice-orange h-5 w-5 mr-2 flex-shrink-0" />
            <span className="text-sm">{feature}</span>
          </li>
        ))}
      </ul>
    </CardContent>
    <CardFooter>
      <Button className="w-full" variant={popular ? "default" : "outline"}>
        {buttonText}
      </Button>
    </CardFooter>
  </Card>
);

const Landing = () => {
  return (
    <div className="flex flex-col min-h-screen bg-invoice-light dark:bg-invoice-darkBg">
      <Header />
      
      {/* Hero Section */}
      <section className="py-20 px-6 md:px-12 lg:px-24 flex flex-col items-center text-center">
        <div className="animate-fade-in">
          <ZapIcon className="h-16 w-16 text-invoice-orange mb-6" />
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-invoice-lightText dark:text-invoice-darkText">
            Generate Invoices with AI
          </h1>
          <p className="text-xl md:text-2xl text-invoice-gray max-w-2xl mx-auto mb-8">
            Describe your work in plain English and watch as InvoiceAI creates 
            professional invoices in seconds
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-invoice-orange hover:bg-invoice-orange/90">
              <Link to="/app">Try for Free</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <a href="#pricing">View Pricing</a>
            </Button>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-20 px-6 md:px-12 lg:px-24 bg-invoice-dark/5 dark:bg-invoice-darkBg/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-invoice-lightText dark:text-invoice-darkText">
            How it works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center">
              <div className="bg-invoice-orange/10 dark:bg-invoice-orange/20 rounded-full p-4 mb-4">
                <FileText className="h-8 w-8 text-invoice-orange" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-invoice-lightText dark:text-invoice-darkText">
                Describe your work
              </h3>
              <p className="text-invoice-gray">
                Simply type what you did, for whom, and how much it cost
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="bg-invoice-orange/10 dark:bg-invoice-orange/20 rounded-full p-4 mb-4">
                <ZapIcon className="h-8 w-8 text-invoice-orange" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-invoice-lightText dark:text-invoice-darkText">
                AI generates your invoice
              </h3>
              <p className="text-invoice-gray">
                Our AI extracts all the details and formats them into a professional invoice
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="bg-invoice-orange/10 dark:bg-invoice-orange/20 rounded-full p-4 mb-4">
                <FileText className="h-8 w-8 text-invoice-orange" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-invoice-lightText dark:text-invoice-darkText">
                Edit and download
              </h3>
              <p className="text-invoice-gray">
                Make any final adjustments and export your invoice as a PDF
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-6 md:px-12 lg:px-24">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4 text-invoice-lightText dark:text-invoice-darkText">
            Simple, transparent pricing
          </h2>
          <p className="text-center text-invoice-gray mb-12 max-w-2xl mx-auto">
            Choose the plan that's right for you and start generating professional invoices in seconds.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            <PricingCard
              title="Free"
              price="Free"
              description="Perfect for trying out InvoiceAI"
              features={[
                "5 invoices per month",
                "Basic invoice template",
                "PDF export with watermark",
                "7-day history"
              ]}
              buttonText="Get Started"
            />
            <PricingCard
              title="Pro"
              price="$12"
              description="For freelancers and small businesses"
              features={[
                "Unlimited invoices",
                "Multiple templates",
                "No watermarks",
                "30-day history",
                "Email sending"
              ]}
              buttonText="Subscribe to Pro"
              popular={true}
            />
            <PricingCard
              title="Business"
              price="$29"
              description="For teams and growing businesses"
              features={[
                "Everything in Pro",
                "Team accounts (up to 5)",
                "Custom branding",
                "Analytics dashboard",
                "Priority support",
                "90-day history"
              ]}
              buttonText="Subscribe to Business"
            />
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 px-6 md:px-12 lg:px-24 bg-invoice-orange text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to simplify your invoicing?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of freelancers and small businesses who are saving time with InvoiceAI.
          </p>
          <Button asChild size="lg" variant="outline" className="bg-white text-invoice-orange hover:bg-white/90 border-none">
            <Link to="/app">Get Started for Free</Link>
          </Button>
        </div>
      </section>
      
      <footer className="py-8 px-6 md:px-12 lg:px-24 border-t border-border">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <FileText className="text-invoice-orange" size={24} />
            <h1 className="text-xl font-bold text-invoice-lightText dark:text-invoice-darkText">
              InvoiceAI
            </h1>
          </div>
          <p className="text-sm text-invoice-gray">© 2025 InvoiceAI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
