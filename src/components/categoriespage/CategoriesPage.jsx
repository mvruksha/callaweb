"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch(
          "https://callabackend.vercel.app/api/categories"
        );
        const data = await res.json();
        setCategories(data);
      } catch (err) {
        console.error("Error fetching categories:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchCategories();
  }, []);

  return (
    <div className="mt-6 sm:mt-8 lg:mt-12 px-4 pb-12 max-w-8xl mx-auto">
      <h1 className="text-3xl font-extrabold mb-10 text-start bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 text-transparent bg-clip-text">
        🍰 Cake Categories
      </h1>

      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {categories.map((cat, index) => (
          <motion.div
            key={cat._id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
          >
            <Link
              href={`/categories/${encodeURIComponent(cat.name)}`}
              className="group relative block rounded-xs overflow-hidden shadow-lg hover:shadow-2xl transition-all bg-white"
            >
              <div className="relative w-full h-68">
                <Image
                  src={cat.image}
                  alt={cat.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                />
                {/* Overlay gradient on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition" />
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-md group-hover:bg-gradient-to-r group-hover:from-purple-600 group-hover:to-pink-500 transition">
                <h2 className="text-lg font-bold text-purple-700 group-hover:text-white">
                  {cat.name}
                </h2>
                <p className="text-sm text-gray-600 mt-1 line-clamp-2 group-hover:text-white/90">
                  {cat.description}
                </p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
