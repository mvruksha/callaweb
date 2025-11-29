"use client";

import React, { useRef, useState } from "react";
import emailjs from "@emailjs/browser";
import Link from "next/link";

const ContactSection = () => {
  const form = useRef();
  const [messageSent, setMessageSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const sendEmail = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Send message to admin (via EmailJS)
      await emailjs.sendForm(
        "service_xa6zxg",
        "template_6ed64r",
        form.current,
        "mI9NGiI5z2rZceOa"
      );

      // Prepare form data
      const formData = new FormData(form.current);
      const emailParams = {
        name: formData.get("name"),
        email: formData.get("email"),
      };

      // Send auto-reply to user (via EmailJS)
      await emailjs.send(
        "service_xa6zxg",
        "template_z5083j",
        emailParams,
        "mI9NGiI5z2rZceOa"
      );

      // Also save data to your backend (MongoDB API)
      await fetch("https://callabackend.vercel.app/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.get("name"),
          email: formData.get("email"),
          number: formData.get("number"),
          services: formData.get("services"),
        }),
      });

      setMessageSent(true);
      form.current.reset();
    } catch (error) {
      console.error("FAILED...", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-gradient-to-r from-purple-50 to-teal-50 py-16 px-6 md:px-20">
      <div className="max-w-6xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
        {/* Left: Contact Details */}
        <div className="md:w-1/2 bg-purple-700 text-white p-10 flex flex-col justify-center space-y-6">
          <h2 className="text-4xl font-bold mb-2">Contact Call-A-Cake</h2>
          <p className="text-lg">
            We’d love to hear from you! Reach out for queries or orders.
          </p>

          <div className="space-y-3">
            <p className="font-semibold flex items-center gap-2">📍 Address:</p>
            <Link
              href="https://share.google/s4NriaoJeQQXic5AG"
              target="_blank"
              className="hover:underline"
            >
              Home Gavi Nilaya, Jnananjyothinagar, Railway Layout, Jnana Ganga
              Nagar, Bengaluru, Karnataka 560056
            </Link>
          </div>

          <div className="space-y-1">
            <p className="font-semibold flex items-center gap-2">📞 Phone:</p>
            <a href="tel:+919164398736" className="hover:underline">
              +91 91643 98736
            </a>
          </div>

          <div className="space-y-1">
            <p className="font-semibold flex items-center gap-2">📧 Email:</p>
            <a href="mailto:order@callacake.com" className="hover:underline">
              order@callacake.com
            </a>
          </div>
        </div>

        {/* Right: Form */}
        <div className="md:w-1/2 p-10 bg-gradient-to-tr from-white via-teal-50 to-white">
          <h3 className="text-3xl font-semibold mb-6 text-purple-700">
            Send us a message
          </h3>

          {messageSent && (
            <div className="mb-4 text-green-600 font-semibold border border-green-300 p-3 rounded-lg bg-green-50">
              ✅ Message sent successfully!
            </div>
          )}

          <form ref={form} onSubmit={sendEmail} className="space-y-5">
            <div>
              <label className="block mb-1 text-gray-700 font-medium">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-400 focus:outline-none transition"
                placeholder="Your name"
              />
            </div>

            <div>
              <label className="block mb-1 text-gray-700 font-medium">
                Email
              </label>
              <input
                type="email"
                name="email"
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-400 focus:outline-none transition"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block mb-1 text-gray-700 font-medium">
                Phone Number
              </label>
              <input
                type="tel"
                name="number"
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-400 focus:outline-none transition"
                placeholder="+91 8105114625"
              />
            </div>

            <div>
              <label className="block mb-1 text-gray-700 font-medium">
                Message
              </label>
              <textarea
                name="services"
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-3 h-32 resize-none focus:ring-2 focus:ring-purple-400 focus:outline-none transition"
                placeholder="Type your message..."
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full font-semibold px-6 py-3 rounded-lg transition ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-purple-700 text-white hover:bg-purple-800"
              }`}
            >
              {loading ? "Sending..." : "Send Message"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ContactSection;
