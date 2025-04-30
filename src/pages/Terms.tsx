import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/Button";
import { useNavigate } from "react-router-dom";

const Terms = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#F5F1EA] py-12">
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
                            Terms and Conditions
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6 text-[#6B6B6B]">
                        <section>
                            <h2 className="text-xl font-semibold text-[#2D2D2D] mb-4">1. Introduction</h2>
                            <p>
                                Welcome to Invoicely. By accessing and using our services, you agree to be bound by these Terms and Conditions. Please read them carefully.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-[#2D2D2D] mb-4">2. Service Description</h2>
                            <p>
                                Invoicely provides an online platform for creating, managing, and sending invoices. Our services include both free and paid subscription options.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-[#2D2D2D] mb-4">3. User Responsibilities</h2>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>You must provide accurate information when creating an account</li>
                                <li>You are responsible for maintaining the confidentiality of your account</li>
                                <li>You agree not to use the service for any illegal purposes</li>
                                <li>You must comply with all applicable laws and regulations</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-[#2D2D2D] mb-4">4. Subscription and Payments</h2>
                            <p>
                                Paid subscriptions are billed on a monthly basis. You can cancel your subscription at any time, but no refunds will be provided for partial months.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-[#2D2D2D] mb-4">5. Intellectual Property</h2>
                            <p>
                                All content and materials available on Invoicely are protected by intellectual property rights. You may not use, reproduce, or distribute any content without our permission.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-[#2D2D2D] mb-4">6. Limitation of Liability</h2>
                            <p>
                                Invoicely is not liable for any indirect, incidental, or consequential damages arising from your use of our services.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-[#2D2D2D] mb-4">7. Changes to Terms</h2>
                            <p>
                                We reserve the right to modify these terms at any time. We will notify users of any significant changes.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-[#2D2D2D] mb-4">8. Contact Information</h2>
                            <p>
                                For any questions regarding these terms, please contact us at support@invoicely.com
                            </p>
                        </section>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Terms; 