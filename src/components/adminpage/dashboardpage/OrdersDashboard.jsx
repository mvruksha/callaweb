"use client";

import { useState, useEffect, useMemo } from "react";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { format, parseISO } from "date-fns";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

// --- HELPER COMPONENTS ---

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(amount);
};

const StatCard = ({ title, value, icon }) => (
  <div className="bg-white p-6 rounded-xs shadow-md border border-gray-200 flex items-center space-x-4">
    <div className="bg-indigo-100 text-indigo-600 p-3 rounded-full">{icon}</div>
    <div>
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <p className="text-2xl font-semibold text-gray-800">{value}</p>
    </div>
  </div>
);

const ChartContainer = ({ title, children }) => (
  <div className="bg-white p-6 rounded-xs shadow-md border border-gray-200">
    <h3 className="text-lg font-semibold text-gray-700 mb-4">{title}</h3>
    <div className="h-80 relative">{children}</div>
  </div>
);

// --- PAGINATION COMPONENT ---

const Pagination = ({
  totalItems,
  itemsPerPage,
  currentPage,
  onPageChange,
}) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  if (totalPages <= 1) return null;

  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  return (
    <nav className="flex justify-center items-center mt-6">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-1 mx-1 rounded-xs bg-white border border-gray-300 disabled:opacity-50"
      >
        &laquo; Prev
      </button>
      {pageNumbers.map((number) => (
        <button
          key={number}
          onClick={() => onPageChange(number)}
          className={`px-3 py-1 mx-1 rounded-xs border ${
            currentPage === number
              ? "bg-indigo-600 text-white border-indigo-600"
              : "bg-white border-gray-300"
          }`}
        >
          {number}
        </button>
      ))}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-1 mx-1 rounded-xs bg-white border border-gray-300 disabled:opacity-50"
      >
        Next &raquo;
      </button>
    </nav>
  );
};

// --- MAIN DASHBOARD COMPONENT ---

