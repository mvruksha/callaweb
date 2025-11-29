"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Titletag from "@/components/titletag/Titletag";
import Product from "@/components/cakemenu/Product";
import {
  FiFilter,
  FiChevronDown,
  FiSearch,
  FiHome,
  FiAlertCircle,
} from "react-icons/fi";

// --- HELPERS ---

// Safe Category Name Extractor
const getCategoryName = (category) => {
  if (!category) return "";
  if (typeof category === "string") return category;
  return category.name || "";
};

// Safe Price Extractor
const getPrice = (product) => {
  if (!product) return 0;
  // Check variant price
  if (product.variants && product.variants.length > 0) {
    const p = product.variants[0].price;
    return typeof p === "object"
      ? p.discountedPrice || p.originalPrice || 0
      : p;
  }
  // Check root price
  const rootPrice = product.price;
  if (typeof rootPrice === "object")
    return rootPrice.discountedPrice || rootPrice.originalPrice || 0;
  return rootPrice || 0;
};

const CategoryPage = () => {
  const { category } = useParams();
  const decodedCategory = decodeURIComponent(category).replace(/-/g, " ");

  // --- STATE ---
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [sortBy, setSortBy] = useState("default");
  const [searchQuery, setSearchQuery] = useState("");
  const [priceRange, setPriceRange] = useState(5000); // Max price slider
  const [showFilters, setShowFilters] = useState(false);

  // --- 1. FETCH DATA ---
  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        const res = await fetch("https://callabackend.vercel.app/api/cakes");

        if (!res.ok) throw new Error("Failed to fetch data");

        const data = await res.json();
        const allProducts = Array.isArray(data) ? data : data.data || [];

        // Filter by Category (Case Insensitive)
        const targetCat = decodedCategory.toLowerCase();

        const filtered = allProducts.filter((cake) => {
          const cakeCatName = getCategoryName(cake.category).toLowerCase();
          // Flexible matching: Exact match OR includes (e.g., 'birthday cakes' matches 'cakes')
          return (
            cakeCatName === targetCat ||
            cakeCatName.includes(targetCat) ||
            targetCat.includes(cakeCatName)
          );
        });

        setProducts(filtered);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (category) fetchProducts();
  }, [category, decodedCategory]);

  // --- 2. FILTER & SORT LOGIC ---
  const processedProducts = useMemo(() => {
    let temp = [...products];

    // Search Filter
    if (searchQuery) {
      temp = temp.filter((p) =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Price Filter
    temp = temp.filter((p) => getPrice(p) <= priceRange);

    // Sorting
    if (sortBy === "price-low") {
      temp.sort((a, b) => getPrice(a) - getPrice(b));
    } else if (sortBy === "price-high") {
      temp.sort((a, b) => getPrice(b) - getPrice(a));
    } else if (sortBy === "rating") {
      temp.sort((a, b) => (b.rating?.rate || 0) - (a.rating?.rate || 0));
    }

    return temp;
  }, [products, searchQuery, priceRange, sortBy]);

  // --- RENDER HELPERS ---
  const SkeletonCard = () => (
    <div className="bg-white rounded-xl border border-gray-100 p-4 h-[350px] animate-pulse">
      <div className="bg-gray-200 h-48 rounded-lg mb-4 w-full"></div>
      <div className="bg-gray-200 h-4 w-3/4 rounded mb-2"></div>
      <div className="bg-gray-200 h-4 w-1/2 rounded mb-4"></div>
      <div className="bg-gray-200 h-8 w-full rounded"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Titletag
        url="/assets/titletag/banner1.jpg"
        parent="Categories"
        title={decodedCategory}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {/* --- BREADCRUMB & HEADER --- */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs text-gray-500 mb-2 uppercase tracking-wide">
              <Link
                href="/"
                className="hover:text-purple-600 flex items-center gap-1"
              >
                <FiHome /> Home
              </Link>
              <span>/</span>
              <span>Menu</span>
              <span>/</span>
              <span className="text-purple-600 font-bold">
                {decodedCategory}
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 capitalize">
              {decodedCategory}
            </h1>
            <p className="text-gray-500 mt-1">
              {loading
                ? "Loading..."
                : `${processedProducts.length} results found`}
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-72">
            <input
              type="text"
              placeholder="Search in this category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white shadow-sm"
            />
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        {/* --- TOOLBAR (Sort & Filter) --- */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-8 sticky top-24 z-20">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Left: Filter Toggle (Mobile) & Price Range */}
            <div className="flex items-center gap-4 w-full md:w-auto">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-semibold text-gray-700 transition md:hidden"
              >
                <FiFilter /> Filters
              </button>

              <div className="hidden md:flex items-center gap-4">
                <span className="text-sm font-bold text-gray-700">
                  Max Price: ₹{priceRange}
                </span>
                <input
                  type="range"
                  min="500"
                  max="5000"
                  step="100"
                  value={priceRange}
                  onChange={(e) => setPriceRange(Number(e.target.value))}
                  className="w-48 accent-purple-600 cursor-pointer"
                />
              </div>
            </div>

            {/* Right: Sort */}
            <div className="relative w-full md:w-auto">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full md:w-48 appearance-none bg-gray-50 border border-gray-200 text-gray-700 py-2 px-4 pr-8 rounded-lg focus:outline-none focus:border-purple-500 font-medium cursor-pointer"
              >
                <option value="default">Sort By: Recommended</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
              <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Mobile Filter Expandable */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-100 md:hidden animate-slide-down">
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Max Price: ₹{priceRange}
              </label>
              <input
                type="range"
                min="500"
                max="5000"
                step="100"
                value={priceRange}
                onChange={(e) => setPriceRange(Number(e.target.value))}
                className="w-full accent-purple-600 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          )}
        </div>

        {/* --- CONTENT AREA --- */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <div className="bg-red-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiAlertCircle className="text-red-500 text-2xl" />
            </div>
            <h3 className="text-lg font-bold text-red-600">
              Something went wrong
            </h3>
            <p className="text-gray-500">{error}</p>
          </div>
        ) : processedProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {processedProducts.map((product, index) => (
              <Product key={product._id || index} product={product} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 bg-white rounded-xl border border-dashed border-gray-300">
            <div className="text-5xl mb-4">🍰</div>
            <h3 className="text-xl font-bold text-gray-800">No cakes found</h3>
            <p className="text-gray-500 mt-2 max-w-xs text-center">
              We couldn't find any cakes matching your current filters in{" "}
              {decodedCategory}.
            </p>
            <button
              onClick={() => {
                setPriceRange(5000);
                setSearchQuery("");
                setSortBy("default");
              }}
              className="mt-6 px-6 py-2 bg-purple-50 text-purple-700 font-semibold rounded-full hover:bg-purple-100 transition"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryPage;
