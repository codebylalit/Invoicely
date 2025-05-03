import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Refunds = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#F6F5F1] py-12">
            <div className="max-w-4xl mx-auto px-4">
                <Button
                    onClick={() => navigate(-1)}
                    variant="ghost"
                    className="mb-8"
                >
                    ← Back
                </Button>

                <Card className="bg-white">
                    <CardHeader>
                        <CardTitle className="text-3xl font-bold text-[#2D2D2D]">
                            Cancellation & Refunds Policy
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6 text-[#6B6B6B]">
                        <section>
                            <h2 className="text-xl font-semibold text-[#2D2D2D] mb-4">1. Subscription Cancellation</h2>
                            <p>
                                You can cancel your subscription at any time through your account settings. The cancellation will take effect at the end of your current billing period.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-[#2D2D2D] mb-4">2. Refund Policy</h2>
                            <p>
                                We offer refunds under the following circumstances:
                            </p>
                            <ul className="list-disc pl-6 space-y-2 mt-2">
                                <li>If you cancel within 14 days of your initial subscription (cooling-off period)</li>
                                <li>If there is a technical issue that prevents you from using our service</li>
                                <li>If we fail to deliver the promised service</li>
                            </ul>
                            <p className="mt-4">
                                Refunds are not available for:
                            </p>
                            <ul className="list-disc pl-6 space-y-2 mt-2">
                                <li>Partial months of service</li>
                                <li>Unused portions of your subscription</li>
                                <li>Change of mind after the cooling-off period</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-[#2D2D2D] mb-4">3. How to Request a Refund</h2>
                            <p>
                                To request a refund:
                            </p>
                            <ol className="list-decimal pl-6 space-y-2 mt-2">
                                <li>Contact our support team at support@invoicelly.me</li>
                                <li>Provide your account details and reason for the refund request</li>
                                <li>Our team will review your request within 5 business days</li>
                                <li>If approved, the refund will be processed to your original payment method</li>
                            </ol>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-[#2D2D2D] mb-4">4. Processing Time</h2>
                            <p>
                                Approved refunds are typically processed within 5-10 business days. The time it takes for the refund to appear in your account depends on your payment provider.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-[#2D2D2D] mb-4">5. Contact Us</h2>
                            <p>
                                For any questions about cancellations or refunds, please contact our support team at support@invoicelly.me
                            </p>
                        </section>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Refunds; 