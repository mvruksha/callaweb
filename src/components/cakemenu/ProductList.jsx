"use client";

import React, { useEffect, useState, useMemo } from "react";
import Product from "./Product";
import {
  FiFilter,
  FiX,
  FiChevronDown,
  FiSearch,
  FiSliders,
} from "react-icons/fi";

// --- HELPER: Safe Category Extraction ---
const getCategoryName = (category) => {
  if (!category) return "Uncategorized";
  if (typeof category === "string") return category;
  return category.name || "Uncategorized";
};

const ProductList = () => {
  // --- STATE ---
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & Sorting
  const [categories, setCategories] = useState(["All"]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [priceRange, setPriceRange] = useState([0, 5000]); // [min, max]
  const [maxPriceLimit, setMaxPriceLimit] = useState(5000); // Dynamic max from data
  const [sortBy, setSortBy] = useState("default");

  // Mobile Sidebar State
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12; // Adjusted for grid layout

  // --- 1. FETCH DATA ---
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          "https://callabackend.vercel.app/api/cakes"
        );
        if (!response.ok) throw new Error("Failed to fetch products");

        const data = await response.json();
        const productsArray = Array.isArray(data) ? data : data.data || [];

        setProducts(productsArray);

        // Calculate Max Price dynamically for the slider
        const highestPrice = Math.max(
          ...productsArray.map((p) => {
            const price =
              p.variants?.[0]?.price?.discountedPrice || p.price || 0;
            return typeof price === "object" ? price.discountedPrice : price;
          }),
          0
        );
        const safeMax = highestPrice > 0 ? highestPrice : 5000;
        setMaxPriceLimit(safeMax);
        setPriceRange([0, safeMax]);
      } catch (err) {
        console.error("Error fetching cakes:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // --- 2. EXTRACT CATEGORIES ---
  useEffect(() => {
    if (products.length > 0) {
      const uniqueCats = new Set(
        products.map((p) => getCategoryName(p.category))
      );
      setCategories(["All", ...Array.from(uniqueCats).filter(Boolean)]);
    }
  }, [products]);

  // --- 3. HELPER: GET PRICE ---
  const getPrice = (p) => {
    // Robust price getter handling variants or flat price structure
    if (p.variants && p.variants.length > 0) {
      const vPrice = p.variants[0].price;
      return typeof vPrice === "object"
        ? vPrice.discountedPrice || vPrice.originalPrice
        : vPrice;
    }
    return typeof p.price === "object"
      ? p.price.discountedPrice || p.price.originalPrice
      : p.price || 0;
  };

  // --- 4. FILTER & SORT LOGIC ---
  const filteredProducts = useMemo(() => {
    let temp = [...products];

    // Category Filter
    if (selectedCategory !== "All") {
      temp = temp.filter(
        (p) =>
          getCategoryName(p.category).toLowerCase() ===
          selectedCategory.toLowerCase()
      );
    }

    // Price Filter
    temp = temp.filter((p) => {
      const price = getPrice(p);
      return price >= priceRange[0] && price <= priceRange[1];
    });

    // Sorting
    if (sortBy === "price-low") {
      temp.sort((a, b) => getPrice(a) - getPrice(b));
    } else if (sortBy === "price-high") {
      temp.sort((a, b) => getPrice(b) - getPrice(a));
    } else if (sortBy === "newest") {
      // Assuming _id roughly correlates to creation time if no createdAt field
      temp.reverse();
    }

    return temp;
  }, [products, selectedCategory, priceRange, sortBy]);

  // Reset pagination on filter change
  useEffect(() => {
    setCurrentPage(1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [selectedCategory, priceRange, sortBy]);

  // --- 5. PAGINATION LOGIC ---
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = filteredProducts.slice(
    startIdx,
    startIdx + itemsPerPage
  );

  // --- LOADING STATE ---
  if (loading) {
    return (
      <div className="max-w-[90rem] mx-auto px-4 py-12 flex gap-8">
        <div className="hidden lg:block w-64 space-y-4">
          <div className="h-8 bg-gray-200 rounded w-3/4 animate-pulse"></div>
          <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="flex-1 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="bg-gray-100 h-[300px] rounded-xl animate-pulse"
            ></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="text-center py-20 text-red-500">Error: {error}</div>;
  }

  // --- FILTER SIDEBAR COMPONENT ---
  const FilterSidebar = ({ mobile = false }) => (
    <div className={`space-y-8 ${mobile ? "p-6" : ""}`}>
      {/* Categories */}
      <div>
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          Categories
        </h3>
        <div className="space-y-2">
          {categories.map((cat) => (
            <label
              key={cat}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <input
                type="radio"
                name="category"
                checked={selectedCategory === cat}
                onChange={() => {
                  setSelectedCategory(cat);
                  if (mobile) setIsMobileFilterOpen(false);
                }}
                className="w-4 h-4 text-purple-600 border-gray-300 focus:ring-purple-500"
              />
              <span
                className={`text-sm ${
                  selectedCategory === cat
                    ? "text-purple-700 font-bold"
                    : "text-gray-600 group-hover:text-purple-600"
                }`}
              >
                {cat}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="text-lg font-bold text-gray-800 mb-4">Price Range</h3>
        <div className="px-1">
          <input
            type="range"
            min="0"
            max={maxPriceLimit}
            step="100"
            value={priceRange[1]}
            onChange={(e) => setPriceRange([0, Number(e.target.value)])}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
          />
          <div className="flex justify-between text-sm font-medium text-gray-600 mt-2">
            <span>₹0</span>
            <span>₹{priceRange[1]}</span>
          </div>
        </div>
      </div>

      {/* Reset Button */}
      <button
        onClick={() => {
          setSelectedCategory("All");
          setPriceRange([0, maxPriceLimit]);
          setSortBy("default");
          if (mobile) setIsMobileFilterOpen(false);
        }}
        className="text-sm text-red-500 hover:text-red-700 font-semibold underline decoration-dotted"
      >
        Reset Filters
      </button>
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-screen">
      <section className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* TOP BAR: Results count & Mobile Filter Toggle */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">Our Cakes</h1>
            <p className="text-gray-500 text-sm mt-1">
              Showing {filteredProducts.length} results
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Mobile Filter Button */}
            <button
              onClick={() => setIsMobileFilterOpen(true)}
              className="lg:hidden flex items-center gap-2 bg-white border border-gray-200 px-4 py-2.5 rounded-lg text-sm font-semibold text-gray-700 shadow-sm"
            >
              <FiSliders /> Filters
            </button>

            {/* Sort Dropdown */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none bg-white border border-gray-200 px-4 py-2.5 pr-10 rounded-lg text-sm font-semibold text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="default">Sort by: Recommended</option>
                <option value="newest">Newest Arrivals</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
              <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="flex gap-8 items-start">
          {/* --- LEFT SIDEBAR (Desktop) --- */}
          <aside className="hidden lg:block w-64 bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-24">
            <FilterSidebar />
          </aside>

          {/* --- MAIN GRID --- */}
          <main className="flex-1">
            {paginatedProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {paginatedProducts.map((product) => (
                  <Product key={product._id} product={product} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-gray-200 text-center">
                <div className="text-6xl mb-4">🎂</div>
                <h3 className="text-xl font-bold text-gray-800">
                  No cakes found
                </h3>
                <p className="text-gray-500 mt-2">
                  Try adjusting your price range or category.
                </p>
                <button
                  onClick={() => {
                    setSelectedCategory("All");
                    setPriceRange([0, maxPriceLimit]);
                  }}
                  className="mt-4 text-purple-600 font-semibold hover:underline"
                >
                  Clear all filters
                </button>
              </div>
            )}

            {/* PAGINATION */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-12 gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                  className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 transition-colors"
                >
                  Previous
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium transition-all ${
                          currentPage === page
                            ? "bg-purple-600 text-white shadow-md"
                            : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        {page}
                      </button>
                    )
                  )}
                </div>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                  className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </main>
        </div>
      </section>

      {/* --- MOBILE FILTER DRAWER --- */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-[9999]">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsMobileFilterOpen(false)}
          />
          <div className="absolute inset-y-0 right-0 w-[300px] bg-white shadow-2xl flex flex-col animate-slide-in-right">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">Filters</h2>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <FiX size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <FilterSidebar mobile={true} />
            </div>
            <div className="p-6 border-t border-gray-100">
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="w-full bg-purple-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-purple-200"
              >
                Show {filteredProducts.length} Results
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductList;
