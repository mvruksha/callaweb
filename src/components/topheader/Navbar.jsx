"use client";

import React, { useState, useEffect, useContext } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  FaBars,
  FaTimes,
  FaChevronDown,
  FaShoppingCart,
  FaSearch,
} from "react-icons/fa";
import { HiCake } from "react-icons/hi2";

import { SidebarContext } from "../../../contexts/SidebarContext";
import { CartContext } from "../../../contexts/CartContext";
import Sidebar from "../cakemenu/sidebar/Sidebar";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const pathname = usePathname();

  // contexts
  const { setIsOpen } = useContext(SidebarContext);
  const { itemAmount } = useContext(CartContext);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleSearch = () => setIsSearchOpen(!isSearchOpen);
  const isActive = (href) => pathname === href;

  const navItems = [
    {
      label: "Cakes",
      submenu: [
        { href: "/cakes", label: "Cakes Menu" },
        { href: "/categories", label: "Categories" },
      ],
    },
    { href: "/gallery", label: "Gallery" },
    { href: "/about", label: "About Us" },
    { href: "/testimonials", label: "Testimonials" },
    { href: "/contact", label: "Contact Us" },
  ];

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?query=${searchQuery}`;
    }
  };

  return (
    <>
      <header
        className={`fixed w-full z-40 top-9 transition-all duration-300 
          bg-gradient-to-r from-[#4B006E] via-[#6A1B9A] to-[#8E24AA] 
          shadow-[0_4px_6px_-1px_rgba(0,0,0,0.3)]
          ${isScrolled ? "text-white backdrop-blur-md" : "text-gray-200"}`}
      >
        <nav className="flex justify-between items-center px-4 py-2">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src="/assets/logo/calacake.svg"
              alt="Logo"
              width={180}
              height={60}
              className="w-auto h-10 sm:h-14 object-contain"
              priority
            />
          </Link>

          {/* Center Search */}
          <div className="flex-1 flex justify-end mr-6">
            {isSearchOpen ? (
              <form
                onSubmit={handleSearchSubmit}
                className="relative w-[90%] sm:w-[60%] md:w-[50%] lg:w-[40%]"
              >
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search cakes..."
                  className="w-full py-2 pl-4 pr-10 rounded-full bg-white text-black text-sm focus:outline-none"
                  autoFocus
                />
                <button
                  type="submit"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-700 hover:text-purple-600"
                >
                  <FaSearch />
                </button>
              </form>
            ) : (
              <button
                onClick={toggleSearch}
                className="text-xl hover:text-white transition"
                title="Search"
              >
                <FaSearch />
              </button>
            )}
          </div>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center space-x-6 text-base font-medium">
            {navItems.map((item, index) => (
              <div key={index} className="relative group">
                {item.submenu ? (
                  <>
                    <button className="flex items-center gap-1 hover:text-white transition relative">
                      {item.label}
                      <FaChevronDown className="text-xs mt-[2px] transition-transform group-hover:rotate-180" />
                    </button>
                    {/* Submenu */}
                    <div
                      className="absolute top-full left-0 mt-2 w-52 rounded shadow-lg opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-all duration-200 z-50
                        bg-gradient-to-r from-[#4B006E] via-[#6A1B9A] to-[#8E24AA] border border-purple-800"
                    >
                      {item.submenu.map((sub, subIndex) => (
                        <Link
                          key={subIndex}
                          href={sub.href}
                          className={`flex items-center gap-2 px-4 py-2 text-sm transition rounded-xs ${
                            isActive(sub.href)
                              ? "bg-purple-950 text-white"
                              : "text-gray-100 hover:bg-purple-800 hover:text-white"
                          }`}
                        >
                          <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                          {sub.label}
                        </Link>
                      ))}
                    </div>
                  </>
                ) : (
                  <Link
                    href={item.href}
                    className={`relative group transition ${
                      isActive(item.href)
                        ? "text-red-400 font-semibold"
                        : "hover:text-white"
                    }`}
                  >
                    {item.label}
                    <span className="absolute left-0 -bottom-1 h-[2px] w-0 bg-white group-hover:w-full transition-all duration-300"></span>
                  </Link>
                )}
              </div>
            ))}

            {/* Cart + Track order */}
            <div className="flex items-center space-x-6 text-xl">
              <button
                onClick={() => setIsOpen(true)}
                className="hover:text-white transition relative"
                title="Cart"
              >
                <FaShoppingCart />
                {itemAmount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-600 text-xs text-white w-5 h-5 flex items-center justify-center rounded-full">
                    {itemAmount}
                  </span>
                )}
              </button>

              <Link
                href="/trackorder"
                className="hover:text-white transition"
                title="Track Order"
              >
                <HiCake className="text-2xl animate-bounce hover:animate-spin transition-transform duration-500" />
              </Link>
            </div>
          </div>

          {/* Mobile Toggle */}
          <div className="lg:hidden flex items-center space-x-6">
            {/* Mobile Cart */}
            <button
              onClick={() => setIsOpen(true)}
              className="hover:text-white transition relative text-xl"
              title="Cart"
            >
              <FaShoppingCart />
              {itemAmount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-xs text-white w-5 h-5 flex items-center justify-center rounded-full">
                  {itemAmount}
                </span>
              )}
            </button>

            {/* Menu Toggle */}
            <button
              onClick={toggleMenu}
              className="text-2xl text-white focus:outline-none"
            >
              {isMenuOpen ? <FaTimes /> : <FaBars />}
            </button>
          </div>
        </nav>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden absolute top-12 left-0 w-full bg-gradient-to-r from-[#4B006E] via-[#6A1B9A] to-[#8E24AA] shadow-lg z-40 animate-slideDown">
            <div className="flex flex-col items-center py-6 space-y-4 text-lg font-medium text-white">
              {navItems.map((item, index) => (
                <div key={index} className="w-full">
                  {item.submenu ? (
                    <details className="w-full px-6">
                      <summary className="cursor-pointer text-sm text-left">
                        {item.label}
                      </summary>
                      <div className="flex flex-col items-start space-y-2 mt-2 pl-4 border-l border-purple-400 ml-2">
                        {item.submenu.map((sub, subIndex) => (
                          <Link
                            key={subIndex}
                            href={sub.href}
                            onClick={toggleMenu}
                            className={`flex items-center gap-2 text-sm px-2 py-2 rounded-xs w-full transition ${
                              isActive(sub.href)
                                ? "bg-purple-950 text-white"
                                : "text-gray-200 hover:text-white hover:bg-purple-800"
                            }`}
                          >
                            <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                            {sub.label}
                          </Link>
                        ))}
                      </div>
                    </details>
                  ) : (
                    <div className="px-6">
                      <Link
                        href={item.href}
                        onClick={toggleMenu}
                        className={`text-sm block w-full text-left transition ${
                          isActive(item.href)
                            ? "text-red-400 font-semibold"
                            : "text-gray-200 hover:text-red-400"
                        }`}
                      >
                        {item.label}
                      </Link>
                    </div>
                  )}
                </div>
              ))}

              {/* Mobile Track Order */}
              <div className="flex w-full mt-2 text-xl px-4">
                <Link
                  onClick={toggleMenu}
                  href="/trackorder"
                  className="w-full relative flex items-center justify-center gap-2 py-2 text-sm font-semibold text-white bg-purple-950 rounded-xs shadow-md transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-lg animate-pulse group"
                >
                  <HiCake className="text-xl animate-bounce group-hover:animate-spin transition-transform duration-500" />
                  Track Order
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Sidebar (Cart) */}
      <Sidebar />
    </>
  );
}
