"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/topheader/Navbar";
import AdminNavbar from "@/components/adminpage/adminnavbar/AdminNavbar";

export default function NavbarSwitcher() {
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith("/admin");

  return isAdminRoute ? <AdminNavbar /> : <Navbar />;
}
