import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Contact = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        setIsSubmitting(true);
        // Formspree will handle the submission automatically
        // We just need to show loading state
    };

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
                            Contact Us
                        </CardTitle>
                        <p className="text-[#6B6B6B]">
                            Have questions or feedback? We'd love to hear from you. Fill out the form below or reach out to us directly.
                        </p>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <form
                            action="https://formspree.io/f/xanojqab"
                            method="POST"
                            onSubmit={handleSubmit}
                            className="space-y-4"
                        >
                            <div>
                                <label className="text-sm font-medium text-[#2D2D2D] block mb-1">
                                    Your Name
                                </label>
                                <Input
                                    type="text"
                                    name="name"
                                    placeholder="John Doe"
                                    required
                                    className="bg-[#F6F5F1] border-[#2D2D2D]/20 w-full"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-[#2D2D2D] block mb-1">
                                    Your Email
                                </label>
                                <Input
                                    type="email"
                                    name="email"
                                    placeholder="john@example.com"
                                    required
                                    className="bg-[#F6F5F1] border-[#2D2D2D]/20 w-full"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-[#2D2D2D] block mb-1">
                                    Subject
                                </label>
                                <Input
                                    type="text"
                                    name="subject"
                                    placeholder="How can we help you?"
                                    required
                                    className="bg-[#F6F5F1] border-[#2D2D2D]/20 w-full"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-[#2D2D2D] block mb-1">
                                    Your Message
                                </label>
                                <Textarea
                                    name="message"
                                    placeholder="Tell us more about your inquiry..."
                                    required
                                    className="bg-[#F6F5F1] border-[#2D2D2D]/20 min-h-[150px] w-full"
                                />
                            </div>
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-[#FFB800] hover:bg-[#FFB800]/90 text-[#2D2D2D] font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-[#2D2D2D]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        <Send className="mr-2 h-4 w-4" />
                                        Send Message
                                    </>
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Contact; 