"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

/* -------------------------------------------------------------------------- */
/* CONFIGURATION & CONSTANTS                               */
/* -------------------------------------------------------------------------- */

const CLOUDINARY_CLOUD_NAME = "dsndb5cfm";
const CLOUDINARY_UPLOAD_PRESET = "callacakeup";
const API_BASE = "https://callabackend.vercel.app/api";

const DEFAULT_IMAGE_PLACEHOLDER =
  "https://res.cloudinary.com/dsndb5cfm/image/upload/v1757172459/calalogo_bjpshx.png";

// Master flavours list (You can edit this to be more generic if needed)
const MASTER_FLAVOURS = [
  "Black Forest",
  "White Forest",
  "Vanilla",
  "Chocolate",
  "Butterscotch",
  "Strawberry",
  "Pineapple",
  "Red Velvet",
  "Blueberry",
  "Rasmalai",
  "Oreo",
  "Ferrero Rocher",
  "Kitkat",
  "Mango",
  "Coffee",
  "Irish Cream",
  "Lemon Zest",
  "Caramel",
  "Banana Walnut",
  "Cheese Cake",
];

// Multipliers for auto-pricing weights
const DEFAULT_MULTIPLIERS = {
  regular: { "1/2 Kg": 1, "1 Kg": 1.8, "2 Kg": 3.5, "4 Kg": 6.5 },
  photo: { "1 Kg": 1, "2 Kg": 2, "3 Kg": 3, "4 Kg": 4, "5 Kg": 5, "6 Kg": 6 },
  fondant: { "2 Kg": 2, "3 Kg": 3, "4 Kg": 4, "5 Kg": 5, "6 Kg": 6 },
  customized: { "2 Kg": 2, "3 Kg": 3, "4 Kg": 4, "5 Kg": 5, "6 Kg": 6 },
};

const CATEGORY_RULES = {
  "Regular Cake": { key: "regular", flavourPrice: 50 },
  "Photo Print Cake": {
    key: "photo",
    flavourPrice: 50,
    extra: { A4: 300, A3: 500 },
    minKg: 1,
  },
  "Fondant Cake": { key: "fondant", flavourPrice: 50 },
  "Customized Cake": { key: "customized", flavourPrice: null },
};

/* -------------------------------------------------------------------------- */
/* UI ICONS                                   */
/* -------------------------------------------------------------------------- */

const Icons = {
  Upload: () => (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
      />
    </svg>
  ),
  Check: () => (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M5 13l4 4L19 7"
      />
    </svg>
  ),
  Trash: () => (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
      />
    </svg>
  ),
  Tag: () => (
    <svg
      className="w-3 h-3"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
      />
    </svg>
  ),
  Scale: () => (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"
      />
    </svg>
  ),
};

/* -------------------------------------------------------------------------- */
/* HELPERS                                  */
/* -------------------------------------------------------------------------- */

async function uploadImageToCloudinary(file) {
  if (!file) throw new Error("No file selected");
  const fd = new FormData();
  fd.append("file", file);
  fd.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
  fd.append("cloud_name", CLOUDINARY_CLOUD_NAME);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
    { method: "POST", body: fd }
  );
  if (!res.ok) throw new Error("Image upload failed");
  const json = await res.json();
  return json.secure_url;
}

const calcDiscounted = (orig, discount) => {
  const d = Number(discount || 0);
  if (!orig || d <= 0) return Number(orig || 0);
  return Math.round(orig - (orig * d) / 100);
};

/* -------------------------------------------------------------------------- */
/* MAIN COMPONENT                               */
/* -------------------------------------------------------------------------- */

