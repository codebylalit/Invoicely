import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Contact = () => {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const navigate = useNavigate();

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("https://formspree.io/f/xeolankl", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSubmitted(true);
        setFormData({ name: "", email: "", message: "" });
      } else {
        throw new Error("Failed to submit form");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("There was an error submitting your message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F5F1] py-12">
      <div className="max-w-4xl mx-auto px-4">
        <Button onClick={() => navigate(-1)} variant="ghost" className="mb-8">
          ← Back
        </Button>

        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-[#2D2D2D]">
              Contact Us
            </CardTitle>
            <p className="text-[#6B6B6B]">
              Have a question, suggestion, or need support? Fill out the form
              below or email us at{" "}
              <a
                href="mailto:support@invoicely.me"
                className="text-[#FFB800] underline"
              >
                support@invoicely.me
              </a>
              .
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {submitted ? (
              <div className="bg-green-100 border border-green-300 text-green-800 px-4 py-3 rounded mb-6">
                Thank you for contacting us! We will get back to you soon.
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block mb-2 font-semibold text-[#2D2D2D]">
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block mb-2 font-semibold text-[#2D2D2D]">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block mb-2 font-semibold text-[#2D2D2D]">
                    Message
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    className="w-full border rounded px-3 py-2 min-h-[100px]"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-[#FFB800] text-[#2D2D2D] font-semibold px-6 py-2 rounded hover:bg-[#FFB800]/90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Sending..." : "Send Message"}
                </button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Contact;
