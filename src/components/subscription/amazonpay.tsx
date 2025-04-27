import { useToast } from "@/components/ui/use-toast";

interface AmazonPayButtonProps {
  onSuccess: () => void;
  onError: (error: string) => void;
  amount: number;
  currency: string;
  disabled?: boolean;
}

export const AmazonPayButton = ({
  onSuccess,
  onError,
  amount,
  currency,
  disabled,
}: AmazonPayButtonProps) => {
  const { toast } = useToast();

  const handleAmazonPayClick = async () => {
    try {
      const response = await fetch("/api/create-amazon-pay-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount,
          currency,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create Amazon Pay session");
      }

      const { checkoutUrl } = await response.json();
      window.location.href = checkoutUrl;
      onSuccess();
    } catch (error) {
      console.error("Amazon Pay error:", error);
      toast({
        title: "Error",
        description: "Failed to initialize Amazon Pay. Please try again.",
        variant: "destructive",
      });
      onError(error instanceof Error ? error.message : "Unknown error");
    }
  };

  return (
    <button
      onClick={handleAmazonPayClick}
      disabled={disabled}
      className={`flex items-center justify-center w-full px-4 py-2 text-white bg-[#FF9900] hover:bg-[#FF9900]/90 rounded-md ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      }`}
    >
      <img
        src="https://d2ldx.org/amazon-pay-logo.svg"
        alt="Amazon Pay"
        className="h-6 mr-2"
      />
      Pay with Amazon
    </button>
  );
};
