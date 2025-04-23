
import { useEffect } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckIcon, FileText, ZapIcon } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import { PricingTier } from "@/types/subscription";

const pricingTiers: PricingTier[] = [
  {
    name: "Free",
    price: "$0",
    description: "Perfect for getting started",
    features: [
      { name: "5 invoices per month", free: true, pro: true },
      { name: "Basic templates", free: true, pro: true },
      { name: "PDF export", free: true, pro: true },
      { name: "Email support", free: true, pro: true },
      { name: "Unlimited invoices", free: false, pro: true },
      { name: "Custom branding", free: false, pro: true },
    ]
  },
  {
    name: "Pro",
    price: "$5",
    description: "For growing businesses",
    features: [
      { name: "5 invoices per month", free: true, pro: true },
      { name: "Basic templates", free: true, pro: true },
      { name: "PDF export", free: true, pro: true },
      { name: "Email support", free: true, pro: true },
      { name: "Unlimited invoices", free: false, pro: true },
      { name: "Custom branding", free: false, pro: true },
    ]
  }
];

const Landing = () => {
  // Get the Supabase client and session from context
  const supabase = useSupabaseClient();
  const session = useSession();
  const navigate = useNavigate();

  useEffect(() => {
    if (session) {
      navigate("/app", { replace: true });
    }
  }, [session, navigate]);

  const handleSignIn = async () => {
    if (supabase) {
      await supabase.auth.signInWithOAuth({
        provider: "github",
      });
    } else {
      console.error("Supabase client is not available");
    }
  };

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
            Create professional invoices in seconds
          </p>
          <Button onClick={handleSignIn} size="lg" className="bg-invoice-orange hover:bg-invoice-orange/90">
            Sign In to Start
          </Button>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-12 px-6 md:px-12">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8 text-invoice-lightText dark:text-invoice-darkText">
            Simple pricing, no hidden fees
          </h2>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {pricingTiers.map((tier) => (
              <Card key={tier.name} className={`border-2 ${tier.name === 'Pro' ? 'border-invoice-orange' : 'border-border'}`}>
                <CardHeader>
                  <CardTitle>{tier.name}</CardTitle>
                  <div className="flex items-baseline mt-2">
                    <span className="text-3xl font-bold">{tier.price}</span>
                    {tier.price !== "$0" && <span className="text-sm text-muted-foreground ml-1">/month</span>}
                  </div>
                  <CardDescription>{tier.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {tier.features.map((feature) => (
                      <li key={feature.name} className="flex items-center">
                        <CheckIcon
                          className={`h-5 w-5 mr-2 flex-shrink-0 ${
                            tier.name === "Free"
                              ? feature.free
                                ? "text-invoice-orange"
                                : "text-muted-foreground"
                              : feature.pro
                                ? "text-invoice-orange"
                                : "text-muted-foreground"
                          }`}
                        />
                        <span className="text-sm">{feature.name}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    onClick={handleSignIn}
                    className={`w-full ${
                      tier.name === "Pro"
                        ? "bg-invoice-orange hover:bg-invoice-orange/90"
                        : "bg-secondary hover:bg-secondary/90"
                    }`}
                  >
                    {tier.name === "Free" ? "Get Started" : "Subscribe Now"}
                  </Button>
                </CardFooter>
              </Card>
            ))}
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

