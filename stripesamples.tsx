import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { toast } from "@/components/ui/use-toast";
import { useLocation } from "react-router-dom";
const Settings = () => {
  const supabase = useSupabaseClient();
  const session = useSession();
  const [activeTab, setActiveTab] = useState("business");
  const [loading, setLoading] = useState(false);
  const [isUpgrading, setUpgrading] = useState(false);


  const location = useLocation();

  // Check for success/canceled query params
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    if (queryParams.get("success")) {
      toast({
        title: "Success!",
        description: "Your subscription has been activated.",
      });
    } else if (queryParams.get("canceled")) {
      toast({
        title: "Canceled",
        description: "Subscription process was canceled.",
        variant: "destructive",
      });
    }
  }, [location]);

  // Handle subscription checkout
  const handleSubscribe = async () => {
    try {
      setUpgrading(true);
      const {
        data: { session },
      } = await supabase.auth.getSession();

     const response = await fetch(
       "https://fwlxdzskqmbxcswxyogw.supabase.co/functions/v1/create-checkout",
       {
         method: "POST",
         headers: {
           Authorization: `Bearer ${session?.access_token}`,
         },
       }
     );

      const { url, error } = await response.json();
      if (error) throw new Error(error);

      // Redirect to Stripe Checkout
      window.location.href = url;
    } catch (error) {
      console.error("Error creating checkout session:", error);
      toast({
        title: "Error",
        description: "Failed to start subscription process.",
        variant: "destructive",
      });
    } finally {
      setUpgrading(false);
    }
  };

  // Replace handleUpgradePlan with new Stripe checkout
  const handleUpgradePlan = () => {
    handleSubscribe();
  };

  // User subscription state
  const [userSubscription, setUserSubscription] = useState({
    tier: "free", // free, growing, advanced
    paymentMethod: null, // stripe, null
    bankTransferDetails: "",
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
      fetchUserSubscription();
    }
  }, [session]);

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

  // Fetch user subscription from Supabase
  const fetchUserSubscription = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("tier, payment_method, bank_transfer_details")
        .eq("user_id", session.user.id)
        .single();

      if (error) throw error;

      setUserSubscription({
        tier: data.tier || "free",
        paymentMethod: data.payment_method || null,
        bankTransferDetails: data.bank_transfer_details || "",
      });
    } catch (error) {
      console.error("Error fetching user subscription:", error);
      toast({
        title: "Error",
        description: "Failed to load payment details.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold">Settings</h1>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="space-y-6">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <div className="-mb-px flex space-x-8">
              <button
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "business"
                    ? "border-invoice-orange text-invoice-orange"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab("business")}
              >
                Business Details
              </button>
              <button
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "payment"
                    ? "border-invoice-orange text-invoice-orange"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab("payment")}
              >
                Payment details
              </button>
              <button
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "subscription"
                    ? "border-invoice-orange text-invoice-orange"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab("subscription")}
              >
                Subscription
              </button>
            </div>
          </div>

          {/* Business Details Form */}
          {activeTab === "business" && (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium mb-6">Business Details</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact name
                  </label>
                  <input
                    type="text"
                    name="contact_name"
                    value={businessDetails.contact_name}
                    onChange={handleBusinessInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company / Business name
                  </label>
                  <input
                    type="text"
                    name="business_name"
                    value={businessDetails.business_name}
                    onChange={handleBusinessInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={businessDetails.email}
                    onChange={handleBusinessInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone number
                  </label>
                  <input
                    type="tel"
                    name="phone_number"
                    value={businessDetails.phone_number}
                    onChange={handleBusinessInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={businessDetails.address}
                    onChange={handleBusinessInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={businessDetails.city}
                    onChange={handleBusinessInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    name="postal_code"
                    value={businessDetails.postal_code}
                    onChange={handleBusinessInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Country
                  </label>
                  <input
                    type="text"
                    name="country"
                    value={businessDetails.country}
                    onChange={handleBusinessInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Region/State
                  </label>
                  <input
                    type="text"
                    name="region_state"
                    value={businessDetails.region_state}
                    onChange={handleBusinessInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    VAT Number
                  </label>
                  <input
                    type="text"
                    name="vat_number"
                    value={businessDetails.vat_number}
                    onChange={handleBusinessInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Upload your logo
                  </label>
                  <div className="flex items-center mt-1">
                    {businessDetails.logo_url && (
                      <div className="mr-4">
                        <img
                          src={businessDetails.logo_url}
                          alt="Business logo"
                          className="h-12 w-12 object-contain"
                        />
                      </div>
                    )}
                    <label className="cursor-pointer bg-white px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                      Upload
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleLogoUpload}
                      />
                    </label>
                    <div className="ml-4 text-xs text-gray-500">
                      Preferred image size: 512x512
                      <br />
                      Format: .png, .svg, .jpg
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <Button
                  onClick={saveBusinessDetails}
                  disabled={loading}
                  className="bg-invoice-orange hover:bg-invoice-orange/90"
                >
                  {loading ? "Saving..." : "Save changes"}
                </Button>
              </div>
            </div>
          )}

          {/* Payment Details */}
          {activeTab === "payment" && (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium mb-2">Payment Details</h2>
              <p className="text-sm text-gray-500 mb-6">
                Here you can set up default payment options for invoices you
                create for your clients.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Bank Transfer */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    <div className="bg-black p-2 rounded-md mr-2">
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
                    <span className="font-medium">Bank transfer</span>
                  </div>

                  <textarea
                    className="w-full border border-gray-300 rounded-md px-3 py-2 mb-4 min-h-[120px]"
                    placeholder="Include payment details here. For example bank transfer details or PayPal."
                    value={userSubscription.bankTransferDetails}
                    onChange={handleBankDetailsChange}
                  ></textarea>

                  <Button
                    onClick={savePaymentDetails}
                    disabled={loading}
                    className="bg-invoice-orange hover:bg-invoice-orange/90 w-full"
                  >
                    {loading ? "Saving..." : "Save bank details"}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Subscription */}
          {activeTab === "subscription" && (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium mb-6">
                Simple pricing, no hidden fees
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Free Plan */}
                <div className="border rounded-lg overflow-hidden">
                  <div className="p-6">
                    <h3 className="text-lg font-medium">Free</h3>
                    <div className="mt-2">
                      <span className="text-2xl font-bold">$0</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      Perfect for getting started
                    </p>

                    <button className="mt-4 w-full py-2 px-4 rounded-md text-center bg-gray-200 hover:bg-gray-300 text-gray-700">
                      Current Plan
                    </button>
                  </div>

                  <div className="px-6 py-4 border-t">
                    <ul className="space-y-2">
                      <li className="flex items-center text-sm">
                        <svg
                          className="h-4 w-4 mr-2 text-green-500"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Basic invoice creation
                      </li>
                      <li className="flex items-center text-sm">
                        <svg
                          className="h-4 w-4 mr-2 text-green-500"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Store up to 10 clients
                      </li>
                      <li className="flex items-center text-sm">
                        <svg
                          className="h-4 w-4 mr-2 text-green-500"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        3 templates
                      </li>
                      <li className="flex items-center text-sm">
                        <svg
                          className="h-4 w-4 mr-2 text-green-500"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        PDF export with watermark
                      </li>
                      <li className="flex items-center text-sm">
                        <svg
                          className="h-4 w-4 mr-2 text-green-500"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Logo branding
                      </li>
                      <li className="flex items-center text-sm">
                        <svg
                          className="h-4 w-4 mr-2 text-green-500"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Basic email support (72hr)
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Pro Plan */}
                <div className="border rounded-lg overflow-hidden border-green-500">
                  <div className="p-6">
                    <h3 className="text-lg font-medium">Pro</h3>
                    <div className="mt-2">
                      <span className="text-2xl font-bold">$5</span>
                      <span className="text-gray-500 ml-1">/mo</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      For growing businesses
                    </p>

                    <Button disabled={isUpgrading} onClick={handleUpgradePlan}>
                      {isUpgrading ? "Upgrading..." : "Upgrade to Pro"}
                    </Button>
                  </div>

                  <div className="px-6 py-4 border-t">
                    <ul className="space-y-2">
                      <li className="flex items-center text-sm">
                        <svg
                          className="h-4 w-4 mr-2 text-green-500"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        AI-powered invoice generation
                      </li>
                      <li className="flex items-center text-sm">
                        <svg
                          className="h-4 w-4 mr-2 text-green-500"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Unlimited clients in portal
                      </li>
                      <li className="flex items-center text-sm">
                        <svg
                          className="h-4 w-4 mr-2 text-green-500"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        10+ premium templates
                      </li>
                      <li className="flex items-center text-sm">
                        <svg
                          className="h-4 w-4 mr-2 text-green-500"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Watermark-free exports
                      </li>{" "}
                      <li className="flex items-center text-sm">
                        <svg
                          className="h-4 w-4 mr-2 text-green-500"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Recurring invoices
                      </li>
                      <li className="flex items-center text-sm">
                        <svg
                          className="h-4 w-4 mr-2 text-green-500"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Send invoices directly via email
                      </li>
                      <li className="flex items-center text-sm">
                        <svg
                          className="h-4 w-4 mr-2 text-green-500"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Priority support (24hr)
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default Settings;
secret = sk_test_51NFXKLSHYUHchBYXoYbPdpzove2gsa1Aii3G8eTP9DwwuLmnSvL6Q9vOEAeGUAqcNDIFxtf69MiqD4Ve5CphS7jR004JKqmM1t

const supabaseUrl = "https://fwlxdzskqmbxcswxyogw.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3bHhkenNrcW1ieGNzd3h5b2d3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUzMDYyMTYsImV4cCI6MjA2MDg4MjIxNn0.F1--kySVanPE5mLDKCr20zjE2T9q7cTezurFHqYpsX8";
  strippriceid = evt_1RI82wSHYUHchBYX7lGvkp80;
  supabase service rokeyl = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3bHhkenNrcW1ieGNzd3h5b2d3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NTMwNjIxNiwiZXhwIjoyMDYwODgyMjE2fQ.v99IRZtD3YoXOhEMaXpmiCBFFbhkieMrziHhfTsgs70


  
   {/* Stripe */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    <div className="bg-indigo-600 p-2 rounded-md mr-2">
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
                    <span className="font-medium">Stripe</span>
                  </div>

                  <p className="text-sm text-gray-500 mb-4">
                    Connect Stripe and accept Cards, Google & Apple Pay. Only
                    standard Stripe processing fees apply.{" "}
                    <a
                      href="https://stripe.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-600 hover:underline"
                    >
                      Learn more at Stripe
                    </a>
                  </p>

                  {userSubscription.paymentMethod === "stripe" ? (
                    <div className="text-sm text-green-600 mb-4 font-medium">
                      ✓ Connected to Stripe
                    </div>
                  ) : (
                    <Button
                      onClick={handleConnectStripe}
                      disabled={connecting}
                      className="bg-green-600 hover:bg-green-700 w-full"
                    >
                      {connecting ? "Connecting..." : "Connect"}
                    </Button>
                  )}
                </div>

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