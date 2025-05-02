import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { toast } from "@/components/ui/use-toast";
import Subscription from "@/components/Subscription";
import { useLocation, useNavigate } from "react-router-dom";
import { Sun, Moon } from "lucide-react";

const Settings = () => {
  const supabase = useSupabaseClient();
  const session = useSession();
  const [activeTab, setActiveTab] = useState("business");
  const [loading, setLoading] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // User subscription state
  const [userSubscription, setUserSubscription] = useState({
    tier: "free", // free, growing, advanced
    paymentMethod: null, // stripe, null
    bankTransferDetails: "",
    subscriptionId: "",
    planId: "",
  });

  // Business details form state
  const [businessDetails, setBusinessDetails] = useState({
    contact_name: "",
    business_name: "",
    email: "",
    address: "",
    city: "",
    postal_code: "",
    region_state: "",
    country: "",
    phone_number: "",
    vat_number: "",
    logo_url: null,
  });

  // Fetch user data on component mount
  useEffect(() => {
    if (session?.user?.id) {
      fetchBusinessDetails();
    }
  }, [session]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("token")) {
      if (window.opener) {
        window.opener.postMessage(
          { type: "PAYPAL_PAYMENT_COMPLETE", orderId: params.get("token") },
          window.location.origin
        );
        setTimeout(() => window.close(), 500);
      }
      toast({
        title: "Payment Complete!",
        description: "Thank you for your payment. Your subscription will be updated shortly.",
      });
    }

    // Set subscription tab active if coming from PayPal flow
    if (params.get("from") === "paypal") {
      setActiveTab("subscription");
    }
  }, [location]);

  // Theme settings
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

    if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
      setIsDarkMode(true);
      document.documentElement.classList.add("dark");
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setIsDarkMode(true);
    }
  };

  // Fetch business details from Supabase
  const fetchBusinessDetails = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("business_details")
        .select("*")
        .eq("user_id", session.user.id)
        .single();

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      if (data) {
        setBusinessDetails(data);
      }
    } catch (error) {
      console.error("Error fetching business details:", error);
      toast({
        title: "Error",
        description: "Failed to load business details.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchUserSubscription = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          return;
        }

        const { data, error } = await supabase
          .from("profiles")
          .select("tier, payment_method, bank_transfer_details, subscription_id, plan_id")
          .eq("user_id", user.id)
          .single();

        if (error) {
          console.error("Error fetching user subscription:", error);
          return;
        }

        setUserSubscription({
          tier: data.tier || "free",
          paymentMethod: data.payment_method || null,
          bankTransferDetails: data.bank_transfer_details || "",
          subscriptionId: data.subscription_id || "",
          planId: data.plan_id || "",
        });
      } catch (error) {
        console.error("Error in subscription fetch:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserSubscription();
  }, [supabase]);

  // Handle input changes for business details form
  const handleBusinessInputChange = (e) => {
    const { name, value } = e.target;
    setBusinessDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle bank transfer details change
  const handleBankDetailsChange = (e) => {
    setUserSubscription((prev) => ({
      ...prev,
      bankTransferDetails: e.target.value,
    }));
  };

  // Handle file upload for logo
  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      // Create a unique file name
      const fileExt = file.name.split(".").pop();
      const fileName = `${session.user.id}-${Math.random()
        .toString(36)
        .substring(2)}.${fileExt}`;
      const filePath = `business_logos/${fileName}`;

      // Upload file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("logos")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL for the file
      const { data } = supabase.storage.from("logos").getPublicUrl(filePath);

      setBusinessDetails((prev) => ({
        ...prev,
        logo_url: data.publicUrl,
      }));

      toast({
        title: "Success",
        description: "Logo uploaded successfully",
      });
    } catch (error) {
      console.error("Error uploading logo:", error);
      toast({
        title: "Error",
        description: "Failed to upload logo.",
        variant: "destructive",
      });
    }
  };

  // Save business details to Supabase
  const saveBusinessDetails = async () => {
    try {
      setLoading(true);

      const updatedDetails = {
        ...businessDetails,
        user_id: session.user.id,
        updated_at: new Date(),
      };

      // Check if record exists
      const { data: existingData } = await supabase
        .from("business_details")
        .select("id")
        .eq("user_id", session.user.id)
        .single();

      let result;

      if (existingData) {
        // Update existing record
        result = await supabase
          .from("business_details")
          .update(updatedDetails)
          .eq("user_id", session.user.id);
      } else {
        // Insert new record
        result = await supabase
          .from("business_details")
          .insert([updatedDetails]);
      }

      if (result.error) throw result.error;

      toast({
        title: "Success",
        description: "Business details saved successfully",
      });
    } catch (error) {
      console.error("Error saving business details:", error);
      toast({
        title: "Error",
        description: "Failed to save business details.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Save bank transfer details
  const savePaymentDetails = async () => {
    try {
      setLoading(true);

      const paymentData = {
        bank_transfer_details: userSubscription.bankTransferDetails,
        payment_method: userSubscription.paymentMethod,
        updated_at: new Date(),
      };

      // Update the profiles table
      const { error } = await supabase.from("profiles").upsert(
        {
          user_id: session.user.id,
          ...paymentData,
        },
        {
          onConflict: "user_id",
        }
      );

      if (error) throw error;

      toast({
        title: "Success",
        description: "Payment details saved successfully",
      });
    } catch (error) {
      console.error("Error saving payment details:", error);
      toast({
        title: "Error",
        description: "Failed to save payment details.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle connect Stripe
  const handleConnectStripe = () => {
    setConnecting(true);
    setTimeout(() => {
      setConnecting(false);
      setUserSubscription((prev) => ({
        ...prev,
        paymentMethod: "stripe",
      }));
      toast({
        title: "Success",
        description: "Stripe connected successfully (mock)",
      });
    }, 1200);
  };

  return (
    <div className="ml-64 no-scrollbar">
      <h1 className="text-3xl font-bold text-invoice-lightText dark:text-invoice-darkText mb-6">Settings</h1>
      <div className="space-y-6">
        {/* Tabs */}
        <div className="flex space-x-2 border-b border-gray-200 dark:border-gray-700 mb-8">
          {['business', 'payment', 'subscription', 'theme'].map(tab => (
            <button
              key={tab}
              className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${activeTab === tab
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-primary'
                } bg-transparent`}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1).replace('Details', ' Details')}
            </button>
          ))}
        </div>

        {/* Business Details Form */}
        {activeTab === "business" && (
          <div className="bg-white dark:bg-invoice-darkBg rounded-lg p-6 shadow-sm border border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-invoice-lightText dark:text-invoice-darkText">Business Details</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  These details will appear on all your invoices
                </p>
              </div>
              <Button
                onClick={saveBusinessDetails}
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Saving...
                  </span>
                ) : (
                  "Save changes"
                )}
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-invoice-lightText dark:text-invoice-darkText">
                  Contact name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="contact_name"
                  value={businessDetails.contact_name}
                  onChange={handleBusinessInputChange}
                  className="w-full px-3 py-2 outline-none border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-invoice-darkBg text-invoice-lightText dark:text-invoice-darkText focus:ring-1 focus:ring-primary/50 focus:border-primary transition-colors"
                  placeholder="John Doe"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-invoice-lightText dark:text-invoice-darkText">
                  Company / Business name
                </label>
                <input
                  type="text"
                  name="business_name"
                  value={businessDetails.business_name}
                  onChange={handleBusinessInputChange}
                  className="w-full px-3 py-2 outline-none border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-invoice-darkBg text-invoice-lightText dark:text-invoice-darkText focus:ring-1 focus:ring-primary/50 focus:border-primary transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-invoice-lightText dark:text-invoice-darkText">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={businessDetails.email}
                  onChange={handleBusinessInputChange}
                  className="w-full px-3 py-2 outline-none border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-invoice-darkBg text-invoice-lightText dark:text-invoice-darkText focus:ring-1 focus:ring-primary/50 focus:border-primary transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-invoice-lightText dark:text-invoice-darkText">
                  Phone number
                </label>
                <input
                  type="tel"
                  name="phone_number"
                  value={businessDetails.phone_number}
                  onChange={handleBusinessInputChange}
                  className="w-full px-3 py-2 outline-none border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-invoice-darkBg text-invoice-lightText dark:text-invoice-darkText focus:ring-1 focus:ring-primary/50 focus:border-primary transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-invoice-lightText dark:text-invoice-darkText">
                  Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={businessDetails.address}
                  onChange={handleBusinessInputChange}
                  className="w-full px-3 py-2 outline-none border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-invoice-darkBg text-invoice-lightText dark:text-invoice-darkText focus:ring-1 focus:ring-primary/50 focus:border-primary transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-invoice-lightText dark:text-invoice-darkText">
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  value={businessDetails.city}
                  onChange={handleBusinessInputChange}
                  className="w-full px-3 py-2 outline-none border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-invoice-darkBg text-invoice-lightText dark:text-invoice-darkText focus:ring-1 focus:ring-primary/50 focus:border-primary transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-invoice-lightText dark:text-invoice-darkText">
                  Postal Code
                </label>
                <input
                  type="text"
                  name="postal_code"
                  value={businessDetails.postal_code}
                  onChange={handleBusinessInputChange}
                  className="w-full px-3 py-2 outline-none border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-invoice-darkBg text-invoice-lightText dark:text-invoice-darkText focus:ring-1 focus:ring-primary/50 focus:border-primary transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-invoice-lightText dark:text-invoice-darkText">
                  Country
                </label>
                <input
                  type="text"
                  name="country"
                  value={businessDetails.country}
                  onChange={handleBusinessInputChange}
                  className="w-full px-3 py-2 outline-none border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-invoice-darkBg text-invoice-lightText dark:text-invoice-darkText focus:ring-1 focus:ring-primary/50 focus:border-primary transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-invoice-lightText dark:text-invoice-darkText">
                  Region/State
                </label>
                <input
                  type="text"
                  name="region_state"
                  value={businessDetails.region_state}
                  onChange={handleBusinessInputChange}
                  className="w-full px-3 py-2 outline-none border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-invoice-darkBg text-invoice-lightText dark:text-invoice-darkText focus:ring-1 focus:ring-primary/50 focus:border-primary transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-invoice-lightText dark:text-invoice-darkText">
                  VAT Number
                </label>
                <input
                  type="text"
                  name="vat_number"
                  value={businessDetails.vat_number}
                  onChange={handleBusinessInputChange}
                  className="w-full px-3 py-2 outline-none border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-invoice-darkBg text-invoice-lightText dark:text-invoice-darkText focus:ring-1 focus:ring-primary/50 focus:border-primary transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-invoice-lightText dark:text-invoice-darkText">
                  Upload your logo
                </label>
                <div className="flex items-center gap-4">
                  {businessDetails.logo_url && (
                    <div className="flex-shrink-0">
                      <img
                        src={businessDetails.logo_url}
                        alt="Business logo"
                        className="h-12 w-12 object-contain rounded-md border border-gray-200 dark:border-gray-700"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <label className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-invoice-lightText dark:text-invoice-darkText hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <span>Upload</span>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleLogoUpload}
                      />
                    </label>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Preferred image size: 512x512 • Format: .png, .svg, .jpg
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Payment Details */}
        {activeTab === "payment" && (
          <div className="bg-white dark:bg-invoice-darkBg rounded-lg p-6 shadow-sm border border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-invoice-lightText dark:text-invoice-darkText">Payment Details</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Set up your preferred payment methods for receiving payments
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Bank Transfer */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center mb-4">
                  <div className="bg-black p-2 rounded-md mr-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-white"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                      <path
                        fillRule="evenodd"
                        d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div>
                    <span className="font-medium text-invoice-lightText dark:text-invoice-darkText">Bank Transfer</span>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Direct bank transfers from your clients</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-invoice-lightText dark:text-invoice-darkText mb-2">
                      Bank Details
                    </label>
                    <textarea
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 min-h-[120px] bg-white dark:bg-invoice-darkBg text-invoice-lightText dark:text-invoice-darkText focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                      placeholder="Bank Name: Your Bank
Account Name: Your Name
Account Number: 123456789
IBAN: XX00 1234 5678 9012 3456 78
SWIFT/BIC: BANK1234XXX"
                      value={userSubscription.bankTransferDetails}
                      onChange={handleBankDetailsChange}
                    ></textarea>
                  </div>

                  <Button
                    onClick={savePaymentDetails}
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Saving...
                      </span>
                    ) : (
                      "Save bank details"
                    )}
                  </Button>
                </div>
              </div>

              {/* Stripe */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center mb-4">
                  <div className="bg-indigo-600 p-2 rounded-md mr-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-white"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                      <path
                        fillRule="evenodd"
                        d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <span className="font-medium text-invoice-lightText dark:text-invoice-darkText">Stripe</span>
                </div>

                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  Connect Stripe and accept Cards, Google & Apple Pay. Only
                  standard Stripe processing fees apply.{" "}
                  <a
                    href="https://stripe.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-600 dark:text-green-400 hover:underline"
                  >
                    Learn more at Stripe
                  </a>
                </p>

                {userSubscription.paymentMethod === "stripe" ? (
                  <div className="flex items-center text-sm text-green-600 dark:text-green-400 mb-4 font-medium">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Connected to Stripe
                  </div>
                ) : (
                  <Button
                    onClick={handleConnectStripe}
                    disabled={connecting}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    {connecting ? "Connecting..." : "Connect"}
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Subscription */}
        {activeTab === "subscription" && (
          <Subscription
            userSubscription={userSubscription}
            setUserSubscription={setUserSubscription}
          />
        )}

        {/* Theme Settings */}
        {activeTab === "theme" && (
          <div className="bg-white dark:bg-invoice-darkBg rounded-lg p-6 shadow-sm border border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-invoice-lightText dark:text-invoice-darkText">Theme Settings</h2>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div>
                  <h3 className="text-base font-medium text-invoice-lightText dark:text-invoice-darkText">Dark Mode</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Switch between light and dark mode</p>
                </div>
                <Button
                  onClick={toggleTheme}
                  className="flex items-center justify-center p-2 rounded-full bg-white dark:bg-gray-700 text-invoice-lightText dark:text-invoice-darkText hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                  aria-label="Toggle theme"
                >
                  {isDarkMode ? (
                    <Sun className="h-5 w-5" />
                  ) : (
                    <Moon className="h-5 w-5" />
                  )}
                </Button>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <h3 className="text-base font-medium text-invoice-lightText dark:text-invoice-darkText mb-4">Theme Preview</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 rounded-lg bg-white dark:bg-invoice-darkBg border border-gray-200 dark:border-gray-700">
                    <h4 className="text-sm font-medium mb-2 text-invoice-lightText dark:text-invoice-darkText">Light Mode</h4>
                    <div className="space-y-2">
                      <div className="h-4 rounded bg-primary"></div>
                      <div className="h-4 rounded bg-secondary"></div>
                      <div className="h-4 rounded bg-accent"></div>
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-gray-900 border border-gray-700">
                    <h4 className="text-sm font-medium mb-2 text-white">Dark Mode</h4>
                    <div className="space-y-2">
                      <div className="h-4 rounded bg-primary"></div>
                      <div className="h-4 rounded bg-secondary"></div>
                      <div className="h-4 rounded bg-accent"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;