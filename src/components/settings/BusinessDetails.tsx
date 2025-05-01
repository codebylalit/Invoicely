import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { useState } from "react";

interface BusinessDetails {
  contact_name: string;
  business_name: string;
  email: string;
  address: string;
  city: string;
  postal_code: string;
  region_state: string;
  country: string;
  phone_number: string;
  vat_number: string;
  logo_url: string | null;
}

interface BusinessDetailsFormProps {
  businessDetails: BusinessDetails;
  loading: boolean;
  onSave: () => Promise<void>;
  onBusinessInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onLogoUpload: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
}

const BusinessDetailsForm = ({
  businessDetails,
  loading,
  onSave,
  onBusinessInputChange,
  onLogoUpload,
}: BusinessDetailsFormProps) => {
  return (
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
            onChange={onBusinessInputChange}
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
            onChange={onBusinessInputChange}
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
            onChange={onBusinessInputChange}
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
            onChange={onBusinessInputChange}
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
            onChange={onBusinessInputChange}
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
            onChange={onBusinessInputChange}
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
            onChange={onBusinessInputChange}
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
            onChange={onBusinessInputChange}
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
            onChange={onBusinessInputChange}
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
            onChange={onBusinessInputChange}
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
                onChange={onLogoUpload}
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
          onClick={onSave}
          disabled={loading}
        >
          {loading ? "Saving..." : "Save changes"}
        </Button>
      </div>
    </div>
  );
};

export default BusinessDetailsForm;
