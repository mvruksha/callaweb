"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Search,
  Edit,
  Trash2,
  X,
  Plus,
  Layers,
  Package,
  CheckCircle,
  AlertCircle,
  LayoutGrid,
  List,
  Filter,
  Upload,
  Image as ImageIcon,
  DollarSign,
  Settings,
  Save,
  Loader2,
} from "lucide-react";

// --- CONFIGURATION ---
const API_BASE = "https://callabackend.vercel.app/api";
const CLOUDINARY_CLOUD_NAME = "dsndb5cfm";
const CLOUDINARY_UPLOAD_PRESET = "callacakeup";

// --- HELPERS ---

// Cloudinary Upload Helper
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

// Price Calculator
const calcDiscounted = (orig, discount) => {
  const d = Number(discount || 0);
  const o = Number(orig || 0);
  if (o <= 0) return 0;
  if (d <= 0) return o;
  return Math.round(o - (o * d) / 100);
};

// Debounce Hook
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
};

// --- UI COMPONENTS ---

const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div
      className={`fixed top-5 right-5 z-[70] px-4 py-3 rounded-lg shadow-xl flex items-center gap-3 text-white animate-in slide-in-from-right-5 fade-in duration-300 ${
        type === "error" ? "bg-red-500" : "bg-emerald-600"
      }`}
    >
      {type === "error" ? <AlertCircle size={20} /> : <CheckCircle size={20} />}
      <span className="text-sm font-medium">{message}</span>
    </div>
  );
};

const ModalOverlay = ({ children, onClose }) => (
  <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
    <div
      className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </div>
    <div className="absolute inset-0 -z-10" onClick={onClose} />
  </div>
);

// ============================================================================
// MODAL: CATEGORY (Add & Edit)
// ============================================================================
const CategoryModal = ({ category, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image: "",
  });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (category) setFormData(category);
    else setFormData({ name: "", description: "", image: "" });
  }, [category]);

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImageToCloudinary(file);
      setFormData((prev) => ({ ...prev, image: url }));
    } catch (error) {
      alert("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await onSave(formData);
    setLoading(false);
  };

  return (
    <ModalOverlay onClose={onClose}>
      <div className="flex justify-between items-center p-5 border-b bg-gray-50">
        <h2 className="text-xl font-bold text-gray-800">
          {category ? "Edit Category" : "New Category"}
        </h2>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-200 rounded-full transition"
        >
          <X size={20} />
        </button>
      </div>
      <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">
                Name
              </label>
              <input
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Category Name"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={4}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Category details..."
              />
            </div>
          </div>

          <div className="space-y-4">
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">
              Category Image
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-xl h-48 flex flex-col items-center justify-center bg-gray-50 relative overflow-hidden group">
              {formData.image ? (
                <>
                  <img
                    src={formData.image}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                    <p className="text-white font-medium">Click to change</p>
                  </div>
                </>
              ) : (
                <div className="text-center text-gray-400">
                  {uploading ? (
                    <Loader2 className="animate-spin mx-auto" />
                  ) : (
                    <Upload className="mx-auto mb-2" />
                  )}
                  <p className="text-sm">Upload Image</p>
                </div>
              )}
              <input
                type="file"
                onChange={handleImageUpload}
                className="absolute inset-0 opacity-0 cursor-pointer"
                accept="image/*"
              />
            </div>
          </div>
        </div>
      </form>
      <div className="p-5 border-t bg-gray-50 flex justify-end gap-3">
        <button
          onClick={onClose}
          className="px-5 py-2.5 text-gray-700 font-medium hover:bg-gray-200 rounded-lg"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={loading || uploading}
          className="px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-70 flex items-center gap-2"
        >
          {loading ? (
            <Loader2 className="animate-spin" size={18} />
          ) : (
            <Save size={18} />
          )}
          {loading ? "Saving..." : "Save Category"}
        </button>
      </div>
    </ModalOverlay>
  );
};

