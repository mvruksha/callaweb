import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import TopHeader from "@/components/topheader/TopHeader";
import CartProvider from "../../contexts/CartContext";

// Fonts
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Metadata
import { metadata } from "./layoutMetadata";
import SidebarProvider from "../../contexts/SidebarContext";
import Footer from "@/components/footer/Footer";
import NavbarSwitcher from "@/components/topheader/NavbarSwitcher";

export { metadata };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <CartProvider>
          <SidebarProvider>
            <TopHeader />
            <NavbarSwitcher />
            {children}
            <Footer />
          </SidebarProvider>
        </CartProvider>
      </body>
    </html>
  );
}