export default function AddProductForm() {
  const router = useRouter();

  // --- Global State ---
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState({ type: "", message: "" });

  // --- Category Creation State ---
  const [categoryTab, setCategoryTab] = useState("select");
  const [newCatData, setNewCatData] = useState({
    name: "",
    description: "",
    image: "",
  });
  const [isCreatingCat, setIsCreatingCat] = useState(false);

  // --- Main Form State ---
  const [selectedCategoryName, setSelectedCategoryName] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    image: "",
    basePrice: "",
    discount: 0,
    variantType: "both", // NEW: "weights" | "flavours" | "both"
    manualVariantMode: false,
    options: {
      flavour_selection: false,
      minimum_weight_kg: 0,
      extra_charges: { A4: 300, A3: 500 },
    },
    customization: {
      flavour_choice: "Available",
      theme_design: "",
      price_range: "",
    },
    examples: [],
  });

  const [variants, setVariants] = useState([]);

  // --- Init ---
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_BASE}/categories`);
      if (res.ok) setCategories(await res.json());
    } catch (e) {
      console.error("Failed to load categories", e);
    }
  };

  const categoryRule = useMemo(() => {
    return (
      CATEGORY_RULES[selectedCategoryName] || {
        key: "regular",
        flavourPrice: 50,
      }
    );
  }, [selectedCategoryName]);

  // --- Logic: Auto-Generate Variants based on variantType ---
  useEffect(() => {
    if (formData.manualVariantMode) return;

    // We need at least a category (to know rules) and basePrice
    // However, if we are just switching types, we might want to clear variants if basePrice is missing
    const base = Number(formData.basePrice);
    if (!selectedCategoryName || !base || Number.isNaN(base)) {
      setVariants([]);
      return;
    }

    const discount = Number(formData.discount || 0);
    const newVariants = [];
    const type = formData.variantType; // "weights" | "flavours" | "both"

    // 1. Generate Weights (if type is weights or both)
    if (type === "weights" || type === "both") {
      const multipliers =
        DEFAULT_MULTIPLIERS[categoryRule.key] || DEFAULT_MULTIPLIERS.regular;
      Object.entries(multipliers).forEach(([label, mult]) => {
        const original = Math.round(base * mult);
        newVariants.push({
          label,
          originalPrice: original,
          discountedPrice: calcDiscounted(original, discount),
          type: "weight",
        });
      });
    }

    // 2. Generate Flavours (if type is flavours or both)
    if (type === "flavours" || type === "both") {
      const flavourBase =
        categoryRule.key === "customized"
          ? Math.round(base)
          : Number(categoryRule.flavourPrice ?? 50);
      MASTER_FLAVOURS.forEach((fl) => {
        newVariants.push({
          label: fl,
          originalPrice: flavourBase,
          discountedPrice: calcDiscounted(flavourBase, discount),
          type: "flavour",
        });
      });
    }

    setVariants(newVariants);
  }, [
    selectedCategoryName,
    formData.basePrice,
    formData.discount,
    formData.variantType,
    formData.manualVariantMode,
    categoryRule,
  ]);

  // --- Logic: Update discounts on change ---
  useEffect(() => {
    const d = Number(formData.discount || 0);
    setVariants((prev) =>
      prev.map((v) => ({
        ...v,
        discountedPrice: calcDiscounted(v.originalPrice, d),
      }))
    );
  }, [formData.discount]);

  // --- Handlers ---
  const setField = (k, v) => setFormData((p) => ({ ...p, [k]: v }));

  const updateVariant = (index, field, value) => {
    setVariants((prev) => {
      const copy = [...prev];
      copy[index] = {
        ...copy[index],
        [field]: field === "label" ? String(value) : Number(value),
      };
      if (field === "originalPrice") {
        copy[index].discountedPrice = calcDiscounted(
          copy[index].originalPrice,
          Number(formData.discount || 0)
        );
      }
      return copy;
    });
    setFormData((p) => ({ ...p, manualVariantMode: true }));
  };

  const addVariant = (type = "custom") => {
    setVariants((p) => [
      ...p,
      {
        label: type === "weight" ? "New Size" : "New Option",
        originalPrice: 0,
        discountedPrice: 0,
        type,
      },
    ]);
    setFormData((p) => ({ ...p, manualVariantMode: true }));
  };

  const handleFileUpload = async (e, setter) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsLoading(true);
    try {
      const url = await uploadImageToCloudinary(file);
      setter(url);
      setNotification({ type: "success", message: "Image uploaded!" });
    } catch (err) {
      setNotification({ type: "error", message: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCategory = async () => {
    if (!newCatData.name)
      return setNotification({ type: "error", message: "Name required" });
    setIsCreatingCat(true);
    try {
      const res = await fetch(`${API_BASE}/categories`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCatData),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message);
      await fetchCategories();
      handleSelectCategory(json._id || json.category?._id, newCatData.name);
      setCategoryTab("select");
      setNewCatData({ name: "", description: "", image: "" });
      setNotification({ type: "success", message: "Category created!" });
    } catch (err) {
      setNotification({ type: "error", message: err.message });
    } finally {
      setIsCreatingCat(false);
    }
  };

  const handleSelectCategory = (id, name = null) => {
    if (!name) name = categories.find((c) => c._id === id)?.name || "";
    setFormData((p) => ({ ...p, category: id }));
    setSelectedCategoryName(name);
  };

  // --- Submit ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (!formData.title || !formData.category || variants.length === 0) {
      setNotification({
        type: "error",
        message: "Title, Category and Variants are required.",
      });
      setIsLoading(false);
      return;
    }

    const cleanedVariants = variants
      .map((v) => ({
        label: String(v.label || "").trim(),
        price: {
          originalPrice: Number(v.originalPrice || 0),
          discountedPrice: Number(v.discountedPrice || 0),
        },
      }))
      .filter((v) => v.label && !Number.isNaN(v.price.originalPrice));

    const payload = {
      title: formData.title,
      description: formData.description,
      category: formData.category,
      image: formData.image,
      discount: Number(formData.discount || 0),
      variantType: formData.variantType, // Explicitly sending selected type
      variants: cleanedVariants,
      options: formData.options,
      customization: formData.customization,
      examples:
        Array.isArray(formData.examples) && formData.examples.length > 0
          ? formData.examples.filter((ex) => ex.trim() !== "")
          : [],
      rating: { rate: 0, count: 0 },
    };

    try {
      const res = await fetch(`${API_BASE}/cakes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error((await res.json()).message || "Failed");
      setNotification({ type: "success", message: "Saved Successfully!" });
      setTimeout(() => router.push("/admin/addcakes"), 1500);
    } catch (err) {
      setNotification({ type: "error", message: err.message });
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-4 md:p-8 font-sans">
      {/* --- HEADER --- */}
      <div className="max-w-7xl mx-auto flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Add New Product</h1>
          <p className="text-slate-500 text-sm mt-1">
            Advanced inventory & pricing configuration
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-white border rounded-lg text-sm font-medium hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className={`px-6 py-2 rounded-lg text-white font-medium shadow-sm flex items-center gap-2 ${
              isLoading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {isLoading ? (
              "Saving..."
            ) : (
              <>
                <Icons.Check /> Save Product
              </>
            )}
          </button>
        </div>
      </div>

      {/* --- NOTIFICATIONS --- */}
      {notification.message && (
        <div
          className={`fixed top-5 right-5 z-50 px-6 py-4 rounded-lg shadow-lg border-l-4 bg-white ${
            notification.type === "error"
              ? "border-red-500 text-red-700"
              : "border-green-500 text-green-700"
          }`}
        >
          <div className="font-bold">
            {notification.type === "error" ? "Error" : "Success"}
          </div>
          <div className="text-sm">{notification.message}</div>
        </div>
      )}

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* --- LEFT SIDEBAR (Category & Preview) --- */}
        <div className="lg:col-span-4 space-y-6">
          {/* Category Selector */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex border-b">
              {["select", "create"].map((t) => (
                <button
                  key={t}
                  onClick={() => setCategoryTab(t)}
                  className={`flex-1 py-3 text-sm font-medium capitalize ${
                    categoryTab === t
                      ? "bg-blue-50 text-blue-700 border-b-2 border-blue-600"
                      : "text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  {t === "select" ? "Select Category" : "+ Create New"}
                </button>
              ))}
            </div>
            <div className="p-4">
              {categoryTab === "select" ? (
                <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar">
                  {categories.map((c) => (
                    <div
                      key={c._id}
                      onClick={() => handleSelectCategory(c._id, c.name)}
                      className={`flex items-center gap-3 p-2.5 rounded-lg cursor-pointer border ${
                        formData.category === c._id
                          ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500"
                          : "border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <img
                        src={c.image || DEFAULT_IMAGE_PLACEHOLDER}
                        className="h-10 w-10 object-cover rounded bg-gray-200"
                        alt=""
                      />
                      <div className="text-sm font-semibold">{c.name}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  <input
                    placeholder="Category Name"
                    value={newCatData.name}
                    onChange={(e) =>
                      setNewCatData({ ...newCatData, name: e.target.value })
                    }
                    className="w-full p-2 border rounded-md text-sm"
                  />
                  <input
                    placeholder="Description"
                    value={newCatData.description}
                    onChange={(e) =>
                      setNewCatData({
                        ...newCatData,
                        description: e.target.value,
                      })
                    }
                    className="w-full p-2 border rounded-md text-sm"
                  />
                  <div className="flex items-center gap-3">
                    <img
                      src={newCatData.image || DEFAULT_IMAGE_PLACEHOLDER}
                      className="h-12 w-12 rounded border object-cover"
                      alt=""
                    />
                    <label className="cursor-pointer px-3 py-1.5 border rounded-md text-xs hover:bg-gray-50">
                      Upload Icon{" "}
                      <input
                        type="file"
                        className="hidden"
                        onChange={(e) =>
                          handleFileUpload(e, (url) =>
                            setNewCatData({ ...newCatData, image: url })
                          )
                        }
                      />
                    </label>
                  </div>
                  <button
                    onClick={handleCreateCategory}
                    disabled={isCreatingCat}
                    className="w-full py-2 bg-slate-800 text-white rounded-md text-sm"
                  >
                    {isCreatingCat ? "Creating..." : "Create Category"}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Live Preview */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sticky top-6">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
              Live Preview
            </h3>
            <div className="rounded-lg overflow-hidden border border-gray-100">
              <div className="relative aspect-square bg-gray-100">
                <img
                  src={formData.image || DEFAULT_IMAGE_PLACEHOLDER}
                  className="object-cover w-full h-full"
                  alt="preview"
                />
                {formData.discount > 0 && (
                  <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                    {formData.discount}% OFF
                  </span>
                )}
              </div>
              <div className="p-4">
                <h2 className="font-bold text-lg text-gray-900">
                  {formData.title || "Product Title"}
                </h2>
                <div className="text-sm text-gray-500 mt-1">
                  {selectedCategoryName || "Category"}
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-xl font-bold text-blue-600">
                    ₹{variants[0]?.discountedPrice || formData.basePrice || "0"}
                  </span>
                  {variants[0]?.discountedPrice <
                    variants[0]?.originalPrice && (
                    <span className="text-sm text-gray-400 line-through">
                      ₹{variants[0]?.originalPrice}
                    </span>
                  )}
                </div>
                <div className="mt-2 flex gap-1 flex-wrap">
                  {variants.slice(0, 3).map((v, i) => (
                    <span
                      key={i}
                      className="text-[10px] px-2 py-1 bg-gray-100 rounded text-gray-600 border"
                    >
                      {v.label}
                    </span>
                  ))}
                  {variants.length > 3 && (
                    <span className="text-[10px] px-2 py-1 text-gray-400">
                      +{variants.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* --- RIGHT CONTENT (Form Fields) --- */}
        <div className="lg:col-span-8 space-y-6">
          {/* Section 1: Details */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-800 border-b pb-3 mb-5">
              Product Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <label className="text-sm font-semibold text-gray-700 block mb-1">
                  Title
                </label>
                <input
                  value={formData.title}
                  onChange={(e) => setField("title", e.target.value)}
                  placeholder="e.g. Dark Chocolate Truffle"
                  className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1">
                  Image URL
                </label>
                <div className="flex gap-2">
                  <input
                    value={formData.image}
                    onChange={(e) => setField("image", e.target.value)}
                    className="flex-1 p-2.5 border rounded-lg text-sm bg-gray-50"
                  />
                  <label className="cursor-pointer bg-blue-50 text-blue-600 border border-blue-200 px-3 rounded-lg flex items-center justify-center hover:bg-blue-100">
                    <Icons.Upload />
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) =>
                        handleFileUpload(e, (url) => setField("image", url))
                      }
                    />
                  </label>
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setField("description", e.target.value)}
                  rows={1}
                  className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
          </section>

          {/* Section 2: PRICING & VARIANTS (The Advanced Part) */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between border-b pb-3 mb-5">
              <h3 className="text-lg font-bold text-gray-800">
                Pricing Engine
              </h3>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-sm text-gray-500 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formData.manualVariantMode}
                    onChange={(e) =>
                      setField("manualVariantMode", e.target.checked)
                    }
                    className="rounded text-blue-600"
                  />
                  Manual Edit
                </label>
              </div>
            </div>

            {/* VARIANT TYPE SELECTOR */}
            <div className="mb-6">
              <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">
                Variant Mode (Select Type)
              </label>
              <div className="grid grid-cols-3 bg-gray-100 p-1 rounded-lg max-w-md">
                {["weights", "flavours", "both"].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setField("variantType", type)}
                    className={`py-1.5 text-sm font-medium rounded-md transition-all capitalize ${
                      formData.variantType === type
                        ? "bg-white text-blue-600 shadow-sm ring-1 ring-black/5"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-2">
                {formData.variantType === "weights" &&
                  "Will generate only sizes/weights (e.g. 1 Kg, 2 Kg). Best for standard items."}
                {formData.variantType === "flavours" &&
                  "Will generate only flavour options. Best for cupcakes or macaroons."}
                {formData.variantType === "both" &&
                  "Will generate both weights and flavours. Best for regular Cakes."}
              </p>
            </div>

            {/* BASE PRICE INPUT */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6 bg-slate-50 p-4 rounded-lg border border-slate-200">
              <div className="md:col-span-2">
                <label className="text-xs font-bold text-slate-500 uppercase">
                  Base Price
                </label>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-gray-400 font-bold">₹</span>
                  <input
                    type="number"
                    value={formData.basePrice}
                    onChange={(e) => setField("basePrice", e.target.value)}
                    placeholder="Enter price to auto-generate"
                    className="flex-1 bg-transparent border-b border-gray-300 focus:border-blue-500 outline-none py-1 font-mono text-lg"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">
                  Discount %
                </label>
                <input
                  type="number"
                  value={formData.discount}
                  onChange={(e) => setField("discount", e.target.value)}
                  className="w-full mt-1 p-2 bg-white border rounded-md"
                />
              </div>
            </div>

            {/* VARIANTS TABLE */}
            <div className="overflow-hidden border border-gray-200 rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Variant Label
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Original
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Discounted
                    </th>
                    <th className="px-4 py-3 text-right"></th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {variants.length === 0 && (
                    <tr>
                      <td
                        colSpan="4"
                        className="text-center py-8 text-gray-400 text-sm"
                      >
                        No variants yet. Select a category and enter Base Price.
                      </td>
                    </tr>
                  )}
                  {variants.map((v, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 group">
                      <td className="px-4 py-2">
                        <input
                          value={v.label}
                          onChange={(e) =>
                            updateVariant(idx, "label", e.target.value)
                          }
                          className="w-full bg-transparent border-none focus:ring-0 text-sm font-medium"
                        />
                        <span className="text-[10px] text-gray-400 uppercase tracking-wide bg-gray-100 px-1 rounded">
                          {v.type}
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="number"
                          value={v.originalPrice}
                          onChange={(e) =>
                            updateVariant(idx, "originalPrice", e.target.value)
                          }
                          className="w-24 border border-gray-200 rounded px-2 py-1 text-sm focus:border-blue-500 outline-none"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <span className="font-bold text-green-600 text-sm">
                          ₹{v.discountedPrice}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-right">
                        <button
                          type="button"
                          onClick={() =>
                            setVariants((p) => p.filter((_, i) => i !== idx))
                          }
                          className="text-gray-300 hover:text-red-500 transition"
                        >
                          <Icons.Trash />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex gap-3 mt-4">
              <button
                type="button"
                onClick={() => addVariant("weight")}
                className="text-xs bg-white border hover:bg-gray-50 text-gray-700 px-3 py-2 rounded font-medium transition"
              >
                + Add Weight
              </button>
              <button
                type="button"
                onClick={() => addVariant("flavour")}
                className="text-xs bg-white border hover:bg-gray-50 text-gray-700 px-3 py-2 rounded font-medium transition"
              >
                + Add Flavour
              </button>
              <button
                type="button"
                onClick={() => addVariant("custom")}
                className="text-xs bg-white border hover:bg-gray-50 text-gray-700 px-3 py-2 rounded font-medium transition"
              >
                + Add Custom
              </button>
            </div>
          </section>

          {/* Section 3: Extra Config & Tags */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-full">
              <h3 className="text-md font-bold text-gray-800 mb-4">
                Configuration
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <span className="text-sm text-gray-700">
                    Allow Flavour Selection
                  </span>
                  <div
                    className={`w-10 h-5 flex items-center bg-gray-300 rounded-full p-1 cursor-pointer transition ${
                      formData.options.flavour_selection ? "bg-green-500" : ""
                    }`}
                    onClick={() =>
                      setFormData((p) => ({
                        ...p,
                        options: {
                          ...p.options,
                          flavour_selection: !p.options.flavour_selection,
                        },
                      }))
                    }
                  >
                    <div
                      className={`bg-white w-3 h-3 rounded-full shadow-md transform transition ${
                        formData.options.flavour_selection
                          ? "translate-x-5"
                          : ""
                      }`}
                    ></div>
                  </div>
                </div>
                {selectedCategoryName === "Photo Print Cake" && (
                  <div className="bg-amber-50 border border-amber-100 p-3 rounded-lg space-y-3">
                    <h4 className="text-xs font-bold text-amber-700 uppercase">
                      Photo Config
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs block mb-1">
                          Min Weight (Kg)
                        </label>
                        <input
                          type="number"
                          value={formData.options.minimum_weight_kg}
                          onChange={(e) =>
                            setFormData((p) => ({
                              ...p,
                              options: {
                                ...p.options,
                                minimum_weight_kg: Number(e.target.value),
                              },
                            }))
                          }
                          className="w-full border rounded p-1 text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs block mb-1">
                          A4 Extra (₹)
                        </label>
                        <input
                          type="number"
                          value={formData.options.extra_charges?.A4}
                          onChange={(e) =>
                            setFormData((p) => ({
                              ...p,
                              options: {
                                ...p.options,
                                extra_charges: {
                                  ...p.options.extra_charges,
                                  A4: Number(e.target.value),
                                },
                              },
                            }))
                          }
                          className="w-full border rounded p-1 text-sm"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </section>

            <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-full">
              <h3 className="text-md font-bold text-gray-800 mb-4">
                Search Tags
              </h3>
              <div className="flex gap-2 mb-2">
                <input
                  id="tagInput"
                  placeholder="Add a tag (e.g. Birthday)..."
                  className="flex-1 p-2 border rounded text-sm"
                />
                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById("tagInput");
                    if (el && el.value.trim()) {
                      setFormData((p) => ({
                        ...p,
                        examples: [...p.examples, el.value.trim()],
                      }));
                      el.value = "";
                    }
                  }}
                  className="bg-slate-800 text-white px-3 rounded text-sm"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.examples.map((ex, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 bg-gray-100 border text-gray-600 px-2 py-1 rounded text-xs"
                  >
                    <Icons.Tag /> {ex}
                    <button
                      type="button"
                      onClick={() =>
                        setFormData((p) => ({
                          ...p,
                          examples: p.examples.filter((_, x) => x !== i),
                        }))
                      }
                      className="ml-1 text-red-500 font-bold hover:text-red-700"
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