// ============================================================================
// MODAL: PRODUCT / CAKE (Full Logic with Fixes)
// ============================================================================
const EditCakeModal = ({ cake, categories, onClose, onSave }) => {
  const [activeTab, setActiveTab] = useState("basic");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Initialize form
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    image: "",
    discount: 0,
    variantType: "weights",
    variants: [],
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
  });

  useEffect(() => {
    if (cake) {
      // --- SAFE EXTRACTION LOGIC ---
      // 1. Default to empty string (handles undefined case)
      let categoryId = "";

      // 2. If category exists, check its type
      if (cake.category) {
        if (typeof cake.category === "object" && cake.category._id) {
          // It's a populated object { _id: "...", name: "..." }
          categoryId = cake.category._id;
        } else if (typeof cake.category === "string") {
          // It's just an ID string "..."
          categoryId = cake.category;
        }
      }

      setFormData({
        title: cake.title || "",
        description: cake.description || "",
        category: categoryId, // <--- Correctly applied here
        image: cake.image || "",
        discount: cake.discount || 0,
        variantType: cake.variantType || "weights",
        variants: Array.isArray(cake.variants) ? cake.variants : [],
        options: {
          flavour_selection: cake.options?.flavour_selection || false,
          minimum_weight_kg: cake.options?.minimum_weight_kg || 0,
          extra_charges: {
            A4: cake.options?.extra_charges?.A4 || 300,
            A3: cake.options?.extra_charges?.A3 || 500,
          },
        },
        customization: {
          flavour_choice: cake.customization?.flavour_choice || "Available",
          theme_design: cake.customization?.theme_design || "",
          price_range: cake.customization?.price_range || "",
        },
      });
    }
  }, [cake]);

  // --- Handlers ---
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImageToCloudinary(file);
      setFormData((prev) => ({ ...prev, image: url }));
    } catch (error) {
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const handleAddVariant = () => {
    setFormData((prev) => ({
      ...prev,
      variants: [
        ...prev.variants,
        { label: "", price: { originalPrice: 0, discountedPrice: 0 } },
      ],
    }));
  };

  const handleRemoveVariant = (index) => {
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index),
    }));
  };

  const handleVariantChange = (index, field, value) => {
    const newVariants = [...formData.variants];
    const currentVariant = { ...newVariants[index] };
    const globalDiscount = Number(formData.discount);

    if (field === "label") {
      currentVariant.label = value;
    } else if (field === "originalPrice") {
      const op = parseFloat(value) || 0;
      currentVariant.price = {
        originalPrice: op,
        discountedPrice: calcDiscounted(op, globalDiscount),
      };
    }

    newVariants[index] = currentVariant;
    setFormData({ ...formData, variants: newVariants });
  };

  const handleDiscountChange = (newDiscount) => {
    const d = parseFloat(newDiscount) || 0;
    const updatedVariants = formData.variants.map((v) => ({
      ...v,
      price: {
        originalPrice: v.price.originalPrice,
        discountedPrice: calcDiscounted(v.price.originalPrice, d),
      },
    }));
    setFormData((prev) => ({
      ...prev,
      discount: d,
      variants: updatedVariants,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const submissionData = {
      ...formData,
      variants: formData.variants.filter(
        (v) => v.label && v.price.originalPrice > 0
      ),
    };
    await onSave(cake._id, submissionData);
    setLoading(false);
  };

  return (
    <ModalOverlay onClose={onClose}>
      {/* Header */}
      <div className="flex justify-between items-center p-5 border-b bg-gray-50">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
            <Package size={20} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">Edit Product</h2>
            <p className="text-xs text-gray-500">ID: {cake._id}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-200 rounded-full transition"
        >
          <X size={20} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b px-5 bg-white sticky top-0 z-10">
        {["basic", "variants", "advanced"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`py-4 px-6 text-sm font-bold border-b-2 capitalize transition ${
              activeTab === tab
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-400 hover:text-gray-600"
            }`}
          >
            {tab} Details
          </button>
        ))}
      </div>

      {/* Content */}
      <form
        id="product-form"
        onSubmit={handleSubmit}
        className="flex-1 overflow-y-auto p-6 bg-gray-50/50"
      >
        {/* --- TAB 1: BASIC --- */}
        {activeTab === "basic" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* Left: Image */}
            <div className="md:col-span-1 space-y-4">
              <label className="block text-xs font-bold text-gray-500 uppercase">
                Product Image
              </label>
              <div className="border-2 border-dashed border-gray-300 bg-white rounded-xl aspect-square flex flex-col items-center justify-center relative overflow-hidden group hover:border-blue-400 transition">
                {formData.image ? (
                  <>
                    <img
                      src={formData.image}
                      className="w-full h-full object-cover"
                      alt="Product"
                    />
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                      <Upload className="text-white mb-1" />
                    </div>
                  </>
                ) : (
                  <div className="text-center text-gray-400 p-4">
                    {uploading ? (
                      <Loader2 className="animate-spin mx-auto" />
                    ) : (
                      <ImageIcon className="mx-auto mb-2" size={32} />
                    )}
                    <p className="text-sm font-medium">Click to Upload</p>
                  </div>
                )}
                <input
                  type="file"
                  onChange={handleImageUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  accept="image/*"
                />
              </div>
            </div>

            {/* Right: Fields */}
            <div className="md:col-span-2 space-y-4 bg-white p-6 rounded-xl border shadow-sm">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-xs font-bold text-gray-500 uppercase">
                    Title
                  </label>
                  <input
                    required
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="w-full mt-1 p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div className="col-span-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">
                    Category
                  </label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="w-full mt-1 p-2.5 border rounded-lg bg-white"
                  >
                    <option value="">Select...</option>
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-span-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">
                    Variant Type
                  </label>
                  <select
                    value={formData.variantType}
                    onChange={(e) =>
                      setFormData({ ...formData, variantType: e.target.value })
                    }
                    className="w-full mt-1 p-2.5 border rounded-lg bg-white"
                  >
                    <option value="weights">Weights Only</option>
                    <option value="flavours">Flavours Only</option>
                    <option value="both">Both</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-bold text-gray-500 uppercase">
                    Description
                  </label>
                  <textarea
                    rows={4}
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full mt-1 p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- TAB 2: VARIANTS --- */}
        {activeTab === "variants" && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white flex items-center justify-between shadow-lg">
              <div>
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <DollarSign size={20} /> Pricing Strategy
                </h3>
                <p className="text-blue-100 text-sm opacity-90">
                  Set global discount to auto-update all prices
                </p>
              </div>
              <div className="flex items-center gap-3 bg-white/10 p-2 rounded-lg backdrop-blur-sm border border-white/20">
                <span className="font-bold text-sm uppercase tracking-wide">
                  Discount
                </span>
                <input
                  type="number"
                  min="0"
                  max="99"
                  value={formData.discount}
                  onChange={(e) => handleDiscountChange(e.target.value)}
                  className="w-16 bg-white text-blue-900 font-bold text-center rounded p-1 outline-none"
                />
                <span className="font-bold">%</span>
              </div>
            </div>

            <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
              <div className="flex justify-between items-center p-4 border-b bg-gray-50">
                <h4 className="font-bold text-gray-700">
                  Variant List ({formData.variants.length})
                </h4>
                <button
                  type="button"
                  onClick={handleAddVariant}
                  className="text-sm bg-gray-900 text-white px-3 py-1.5 rounded-lg flex items-center gap-2 hover:bg-black transition"
                >
                  <Plus size={14} /> Add Variant
                </button>
              </div>
              <div className="max-h-[400px] overflow-y-auto p-2 space-y-2">
                {formData.variants.map((variant, idx) => (
                  <div
                    key={idx}
                    className="grid grid-cols-12 gap-3 items-center p-3 border rounded-lg hover:border-blue-300 transition bg-white"
                  >
                    <div className="col-span-5">
                      <label className="text-[10px] text-gray-400 font-bold uppercase">
                        Label
                      </label>
                      <input
                        value={variant.label}
                        onChange={(e) =>
                          handleVariantChange(idx, "label", e.target.value)
                        }
                        placeholder="e.g. 1 Kg"
                        className="w-full p-2 bg-gray-50 border rounded font-medium focus:bg-white transition"
                      />
                    </div>
                    <div className="col-span-3">
                      <label className="text-[10px] text-gray-400 font-bold uppercase">
                        Original Price
                      </label>
                      <input
                        type="number"
                        value={variant.price.originalPrice}
                        onChange={(e) =>
                          handleVariantChange(
                            idx,
                            "originalPrice",
                            e.target.value
                          )
                        }
                        className="w-full p-2 bg-gray-50 border rounded focus:bg-white transition"
                      />
                    </div>
                    <div className="col-span-3">
                      <label className="text-[10px] text-gray-400 font-bold uppercase">
                        Discounted
                      </label>
                      <div className="relative">
                        <input
                          readOnly
                          value={variant.price.discountedPrice}
                          className="w-full p-2 bg-green-50 border border-green-100 text-green-700 font-bold rounded cursor-not-allowed"
                        />
                      </div>
                    </div>
                    <div className="col-span-1 flex justify-end pt-4">
                      <button
                        type="button"
                        onClick={() => handleRemoveVariant(idx)}
                        className="text-red-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-full transition"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* --- TAB 3: ADVANCED --- */}
        {activeTab === "advanced" && (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-white p-6 rounded-xl border shadow-sm space-y-6">
              <div>
                <h4 className="font-bold text-gray-800 flex items-center gap-2 mb-4 border-b pb-2">
                  <Settings size={18} /> Configuration
                </h4>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                  <div>
                    <span className="font-bold text-gray-700 block">
                      Flavour Selection
                    </span>
                    <span className="text-xs text-gray-500">
                      Allow users to choose flavour for this cake
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={formData.options.flavour_selection}
                      onChange={(e) =>
                        setFormData((p) => ({
                          ...p,
                          options: {
                            ...p.options,
                            flavour_selection: e.target.checked,
                          },
                        }))
                      }
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-gray-800 flex items-center gap-2 mb-4 border-b pb-2">
                  <DollarSign size={18} /> Extra Charges (Photo Cakes)
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">
                      A4 Sheet Charge
                    </label>
                    <div className="relative mt-1">
                      <span className="absolute left-3 top-2.5 text-gray-400">
                        ₹
                      </span>
                      <input
                        type="number"
                        value={formData.options.extra_charges.A4}
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
                        className="w-full pl-7 p-2 border rounded-lg"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">
                      A3 Sheet Charge
                    </label>
                    <div className="relative mt-1">
                      <span className="absolute left-3 top-2.5 text-gray-400">
                        ₹
                      </span>
                      <input
                        type="number"
                        value={formData.options.extra_charges.A3}
                        onChange={(e) =>
                          setFormData((p) => ({
                            ...p,
                            options: {
                              ...p.options,
                              extra_charges: {
                                ...p.options.extra_charges,
                                A3: Number(e.target.value),
                              },
                            },
                          }))
                        }
                        className="w-full pl-7 p-2 border rounded-lg"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </form>

      {/* Footer */}
      <div className="p-5 border-t bg-gray-50 flex justify-end gap-3 z-20 relative">
        <button
          type="button"
          onClick={onClose}
          className="px-5 py-2.5 text-gray-600 hover:bg-gray-200 rounded-lg font-medium transition"
        >
          Cancel
        </button>
        <button
          type="submit"
          form="product-form"
          disabled={loading || uploading}
          className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm transition disabled:opacity-50 font-medium flex items-center gap-2"
        >
          {loading ? (
            <Loader2 className="animate-spin" size={18} />
          ) : (
            <Save size={18} />
          )}
          {loading ? "Updating..." : "Save Changes"}
        </button>
      </div>
    </ModalOverlay>
  );
};

// ============================================================================
// COMPONENT: CAKES TABLE (With "Uncategorized" Fix)
// ============================================================================
const CakesTable = ({ setToast }) => {
  const [allCakes, setAllCakes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingCake, setEditingCake] = useState(null);
  const [viewMode, setViewMode] = useState("table");
  const [selectedIds, setSelectedIds] = useState(new Set());

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const debouncedSearch = useDebounce(searchTerm, 300);

  // Initial Fetch
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [resCakes, resCats] = await Promise.all([
          fetch(`${API_BASE}/cakes`),
          fetch(`${API_BASE}/categories`),
        ]);
        if (resCakes.ok) setAllCakes(await resCakes.json());
        if (resCats.ok) setCategories(await resCats.json());
      } catch (error) {
        setToast({ type: "error", message: "Failed to load data" });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [setToast]);

  // Derived Data
  const uniqueCategoryNames = useMemo(() => {
    // FIXED: Safely get names, ensuring category is an object and name exists
    const names = allCakes
      .map((c) =>
        typeof c.category === "object" && c.category?.name
          ? c.category.name
          : null
      )
      .filter((n) => typeof n === "string");
    return ["All", ...new Set(names)].sort();
  }, [allCakes]);

  const filteredCakes = useMemo(() => {
    let result = [...allCakes];
    if (filterCategory !== "All") {
      result = result.filter((c) => {
        // FIXED: Safe filter check
        const catName =
          typeof c.category === "object" ? c.category?.name : "Uncategorized";
        return catName === filterCategory;
      });
    }
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      result = result.filter((c) => c.title.toLowerCase().includes(q));
    }
    return result;
  }, [allCakes, filterCategory, debouncedSearch]);

  const paginatedCakes = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredCakes.slice(start, start + itemsPerPage);
  }, [filteredCakes, currentPage, itemsPerPage]);

  // Handlers
  const handleUpdate = async (id, data) => {
    try {
      const res = await fetch(`${API_BASE}/cakes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Update failed");

      // Refresh data to get populated fields back
      const refresh = await fetch(`${API_BASE}/cakes`);
      setAllCakes(await refresh.json());

      setToast({ type: "success", message: "Product updated successfully!" });
      setEditingCake(null);
    } catch (e) {
      setToast({ type: "error", message: e.message });
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure? This action cannot be undone.")) return;
    try {
      await fetch(`${API_BASE}/cakes/${id}`, { method: "DELETE" });
      setAllCakes((p) => p.filter((c) => c._id !== id));
      setToast({ type: "success", message: "Product deleted" });
    } catch (e) {
      setToast({ type: "error", message: "Delete failed" });
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Delete ${selectedIds.size} products?`)) return;
    setLoading(true);
    for (const id of selectedIds) {
      try {
        await fetch(`${API_BASE}/cakes/${id}`, { method: "DELETE" });
      } catch (e) {}
    }
    const refresh = await fetch(`${API_BASE}/cakes`);
    setAllCakes(await refresh.json());
    setSelectedIds(new Set());
    setLoading(false);
    setToast({ type: "success", message: "Bulk deletion complete" });
  };

  // Helper helper to safely render category name
  const getCategoryName = (c) => {
    if (c.category && typeof c.category === "object" && c.category.name) {
      return c.category.name;
    }
    return "Uncategorized";
  };

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="bg-white p-4 rounded-xl border shadow-sm flex flex-col md:flex-row justify-between gap-4 items-center">
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative w-full md:w-80 group">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition"
              size={18}
            />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
            />
          </div>
          <div className="relative">
            <Filter
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={16}
            />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="pl-9 pr-8 py-2 border rounded-lg appearance-none bg-white focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
            >
              {uniqueCategoryNames.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {selectedIds.size > 0 && (
            <button
              onClick={handleBulkDelete}
              className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg font-medium hover:bg-red-100 transition animate-in fade-in"
            >
              <Trash2 size={16} /> Delete ({selectedIds.size})
            </button>
          )}
          <div className="flex bg-gray-100 p-1 rounded-lg border">
            <button
              onClick={() => setViewMode("table")}
              className={`p-2 rounded transition ${
                viewMode === "table"
                  ? "bg-white shadow text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <List size={18} />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded transition ${
                viewMode === "grid"
                  ? "bg-white shadow text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <LayoutGrid size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <Loader2 className="animate-spin text-blue-600" size={40} />
        </div>
      ) : viewMode === "table" ? (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-6 py-4 w-10">
                  <input
                    type="checkbox"
                    checked={
                      paginatedCakes.length > 0 &&
                      selectedIds.size === paginatedCakes.length
                    }
                    onChange={() =>
                      selectedIds.size === paginatedCakes.length
                        ? setSelectedIds(new Set())
                        : setSelectedIds(
                            new Set(paginatedCakes.map((c) => c._id))
                          )
                    }
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">
                  Product
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">
                  Category
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">
                  Pricing Overview
                </th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedCakes.map((cake) => (
                <tr
                  key={cake._id}
                  className={
                    selectedIds.has(cake._id)
                      ? "bg-blue-50/50"
                      : "hover:bg-gray-50"
                  }
                >
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(cake._id)}
                      onChange={() => {
                        const s = new Set(selectedIds);
                        s.has(cake._id) ? s.delete(cake._id) : s.add(cake._id);
                        setSelectedIds(s);
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-lg bg-gray-100 border overflow-hidden shrink-0">
                        {cake.image ? (
                          <img
                            src={cake.image}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <ImageIcon size={20} />
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">
                          {cake.title}
                        </div>
                        {cake.discount > 0 && (
                          <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-bold">
                            {cake.discount}% OFF
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border">
                      {getCategoryName(cake)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-2 max-w-xs">
                      {cake.variants &&
                        cake.variants.slice(0, 3).map((v, i) => (
                          <div
                            key={i}
                            className="text-xs border rounded px-2 py-1 bg-white"
                          >
                            <span className="text-gray-500 mr-1">
                              {v.label}:
                            </span>
                            <span className="font-bold">
                              ₹{v.price.discountedPrice}
                            </span>
                          </div>
                        ))}
                      {cake.variants && cake.variants.length > 3 && (
                        <span className="text-xs text-gray-400 self-center">
                          +{cake.variants.length - 3} more
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      onClick={() => setEditingCake(cake)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(cake._id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {paginatedCakes.length === 0 && (
            <div className="p-10 text-center text-gray-400">
              No products found.
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {paginatedCakes.map((cake) => (
            <div
              key={cake._id}
              className="bg-white rounded-xl border shadow-sm hover:shadow-md transition overflow-hidden flex flex-col group"
            >
              <div className="h-48 relative bg-gray-100">
                {cake.image ? (
                  <img
                    src={cake.image}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <ImageIcon size={32} />
                  </div>
                )}
                <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition translate-x-2 group-hover:translate-x-0">
                  <button
                    onClick={() => setEditingCake(cake)}
                    className="p-2 bg-white rounded-full shadow hover:text-blue-600"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(cake._id)}
                    className="p-2 bg-white rounded-full shadow hover:text-red-600"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <h3 className="font-bold text-gray-900 truncate">
                  {cake.title}
                </h3>
                <div className="text-xs text-gray-500 mb-3">
                  {getCategoryName(cake)}
                </div>
                <div className="mt-auto space-y-1">
                  {cake.variants &&
                    cake.variants.slice(0, 2).map((v, i) => (
                      <div key={i} className="flex justify-between text-xs">
                        <span>{v.label}</span>
                        <span className="font-bold">
                          ₹{v.price.discountedPrice}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      <div className="flex justify-between items-center pt-4">
        <div className="text-sm text-gray-500">
          Page {currentPage} of {Math.ceil(filteredCakes.length / itemsPerPage)}
        </div>
        <div className="flex gap-2">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
            className="px-3 py-1 border rounded bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            Prev
          </button>
          <button
            disabled={currentPage * itemsPerPage >= filteredCakes.length}
            onClick={() => setCurrentPage((p) => p + 1)}
            className="px-3 py-1 border rounded bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      {editingCake && (
        <EditCakeModal
          cake={editingCake}
          categories={categories}
          onClose={() => setEditingCake(null)}
          onSave={handleUpdate}
        />
      )}
    </div>
  );
};

// ============================================================================
// COMPONENT: CATEGORIES TABLE (With Image Error Fix)
// ============================================================================
const CategoriesTable = ({ setToast }) => {
  const [categories, setCategories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState(null);

  const fetchCats = async () => {
    try {
      const res = await fetch(`${API_BASE}/categories`);
      if (res.ok) setCategories(await res.json());
    } catch (e) {
      setToast({ type: "error", message: "Failed to load categories" });
    }
  };

  useEffect(() => {
    fetchCats();
  }, []);

  const handleSave = async (data) => {
    try {
      const url = editingCat
        ? `${API_BASE}/categories/${editingCat._id}`
        : `${API_BASE}/categories`;
      const method = editingCat ? "PUT" : "POST";
      await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      fetchCats();
      setToast({ type: "success", message: "Category saved!" });
      setIsModalOpen(false);
    } catch (e) {
      setToast({ type: "error", message: "Failed to save" });
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete category?")) return;
    try {
      await fetch(`${API_BASE}/categories/${id}`, { method: "DELETE" });
      fetchCats();
      setToast({ type: "success", message: "Category deleted" });
    } catch (e) {
      setToast({ type: "error", message: "Delete failed" });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          onClick={() => {
            setEditingCat(null);
            setIsModalOpen(true);
          }}
          className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium flex gap-2 items-center hover:bg-black transition"
        >
          <Plus size={16} /> Add Category
        </button>
      </div>
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">
                Preview
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">
                Info
              </th>
              <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {categories.map((c) => (
              <tr key={c._id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  {/* FIXED: Conditional rendering to prevent empty src error */}
                  {c.image ? (
                    <img
                      src={c.image}
                      className="h-12 w-12 rounded bg-gray-100 object-cover border"
                      alt=""
                    />
                  ) : (
                    <div className="h-12 w-12 rounded bg-gray-100 border flex items-center justify-center text-xs text-gray-400">
                      N/A
                    </div>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="font-bold">{c.name}</div>
                  <div className="text-xs text-gray-500">{c.description}</div>
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button
                    onClick={() => {
                      setEditingCat(c);
                      setIsModalOpen(true);
                    }}
                    className="text-blue-600 p-2 hover:bg-blue-50 rounded"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(c._id)}
                    className="text-red-500 p-2 hover:bg-red-50 rounded"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {isModalOpen && (
        <CategoryModal
          category={editingCat}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

// ============================================================================
// MAIN PAGE
// ============================================================================
const CTable = () => {
  const [activeTab, setActiveTab] = useState("products");
  const [toast, setToast] = useState({ type: "", message: "" });

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-gray-900 pb-20">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              Inventory Dashboard
            </h1>
            <p className="text-gray-500 mt-1">
              Manage your catalog, pricing strategies, and categories.
            </p>
          </div>
        </div>

        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab("products")}
            className={`pb-4 px-6 text-sm font-bold border-b-2 flex items-center gap-2 transition ${
              activeTab === "products"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <Package size={18} /> Products
          </button>
          <button
            onClick={() => setActiveTab("categories")}
            className={`pb-4 px-6 text-sm font-bold border-b-2 flex items-center gap-2 transition ${
              activeTab === "categories"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <Layers size={18} /> Categories
          </button>
        </div>

        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {activeTab === "products" ? (
            <CakesTable setToast={setToast} />
          ) : (
            <CategoriesTable setToast={setToast} />
          )}
        </div>
      </div>
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ type: "", message: "" })}
      />
    </div>
  );
};

export default CTable;
