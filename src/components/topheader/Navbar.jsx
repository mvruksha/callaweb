"use client";

import React, { useState, useEffect, useContext, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  FaBars,
  FaTimes,
  FaChevronDown,
  FaShoppingCart,
  FaSearch,
  FaMapMarkerAlt,
} from "react-icons/fa";
import { HiCake } from "react-icons/hi2";
import { IoIosArrowForward } from "react-icons/io";

import { SidebarContext } from "../../../contexts/SidebarContext";
import { CartContext } from "../../../contexts/CartContext";
import Sidebar from "../cakemenu/sidebar/Sidebar";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const navRef = useRef(null);

  // --- UI States ---
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [mobileSubmenuOpen, setMobileSubmenuOpen] = useState(null);

  // --- Contexts ---
  const { setIsOpen } = useContext(SidebarContext);
  const { itemAmount } = useContext(CartContext);

  // --- 1. HANDLE SCROLL ---
  useEffect(() => {
    const handleScroll = () => {
      // Threshold 10px matches TopHeader logic
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // --- 2. AUTO-CLOSE ---
  useEffect(() => {
    setIsMenuOpen(false);
    setMobileSubmenuOpen(null);
  }, [pathname, searchParams]);

  // --- 3. CLICK OUTSIDE ---
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navRef.current && !navRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Helpers
  const isActive = (href) => pathname === href;

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?query=${encodeURIComponent(searchQuery)}`);
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
    }
  };

  const navItems = [
    {
      label: "Cakes",
      href: "/cakes",
      submenu: [
        { href: "/cakes", label: "Full Menu" },
        { href: "/categories", label: "By Category" },
      ],
    },
    { href: "/gallery", label: "Gallery" },
    { href: "/about", label: "About" },
    { href: "/testimonials", label: "Reviews" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <>
      <header
        ref={navRef}
        // FIX: Added 'bg-[#4B006E]' here as a fallback to prevent white flash
        className={`fixed w-full z-40 transition-all duration-300 ease-in-out border-b border-white/10 bg-[#4B006E]
          ${
            isScrolled
              ? "top-0 py-2 bg-opacity-95 backdrop-blur-md shadow-xl" // Scrolled state
              : "top-10 py-3 bg-gradient-to-r from-[#4B006E] via-[#6A1B9A] to-[#8E24AA]" // Initial State
          } text-white`}
      >
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center gap-4">
            {/* ================= LEFT: LOGO ================= */}
            <Link href="/" className="flex-shrink-0 group relative z-50">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Image
                    src="/assets/logo/calacake.svg"
                    alt="Cala Cake"
                    width={140}
                    height={45}
                    className={`transition-all duration-300 object-contain ${
                      isScrolled ? "h-9 w-auto" : "h-11 w-auto"
                    }`}
                    priority
                  />
                </div>
              </div>
            </Link>

            {/* ================= CENTER: SEARCH BAR (Desktop) ================= */}
            <div className="hidden md:flex flex-1 justify-center max-w-xl mx-4 transition-all duration-300">
              <form
                onSubmit={handleSearchSubmit}
                className={`relative w-full group transition-all duration-300 ${
                  isSearchFocused ? "scale-105" : "scale-100"
                }`}
              >
                <div
                  className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-300 ${
                    isSearchFocused ? "text-purple-600" : "text-purple-200"
                  }`}
                >
                  <FaSearch />
                </div>
                <input
                  type="text"
                  placeholder="Find your favorite cake..."
                  className={`w-full py-2.5 pl-11 pr-4 rounded-full text-sm outline-none border transition-all duration-300 ${
                    isSearchFocused
                      ? "bg-white text-gray-900 border-white shadow-lg placeholder-gray-400"
                      : "bg-white/10 text-white border-white/20 placeholder-purple-200 hover:bg-white/20 hover:border-white/40"
                  }`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                />
              </form>
            </div>

            {/* ================= RIGHT: NAV & ACTIONS ================= */}
            <div className="flex items-center gap-1 sm:gap-6">
              {/* Desktop Nav Links */}
              <nav className="hidden lg:flex items-center space-x-6">
                {navItems.map((item, index) => (
                  <div key={index} className="relative group/menu">
                    <Link
                      href={item.href}
                      className={`flex items-center gap-1 text-sm font-medium transition-colors hover:text-pink-300 ${
                        isActive(item.href) ? "text-pink-300" : "text-white/90"
                      }`}
                    >
                      {item.label}
                      {item.submenu && (
                        <FaChevronDown className="text-[10px] group-hover/menu:rotate-180 transition-transform" />
                      )}
                    </Link>

                    {/* Desktop Dropdown */}
                    {item.submenu && (
                      <div className="absolute top-full right-0 pt-4 opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all duration-300 transform translate-y-2 group-hover/menu:translate-y-0">
                        <div className="w-56 bg-white/95 backdrop-blur-xl border border-purple-100 rounded-xl shadow-2xl overflow-hidden py-2 text-gray-800">
                          {item.submenu.map((sub, subIndex) => (
                            <Link
                              key={subIndex}
                              href={sub.href}
                              className="flex items-center justify-between px-5 py-2.5 text-sm hover:bg-purple-50 hover:text-purple-700 transition-colors"
                            >
                              {sub.label}
                              <IoIosArrowForward className="text-gray-400 text-xs" />
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </nav>

              <div className="w-px h-6 bg-white/20 hidden lg:block mx-2"></div>

              {/* Action Icons */}
              <div className="flex items-center gap-3 sm:gap-5">
                {/* Track Order */}
                <Link
                  href="/trackorder"
                  className="relative group p-2 hover:bg-white/10 rounded-full transition-all"
                  title="Track Order"
                >
                  <HiCake className="text-xl sm:text-2xl group-hover:text-pink-300 transition-colors" />
                </Link>

                {/* Cart Icon */}
                <button
                  onClick={() => setIsOpen(true)}
                  className="relative group p-2 hover:bg-white/10 rounded-full transition-all"
                >
                  <FaShoppingCart className="text-xl group-hover:text-pink-300 transition-colors" />
                  {itemAmount > 0 && (
                    <span className="absolute top-0 right-0 bg-pink-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-[#6A1B9A] group-hover:animate-bounce">
                      {itemAmount}
                    </span>
                  )}
                </button>

                {/* Mobile Menu Toggle */}
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="lg:hidden p-2 text-xl hover:bg-white/10 rounded-full transition-all"
                >
                  {isMenuOpen ? <FaTimes /> : <FaBars />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ================= MOBILE MENU DRAWER ================= */}
        <div
          className={`lg:hidden absolute top-full left-0 w-full bg-[#590080] border-t border-white/10 shadow-2xl transition-all duration-500 overflow-hidden ${
            isMenuOpen ? "max-h-[85vh] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="p-5 space-y-4 overflow-y-auto max-h-[80vh]">
            {/* Mobile Search */}
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="Search cakes..."
                className="w-full bg-black/20 border border-white/10 rounded-lg py-3 px-4 text-white placeholder-white/50 focus:outline-none focus:bg-black/30 focus:border-pink-500/50"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button
                type="submit"
                className="absolute right-3 top-3.5 text-white/70"
              >
                <FaSearch />
              </button>
            </form>

            <div className="h-px bg-white/10 my-2"></div>

            {/* Mobile Nav Links */}
            <div className="space-y-1">
              {navItems.map((item, index) => (
                <div key={index}>
                  {item.submenu ? (
                    <div className="rounded-xl overflow-hidden">
                      <button
                        onClick={() =>
                          setMobileSubmenuOpen(
                            mobileSubmenuOpen === index ? null : index
                          )
                        }
                        className={`w-full flex items-center justify-between px-4 py-3 font-medium transition-colors ${
                          mobileSubmenuOpen === index
                            ? "bg-white/10 text-pink-300"
                            : "text-white hover:bg-white/5"
                        }`}
                      >
                        {item.label}
                        <FaChevronDown
                          className={`text-xs transition-transform duration-300 ${
                            mobileSubmenuOpen === index ? "-rotate-180" : ""
                          }`}
                        />
                      </button>

                      <div
                        className={`bg-black/20 transition-all duration-300 ease-in-out ${
                          mobileSubmenuOpen === index
                            ? "max-h-60 opacity-100 py-2"
                            : "max-h-0 opacity-0"
                        }`}
                      >
                        {item.submenu.map((sub, i) => (
                          <Link
                            key={i}
                            href={sub.href}
                            className="block px-8 py-2 text-sm text-gray-300 hover:text-white border-l-2 border-transparent hover:border-pink-400 ml-4"
                            onClick={() => setIsMenuOpen(false)}
                          >
                            {sub.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <Link
                      href={item.href}
                      className="block px-4 py-3 font-medium text-white hover:bg-white/5 rounded-xl"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                  )}
                </div>
              ))}
            </div>

            {/* Mobile Extra Actions */}
            <div className="pt-4 mt-4 border-t border-white/10 grid grid-cols-2 gap-3">
              <Link
                href="/trackorder"
                onClick={() => setIsMenuOpen(false)}
                className="flex flex-col items-center justify-center p-3 bg-white/5 rounded-xl hover:bg-white/10"
              >
                <HiCake className="text-2xl mb-1 text-pink-300" />
                <span className="text-xs">Orders</span>
              </Link>
              <Link
                href="/contact"
                onClick={() => setIsMenuOpen(false)}
                className="flex flex-col items-center justify-center p-3 bg-white/5 rounded-xl hover:bg-white/10"
              >
                <FaMapMarkerAlt className="text-xl mb-1 text-pink-300" />
                <span className="text-xs">Locate Us</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar Component */}
      <Sidebar />
    </>
  );
}
