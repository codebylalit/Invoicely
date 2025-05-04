import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Privacy = () => {
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
                            Privacy Policy
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6 text-[#6B6B6B]">
                        <section>
                            <h2 className="text-xl font-semibold text-[#2D2D2D] mb-4">1. Information We Collect</h2>
                            <p>
                                We collect information that you provide directly to us, including:
                            </p>
                            <ul className="list-disc pl-6 space-y-2 mt-2">
                                <li>Account information (name, email, password)</li>
                                <li>Business information (company name, address, tax information)</li>
                                <li>Client information (names, email addresses, payment details)</li>
                                <li>Usage data and analytics</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-[#2D2D2D] mb-4">2. How We Use Your Information</h2>
                            <p>
                                We use the collected information to:
                            </p>
                            <ul className="list-disc pl-6 space-y-2 mt-2">
                                <li>Provide and maintain our services</li>
                                <li>Process your payments and invoices</li>
                                <li>Send you important updates and notifications</li>
                                <li>Improve our services and user experience</li>
                                <li>Comply with legal obligations</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-[#2D2D2D] mb-4">3. Data Security</h2>
                            <p>
                                We implement appropriate security measures to protect your personal information. This includes encryption, secure servers, and regular security audits.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-[#2D2D2D] mb-4">4. Third-Party Services</h2>
                            <p>
                                We may use third-party services to help us operate our platform. These services have their own privacy policies and may collect information about you.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-[#2D2D2D] mb-4">5. Your Rights</h2>
                            <p>
                                You have the right to:
                            </p>
                            <ul className="list-disc pl-6 space-y-2 mt-2">
                                <li>Access your personal information</li>
                                <li>Correct inaccurate data</li>
                                <li>Request deletion of your data</li>
                                <li>Opt-out of marketing communications</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-[#2D2D2D] mb-4">6. Cookies</h2>
                            <p>
                                We use cookies to improve your experience on our platform. You can control cookie settings through your browser preferences.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-[#2D2D2D] mb-4">7. Changes to Privacy Policy</h2>
                            <p>
                                We may update this privacy policy from time to time. We will notify you of any significant changes via email or through our platform.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-[#2D2D2D] mb-4">8. Contact Us</h2>
                            <p>
                                If you have any questions about this privacy policy, please contact us at support@invoicely.me
                            </p>
                        </section>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Privacy; 