"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import {
  FileText,
  BarChart2,
  Menu,
  X,
  LogOut,
  ChevronDown,
  ChevronUp,
  Calendar,
  User,
  Bell,
  Settings,
} from "lucide-react";

const AdminNavbar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const navRef = useRef(null); // Ref for click-outside detection

  const [menuOpen, setMenuOpen] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState(null);
  const [scrolled, setScrolled] = useState(false);

  // Toggle mobile menu
  const toggleMenu = () => setMenuOpen((prev) => !prev);

  // Toggle specific submenu
  const handleSubmenuToggle = (menuName) => {
    setOpenSubmenu((prev) => (prev === menuName ? null : menuName));
  };

  // Logout Logic
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("admin");
    router.push("/admin/login");
  };

  // 1. AUTO-CLOSE: Close menus when the Route (Pathname) changes
  useEffect(() => {
    setMenuOpen(false);
    setOpenSubmenu(null);
  }, [pathname]);

  // 2. AUTO-CLOSE: Close menus when clicking outside the navbar
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navRef.current && !navRef.current.contains(event.target)) {
        setOpenSubmenu(null);
        // Optional: Close mobile menu on outside click too
        // setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 3. EFFECT: Add shadow on scroll
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Dashboard", path: "/admin", icon: <BarChart2 size={18} /> },
    {
      name: "Cakes Board",
      icon: <FileText size={18} />,
      submenu: [
        { name: "Add Cakes", path: "/admin/addcakes" },
        { name: "Cakes List", path: "/admin/cakeslist" },
      ],
    },
    {
      name: "Orders",
      icon: <FileText size={18} />,
      submenu: [{ name: "All Orders", path: "/admin/orders" }],
    },
    {
      name: "Users",
      icon: <User size={18} />,
      submenu: [{ name: "Admin Users", path: "/admin/add-user" }],
    },
    {
      name: "Contact",
      icon: <Calendar size={18} />,
      submenu: [{ name: "Inquiries", path: "/admin/contact" }],
    },
  ];

  return (
    <header
      ref={navRef}
      className={`fixed w-full z-50 top-0 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-md text-gray-800 shadow-md py-3"
          : "bg-gradient-to-r from-[#4B006E] via-[#6A1B9A] to-[#8E24AA] text-white py-4"
      }`}
    >
      <div className="max-w-8xl mx-auto px-6 flex items-center justify-between">
        {/* --- Logo Area --- */}
        <Link href="/admin" className="flex items-center gap-2 group">
          <div
            className={`p-2 rounded-lg ${
              scrolled
                ? "bg-purple-100 text-purple-700"
                : "bg-white/20 text-white"
            }`}
          >
            <Settings
              size={20}
              className="group-hover:rotate-90 transition-transform duration-500"
            />
          </div>
          <span className="text-xl font-bold tracking-wide">AdminPanel</span>
        </Link>

        {/* --- Desktop Navigation --- */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <div key={link.name} className="relative group">
              {link.submenu ? (
                // Dropdown Parent
                <div className="relative">
                  <button
                    onClick={() => handleSubmenuToggle(link.name)}
                    className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      openSubmenu === link.name
                        ? "bg-pink-600 text-white"
                        : "hover:opacity-80"
                    }`}
                  >
                    {link.icon}
                    {link.name}
                    {openSubmenu === link.name ? (
                      <ChevronUp size={14} />
                    ) : (
                      <ChevronDown size={14} />
                    )}
                  </button>

                  {/* Desktop Dropdown Menu */}
                  {openSubmenu === link.name && (
                    <div className="absolute top-full left-0 mt-2 w-48 bg-white text-gray-800 rounded-xl shadow-xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                      {link.submenu.map((sublink) => (
                        <Link
                          key={sublink.name}
                          href={sublink.path}
                          className={`block px-4 py-3 text-sm hover:bg-purple-50 transition-colors ${
                            pathname === sublink.path
                              ? "bg-purple-100 text-purple-700 font-semibold"
                              : ""
                          }`}
                        >
                          {sublink.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                // Standard Link
                <Link
                  href={link.path}
                  className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    pathname === link.path
                      ? "bg-pink-600 text-white shadow-lg shadow-pink-600/30"
                      : "hover:opacity-80"
                  }`}
                >
                  {link.icon}
                  {link.name}
                </Link>
              )}
            </div>
          ))}
        </nav>

        {/* --- Right Actions (Profile/Logout) --- */}
        <div className="hidden md:flex items-center gap-4">
          <button
            className={`p-2 rounded-full transition-colors ${
              scrolled ? "hover:bg-gray-100" : "hover:bg-white/10"
            }`}
          >
            <Bell size={20} />
          </button>
          <div className="h-6 w-px bg-current opacity-20"></div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm font-medium hover:text-red-400 transition-colors"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>

        {/* --- Mobile Menu Button --- */}
        <button
          onClick={toggleMenu}
          className={`md:hidden p-2 rounded-lg transition-colors ${
            scrolled
              ? "hover:bg-gray-100 text-gray-800"
              : "hover:bg-white/10 text-white"
          }`}
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* --- Mobile Dropdown Area --- */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          menuOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="bg-white text-gray-800 shadow-inner p-4 space-y-2">
          {navLinks.map((link) => (
            <div key={link.name}>
              {link.submenu ? (
                <>
                  <button
                    onClick={() => handleSubmenuToggle(link.name)}
                    className={`w-full flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                      openSubmenu === link.name
                        ? "bg-purple-50 text-purple-700"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {link.icon} {link.name}
                    </div>
                    {openSubmenu === link.name ? (
                      <ChevronUp size={16} />
                    ) : (
                      <ChevronDown size={16} />
                    )}
                  </button>
                  {/* Mobile Submenu */}
                  {openSubmenu === link.name && (
                    <div className="ml-4 mt-1 space-y-1 border-l-2 border-purple-100 pl-3">
                      {link.submenu.map((sublink) => (
                        <Link
                          key={sublink.name}
                          href={sublink.path}
                          className={`block px-4 py-2 text-sm rounded-lg ${
                            pathname === sublink.path
                              ? "text-pink-600 font-semibold bg-pink-50"
                              : "text-gray-600 hover:text-purple-700"
                          }`}
                        >
                          {sublink.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <Link
                  href={link.path}
                  className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg ${
                    pathname === link.path
                      ? "bg-pink-600 text-white shadow-md"
                      : "hover:bg-gray-50"
                  }`}
                >
                  {link.icon} {link.name}
                </Link>
              )}
            </div>
          ))}
          <div className="border-t my-2 pt-2">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminNavbar;
