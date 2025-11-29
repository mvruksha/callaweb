"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import {
  FiSearch,
  FiFilter,
  FiChevronDown,
  FiChevronUp,
  FiDownload,
  FiTrash2,
  FiUser,
  FiMapPin,
  FiPhone,
  FiBox,
  IoMdCloseCircle,
} from "react-icons/fi";
import { IoMdCheckmarkCircle, IoMdTime, IoMdClose } from "react-icons/io";

// --- HELPERS ---

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleString("en-IN", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount || 0);
};

const getStatusBadge = (status) => {
  const styles = {
    pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
    processing: "bg-blue-100 text-blue-700 border-blue-200",
    shipped: "bg-purple-100 text-purple-700 border-purple-200",
    delivered: "bg-green-100 text-green-700 border-green-200",
    cancelled: "bg-red-100 text-red-700 border-red-200",
  };

  const icons = {
    pending: <IoMdTime />,
    processing: <FiBox />,
    delivered: <IoMdCheckmarkCircle />,
    cancelled: <IoMdClose />, // Fixed icon import
  };

  const s = status?.toLowerCase() || "pending";

  return (
    <span
      className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${
        styles[s] || styles.pending
      }`}
    >
      {icons[s] || <IoMdTime />} {status}
    </span>
  );
};

// --- COMPONENT ---

const OrdersTable = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filtering & Pagination
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [expandedId, setExpandedId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Loading States for Actions
  const [processingId, setProcessingId] = useState(null);

  // --- 1. DATA FETCHING ---
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const res = await fetch("https://callabackend.vercel.app/api/orders");
        if (!res.ok) throw new Error("Failed to fetch orders");
        const data = await res.json();
        // Sort by Newest First
        setOrders(
          data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        );
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  // --- 2. LOGIC: DOWNLOAD IMAGE ---
  const handleDownload = async (imageUrl, orderId, itemTitle) => {
    try {
      const res = await fetch(imageUrl);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ORDER_${orderId.slice(-6)}_${itemTitle.replace(
        /\s/g,
        "_"
      )}.jpg`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (err) {
      window.open(imageUrl, "_blank"); // Fallback
    }
  };

  // --- 3. LOGIC: UPDATE STATUS ---
  const handleStatusUpdate = async (id, type, value) => {
    setProcessingId(id);
    try {
      const endpoint =
        type === "status"
          ? `https://callabackend.vercel.app/api/orders/${id}/status`
          : `https://callabackend.vercel.app/api/orders/${id}`; // Assuming generic update endpoint exists for payment

      const payload =
        type === "status" ? { status: value } : { payment: { status: value } };

      // Optimistic Update
      setOrders((prev) =>
        prev.map((o) => {
          if (o._id === id) {
            if (type === "status") return { ...o, status: value };
            if (type === "payment")
              return { ...o, payment: { ...o.payment, status: value } };
          }
          return o;
        })
      );

      await fetch(endpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch (err) {
      console.error("Update failed", err);
      alert("Failed to update status");
    } finally {
      setProcessingId(null);
    }
  };

  // --- 4. LOGIC: DELETE ORDER ---
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure? This cannot be undone.")) return;
    setProcessingId(id);
    try {
      await fetch(`https://callabackend.vercel.app/api/orders/${id}`, {
        method: "DELETE",
      });
      setOrders((prev) => prev.filter((o) => o._id !== id));
    } catch (err) {
      alert("Delete failed");
    } finally {
      setProcessingId(null);
    }
  };

  // --- 5. FILTERING ---
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesSearch =
        order._id.toLowerCase().includes(search.toLowerCase()) ||
        order.customer.name.toLowerCase().includes(search.toLowerCase()) ||
        order.customer.phone.includes(search);

      const matchesStatus =
        statusFilter === "all" || order.status.toLowerCase() === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [orders, search, statusFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const currentData = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (loading)
    return (
      <div className="p-10 text-center text-gray-500 animate-pulse">
        Loading Dashboard...
      </div>
    );
  if (error)
    return <div className="p-10 text-center text-red-500">Error: {error}</div>;

  return (
    <div className="bg-gray-50 min-h-screen p-4 sm:p-8 font-sans text-gray-800">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
              Order Management
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage and track all customer orders
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            {/* Search */}
            <div className="relative group">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-600" />
              <input
                type="text"
                placeholder="Search ID, Name, Phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 pr-4 py-2.5 w-full sm:w-64 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm outline-none transition-all"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <FiFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-10 pr-8 py-2.5 w-full sm:w-40 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 shadow-sm appearance-none cursor-pointer outline-none"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* TABLE CARD */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 text-xs font-bold text-gray-500 uppercase border-b border-gray-100">
                  <th className="px-6 py-4">Order ID</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {currentData.map((order) => (
                  <React.Fragment key={order._id}>
                    {/* MAIN ROW */}
                    <tr
                      className={`hover:bg-purple-50/30 transition-colors cursor-pointer ${
                        expandedId === order._id ? "bg-purple-50/50" : ""
                      }`}
                      onClick={() =>
                        setExpandedId(
                          expandedId === order._id ? null : order._id
                        )
                      }
                    >
                      <td className="px-6 py-4 font-mono text-xs text-gray-500">
                        #{order._id.slice(-6).toUpperCase()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-900 text-sm">
                            {order.customer.name}
                          </span>
                          <span className="text-xs text-gray-500">
                            {order.customer.phone}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(order.status)}
                      </td>
                      <td className="px-6 py-4 font-bold text-gray-900">
                        {formatCurrency(
                          order.totals?.grandTotal || order.total
                        )}
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-500">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="p-2 hover:bg-gray-100 rounded-full transition text-gray-400">
                          {expandedId === order._id ? (
                            <FiChevronUp />
                          ) : (
                            <FiChevronDown />
                          )}
                        </button>
                      </td>
                    </tr>

                    {/* EXPANDED DETAILS PANEL */}
                    {expandedId === order._id && (
                      <tr className="bg-gray-50/50">
                        <td colSpan="6" className="p-6">
                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-slide-down">
                            {/* 1. CUSTOMER INFO */}
                            <div className="space-y-4">
                              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                <FiUser /> Delivery Details
                              </h3>
                              <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm text-sm space-y-3">
                                <div className="flex items-start gap-3">
                                  <FiUser className="mt-1 text-gray-400" />
                                  <div>
                                    <p className="font-semibold text-gray-800">
                                      {order.customer.name}
                                    </p>
                                    <p className="text-gray-500">
                                      {order.customer.email}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-start gap-3">
                                  <FiPhone className="mt-1 text-gray-400" />
                                  <p className="text-gray-600">
                                    {order.customer.phone}
                                  </p>
                                </div>
                                <div className="flex items-start gap-3">
                                  <FiMapPin className="mt-1 text-gray-400" />
                                  <div>
                                    <p className="text-gray-600 leading-relaxed">
                                      {order.customer.address},{" "}
                                      {order.customer.city} -{" "}
                                      {order.customer.pincode}
                                    </p>
                                  </div>
                                </div>
                                {order.customer.note && (
                                  <div className="mt-2 pt-2 border-t border-gray-100 text-xs text-amber-600 font-medium bg-amber-50 p-2 rounded">
                                    📝 Note: "{order.customer.note}"
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* 2. ORDER ITEMS (COMPLEX DATA) */}
                            <div className="lg:col-span-2 space-y-4">
                              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                <FiBox /> Items Ordered
                              </h3>
                              <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
                                {order.items.map((item, idx) => (
                                  <div
                                    key={idx}
                                    className="flex flex-col sm:flex-row gap-4 p-4 border-b border-gray-100 last:border-0 items-start sm:items-center"
                                  >
                                    {/* Item Image */}
                                    <div className="relative w-16 h-16 bg-gray-100 rounded-md overflow-hidden shrink-0">
                                      <Image
                                        src={item.image || "/placeholder.png"}
                                        alt={item.title}
                                        fill
                                        className="object-cover"
                                      />
                                    </div>

                                    {/* Item Details */}
                                    <div className="flex-1">
                                      <h4 className="font-bold text-gray-900 text-sm">
                                        {item.title}
                                      </h4>
                                      <div className="flex flex-wrap gap-2 mt-1">
                                        <span className="text-[10px] font-semibold bg-purple-50 text-purple-700 px-2 py-0.5 rounded border border-purple-100">
                                          {item.selectedWeight}
                                        </span>
                                        <span className="text-[10px] font-semibold bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-100">
                                          {item.selectedFlavor}
                                        </span>
                                        {/* Print Size Tag if exists */}
                                        {item.customization?.size && (
                                          <span className="text-[10px] font-semibold bg-orange-50 text-orange-700 px-2 py-0.5 rounded border border-orange-100">
                                            Size:{" "}
                                            {item.customization.size.toUpperCase()}
                                          </span>
                                        )}
                                      </div>
                                    </div>

                                    {/* Price & Qty */}
                                    <div className="text-right">
                                      <p className="font-bold text-gray-900">
                                        {formatCurrency(
                                          item.price * item.quantity
                                        )}
                                      </p>
                                      <p className="text-xs text-gray-500">
                                        {item.quantity} x{" "}
                                        {formatCurrency(item.price)}
                                      </p>
                                    </div>

                                    {/* Download Action for Photo Cakes */}
                                    {item.customization?.imageUrl && (
                                      <button
                                        onClick={() =>
                                          handleDownload(
                                            item.customization.imageUrl,
                                            order._id,
                                            item.title
                                          )
                                        }
                                        className="sm:ml-4 flex items-center gap-2 text-xs font-bold text-white bg-gray-800 hover:bg-black px-3 py-2 rounded-md transition-colors shadow-sm"
                                      >
                                        <FiDownload /> Asset
                                      </button>
                                    )}
                                  </div>
                                ))}

                                {/* Financial Summary */}
                                <div className="bg-gray-50 p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                  <div className="space-y-1 text-xs text-gray-500">
                                    <p>
                                      Subtotal:{" "}
                                      <span className="font-medium text-gray-800">
                                        {formatCurrency(order.totals?.subtotal)}
                                      </span>
                                    </p>
                                    {order.totals?.extraCharges > 0 && (
                                      <p>
                                        Customization:{" "}
                                        <span className="font-medium text-gray-800">
                                          +
                                          {formatCurrency(
                                            order.totals?.extraCharges
                                          )}
                                        </span>
                                      </p>
                                    )}
                                  </div>
                                  <div className="text-right">
                                    <p className="text-xs text-gray-500 uppercase font-bold">
                                      Grand Total
                                    </p>
                                    <p className="text-xl font-extrabold text-purple-700">
                                      {formatCurrency(
                                        order.totals?.grandTotal || order.total
                                      )}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              {/* 3. ADMIN CONTROLS */}
                              <div className="flex flex-wrap gap-4 pt-2">
                                {/* Status Control */}
                                <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-gray-200 shadow-sm">
                                  <span className="text-xs font-bold text-gray-500 uppercase px-2">
                                    Update Status:
                                  </span>
                                  <select
                                    value={order.status}
                                    onChange={(e) =>
                                      handleStatusUpdate(
                                        order._id,
                                        "status",
                                        e.target.value
                                      )
                                    }
                                    disabled={processingId === order._id}
                                    className="text-sm font-semibold bg-transparent outline-none cursor-pointer text-gray-800"
                                  >
                                    <option value="pending">Pending</option>
                                    <option value="processing">
                                      Processing
                                    </option>
                                    <option value="shipped">Shipped</option>
                                    <option value="delivered">Delivered</option>
                                    <option value="cancelled">Cancelled</option>
                                  </select>
                                </div>

                                {/* Payment Control */}
                                <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-gray-200 shadow-sm">
                                  <span className="text-xs font-bold text-gray-500 uppercase px-2">
                                    Payment:
                                  </span>
                                  <select
                                    value={order.payment?.status || "Pending"}
                                    onChange={(e) =>
                                      handleStatusUpdate(
                                        order._id,
                                        "payment",
                                        e.target.value
                                      )
                                    }
                                    disabled={processingId === order._id}
                                    className={`text-sm font-bold bg-transparent outline-none cursor-pointer ${
                                      order.payment?.status === "Paid"
                                        ? "text-green-600"
                                        : "text-orange-500"
                                    }`}
                                  >
                                    <option value="Pending">Pending</option>
                                    <option value="Paid">Paid</option>
                                    <option value="Failed">Failed</option>
                                  </select>
                                </div>

                                {/* Delete Button */}
                                <button
                                  onClick={() => handleDelete(order._id)}
                                  disabled={processingId === order._id}
                                  className="ml-auto flex items-center gap-2 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-lg transition-colors"
                                >
                                  <FiTrash2 /> Delete Order
                                </button>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
            <span className="text-xs text-gray-500 font-medium">
              Showing page {currentPage} of {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 text-xs font-bold border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-xs font-bold border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrdersTable;
