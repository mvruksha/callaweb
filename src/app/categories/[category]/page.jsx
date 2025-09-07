"use client";
import Titletag from "@/components/titletag/Titletag";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Product from "@/components/cakemenu/Product";

const Main = () => {
  const { category } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch("https://callabackend.vercel.app/api/cakes");
        const data = await res.json();

        // Filter by category (case-insensitive match)
        const filtered = data.filter(
          (cake) =>
            cake.category.toLowerCase() ===
            decodeURIComponent(category).toLowerCase()
        );
        setProducts(filtered);
      } catch (err) {
        console.error("Error fetching products:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, [category]);
  return (
    <>
      <Titletag
        url="/assets/titletag/banner1.jpg"
        parent="categories"
        title="Categories-Cakes"
      />
      <div className="mt-6 px-4 mb-4">
        <h1 className="text-2xl font-bold mb-6">
          {decodeURIComponent(category)}
        </h1>

        {loading ? (
          <p className="text-gray-600">Loading cakes...</p>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product, index) => (
              <Product
                key={product._id || product.id || index}
                product={{ ...product, id: product._id || product.id }}
              />
            ))}
          </div>
        ) : (
          <p className="text-gray-600">No cakes found in this category.</p>
        )}
      </div>
    </>
  );
};

export default Main;
