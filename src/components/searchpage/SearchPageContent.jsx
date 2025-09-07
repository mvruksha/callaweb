"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Product from "@/components/cakemenu/Product";

export default function SearchPageContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("query") || "";
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("https://callabackend.vercel.app/api/cakes");
        const data = await res.json();

        const lowerQuery = query.toLowerCase();
        const results = data.filter(
          (cake) =>
            cake.title.toLowerCase().includes(lowerQuery) ||
            cake.category.toLowerCase().includes(lowerQuery) ||
            cake.description.toLowerCase().includes(lowerQuery)
        );
        setProducts(data);
        setFiltered(results);
      } catch (err) {
        console.error("Error fetching cakes:", err);
      } finally {
        setLoading(false);
      }
    }

    if (query) fetchData();
  }, [query]);

  if (loading) return <p className="pt-28 px-4">Loading cakes...</p>;

  return (
    <div className="pt-4 px-4 sm:px-8 min-h-screen bg-gray-50">
      <h1 className="text-2xl font-bold mb-6">
        Search results for: <span className="text-purple-700">{query}</span>
      </h1>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((product, index) => (
            <Product
              key={product._id || product.id || index}
              product={{ ...product, id: product._id || product.id }}
            />
          ))}
        </div>
      ) : (
        <p className="text-gray-600">No cakes found matching your search.</p>
      )}
    </div>
  );
}
