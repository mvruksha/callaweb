"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  FaPhoneAlt,
  FaEnvelope,
  FaFacebookF,
  FaInstagram,
  FaTwitter,
} from "react-icons/fa";

export default function TopHeader() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      // Hide TopHeader if user scrolls down more than 10px
      setIsVisible(window.scrollY < 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className={`fixed w-full top-0 left-0 z-50 h-10 bg-purple-50 text-gray-800 text-sm shadow-sm transition-transform duration-300 ease-in-out ${
        isVisible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <div className="max-w-8xl mx-auto flex justify-between items-center px-4 sm:px-6 lg:px-8 h-full">
        {/* Left: Contact Info */}
        <div className="flex space-x-6 items-center">
          <Link
            href="mailto:order@callacake.com"
            className="flex items-center space-x-1.5 hover:text-pink-600 transition-colors text-xs sm:text-sm font-medium"
          >
            <FaEnvelope className="text-gray-600" />
            <span className="hidden sm:inline">order@callacake.com</span>
          </Link>

          <Link
            href="tel:+918105114625"
            className="flex items-center space-x-1.5 hover:text-pink-600 transition-colors text-xs sm:text-sm font-medium"
          >
            <FaPhoneAlt className="text-gray-600" />
            <span className="hidden sm:inline">+91 8105114625</span>
          </Link>
        </div>

        {/* Right: Social Icons */}
        <div className="flex space-x-4 text-sm sm:text-base">
          <Link
            href="https://facebook.com"
            target="_blank"
            className="text-gray-600 hover:text-[#1877F2] transition-colors"
            aria-label="Facebook"
          >
            <FaFacebookF />
          </Link>
          <Link
            href="https://instagram.com"
            target="_blank"
            className="text-gray-600 hover:text-[#E4405F] transition-colors"
            aria-label="Instagram"
          >
            <FaInstagram />
          </Link>
          <Link
            href="https://twitter.com"
            target="_blank"
            className="text-gray-600 hover:text-[#1DA1F2] transition-colors"
            aria-label="Twitter"
          >
            <FaTwitter />
          </Link>
        </div>
      </div>
    </div>
  );
}
