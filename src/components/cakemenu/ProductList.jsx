"use client";

import React, { useContext, useEffect, useState } from "react";
import { ProductContext } from "../../../contexts/ProductContext";
import Product from "./Product";

const ProductList = () => {
  const { products } = useContext(ProductContext);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 20; // Show 20 products per page

  // Fetch categories dynamically
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(
          "https://callabackend.vercel.app/api/categories"
        );
        const data = await res.json();

        const formatted = data.map((cat, idx) => ({
          id: cat.id || idx,
          name: cat.name || cat,
        }));

        setCategories([{ id: "all", name: "All" }, ...formatted]);
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };
    fetchCategories();
  }, []);

  // Filtering + Sorting
  useEffect(() => {
    let tempProducts = [...products];

    if (selectedCategory !== "All") {
      tempProducts = tempProducts.filter(
        (p) => p.category?.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    if (sortBy === "price-low") {
      tempProducts.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-high") {
      tempProducts.sort((a, b) => b.price - a.price);
    } else if (sortBy === "discount") {
      tempProducts.sort((a, b) => (b.discount || 0) - (a.discount || 0));
    }

    setFilteredProducts(tempProducts);
    setCurrentPage(1); // Reset to first page when filters change
  }, [products, selectedCategory, sortBy]);

  // Pagination logic
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = filteredProducts.slice(
    startIdx,
    startIdx + itemsPerPage
  );

  return (
    <section className="py-10 px-4 max-w-8xl mx-auto">
      <h1 className="text-3xl md:text-4xl font-extrabold mb-10 text-gray-800 text-start">
        🍰 Explore Our Cakes
      </h1>

      {/* Filter & Sort Controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-10">
        {/* Category Buttons */}
        <div className="flex flex-wrap gap-3 justify-start md:justify-start">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.name)}
              className={`px-4 py-2 rounded-xs border text-sm font-medium transition-all shadow-sm ${
                selectedCategory === cat.name
                  ? "bg-purple-500 text-white shadow-md scale-105"
                  : "bg-white text-gray-600 hover:bg-gray-100 border-gray-300"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Sort Dropdown */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="border px-4 py-2 rounded-xs shadow-sm focus:ring-2 focus:ring-purple-400"
        >
          <option value="">Sort by</option>
          <option value="price-low">Price: Low → High</option>
          <option value="price-high">Price: High → Low</option>
          <option value="discount">Best Discount</option>
        </select>
      </div>

      {/* Products Grid */}
      {!paginatedProducts || paginatedProducts.length === 0 ? (
        <p className="text-center text-gray-500 font-medium py-10">
          No cakes found in{" "}
          <span className="font-semibold">{selectedCategory}</span> 🍩
        </p>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-2 md:gap-4 lg:gap-6 xl:gap-6 2xl:gap-6">
            {paginatedProducts.map((product, index) => (
              <Product
                key={product._id || product.id || index}
                product={{ ...product, id: product._id || product.id }}
              />
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-8 gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Prev
              </button>

              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-3 py-1 border rounded ${
                    currentPage === i + 1
                      ? "bg-purple-500 text-white"
                      : "bg-white hover:bg-gray-100"
                  }`}
                >
                  {i + 1}
                </button>
              ))}

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
};

export default ProductList;
