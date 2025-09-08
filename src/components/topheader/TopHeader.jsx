"use client";
import React from "react";
import Link from "next/link";
import {
  FaPhoneAlt,
  FaEnvelope,
  FaFacebookF,
  FaInstagram,
  FaTwitter,
} from "react-icons/fa";

export default function TopHeader() {
  return (
    <div className="fixed w-full top-0 bg-purple-50 text-gray-800 text-sm z-50 shadow-md">
      <div className="flex justify-between items-center px-4 py-2">
        {/* Left: Contact Info */}
        <div className="flex space-x-6 items-center">
          <Link
            href="mailto:order@callacake.com"
            className="flex items-center space-x-1 hover:text-pink-600 transition"
          >
            <FaEnvelope className="text-gray-700" />
            <span className="hidden sm:inline">order@callacake.com</span>
          </Link>

          <Link
            href="tel:+91-99809-03360"
            className="flex items-center space-x-1 hover:text-yellow-600 transition"
          >
            <FaPhoneAlt className="text-gray-700" />
            <span className="hidden sm:inline">+91-99809-03360</span>
          </Link>
        </div>

        {/* Right: Social Icons */}
        <div className="flex space-x-4 text-lg">
          <Link
            href="https://facebook.com"
            target="_blank"
            className="hover:text-blue-600 transition"
          >
            <FaFacebookF />
          </Link>
          <Link
            href="https://instagram.com"
            target="_blank"
            className="hover:text-pink-600 transition"
          >
            <FaInstagram />
          </Link>
          <Link
            href="https://twitter.com"
            target="_blank"
            className="hover:text-sky-500 transition"
          >
            <FaTwitter />
          </Link>
        </div>
      </div>
    </div>
  );
}
