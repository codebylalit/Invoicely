import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Contact = () => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        subject: "",
        message: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // TODO: Implement form submission logic
        console.log("Form submitted:", formData);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

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
                            Contact Us
                        </CardTitle>
                        <p className="text-[#6B6B6B]">
                            Have questions or feedback? We'd love to hear from you. Fill out the form below or reach out to us directly.
                        </p>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-[#2D2D2D] block mb-1">
                                    Your Name
                                </label>
                                <Input
                                    type="text"
                                    name="name"
                                    placeholder="John Doe"
                                    value={formData.name}
                                    onChange={handleChange}
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
                                    value={formData.email}
                                    onChange={handleChange}
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
                                    value={formData.subject}
                                    onChange={handleChange}
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
                                    value={formData.message}
                                    onChange={handleChange}
                                    required
                                    className="bg-[#F6F5F1] border-[#2D2D2D]/20 min-h-[150px] w-full"
                                />
                            </div>
                            <Button
                                type="submit"
                                className="w-full bg-[#FFB800] hover:bg-[#FFB800]/90 text-[#2D2D2D] font-medium"
                            >
                                <Send className="mr-2 h-4 w-4" />
                                Send Message
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Contact; 