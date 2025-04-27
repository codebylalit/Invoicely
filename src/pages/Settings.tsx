import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { toast } from "@/components/ui/use-toast";
import Subscription from "@/components/Subscription";
import { useLocation } from "react-router-dom";

const Settings = () => {
  const supabase = useSupabaseClient();
  const session = useSession();
  const [activeTab, setActiveTab] = useState("business");
  const [loading, setLoading] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const location = useLocation();

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

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("token")) {
      if (window.opener) {
        window.opener.postMessage(
          { type: "PAYPAL_PAYMENT_COMPLETE", orderId: params.get("token") },
          window.location.origin
        );
        setTimeout(() => window.close(), 1000);
      }
      toast({
        title: "Payment Complete!",
        description: "Thank you for your payment. Your subscription will be updated shortly.",
      });
    }
  }, [location]);

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

  const handleMessage = async (event: MessageEvent) => {
    if (event.data.type === "PAYPAL_PAYMENT_COMPLETE") {
      // ...verify payment, show toast, refresh subscription...
      // (You should call setUserSubscription or refetch subscription here)
    }
  };
  window.addEventListener("message", handleMessage);

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
        </div>
      </div>
    </div>
  );
};

export default Settings;
