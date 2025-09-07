"use client"; // This is a client component

import { useState, useRef, useEffect } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

// --- Icon Imports ---
// Using react-icons for a richer UI
import { FaRegClock, FaDownload } from "react-icons/fa";
import { GiCook, GiPartyPopper } from "react-icons/gi";
import { TbTruckDelivery } from "react-icons/tb";

// --- SVG Icons (Self-contained components from original code) ---

const SearchIcon = ({ className }) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const FrownIcon = ({ className }) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M16 16s-1.5-2-4-2-4 2-4 2" />
    <line x1="9" y1="9" x2="9.01" y2="9" />
    <line x1="15" y1="9" x2="15.01" y2="9" />
  </svg>
);

// --- Helper Functions ---

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(amount);
};

const getStatusDetails = (status) => {
  switch (status?.toLowerCase()) {
    case "pending":
      return { text: "Pending", className: "bg-yellow-100 text-yellow-800" };
    case "processing":
      return { text: "Processing", className: "bg-blue-100 text-blue-800" };
    case "delivered":
      return { text: "Delivered", className: "bg-green-100 text-green-800" };
    case "cancelled":
      return { text: "Cancelled", className: "bg-red-100 text-red-800" };
    default:
      return { text: "Unknown", className: "bg-gray-100 text-gray-800" };
  }
};

// --- UI Sub-Components ---

