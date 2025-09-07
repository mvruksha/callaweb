"use client";

import { useState, useEffect, useMemo } from "react";
import { Search, ChevronDown, ChevronUp, Edit, Trash2, X } from "lucide-react";

// A custom hook for debouncing input to improve search performance.
// This prevents the filter logic from running on every single keystroke.
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
};

// --- Edit Cake Modal Component ---
// This modal handles the form for updating a cake's details.
const EditCakeModal = ({ cake, onClose, onSave }) => {
  const [formData, setFormData] = useState(null);
  const [status, setStatus] = useState({ loading: false, error: null });

  const availableWeights = useMemo(
    () => ["1/2 Kg", "1 Kg", "2 Kg", "4 Kg"],
    []
  );

  // Effect to initialize or reset the form data when a cake is selected for editing.
  // It ensures that price objects exist for all possible weights, preventing errors.
  useEffect(() => {
    if (cake) {
      const initialPrices = {};
      for (const weight of availableWeights) {
        initialPrices[weight] = cake.prices[weight] || {
          originalPrice: "",
          discountedPrice: "",
        };
      }
      setFormData({ ...cake, prices: initialPrices });
    }
  }, [cake, availableWeights]);

  // Effect to automatically calculate the discounted price whenever the overall
  // discount or any original price is changed. The specific dependency array
  // prevents infinite re-render loops.
  useEffect(() => {
    if (!formData) return;

    const newPrices = { ...formData.prices };
    const discount = parseFloat(formData.discount) || 0;
    let hasChanged = false;

    for (const weight in newPrices) {
      const originalPrice = parseFloat(newPrices[weight].originalPrice) || 0;
      let newDiscountedPrice;

      if (originalPrice > 0 && discount >= 0 && discount <= 100) {
        newDiscountedPrice = Math.round(
          originalPrice - (originalPrice * discount) / 100
        );
      } else {
        // If no valid price/discount, fallback to the original price or empty string.
        newDiscountedPrice = newPrices[weight].originalPrice || "";
      }

      if (
        String(newPrices[weight].discountedPrice) !== String(newDiscountedPrice)
      ) {
        newPrices[weight].discountedPrice = newDiscountedPrice;
        hasChanged = true;
      }
    }

    // Only update state if a value has actually changed to avoid unnecessary re-renders.
    if (hasChanged) {
      setFormData((prev) => ({ ...prev, prices: newPrices }));
    }
  }, [
    formData?.discount,
    formData?.prices["1/2 Kg"].originalPrice,
    formData?.prices["1 Kg"].originalPrice,
    formData?.prices["2 Kg"].originalPrice,
    formData?.prices["4 Kg"].originalPrice,
    formData, // Add formData to re-evaluate when price object itself is replaced
  ]);

  // Generic handler for simple form inputs.
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handler for nested price inputs.
  const handlePriceChange = (e, weight) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      prices: {
        ...prev.prices,
        [weight]: { ...prev.prices[weight], [name]: value },
      },
    }));
  };

  // Handler for the weight availability checkboxes.
  const handleWeightCheckbox = (e) => {
    const { value, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      weights: checked
        ? [...prev.weights, value]
        : prev.weights.filter((w) => w !== value),
    }));
  };

  // Handles form submission, data cleaning, and calling the onSave prop.
  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, error: null });

    // Prepare a clean data object for submission.
    // This removes inactive weights and ensures all numbers are parsed correctly.
    const submissionData = {
      ...formData,
      discount: parseFloat(formData.discount) || 0,
      prices: Object.keys(formData.prices)
        .filter((w) => formData.weights.includes(w))
        .reduce((obj, key) => {
          const op = parseFloat(formData.prices[key].originalPrice);
          if (op > 0) {
            obj[key] = {
              originalPrice: op,
              discountedPrice:
                parseFloat(formData.prices[key].discountedPrice) || op,
            };
          }
          return obj;
        }, {}),
    };

    try {
      await onSave(cake._id, submissionData);
    } catch (error) {
      setStatus({
        loading: false,
        error: error.message || "Failed to save changes.",
      });
    }
    // No finally block needed here, as success is handled by the parent.
  };

  // Don't render anything until the form data is initialized.
  if (!formData) return null;

  return (
    <div className="fixed inset-0 bg-white bg-opacity-10 z-50 flex justify-center items-center p-4 transition-opacity duration-300">
      <div
        className="bg-white rounded-xs shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()} // Prevent modal close on inner click
      >
        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          <div className="flex justify-between items-center border-b pb-3">
            <h2 className="text-2xl font-bold text-gray-800">Edit Cake</h2>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-full text-gray-500 hover:bg-gray-200 hover:text-gray-800"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <fieldset className="space-y-4">
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700"
              >
                Title
              </label>
              <input
                type="text"
                name="title"
                id="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-xs shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700"
              >
                Description
              </label>
              <textarea
                name="description"
                id="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                className="mt-1 block w-full border border-gray-300 rounded-xs shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
              ></textarea>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="category"
                  className="block text-sm font-medium text-gray-700"
                >
                  Category
                </label>
                <input
                  type="text"
                  name="category"
                  id="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-xs shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label
                  htmlFor="image"
                  className="block text-sm font-medium text-gray-700"
                >
                  Image URL
                </label>
                <input
                  type="url"
                  name="image"
                  id="image"
                  value={formData.image}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-xs shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
          </fieldset>

          <fieldset className="space-y-4">
            <legend className="text-lg font-semibold text-gray-700 border-b w-full pb-2">
              Pricing & Weights
            </legend>
            <div>
              <label
                htmlFor="discount"
                className="block text-sm font-medium text-gray-700"
              >
                Overall Discount (%)
              </label>
              <input
                type="number"
                name="discount"
                id="discount"
                value={formData.discount}
                onChange={handleChange}
                min="0"
                max="100"
                step="any"
                className="mt-1 block w-full md:w-1/2 border border-gray-300 rounded-xs shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div className="space-y-4">
              {availableWeights.map((weight) => (
                <div
                  key={weight}
                  className="grid grid-cols-1 md:grid-cols-4 items-center gap-4 p-3 bg-gray-50 rounded-xs border"
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id={`weight-${weight}`}
                      value={weight}
                      checked={formData.weights.includes(weight)}
                      onChange={handleWeightCheckbox}
                      className="h-5 w-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <label
                      htmlFor={`weight-${weight}`}
                      className="font-semibold text-gray-800"
                    >
                      {weight}
                    </label>
                  </div>
                  <div className="col-span-3 grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-500">
                        Original Price (₹)
                      </label>
                      <input
                        type="number"
                        name="originalPrice"
                        value={formData.prices[weight]?.originalPrice || ""}
                        onChange={(e) => handlePriceChange(e, weight)}
                        disabled={!formData.weights.includes(weight)}
                        min="0"
                        className="mt-1 block w-full border border-gray-300 p-2 rounded-xs disabled:bg-gray-200 disabled:cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500">
                        Discounted Price (₹)
                      </label>
                      <input
                        type="number"
                        name="discountedPrice"
                        value={formData.prices[weight]?.discountedPrice || ""}
                        readOnly
                        className="mt-1 block w-full border border-gray-300 p-2 rounded-xs bg-gray-100 cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </fieldset>

          <div className="flex justify-end gap-4 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="py-2 px-6 border border-gray-300 rounded-xs shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={status.loading}
              className="py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-xs text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-wait focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {status.loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
          {status.error && (
            <p className="text-red-600 text-sm mt-2 text-center bg-red-50 p-3 rounded-xs">
              {status.error}
            </p>
          )}
        </form>
      </div>
    </div>
  );
};

// --- Main Cakes Table Component ---
// This component displays all cakes and handles filtering, sorting, and pagination.
const CakesTable = () => {
  // Data and status state
  const [allCakes, setAllCakes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCake, setEditingCake] = useState(null);

  // UI control state
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [sortConfig, setSortConfig] = useState({
    key: "title",
    direction: "ascending",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Debounce search term to avoid performance issues
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Fetch initial data
  useEffect(() => {
    const fetchCakes = async () => {
      try {
        setLoading(true);
        const res = await fetch("https://callabackend.vercel.app/api/cakes");
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        setAllCakes(data);
      } catch (err) {
        setError(err.message || "Failed to fetch cakes.");
      } finally {
        setLoading(false);
      }
    };
    fetchCakes();
  }, []);

  // *** FIX IS HERE ***
  // When filters change, we must reset the pagination to the first page
  // to avoid viewing a non-existent page of the filtered results.
  useEffect(() => {
    setCurrentPage(1);
  }, [filterCategory, debouncedSearchTerm]);

  // Memoize unique categories to prevent recalculation on every render.
  const uniqueCategories = useMemo(
    () => ["All", ...new Set(allCakes.map((cake) => cake.category))],
    [allCakes]
  );

  // Memoize the filtering and sorting logic. This is the core data processing pipeline.
  const filteredAndSortedCakes = useMemo(() => {
    let processableCakes = [...allCakes];

    // 1. Filter by category
    if (filterCategory !== "All") {
      processableCakes = processableCakes.filter(
        (c) => c.category === filterCategory
      );
    }

    // 2. Filter by search term (debounced)
    if (debouncedSearchTerm) {
      processableCakes = processableCakes.filter((c) =>
        c.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
      );
    }

    // 3. Sort the results
    if (sortConfig.key) {
      processableCakes.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "ascending" ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "ascending" ? 1 : -1;
        }
        return 0;
      });
    }

    return processableCakes;
  }, [allCakes, filterCategory, debouncedSearchTerm, sortConfig]);

  // Memoize the paginated result to prevent slicing on every render.
  const paginatedCakes = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedCakes.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedCakes, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredAndSortedCakes.length / itemsPerPage);

  // Handler to change the sort configuration.
  const requestSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  // --- Modal and Data Update Handlers ---
  const handleEditClick = (cake) => {
    setEditingCake(cake);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCake(null);
  };

  const handleUpdateCake = async (id, updatedData) => {
    try {
      const response = await fetch(
        `https://callabackend.vercel.app/api/cakes/${id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedData),
        }
      );
      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Update failed on the server.");
      }
      const savedCake = await response.json();

      // Update the cake in the main list for immediate UI feedback.
      setAllCakes(allCakes.map((c) => (c._id === id ? savedCake : c)));
      alert("Cake updated successfully!");
      handleCloseModal();
    } catch (error) {
      // Re-throw the error to be caught by the modal's handleSubmit
      throw error;
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this cake?")) return;
    try {
      const res = await fetch(
        `https://callabackend.vercel.app/api/cakes/${id}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error("Failed to delete the cake.");
      setAllCakes(allCakes.filter((cake) => cake._id !== id));
      alert("Cake deleted successfully!");
    } catch (err) {
      alert(err.message);
    }
  };

  // Sub-component for table headers to keep JSX clean.
  const SortableHeader = ({ children, name }) => (
    <th
      scope="col"
      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
      onClick={() => requestSort(name)}
    >
      <div className="flex items-center">
        {children}
        <span className="ml-1 w-4 h-4">
          {sortConfig.key === name &&
            (sortConfig.direction === "ascending" ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            ))}
        </span>
      </div>
    </th>
  );

  if (loading)
    return (
      <div className="text-center py-10 font-semibold text-lg">
        Loading Cakes...
      </div>
    );
  if (error)
    return (
      <div className="text-center py-10 text-red-600 bg-red-50 p-4 rounded-xs">
        {error}
      </div>
    );

  return (
    <>
      <div className="bg-white rounded-xs shadow-md p-4">
        <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
          <div className="relative w-full md:w-1/3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xs focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div className="w-full md:w-auto">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full md:w-48 px-4 py-2 border border-gray-300 rounded-xs focus:ring-indigo-500 focus:border-indigo-500"
            >
              {uniqueCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Image
                </th>
                <SortableHeader name="title">Title</SortableHeader>
                <SortableHeader name="category">Category</SortableHeader>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Prices
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedCakes.length > 0 ? (
                paginatedCakes.map((cake) => (
                  <tr key={cake._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <img
                        src={cake.image}
                        alt={cake.title}
                        className="w-16 h-16 object-cover rounded-xs"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold text-gray-900">
                        {cake.title}
                      </div>
                      <div className="text-xs text-gray-500 max-w-xs truncate">
                        {cake.description}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-xs bg-pink-500 text-white">
                        {cake.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {cake.prices &&
                        Object.entries(cake.prices).map(
                          ([weight, priceInfo]) => (
                            <div
                              key={weight}
                              className="mb-1 whitespace-nowrap"
                            >
                              <span className="font-bold">{weight}:</span>
                              {priceInfo.originalPrice !==
                              priceInfo.discountedPrice ? (
                                <span className="ml-2">
                                  <del className="text-red-500">
                                    ₹{priceInfo.originalPrice}
                                  </del>
                                  <span className="ml-1 font-bold text-gray-800">
                                    ₹{priceInfo.discountedPrice}
                                  </span>
                                </span>
                              ) : (
                                <span className="ml-2 font-bold text-gray-800">
                                  ₹{priceInfo.originalPrice}
                                </span>
                              )}
                            </div>
                          )
                        )}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium whitespace-nowrap">
                      <button
                        onClick={() => handleEditClick(cake)}
                        className="text-indigo-600 hover:text-indigo-800 inline-flex items-center"
                      >
                        <Edit className="h-4 w-4 mr-1" /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(cake._id)}
                        className="text-red-600 hover:text-red-800 ml-4 inline-flex items-center"
                      >
                        <Trash2 className="h-4 w-4 mr-1" /> Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-10 text-gray-500">
                    No cakes match your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="flex justify-between items-center mt-4">
          <span className="text-sm text-gray-700">
            Showing{" "}
            <span className="font-medium">
              {filteredAndSortedCakes.length > 0
                ? (currentPage - 1) * itemsPerPage + 1
                : 0}
            </span>{" "}
            to{" "}
            <span className="font-medium">
              {Math.min(
                currentPage * itemsPerPage,
                filteredAndSortedCakes.length
              )}
            </span>{" "}
            of{" "}
            <span className="font-medium">{filteredAndSortedCakes.length}</span>{" "}
            results
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xs hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xs hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Conditionally render the modal */}
      {isModalOpen && editingCake && (
        <EditCakeModal
          cake={editingCake}
          onClose={handleCloseModal}
          onSave={handleUpdateCake}
        />
      )}
    </>
  );
};

export default CakesTable;
