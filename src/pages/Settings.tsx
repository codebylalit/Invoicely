import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import Subscription from "@/components/Subscription";
import { useLocation, useNavigate } from "react-router-dom";
import { Sun, Moon, Loader2, Building2, CreditCard, Star, Palette, Sliders } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// ─── Currency options ────────────────────────────────────────────────────────
const CURRENCIES = [
  { code: "INR", label: "₹ Indian Rupee (INR)", symbol: "₹" },
  { code: "USD", label: "$ US Dollar (USD)", symbol: "$" },
  { code: "EUR", label: "€ Euro (EUR)", symbol: "€" },
  { code: "GBP", label: "£ British Pound (GBP)", symbol: "£" },
  { code: "AED", label: "د.إ UAE Dirham (AED)", symbol: "د.إ" },
  { code: "SGD", label: "S$ Singapore Dollar (SGD)", symbol: "S$" },
  { code: "CAD", label: "C$ Canadian Dollar (CAD)", symbol: "C$" },
  { code: "AUD", label: "A$ Australian Dollar (AUD)", symbol: "A$" },
];

const TABS = [
  { id: "business", label: "Business", icon: Building2 },
  { id: "payment", label: "Payment", icon: CreditCard },
  { id: "preferences", label: "Preferences", icon: Sliders },
  { id: "subscription", label: "Subscription", icon: Star },
  { id: "theme", label: "Theme", icon: Palette },
];

