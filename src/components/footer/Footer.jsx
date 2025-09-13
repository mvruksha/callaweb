import Link from "next/link";
import Image from "next/image";
import {
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  Phone,
  MapPin,
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-purple-950 text-white py-8 border-t border-purple-700">
      <div className="px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Logo & Intro */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center space-x-3 mb-4">
              <Image
                src="/assets/logo/footerbg.svg"
                alt="Logo"
                width={220}
                height={120}
                className="w-auto h-18 object-contain"
                priority
              />
            </Link>
            <h2 className="text-2xl font-bold mb-2">Call-A-Cake</h2>
            <p className="text-gray-300 mb-4 leading-relaxed">
              Trusted name in the bakery industry with over 10 years of
              experience crafting delicious treats and snacks. We combine
              quality ingredients with expert craftsmanship.
            </p>
            <Link
              href="/cakes"
              className="bg-gradient-to-r mt-6 from-pink-500 to-purple-700 
                     hover:from-pink-600 hover:to-purple-800 
                     text-white px-6 py-3 rounded-xs shadow-md 
                     transition transform hover:scale-105 
                     text-[10px] sm:text-sm font-bold"
            >
              Explore Cakes
            </Link>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-4 border-b border-gray-600 pb-2">
              Quick Links
            </h3>
            <ul className="space-y-2 text-gray-300">
              {[
                { href: "/gallery", label: "Gallery" },
                { href: "/about", label: "About Us" },
                { href: "/testimonials", label: "Testimonials" },
                { href: "/admin", label: "Admin" },
                { href: "/contact", label: "Contact Us" },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="hover:text-red-500 transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info + Socials */}
          <div>
            <h3 className="text-lg font-bold mb-4 border-b border-gray-600 pb-2">
              Contact Us
            </h3>
            <ul className="space-y-3 text-gray-300 mb-6">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-1" />
                Home Gavi Nilaya, Jnananjyothinagar, Railway Layout, Jnana Ganga
                Nagar, Bengaluru, Karnataka 560056
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <Link href="tel:+919980903360" className="hover:text-red-500">
                  +91-99809-03360 / 83105-80615
                </Link>
              </li>
              <li className="flex items-center gap-2">
                <FaWhatsapp className="w-4 h-4" />
                <Link
                  href="https://wa.me/919980903360"
                  target="_blank"
                  className="hover:text-green-400"
                >
                  WhatsApp Us
                </Link>
              </li>
            </ul>

            <h3 className="text-lg font-bold mb-3 border-b border-gray-600 pb-2">
              Follow Us
            </h3>
            <div className="flex space-x-4">
              <Link
                href="#"
                className="hover:text-blue-600 transition-transform transform hover:scale-110"
              >
                <Facebook className="w-5 h-5" />
              </Link>
              <Link
                href="#"
                className="hover:text-pink-400 transition-transform transform hover:scale-110"
              >
                <Instagram className="w-5 h-5" />
              </Link>
              <Link
                href="#"
                className="hover:text-sky-400 transition-transform transform hover:scale-110"
              >
                <Twitter className="w-5 h-5" />
              </Link>
              <Link
                href="#"
                className="hover:text-red-600 transition-transform transform hover:scale-110"
              >
                <Youtube className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="mt-10 border-t border-gray-500 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-gray-400 text-sm">
          <div className="text-center md:text-left">
            Developed with <span className="text-red-500">❤️</span> by{" "}
            <Link
              href="https://mvrukshasoftwares.com"
              target="_blank"
              className="hover:text-white font-semibold"
            >
              mVruksha Softwares
            </Link>
          </div>
          <div className="text-center md:text-right">
            &copy; {new Date().getFullYear()} Call-A-Cake. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