const OrdersDashboard = () => {
  // State for raw data
  const [allOrders, setAllOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for filtering and pagination
  const [uniqueCategories, setUniqueCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const ORDERS_PER_PAGE = 10;

  // State for processed chart data
  const [processedData, setProcessedData] = useState(null);

  // 1. Fetch data only once on component mount
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch(
          "https://callabackend.vercel.app/api/orders"
        );
        if (!response.ok) throw new Error("Failed to fetch data");
        const data = await response.json();

        // Sort orders by most recent first
        const sortedData = data.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setAllOrders(sortedData);

        // Extract unique categories for the filter dropdown
        const categories = new Set();
        data.forEach((order) => {
          order.items.forEach((item) => categories.add(item.category));
        });
        setUniqueCategories(["all", ...Array.from(categories)]);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  // 2. Memoize filtered orders to avoid re-calculation on every render
  const filteredOrders = useMemo(() => {
    if (selectedCategory === "all") {
      return allOrders;
    }
    return allOrders.filter((order) =>
      order.items.some((item) => item.category === selectedCategory)
    );
  }, [allOrders, selectedCategory]);

  // 3. Process data for charts whenever the filtered data changes
  useEffect(() => {
    if (filteredOrders.length === 0 && allOrders.length > 0) {
      // Handle case where filter results in no orders
      setProcessedData(null); // Clear previous data
      return;
    }
    processData(filteredOrders);
  }, [filteredOrders, allOrders.length]); // Rerun when filteredOrders changes

  // 4. Function to process data for KPIs and charts
  const processData = (data) => {
    if (!data || data.length === 0) return;

    // KPIs
    const confirmedOrders = data.filter(
      (order) => order.status === "Confirmed"
    );
    const totalRevenue = confirmedOrders.reduce(
      (sum, order) => sum + order.total,
      0
    );
    const totalOrders = data.length;
    const avgOrderValue =
      confirmedOrders.length > 0 ? totalRevenue / confirmedOrders.length : 0;

    // Sales Over Time
    const salesByDay = data.reduce((acc, order) => {
      const date = format(parseISO(order.createdAt), "MMM d, yyyy");
      acc[date] = (acc[date] || 0) + order.total;
      return acc;
    }, {});
    const sortedDates = Object.keys(salesByDay).sort(
      (a, b) => new Date(a) - new Date(b)
    );
    const salesOverTime = {
      labels: sortedDates,
      datasets: [
        {
          label: "Daily Revenue",
          data: sortedDates.map((date) => salesByDay[date]),
          borderColor: "rgb(79, 70, 229)",
          backgroundColor: "rgba(79, 70, 229, 0.1)",
          fill: true,
          tension: 0.3,
        },
      ],
    };

    // Order Status
    const statusCounts = data.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {});
    const orderStatus = {
      labels: Object.keys(statusCounts),
      datasets: [
        {
          data: Object.values(statusCounts),
          backgroundColor: [
            "rgba(255, 159, 64, 0.8)",
            "rgba(75, 192, 192, 0.8)",
            "rgba(255, 99, 132, 0.8)",
            "rgba(54, 162, 235, 0.8)",
          ],
          borderColor: "#fff",
          borderWidth: 2,
        },
      ],
    };

    // Sales by Category
    const salesByCategory = data.reduce((acc, order) => {
      order.items.forEach((item) => {
        acc[item.category] =
          (acc[item.category] || 0) + item.price * item.quantity;
      });
      return acc;
    }, {});
    const sortedCategories = Object.entries(salesByCategory).sort(
      ([, a], [, b]) => b - a
    );
    const topCategories = {
      labels: sortedCategories.map((cat) => cat[0]),
      datasets: [
        {
          label: "Revenue by Category",
          data: sortedCategories.map((cat) => cat[1]),
          backgroundColor: "rgba(139, 92, 246, 0.8)",
          borderColor: "rgba(139, 92, 246, 1)",
          borderWidth: 1,
        },
      ],
    };

    setProcessedData({
      kpis: { totalRevenue, totalOrders, averageOrderValue: avgOrderValue },
      salesOverTime,
      orderStatus,
      topCategories,
    });
  };

  // Handle filter change
  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
    setCurrentPage(1); // Reset to first page on new filter
  };

  // Pagination logic
  const indexOfLastOrder = currentPage * ORDERS_PER_PAGE;
  const indexOfFirstOrder = indexOfLastOrder - ORDERS_PER_PAGE;
  const currentOrders = filteredOrders.slice(
    indexOfFirstOrder,
    indexOfLastOrder
  );

  if (loading)
    return <div className="text-center p-10">Loading Dashboard...</div>;
  if (error)
    return <div className="text-center p-10 text-red-500">Error: {error}</div>;

  return (
    <div className="bg-gray-50 p-4 sm:p-6 lg:p-8 min-h-screen">
      <div className="max-w-8xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Orders Dashboard</h1>
          {/* --- CATEGORY FILTER DROPDOWN --- */}
          <div className="mt-4 sm:mt-0">
            <label
              htmlFor="category-filter"
              className="text-sm font-medium text-gray-700 mr-2"
            >
              Filter by Category:
            </label>
            <select
              id="category-filter"
              value={selectedCategory}
              onChange={handleCategoryChange}
              className="p-2 border border-gray-300 rounded-xs shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            >
              {uniqueCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === "all" ? "All Categories" : cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {processedData ? (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <StatCard
                title="Total Revenue (Confirmed)"
                value={formatCurrency(processedData.kpis.totalRevenue)}
                icon={<span>₹</span>}
              />
              <StatCard
                title="Total Orders"
                value={processedData.kpis.totalOrders}
                icon={<span>📦</span>}
              />
              <StatCard
                title="Average Order Value"
                value={formatCurrency(processedData.kpis.averageOrderValue)}
                icon={<span>📈</span>}
              />
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <ChartContainer title="Daily Revenue">
                <Line
                  data={processedData.salesOverTime}
                  options={{ responsive: true, maintainAspectRatio: false }}
                />
              </ChartContainer>
              <ChartContainer title="Order Status">
                <Doughnut
                  data={processedData.orderStatus}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { position: "bottom" } },
                  }}
                />
              </ChartContainer>
              <div className="lg:col-span-2">
                <ChartContainer title="Revenue by Category">
                  <Bar
                    data={processedData.topCategories}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      indexAxis: "y",
                    }}
                  />
                </ChartContainer>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-16 bg-white rounded-xs shadow-md border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-600">
              No orders found for the selected category.
            </h2>
            <p className="text-gray-500 mt-2">
              Please select a different category to view data.
            </p>
          </div>
        )}

        {/* Orders Table with Pagination */}
        <div className="bg-white p-6 rounded-xs shadow-md border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Orders</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                <tr>
                  <th scope="col" className="px-6 py-3">
                    Order ID
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Customer
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Total
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentOrders.map((order) => (
                  <tr
                    key={order._id}
                    className="bg-white border-b hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                      ...{order._id.slice(-6)}
                    </td>
                    <td className="px-6 py-4">{order.customer.name}</td>
                    <td className="px-6 py-4">
                      {format(parseISO(order.createdAt), "dd MMM, yyyy")}
                    </td>
                    <td className="px-6 py-4">{formatCurrency(order.total)}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-xs ${
                          order.status === "Confirmed"
                            ? "bg-green-100 text-green-800"
                            : order.status === "Cancelled"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination
            totalItems={filteredOrders.length}
            itemsPerPage={ORDERS_PER_PAGE}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
    </div>
  );
};

export default OrdersDashboard;