// --- NEW: Enhanced Order Timeline ---
const OrderTimeline = ({ status }) => {
  const currentStatus = status?.toLowerCase();
  const statuses = [
    { key: "pending", label: "Pending", icon: FaRegClock },
    { key: "processing", label: "Processing", icon: GiCook },
    { key: "delivered", label: "Delivered", icon: TbTruckDelivery },
  ];
  const currentIndex = statuses.findIndex((s) => s.key === currentStatus);

  if (currentStatus === "cancelled") {
    return (
      <div className="flex items-center mt-4">
        <div className="flex items-center text-red-600">
          <svg
            className="w-6 h-6 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
          <span className="font-semibold">Order Cancelled</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full mt-6 mb-2 px-4 sm:px-0">
      <div className="relative">
        {/* Background line */}
        <div className="absolute top-5 left-0 w-full h-1 bg-gray-200"></div>
        {/* Progress line */}
        <div
          className="absolute top-5 left-0 h-1 bg-teal-500 transition-all duration-500"
          style={{ width: `${(currentIndex / (statuses.length - 1)) * 100}%` }}
        ></div>

        <div className="flex justify-between items-start relative">
          {statuses.map((s, index) => {
            const isActive = index <= currentIndex;
            const IconComponent = s.icon;
            return (
              <div
                key={s.key}
                className="flex flex-col items-center text-center w-1/3"
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    isActive
                      ? "bg-teal-500 text-white"
                      : "bg-gray-200 text-gray-400"
                  } transition-colors duration-500`}
                >
                  <IconComponent className="w-6 h-6" />
                </div>
                <div
                  className={`mt-2 text-sm font-bold capitalize ${
                    isActive ? "text-teal-600" : "text-gray-400"
                  }`}
                >
                  {s.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// --- NEW: Invoice Component (Hidden, for PDF generation) ---
const Invoice = ({ order, ref }) => {
  if (!order) return null;

  // GST Calculation (assuming total is inclusive of 18% GST)
  const GST_RATE = 0.18;
  const totalAmount = order.total;
  const taxableValue = totalAmount / (1 + GST_RATE);
  const totalGst = totalAmount - taxableValue;
  const cgst = totalGst / 2;
  const sgst = totalGst / 2;

  return (
    <div
      ref={ref}
      className="invoice-container"
      style={{
        position: "absolute",
        left: "-9999px", // Position off-screen
        width: "210mm",
        minHeight: "297mm",
        padding: "20mm",
        backgroundColor: "white",
        fontFamily: "sans-serif",
        color: "#333",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "2px solid #eee",
          paddingBottom: "20px",
        }}
      >
        <img
          src="/assets/logo/calalogo.png"
          alt="Calla Logo"
          style={{ width: "150px" }}
        />
        <h1 style={{ fontSize: "2.5rem", fontWeight: "bold", color: "#111" }}>
          INVOICE
        </h1>
      </div>

      {/* Company & Customer Info */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: "30px",
        }}
      >
        <div>
          <h3 style={{ fontWeight: "bold", marginBottom: "10px" }}>
            Billed From:
          </h3>
          <p>Calla Cakes & Bakes</p>
          <p>123 Bakery Lane, Cakeville</p>
          <p>Bengaluru, Karnataka, 560001</p>
          <p>GSTIN: 29ABCDE1234F1Z5</p>
        </div>
        <div>
          <h3 style={{ fontWeight: "bold", marginBottom: "10px" }}>
            Billed To:
          </h3>
          <p>{order.customer.name}</p>
          <p>{order.customer.address}</p>
          <p>{order.customer.phone}</p>
        </div>
        <div>
          <p>
            <span style={{ fontWeight: "bold" }}>Invoice #:</span> ...
            {order._id.slice(-8)}
          </p>
          <p>
            <span style={{ fontWeight: "bold" }}>Date:</span>{" "}
            {formatDate(order.createdAt)}
          </p>
        </div>
      </div>

      {/* Items Table */}
      <table
        style={{ width: "100%", marginTop: "40px", borderCollapse: "collapse" }}
      >
        <thead>
          <tr style={{ backgroundColor: "#f9f9f9" }}>
            <th
              style={{
                padding: "12px",
                border: "1px solid #ddd",
                textAlign: "left",
              }}
            >
              Item
            </th>
            <th
              style={{
                padding: "12px",
                border: "1px solid #ddd",
                textAlign: "center",
              }}
            >
              Qty
            </th>
            <th
              style={{
                padding: "12px",
                border: "1px solid #ddd",
                textAlign: "right",
              }}
            >
              Price
            </th>
            <th
              style={{
                padding: "12px",
                border: "1px solid #ddd",
                textAlign: "right",
              }}
            >
              Amount
            </th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((item, index) => (
            <tr key={item._id || index}>
              <td style={{ padding: "12px", border: "1px solid #ddd" }}>
                {item.title}
                {item.selectedWeight && (
                  <span style={{ fontSize: "0.8rem", color: "#666" }}>
                    {" "}
                    ({item.selectedWeight})
                  </span>
                )}
              </td>
              <td
                style={{
                  padding: "12px",
                  border: "1px solid #ddd",
                  textAlign: "center",
                }}
              >
                {item.quantity}
              </td>
              <td
                style={{
                  padding: "12px",
                  border: "1px solid #ddd",
                  textAlign: "right",
                }}
              >
                {formatCurrency(item.price)}
              </td>
              <td
                style={{
                  padding: "12px",
                  border: "1px solid #ddd",
                  textAlign: "right",
                }}
              >
                {formatCurrency(item.price * item.quantity)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals Section */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginTop: "30px",
        }}
      >
        <div style={{ width: "300px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "8px 0",
            }}
          >
            <span>Taxable Value:</span>
            <span>{formatCurrency(taxableValue)}</span>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "8px 0",
            }}
          >
            <span>CGST (9%):</span>
            <span>{formatCurrency(cgst)}</span>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "8px 0",
            }}
          >
            <span>SGST (9%):</span>
            <span>{formatCurrency(sgst)}</span>
          </div>
          <div
            style={{
              borderTop: "2px solid #333",
              marginTop: "10px",
              paddingTop: "10px",
              display: "flex",
              justifyContent: "space-between",
              fontWeight: "bold",
              fontSize: "1.2rem",
            }}
          >
            <span>Grand Total:</span>
            <span>{formatCurrency(order.total)}</span>
          </div>
        </div>
      </div>
      {/* Footer */}
      <div
        style={{
          marginTop: "50px",
          paddingTop: "20px",
          borderTop: "1px solid #eee",
          textAlign: "center",
          color: "#777",
        }}
      >
        <p>Thank you for your order!</p>
        <p>
          This is a computer-generated invoice and does not require a signature.
        </p>
      </div>
    </div>
  );
};

// --- Main Track Order Component ---

const TrackOrderPage = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  // --- NEW: State for invoice generation ---
  const [isDownloading, setIsDownloading] = useState(false);
  const [orderToInvoice, setOrderToInvoice] = useState(null);
  const invoiceRef = useRef();

  const handleTrackOrder = async (e) => {
    e.preventDefault();
    if (!phoneNumber || !/^\d{10}$/.test(phoneNumber)) {
      setError("Please enter a valid 10-digit phone number.");
      return;
    }
    setLoading(true);
    setError(null);
    setOrders([]);
    setHasSearched(true);
    try {
      const response = await fetch(
        `https://callabackend.vercel.app/api/orders`
      );
      if (!response.ok) {
        throw new Error(`Failed to fetch data. Status: ${response.status}`);
      }
      const allOrders = await response.json();
      const userOrders = allOrders.filter(
        (order) =>
          order.customer?.phone && order.customer.phone.endsWith(phoneNumber)
      );
      const sortedOrders = userOrders.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setOrders(sortedOrders);
    } catch (err) {
      console.error("Failed to track order:", err);
      setError(
        err.message || "An unexpected error occurred. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  // --- NEW: Function to trigger invoice download ---
  const downloadInvoice = (order) => {
    setOrderToInvoice(order);
    setIsDownloading(true);
  };

  // --- NEW: Effect to generate PDF when orderToInvoice is set ---
  useEffect(() => {
    if (orderToInvoice && invoiceRef.current) {
      html2canvas(invoiceRef.current, { scale: 3 }).then((canvas) => {
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", "a4");
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
        pdf.save(`invoice-calla-${orderToInvoice._id.slice(-6)}.pdf`);

        // Reset state
        setIsDownloading(false);
        setOrderToInvoice(null);
      });
    }
  }, [orderToInvoice]);

  return (
    <>
      {/* Hidden Invoice component for PDF generation */}
      <Invoice ref={invoiceRef} order={orderToInvoice} />

      <div className="bg-gray-50 min-h-screen font-sans p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight">
              Track Your Order
            </h1>
            <p className="text-gray-600 mt-3 max-w-lg mx-auto">
              Enter your 10-digit phone number to view your order history and
              current status.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xs shadow-lg mb-8">
            <form
              onSubmit={handleTrackOrder}
              className="flex flex-col sm:flex-row items-center gap-4"
            >
              <div className="relative w-full">
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) =>
                    setPhoneNumber(e.target.value.replace(/\D/g, ""))
                  }
                  placeholder="Enter your 10-digit phone number"
                  className="w-full p-4 pl-5 text-lg border-2 border-gray-200 rounded-xs shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                  maxLength="10"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-pink-500 to-purple-700 
                     hover:from-pink-600 hover:to-purple-800 
                     text-white font-semibold py-4 px-8 rounded-xs hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed transition-all duration-300 shadow-md hover:shadow-lg"
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Searching...
                  </>
                ) : (
                  <>
                    <SearchIcon className="w-4 h-4" />
                    Track Order
                  </>
                )}
              </button>
            </form>
            {error && (
              <p className="text-red-600 mt-4 text-center font-medium">
                {error}
              </p>
            )}
          </div>

          <div className="space-y-8">
            {loading && (
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg">
                  Fetching your orders, please wait...
                </p>
              </div>
            )}

            {!loading && hasSearched && orders.length === 0 && (
              <div className="bg-white text-center p-12 rounded-xs shadow-lg">
                <FrownIcon className="mx-auto h-16 w-16 text-indigo-300" />
                <h3 className="text-2xl font-bold text-gray-800 mt-4">
                  No Orders Found
                </h3>
                <p className="text-gray-500 mt-2">
                  We couldn't find any orders for that phone number. Please
                  double-check the number and try again.
                </p>
              </div>
            )}

            {!loading &&
              orders.length > 0 &&
              orders.map((order) => {
                const status = getStatusDetails(order.status);
                return (
                  <div
                    key={order._id}
                    className="bg-white rounded-xs shadow-lg overflow-hidden transition-shadow duration-300 hover:shadow-2xl"
                  >
                    <div className="p-6 border-b border-gray-200 bg-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">
                          Order ID:{" "}
                          <span className="font-mono">
                            ...{order._id.slice(-8)}
                          </span>
                        </h3>
                        <p className="text-sm font-normal text-gray-600">
                          Name
                          <span className="font-mono">
                            ...{order.customer.name}
                          </span>
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          Placed on: {formatDate(order.createdAt)}
                        </p>
                      </div>
                      <span
                        className={`px-4 py-1.5 text-sm font-bold rounded-full ${status.className}`}
                      >
                        {status.text}
                      </span>
                    </div>

                    <div className="p-6">
                      <OrderTimeline status={order.status} />
                      <h4 className="font-semibold text-gray-800 mt-8 mb-4 text-lg">
                        Order Summary
                      </h4>
                      <ul className="space-y-4">
                        {order.items.map((item, index) => (
                          <li
                            key={item._id || index}
                            className="flex items-center space-x-4"
                          >
                            <img
                              src={item.image || "/placeholder.png"}
                              alt={item.title}
                              className="rounded-xs object-cover w-20 h-20 border-2 border-gray-100"
                            />
                            <div className="flex-grow">
                              <p className="font-semibold text-gray-900">
                                {item.title}
                              </p>
                              <p className="text-sm text-gray-600">
                                {item.quantity} x {formatCurrency(item.price)}
                              </p>
                              {item.selectedWeight && (
                                <p className="text-xs text-gray-500 mt-1 bg-gray-100 px-2 py-0.5 rounded-full inline-block">
                                  {item.selectedWeight}
                                </p>
                              )}
                            </div>
                            <p className="font-semibold text-gray-800 text-lg">
                              {formatCurrency(item.price * item.quantity)}
                            </p>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-gray-50 p-6 border-t border-gray-200 flex flex-col md:flex-row justify-end items-center gap-4">
                      {/* --- MODIFIED: Invoice button only shows if order is delivered --- */}
                      {order.status?.toLowerCase() === "delivered" && (
                        <button
                          onClick={() => downloadInvoice(order)}
                          disabled={
                            isDownloading && orderToInvoice?._id === order._id
                          }
                          className="w-full md:w-auto flex items-center justify-center gap-2 bg-gray-600 text-white font-semibold py-2 px-4 rounded-xs hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:bg-gray-400 disabled:cursor-wait transition-all duration-300 shadow-sm"
                        >
                          <FaDownload />
                          {isDownloading && orderToInvoice?._id === order._id
                            ? "Downloading..."
                            : "Download Invoice"}
                        </button>
                      )}

                      <div className="text-right flex-grow md:flex-grow-0">
                        <span className="text-gray-600 font-medium text-lg">
                          Order Total:
                        </span>
                        <span className="text-2xl font-bold text-gray-900 ml-2">
                          {formatCurrency(order.total)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </>
  );
};

export default TrackOrderPage;
