import React, { useState, useEffect } from 'react';
import { MapPin, Smartphone, FileText, Send } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import api from "@/api/api";
import { ACCESS_TOKEN } from "@/constants";

export default function ContactUs() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem(ACCESS_TOKEN);
        if (token) {
          const res = await api.get('/auth/profile/');
          setEmail(res.data.email);
          setIsLoggedIn(true);
        }
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      }
    };
    fetchProfile();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !message) return;

    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      alert("Your message has been sent. We'll get back to you soon!");
      if (!isLoggedIn) setEmail("");
      setMessage("");
    }, 1000);
  };

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center py-24 px-4 bg-white dark:bg-slate-950">
      <div className="max-w-4xl w-full text-center space-y-16">

        {/* Header Section */}
        <div className="space-y-6">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground">
            Contact Us
          </h1>
          <p className="text-slate-400 dark:text-slate-500 max-w-xl mx-auto text-base">
            If you have any questions about internships or applications, feel free to contact us. Our support team is here to help you.
          </p>
        </div>

        {/* Divider */}
        <div className="max-w-2xl mx-auto border-t border-slate-200 dark:border-slate-800"></div>

        {/* Contact Form */}
        <div className="mt-12 max-w-lg mx-auto text-left w-full">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Send us a message</h2>
            <p className="text-slate-500 mt-2">Fill out the form below and we'll reply as soon as possible.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => !isLoggedIn && setEmail(e.target.value)}
                readOnly={isLoggedIn}
                className={isLoggedIn ? "bg-slate-50 dark:bg-slate-800/50 cursor-not-allowed opacity-80" : ""}
                required
              />

            </div>

            <div className="space-y-2">
              <label htmlFor="message" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                How can we help?
              </label>
              <textarea
                id="message"
                rows="4"
                placeholder="Describe your issue or question..."
                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-y"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
              ></textarea>
            </div>

            <Button
              type="submit"
              className="w-full h-11 font-bold shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
              disabled={loading}
            >
              {loading ? "Sending..." : "Send Message"}
              {!loading && <Send className="w-4 h-4 ml-2" />}
            </Button>
          </form>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 pt-12 border-t border-slate-100 dark:border-slate-800/50">

          {/* Address */}
          <div className="flex flex-col items-center space-y-5">
            <div className="h-16 w-16 flex items-center justify-center">
              <MapPin className="h-12 w-12 text-slate-800 dark:text-slate-200" strokeWidth={1.5} />
            </div>
            <div className="space-y-3">
              <h3 className="text-sm font-bold tracking-[0.25em] text-slate-400 uppercase">
                Address
              </h3>
              <p className="text-slate-800 dark:text-slate-300 font-medium">
                Algiers, Algeria
              </p>
            </div>
          </div>

          {/* Phone */}
          <div className="flex flex-col items-center space-y-5">
            <div className="h-16 w-16 flex items-center justify-center">
              <Smartphone className="h-12 w-12 text-slate-800 dark:text-slate-200" strokeWidth={1.5} />
            </div>
            <div className="space-y-3">
              <h3 className="text-sm font-bold tracking-[0.25em] text-slate-400 uppercase">
                Phone
              </h3>
              <p className="text-slate-800 dark:text-slate-300 font-medium">
                +213 779 53 12 93
              </p>
            </div>
          </div>

          {/* Email */}
          <div className="flex flex-col items-center space-y-5">
            <div className="h-16 w-16 flex items-center justify-center">
              <FileText className="h-12 w-12 text-slate-800 dark:text-slate-200" strokeWidth={1.5} />
            </div>
            <div className="space-y-3">
              <h3 className="text-sm font-bold tracking-[0.25em] text-slate-400 uppercase">
                Email
              </h3>
              <p className="text-slate-800 dark:text-slate-300 font-medium">
                support@intership.com
              </p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
