"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation"; // <-- add useRouter
import { useState } from "react";
import {
  FileText,
  BarChart2,
  Menu,
  X,
  House,
  ChevronDown,
  ChevronUp,
  Calendar,
} from "lucide-react";

const AdminNavbar = () => {
  const pathname = usePathname();
  const router = useRouter(); // <-- router to navigate programmatically
  const [menuOpen, setMenuOpen] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState(null);

  const toggleMenu = () => setMenuOpen((prev) => !prev);

  const handleSubmenuToggle = (menu) => {
    setOpenSubmenu((prev) => (prev === menu ? null : menu));
  };

  const handleLogout = () => {
    // Clear token/session
    localStorage.removeItem("token");
    // Optionally, clear other admin-related data
    localStorage.removeItem("admin");
    // Redirect to login
    router.push("/admin/login");
  };

  const navLinks = [
    { name: "Dashboard", path: "/admin", icon: <BarChart2 size={18} /> },
    {
      name: "Cakes Board",
      icon: <FileText size={18} />,
      submenu: [
        { name: "AddCakes", path: "/admin/addcakes" },
        { name: "CakesList", path: "/admin/cakeslist" },
      ],
    },
    {
      name: "Cakes Orders",
      icon: <FileText size={18} />,
      submenu: [{ name: "Cakes Orders", path: "/admin/orders" }],
    },
    {
      name: "Users",
      icon: <FileText size={18} />,
      submenu: [{ name: "Admin Users", path: "/admin/add-user" }],
    },
    {
      name: "Contact",
      icon: <Calendar size={18} />,
      submenu: [{ name: "Contact Table", path: "/admin/contact" }],
    },
  ];

  return (
    <header className="fixed w-full z-40 top-8 bg-gradient-to-r from-[#4B006E] via-[#6A1B9A] to-[#8E24AA] shadow-[0_4px_6px_-1px_rgba(0,0,0,0.3)] text-white px-6 py-4">
      <div className="flex items-center justify-between md:justify-start md:gap-8">
        {/* Title */}
        <Link href="/admin">
          <h1 className="text-xl font-semibold">Admin Panel</h1>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex gap-4 ml-auto items-start">
          {navLinks.map((link) =>
            link.submenu ? (
              <div key={link.name} className="relative">
                <button
                  onClick={() => handleSubmenuToggle(link.name)}
                  className={`flex items-center gap-2 px-3 py-2 text-sm rounded-xs ${
                    openSubmenu === link.name
                      ? "bg-pink-600 text-white font-semibold"
                      : "hover:bg-gray-700"
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
                {openSubmenu === link.name && (
                  <div className="absolute bg-gray-800 rounded-xs mt-1 shadow-lg w-48">
                    {link.submenu.map((sublink) => (
                      <Link
                        key={sublink.name}
                        href={sublink.path}
                        className={`block px-4 py-2 text-sm ${
                          pathname === sublink.path
                            ? "bg-pink-600 text-white font-semibold"
                            : "hover:bg-gray-700"
                        }`}
                      >
                        {sublink.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <Link
                key={link.name}
                href={link.path}
                className={`flex items-center gap-2 px-3 py-2 rounded-xs text-sm ${
                  pathname === link.path
                    ? "bg-pink-600 text-white font-semibold"
                    : "hover:bg-gray-700"
                }`}
              >
                {link.icon}
                {link.name}
              </Link>
            )
          )}

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 rounded-xs text-sm hover:bg-gray-700"
          >
            <House size={18} />
            Logout
          </button>
        </nav>

        {/* Mobile toggle button */}
        <button
          onClick={toggleMenu}
          className="md:hidden text-white focus:outline-none ml-auto"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Nav */}
      {menuOpen && (
        <nav className="flex flex-col gap-2 mt-4 md:hidden">
          {navLinks.map((link) =>
            link.submenu ? (
              <div key={link.name} className="flex flex-col">
                <button
                  onClick={() => handleSubmenuToggle(link.name)}
                  className={`flex items-center justify-between px-3 py-2 text-sm rounded-xs ${
                    openSubmenu === link.name
                      ? "bg-pink-600 text-white font-semibold"
                      : "hover:bg-gray-700"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {link.icon}
                    {link.name}
                  </div>
                  {openSubmenu === link.name ? (
                    <ChevronUp size={14} />
                  ) : (
                    <ChevronDown size={14} />
                  )}
                </button>
                {openSubmenu === link.name && (
                  <div className="ml-6 mt-1">
                    {link.submenu.map((sublink) => (
                      <Link
                        key={sublink.name}
                        href={sublink.path}
                        onClick={() => {
                          setOpenSubmenu(null);
                          setMenuOpen(false);
                        }}
                        className={`block px-3 py-1 text-sm rounded-xs ${
                          pathname === sublink.path
                            ? "bg-pink-600 text-white font-semibold"
                            : "hover:bg-gray-700"
                        }`}
                      >
                        {sublink.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <Link
                key={link.name}
                href={link.path}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xs text-sm ${
                  pathname === link.path
                    ? "bg-pink-600 text-white font-semibold"
                    : "hover:bg-gray-700"
                }`}
              >
                {link.icon}
                {link.name}
              </Link>
            )
          )}

          {/* Logout mobile */}
          <button
            onClick={() => {
              handleLogout();
              setMenuOpen(false);
            }}
            className="flex items-center gap-2 px-3 py-2 rounded-xs text-sm hover:bg-gray-700"
          >
            <House size={18} />
            Logout
          </button>
        </nav>
      )}
    </header>
  );
};

export default AdminNavbar;
