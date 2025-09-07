// components/OrdersTable.jsx
"use client"; // This is a client component

import { useState, useEffect, useMemo, Fragment } from "react";
import Image from "next/image";

// --- Constants for specific categories ---
// These categories will have a "Download Photo" button if an image was uploaded.
const PHOTO_CAKE_CATEGORIES = [
  "photo print cake",
  "fondant cake",
  "customized cake",
];

// --- Helper Components ---

// Pagination Component
const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage,
  onItemsPerPageChange,
  totalItems,
}) => {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="flex items-center justify-between px-6 py-3 bg-white border-t">
      <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-700">Rows per page:</span>
        <select
          value={itemsPerPage}
          onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
          className="p-1 border rounded-xs text-sm"
        >
          {[10, 25, 50, 100].map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
        <span className="text-sm text-gray-500">
          Showing {startItem}-{endItem} of {totalItems}
        </span>
      </div>
      <div className="flex items-center space-x-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1 text-sm border rounded-xs disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <span className="text-sm text-gray-700">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-1 text-sm border rounded-xs disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );
};

// --- Custom Hooks ---
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}

// --- Main Table Component ---
const OrdersTable = () => {
  // Data and Loading State
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // UI Interaction State
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState({});

  // Filtering and Pagination State
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // --- Helper Functions ---
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const getRowColorByStatus = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "bg-yellow-50 hover:bg-yellow-100";
      case "processing":
        return "bg-blue-50 hover:bg-blue-100";
      case "delivered":
        return "bg-green-50 hover:bg-green-100";
      case "cancelled":
        return "bg-red-50 hover:bg-red-100";
      default:
        return "bg-white hover:bg-gray-50";
    }
  };

  const handleDownload = async (imageUrl, orderId, itemTitle) => {
    try {
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`);
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");

      const fileExtension = blob.type.split("/")[1] || "jpg";
      const cleanTitle = itemTitle.replace(/\s+/g, "_");
      const filename = `order_${orderId.slice(
        -6
      )}_${cleanTitle}.${fileExtension}`;

      a.style.display = "none";
      a.href = url;
      a.download = filename;

      document.body.appendChild(a);
      a.click();

      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error("Download failed:", err);
      // Fallback: open in new tab if fetch fails (e.g., CORS issue)
      window.open(imageUrl, "_blank");
      alert(
        "Could not download the file automatically. It will open in a new tab for you to save manually."
      );
    }
  };

  // --- Data Fetching ---
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          "https://callabackend.vercel.app/api/orders"
        );
        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        setOrders(
          data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        );
      } catch (e) {
        setError(e.message);
        console.error("Failed to fetch orders:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  // --- Memoized Filtering and Pagination Logic ---
  const filteredOrders = useMemo(() => {
    if (!debouncedSearchTerm) return orders;
    return orders.filter(
      (order) =>
        order.customer.name
          .toLowerCase()
          .includes(debouncedSearchTerm.toLowerCase()) ||
        order.customer.phone?.includes(debouncedSearchTerm)
    );
  }, [orders, debouncedSearchTerm]);

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const currentTableData = useMemo(() => {
    const firstPageIndex = (currentPage - 1) * itemsPerPage;
    const lastPageIndex = firstPageIndex + itemsPerPage;
    return filteredOrders.slice(firstPageIndex, lastPageIndex);
  }, [currentPage, filteredOrders, itemsPerPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm]);

  // --- Event Handlers ---
  const toggleExpand = (orderId) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  const handleStatusChange = async (orderId, field, value) => {
    setUpdatingStatus((prev) => ({ ...prev, [orderId]: true }));
    try {
      let endpoint = `https://callabackend.vercel.app/api/orders/${orderId}`;
      if (field === "status") {
        endpoint = `https://callabackend.vercel.app/api/orders/${orderId}/status`;
      }

      const response = await fetch(endpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value }),
      });

      if (!response.ok) throw new Error("Failed to update status.");

      const updatedOrder = await response.json();

      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === orderId ? { ...order, ...updatedOrder } : order
        )
      );
    } catch (err) {
      console.error("Update failed:", err);
      alert("Failed to update order status. Please try again.");
    } finally {
      setUpdatingStatus((prev) => ({ ...prev, [orderId]: false }));
    }
  };

  // NEW: Handler for deleting an order
  const handleDeleteOrder = async (orderId) => {
    // Confirmation dialog before deleting
    if (
      !window.confirm(
        "Are you sure you want to delete this order? This action cannot be undone."
      )
    ) {
      return;
    }

    setUpdatingStatus((prev) => ({ ...prev, [orderId]: true }));
    try {
      const response = await fetch(
        `https://callabackend.vercel.app/api/orders/${orderId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete the order.");
      }

      // Remove the order from the local state to update the UI
      setOrders((prevOrders) =>
        prevOrders.filter((order) => order._id !== orderId)
      );

      alert("Order deleted successfully."); // Optional: show success message
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete the order. Please try again.");
    } finally {
      setUpdatingStatus((prev) => ({ ...prev, [orderId]: false }));
    }
  };

  // --- Render Logic ---
  if (loading) return <div className="text-center p-8">Loading orders...</div>;
  if (error)
    return (
      <div className="text-center p-8 text-red-600">
        Error fetching orders: {error}
      </div>
    );

  return (
    <div className="bg-gray-100 p-4 sm:p-6 lg:p-8 font-sans">
      <div className="max-w-8xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          Order Management
        </h1>

        <div className="mb-4">
          <input
            type="text"
            placeholder="Search by customer name or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-1/3 p-2 border border-gray-300 rounded-xs shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        {filteredOrders.length === 0 ? (
          <div className="text-center p-8 bg-white rounded-lg shadow-md">
            No orders found.
          </div>
        ) : (
          <div className="overflow-x-auto bg-white rounded-lg shadow-md">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Order ID
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Customer
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Date
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Total
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Order Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Payment
                  </th>
                  {/* MODIFIED: Changed sr-only to a visible "Actions" header */}
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentTableData.map((order) => (
                  <Fragment key={order._id}>
                    <tr
                      className={`relative transition-colors duration-200 ${getRowColorByStatus(
                        order.status
                      )}`}
                    >
                      {updatingStatus[order._id] && (
                        <td
                          colSpan="7"
                          className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center z-10"
                        >
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                        </td>
                      )}
                      <td
                        className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-600"
                        title={order._id}
                      >
                        ...{order._id.substring(order._id.length - 8)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {order.customer.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {order.customer.phone}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">
                        {formatCurrency(order.total)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <select
                          value={order.status}
                          onChange={(e) =>
                            handleStatusChange(
                              order._id,
                              "status",
                              e.target.value
                            )
                          }
                          disabled={updatingStatus[order._id]}
                          className="p-1 border rounded-xs text-xs w-full"
                        >
                          <option>Pending</option>
                          <option>Processing</option>
                          <option>Delivered</option>
                          <option>Cancelled</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <select
                          value={order.payment.status}
                          onChange={(e) =>
                            handleStatusChange(
                              order._id,
                              "payment.status",
                              e.target.value
                            )
                          }
                          disabled={updatingStatus[order._id]}
                          className="p-1 border rounded-xs text-xs w-full"
                        >
                          <option>Pending</option>
                          <option>Paid</option>
                          <option>Failed</option>
                        </select>
                        <div className="text-xs text-gray-400 mt-1">
                          {order.payment.method}
                        </div>
                      </td>
                      {/* MODIFIED: Added a flex container for multiple action buttons */}
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-4">
                          <button
                            onClick={() => toggleExpand(order._id)}
                            className="text-white font-bold hover:bg-green-600 cursor-pointer px-4 py-2 bg-blue-900"
                            disabled={updatingStatus[order._id]}
                          >
                            {expandedOrderId === order._id
                              ? "Hide"
                              : "View Details"}
                          </button>
                          {/* NEW: Delete button */}
                          <button
                            onClick={() => handleDeleteOrder(order._id)}
                            className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={updatingStatus[order._id]}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                    {/* Expanded Row Content */}
                    {expandedOrderId === order._id && (
                      <tr className="bg-gray-50">
                        <td colSpan="7" className="px-6 py-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Customer Details */}
                            <div>
                              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                Customer Details
                              </h3>
                              <p>
                                <strong>Email:</strong>{" "}
                                {order.customer.email || "N/A"}
                              </p>
                              <p>
                                <strong>Address:</strong>{" "}
                                {order.customer.address}
                              </p>
                              {order.customer.note && (
                                <p>
                                  <strong>Note:</strong> {order.customer.note}
                                </p>
                              )}
                            </div>
                            {/* Items Details */}
                            <div>
                              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                Items ({order.itemCount})
                              </h3>
                              <ul className="space-y-4">
                                {order.items.map((item, index) => {
                                  const itemCategory =
                                    item.category?.toLowerCase() || "";
                                  const uploadedImageUrl =
                                    item.details?.imageUrl;
                                  const canBeDownloaded =
                                    PHOTO_CAKE_CATEGORIES.includes(
                                      itemCategory
                                    ) && uploadedImageUrl;
                                  const productImage =
                                    item.image || "/placeholder.png";

                                  return (
                                    <li
                                      key={item._id || index}
                                      className="flex items-start space-x-4"
                                    >
                                      <div className="flex-shrink-0">
                                        <Image
                                          src={productImage}
                                          alt={item.title}
                                          width={64}
                                          height={64}
                                          className="rounded-xs object-cover w-16 h-16"
                                        />
                                      </div>
                                      <div className="flex-grow">
                                        <p className="font-semibold text-gray-900">
                                          {item.title}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                          {item.quantity} x{" "}
                                          {formatCurrency(item.price)}
                                        </p>
                                        {item.selectedWeight && (
                                          <p className="text-xs text-gray-500">
                                            Weight: {item.selectedWeight}
                                          </p>
                                        )}
                                        {item.details?.flavour && (
                                          <p className="text-xs text-gray-500">
                                            Flavour: {item.details.flavour}
                                          </p>
                                        )}
                                      </div>
                                      <div className="flex-shrink-0">
                                        <Image
                                          src={
                                            uploadedImageUrl ||
                                            "/assets/logo/calalogo.png"
                                          }
                                          alt={item.title}
                                          width={64}
                                          height={64}
                                          className="rounded-xs object-cover w-16 h-16"
                                        />
                                      </div>
                                      {canBeDownloaded && (
                                        <button
                                          onClick={() =>
                                            handleDownload(
                                              uploadedImageUrl,
                                              order._id,
                                              item.title
                                            )
                                          }
                                          className="ml-4 px-3 py-1 text-xs font-medium text-white bg-indigo-600 rounded-xs hover:bg-indigo-700 self-center"
                                        >
                                          Download Photo
                                        </button>
                                      )}
                                    </li>
                                  );
                                })}
                              </ul>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              itemsPerPage={itemsPerPage}
              onItemsPerPageChange={(value) => {
                setItemsPerPage(value);
                setCurrentPage(1);
              }}
              totalItems={filteredOrders.length}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersTable;
