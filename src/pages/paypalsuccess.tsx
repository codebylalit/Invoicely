import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";

const PayPalSuccess = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("token");

  useEffect(() => {
    if (orderId && window.opener) {
      // Send message to parent window
      window.opener.postMessage(
        { 
          type: "PAYPAL_PAYMENT_COMPLETE", 
          orderId: orderId 
        },
        window.location.origin
      );
      
      // Close this window after a delay
      setTimeout(() => window.close(), 3000);
    }
  }, [orderId]);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="h-10 w-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Payment Successful!</h2>
        <p className="text-gray-600 mb-6">
          Thank you for your payment. Your Pro subscription has been activated.
        </p>
        <p className="text-sm text-gray-500">
          This window will close automatically in a few seconds...
        </p>
      </div>
    </div>
  );
};

export default PayPalSuccess;