const Settings = () => {
  const supabase = useSupabaseClient();
  const session = useSession();
  const [activeTab, setActiveTab] = useState("business");
  const [loading, setLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // ── State ──────────────────────────────────────────────────────────────────
  const [userSubscription, setUserSubscription] = useState({
    tier: "free",
    paymentMethod: null as string | null,
    bankTransferDetails: "",
    paymentLink: "",
  });

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
    logo_url: null as string | null,
  });

  const [preferences, setPreferences] = useState({
    currency: "INR",
    invoice_prefix: "INV",
    invoice_start_number: "1001",
    default_tax_name: "GST",
    default_tax_rate: "18",
    default_due_days: "30",
    default_notes: "",
  });

  // ── Effects ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (session?.user?.id) {
      fetchBusinessDetails();
      fetchUserSubscription();
      fetchPreferences();
    }
  }, [session]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("token") && window.opener) {
      window.opener.postMessage(
        { type: "PAYPAL_PAYMENT_COMPLETE", orderId: params.get("token") },
        window.location.origin
      );
      setTimeout(() => window.close(), 500);
      toast({ title: "Payment Complete!", description: "Your subscription will be updated shortly." });
    }
    if (params.get("from") === "paypal" || params.get("tab") === "subscription") {
      setActiveTab("subscription");
    }
  }, [location]);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
      setIsDarkMode(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleTheme = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    }
    setIsDarkMode(!isDarkMode);
  };

  // ── Fetch functions ──────────────────────────────────────────────────────────
  const fetchBusinessDetails = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("business_details")
        .select("*")
        .eq("user_id", session!.user.id)
        .maybeSingle();
      if (error) throw error;
      if (data) setBusinessDetails(data);
    } catch (err) {
      console.error("Error fetching business details:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserSubscription = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("tier, payment_method, bank_transfer_details, payment_link")
        .eq("user_id", session!.user.id)
        .maybeSingle();
      if (error) throw error;
      setUserSubscription({
        tier: data?.tier || "free",
        paymentMethod: data?.payment_method || null,
        bankTransferDetails: data?.bank_transfer_details || "",
        paymentLink: data?.payment_link || "",
      });
    } catch (err) {
      console.error("Error fetching subscription:", err);
    }
  };

  const fetchPreferences = async () => {
    try {
      // Preferences stored in profiles table as JSON metadata or fallback to defaults
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", session!.user.id)
        .maybeSingle();
      if (data) {
        // Try to read preferences if stored (graceful fallback if columns don't exist yet)
        setPreferences({
          currency: (data as any).default_currency || "INR",
          invoice_prefix: (data as any).invoice_prefix || "INV",
          invoice_start_number: (data as any).invoice_start_number || "1001",
          default_tax_name: (data as any).default_tax_name || "GST",
          default_tax_rate: (data as any).default_tax_rate || "18",
          default_due_days: (data as any).default_due_days || "30",
          default_notes: (data as any).default_notes || "",
        });
      }
    } catch {
      // silently use defaults
    }
  };

  // ── Save functions ─────────────────────────────────────────────────────────
  const saveBusinessDetails = async () => {
    try {
      setLoading(true);
      const payload = { ...businessDetails, user_id: session!.user.id, updated_at: new Date() };
      const { data: existing } = await supabase
        .from("business_details")
        .select("id")
        .eq("user_id", session!.user.id)
        .maybeSingle();

      const { error } = existing
        ? await supabase.from("business_details").update(payload).eq("user_id", session!.user.id)
        : await supabase.from("business_details").insert([payload]);

      if (error) throw error;
      toast({ title: "Saved!", description: "Business details updated successfully." });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const savePaymentDetails = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.from("profiles").upsert(
        {
          user_id: session!.user.id,
          bank_transfer_details: userSubscription.bankTransferDetails,
          payment_link: userSubscription.paymentLink,
          updated_at: new Date(),
        },
        { onConflict: "user_id" }
      );
      if (error) throw error;
      toast({ title: "Saved!", description: "Payment details updated successfully." });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.from("profiles").upsert(
        {
          user_id: session!.user.id,
          default_currency: preferences.currency,
          invoice_prefix: preferences.invoice_prefix,
          invoice_start_number: preferences.invoice_start_number,
          default_tax_name: preferences.default_tax_name,
          default_tax_rate: preferences.default_tax_rate,
          default_due_days: preferences.default_due_days,
          default_notes: preferences.default_notes,
          updated_at: new Date(),
        },
        { onConflict: "user_id" }
      );
      if (error) throw error;
      toast({ title: "Saved!", description: "Preferences updated successfully." });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const ext = file.name.split(".").pop();
      const fileName = `${session!.user.id}-${Math.random().toString(36).substring(2)}.${ext}`;
      const filePath = `business_logos/${fileName}`;
      const { error: uploadError } = await supabase.storage.from("logos").upload(filePath, file);
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from("logos").getPublicUrl(filePath);
      setBusinessDetails((prev) => ({ ...prev, logo_url: data.publicUrl }));
      toast({ title: "Logo uploaded", description: "Your logo has been uploaded successfully." });
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 pb-4">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your account, business profile, and preferences.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 border-b border-border overflow-x-auto pb-px scrollbar-none">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-2 px-3 sm:px-4 py-2.5 text-sm font-medium border-b-2 transition-all duration-150 whitespace-nowrap flex-shrink-0
                ${
                  activeTab === tab.id
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                }
              `}
              aria-current={activeTab === tab.id ? "page" : undefined}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.label.split(" ")[0]}</span>
            </button>
          );
        })}
      </div>

      {/* ── Business Details ────────────────────────────────────────────────── */}
      {activeTab === "business" && (
        <Card className="border-border/60">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4">
            <div>
              <CardTitle>Business Details</CardTitle>
              <CardDescription className="mt-1">
                These details will appear on all your invoices.
              </CardDescription>
            </div>
            <Button onClick={saveBusinessDetails} disabled={loading} className="flex-shrink-0 self-start sm:self-auto">
              {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving…</> : "Save Changes"}
            </Button>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <FieldGroup label="Contact Name" required>
              <Input
                name="contact_name"
                value={businessDetails.contact_name}
                onChange={(e) => setBusinessDetails((p) => ({ ...p, contact_name: e.target.value }))}
                placeholder="John Doe"
              />
            </FieldGroup>
            <FieldGroup label="Business / Company Name">
              <Input
                name="business_name"
                value={businessDetails.business_name}
                onChange={(e) => setBusinessDetails((p) => ({ ...p, business_name: e.target.value }))}
                placeholder="Acme Pvt Ltd"
              />
            </FieldGroup>
            <FieldGroup label="Email Address">
              <Input
                type="email"
                name="email"
                value={businessDetails.email}
                onChange={(e) => setBusinessDetails((p) => ({ ...p, email: e.target.value }))}
                placeholder="hello@yourcompany.com"
              />
            </FieldGroup>
            <FieldGroup label="Phone Number">
              <Input
                type="tel"
                name="phone_number"
                value={businessDetails.phone_number}
                onChange={(e) => setBusinessDetails((p) => ({ ...p, phone_number: e.target.value }))}
                placeholder="+91 98765 43210"
              />
            </FieldGroup>
            <FieldGroup label="Street Address" className="md:col-span-2">
              <Input
                name="address"
                value={businessDetails.address}
                onChange={(e) => setBusinessDetails((p) => ({ ...p, address: e.target.value }))}
                placeholder="123 Main Street"
              />
            </FieldGroup>
            <FieldGroup label="City">
              <Input
                name="city"
                value={businessDetails.city}
                onChange={(e) => setBusinessDetails((p) => ({ ...p, city: e.target.value }))}
                placeholder="Mumbai"
              />
            </FieldGroup>
            <FieldGroup label="Postal Code">
              <Input
                name="postal_code"
                value={businessDetails.postal_code}
                onChange={(e) => setBusinessDetails((p) => ({ ...p, postal_code: e.target.value }))}
                placeholder="400001"
              />
            </FieldGroup>
            <FieldGroup label="Region / State">
              <Input
                name="region_state"
                value={businessDetails.region_state}
                onChange={(e) => setBusinessDetails((p) => ({ ...p, region_state: e.target.value }))}
                placeholder="Maharashtra"
              />
            </FieldGroup>
            <FieldGroup label="Country">
              <Input
                name="country"
                value={businessDetails.country}
                onChange={(e) => setBusinessDetails((p) => ({ ...p, country: e.target.value }))}
                placeholder="India"
              />
            </FieldGroup>
            <FieldGroup label="VAT / GST Number">
              <Input
                name="vat_number"
                value={businessDetails.vat_number}
                onChange={(e) => setBusinessDetails((p) => ({ ...p, vat_number: e.target.value }))}
                placeholder="27AAPFU0939F1ZV"
              />
            </FieldGroup>
            {/* Logo Upload */}
            <div className="md:col-span-2 space-y-1.5">
              <Label>Business Logo</Label>
              <div className="flex items-center gap-4">
                {businessDetails.logo_url && (
                  <div className="h-14 w-14 rounded-xl border border-border overflow-hidden flex-shrink-0">
                    <img
                      src={businessDetails.logo_url}
                      alt="Business logo"
                      className="h-full w-full object-contain"
                    />
                  </div>
                )}
                <div>
                  <label
                    htmlFor="logo-upload"
                    className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors"
                  >
                    {businessDetails.logo_url ? "Change Logo" : "Upload Logo"}
                    <input
                      id="logo-upload"
                      type="file"
                      className="sr-only"
                      accept="image/*"
                      onChange={handleLogoUpload}
                    />
                  </label>
                  <p className="text-xs text-muted-foreground mt-1.5">
                    PNG, SVG or JPG · Recommended: 512×512px
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Payment Details ─────────────────────────────────────────────────── */}
      {activeTab === "payment" && (
        <div className="space-y-4">
          <Card className="border-border/60">
            <CardHeader>
              <CardTitle>Bank Transfer</CardTitle>
              <CardDescription>
                Add your bank account details for clients who prefer bank transfers.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="bank-details">Bank Account Details</Label>
                <Textarea
                  id="bank-details"
                  className="min-h-[140px] resize-none font-mono text-sm"
                  placeholder={`Bank Name: HDFC Bank\nAccount Name: Your Company\nAccount Number: 1234567890\nIFSC Code: HDFC0001234\nIBAN: —\nSWIFT/BIC: —`}
                  value={userSubscription.bankTransferDetails}
                  onChange={(e) =>
                    setUserSubscription((p) => ({ ...p, bankTransferDetails: e.target.value }))
                  }
                />
              </div>
              <Button onClick={savePaymentDetails} disabled={loading}>
                {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving…</> : "Save Bank Details"}
              </Button>
            </CardContent>
          </Card>

          <Card className="border-border/60">
            <CardHeader>
              <CardTitle>Online Payment Link</CardTitle>
              <CardDescription>
                Add a payment link (Razorpay, Stripe, UPI, PayPal, etc.) that will appear on your invoices.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="payment-link">Payment Link URL</Label>
                <Input
                  id="payment-link"
                  type="url"
                  placeholder="https://razorpay.me/@yourname"
                  value={userSubscription.paymentLink}
                  onChange={(e) =>
                    setUserSubscription((p) => ({ ...p, paymentLink: e.target.value }))
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Accepts any URL — Razorpay, Stripe Payment Links, UPI intent links, etc.
                </p>
              </div>
              <Button onClick={savePaymentDetails} disabled={loading}>
                {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving…</> : "Save Payment Link"}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── Preferences ─────────────────────────────────────────────────────── */}
      {activeTab === "preferences" && (
        <Card className="border-border/60">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4">
            <div>
              <CardTitle>Invoice Preferences</CardTitle>
              <CardDescription>
                Set your defaults for currency, numbering, taxes, and payment terms.
              </CardDescription>
            </div>
            <Button onClick={savePreferences} disabled={loading} className="flex-shrink-0 self-start sm:self-auto">
              {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving…</> : "Save Preferences"}
            </Button>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Currency */}
            <FieldGroup label="Default Currency">
              <Select
                value={preferences.currency}
                onValueChange={(v) => setPreferences((p) => ({ ...p, currency: v }))}
              >
                <SelectTrigger id="currency-select">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((c) => (
                    <SelectItem key={c.code} value={c.code}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                Will be used on all new invoices.
              </p>
            </FieldGroup>

            {/* Invoice Prefix */}
            <FieldGroup label="Invoice Number Prefix">
              <Input
                value={preferences.invoice_prefix}
                onChange={(e) => setPreferences((p) => ({ ...p, invoice_prefix: e.target.value }))}
                placeholder="INV"
                maxLength={10}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Example: <span className="font-mono font-medium">{preferences.invoice_prefix}-2026-1001</span>
              </p>
            </FieldGroup>

            {/* Starting Number */}
            <FieldGroup label="Starting Invoice Number">
              <Input
                type="number"
                value={preferences.invoice_start_number}
                onChange={(e) =>
                  setPreferences((p) => ({ ...p, invoice_start_number: e.target.value }))
                }
                placeholder="1001"
                min="1"
              />
            </FieldGroup>

            {/* Default Due Days */}
            <FieldGroup label="Default Payment Terms (Days)">
              <Input
                type="number"
                value={preferences.default_due_days}
                onChange={(e) => setPreferences((p) => ({ ...p, default_due_days: e.target.value }))}
                placeholder="30"
                min="0"
              />
              <p className="text-xs text-muted-foreground mt-1">
                E.g., 30 means payment due 30 days from invoice date.
              </p>
            </FieldGroup>

            {/* Default Tax Name */}
            <FieldGroup label="Default Tax Label">
              <Input
                value={preferences.default_tax_name}
                onChange={(e) => setPreferences((p) => ({ ...p, default_tax_name: e.target.value }))}
                placeholder="GST"
              />
            </FieldGroup>

            {/* Default Tax Rate */}
            <FieldGroup label="Default Tax Rate (%)">
              <Input
                type="number"
                value={preferences.default_tax_rate}
                onChange={(e) => setPreferences((p) => ({ ...p, default_tax_rate: e.target.value }))}
                placeholder="18"
                min="0"
                max="100"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Quick presets:{" "}
                {["5", "12", "18", "28"].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setPreferences((p) => ({ ...p, default_tax_rate: r }))}
                    className="mr-2 text-primary hover:underline font-medium"
                  >
                    {r}%
                  </button>
                ))}
              </p>
            </FieldGroup>

            {/* Default Notes */}
            <FieldGroup label="Default Invoice Notes" className="md:col-span-2">
              <Textarea
                value={preferences.default_notes}
                onChange={(e) => setPreferences((p) => ({ ...p, default_notes: e.target.value }))}
                placeholder="Thank you for your business! Payment due within 30 days."
                rows={3}
                className="resize-none"
              />
            </FieldGroup>
          </CardContent>
        </Card>
      )}

      {/* ── Subscription ────────────────────────────────────────────────────── */}
      {activeTab === "subscription" && (
        <Subscription
          userSubscription={userSubscription}
          setUserSubscription={setUserSubscription}
        />
      )}

      {/* ── Theme ────────────────────────────────────────────────────────────── */}
      {activeTab === "theme" && (
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>Customize the look and feel of Invoicelly.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-muted/30">
              <div>
                <h3 className="text-sm font-semibold text-foreground">Dark Mode</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Switch between light and dark interface.
                </p>
              </div>
              <button
                onClick={toggleTheme}
                aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
                className={`
                  relative inline-flex h-7 w-13 items-center rounded-full transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
                  ${isDarkMode ? "bg-primary" : "bg-muted-foreground/30"}
                `}
                style={{ width: "52px" }}
              >
                <span
                  className={`
                    inline-flex h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-300 items-center justify-center
                    ${isDarkMode ? "translate-x-7" : "translate-x-1"}
                  `}
                >
                  {isDarkMode ? (
                    <Moon className="h-3 w-3 text-primary" />
                  ) : (
                    <Sun className="h-3 w-3 text-amber-500" />
                  )}
                </span>
              </button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// ─── Field Group Helper ────────────────────────────────────────────────────────
const FieldGroup = ({
  label,
  required,
  children,
  className = "",
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={`space-y-1.5 ${className}`}>
    <Label>
      {label}
      {required && <span className="text-destructive ml-1">*</span>}
    </Label>
    {children}
  </div>
);

export default Settings;