"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const DEFAULT_IMAGE_URL =
  "https://res.cloudinary.com/dsndb5cfm/image/upload/v1757172459/calalogo_bjpshx.png";

const AddCakeForm = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    image: "",
    discount: "",
    prices: {
      "1/2 Kg": { originalPrice: "", discountedPrice: "" },
      "1 Kg": { originalPrice: "", discountedPrice: "" },
      "2 Kg": { originalPrice: "", discountedPrice: "" },
      "4 Kg": { originalPrice: "", discountedPrice: "" },
    },
    weights: [],
    flavours: 0, // Kept for data model consistency
    pricing: "", // Kept for data model consistency
  });

  const [status, setStatus] = useState({
    loading: false,
    error: null,
    success: null,
  });

  // State for dynamic categories from the database
  const [categories, setCategories] = useState([]);
  // State to control the visibility of the "new category" input field
  const [showOtherCategory, setShowOtherCategory] = useState(false);

  // Pre-defined weights for the form
  const availableWeights = ["1/2 Kg", "1 Kg", "2 Kg", "4 Kg"];

  // Fetch existing categories when the component mounts
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("https://callabackend.vercel.app/api/cakes");
        if (!res.ok) throw new Error("Failed to fetch categories");
        const data = await res.json();
        // Create a unique list of categories from the fetched cakes
        const uniqueCategories = [
          ...new Set(data.map((cake) => cake.category).filter(Boolean)),
        ];
        setCategories(uniqueCategories);
      } catch (error) {
        console.error("Error fetching categories:", error);
        setStatus((prev) => ({ ...prev, error: "Could not load categories." }));
      }
    };
    fetchCategories();
  }, []);

  // Effect to auto-calculate discounted prices whenever the discount or an original price changes
  useEffect(() => {
    const newPrices = { ...formData.prices };
    const discount = parseFloat(formData.discount) || 0;

    for (const weight in newPrices) {
      const originalPrice = parseFloat(newPrices[weight].originalPrice) || 0;

      if (originalPrice > 0 && discount >= 0 && discount <= 100) {
        const discountAmount = (originalPrice * discount) / 100;
        newPrices[weight].discountedPrice = Math.round(
          originalPrice - discountAmount
        );
      } else {
        // If no valid discount, the discounted price is the same as the original
        newPrices[weight].discountedPrice = newPrices[weight].originalPrice
          ? newPrices[weight].originalPrice
          : "";
      }
    }
    setFormData((prev) => ({ ...prev, prices: newPrices }));
  }, [
    formData.discount,
    formData.prices["1/2 Kg"].originalPrice,
    formData.prices["1 Kg"].originalPrice,
    formData.prices["2 Kg"].originalPrice,
    formData.prices["4 Kg"].originalPrice,
  ]);

  // Generic handler for most form inputs
  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? (value === "" ? "" : value) : value,
    }));
  };

  // Specific handler for the category dropdown
  const handleCategoryChange = (e) => {
    const { value } = e.target;
    if (value === "other") {
      // If user selects "Add New", show the text input
      setShowOtherCategory(true);
      setFormData((prev) => ({ ...prev, category: "" })); // Clear category to allow typing
    } else {
      // If user selects an existing category, hide the text input
      setShowOtherCategory(false);
      setFormData((prev) => ({ ...prev, category: value }));
    }
  };

  // Handler for price inputs
  const handlePriceChange = (e, weight) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      prices: {
        ...prev.prices,
        [weight]: {
          ...prev.prices[weight],
          [name]: value === "" ? "" : value,
        },
      },
    }));
  };

  // Handler for weight checkboxes
  const handleWeightCheckbox = (e) => {
    const { value, checked } = e.target;
    setFormData((prev) => {
      const newWeights = checked
        ? [...prev.weights, value]
        : prev.weights.filter((w) => w !== value);
      return { ...prev, weights: newWeights };
    });
  };

  // Form submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, error: null, success: null });

    // Prepare data for submission, cleaning up empty values
    const submissionData = {
      ...formData,
      image: formData.image || DEFAULT_IMAGE_URL,
      discount: parseFloat(formData.discount) || 0,
      prices: Object.keys(formData.prices)
        .filter((weight) => formData.weights.includes(weight)) // Only include selected weights
        .reduce((obj, key) => {
          const originalPrice = parseFloat(formData.prices[key].originalPrice);
          if (originalPrice && originalPrice > 0) {
            obj[key] = {
              originalPrice: originalPrice,
              discountedPrice:
                parseFloat(formData.prices[key].discountedPrice) ||
                originalPrice,
            };
          }
          return obj;
        }, {}),
    };

    try {
      const response = await fetch(
        "https://callabackend.vercel.app/api/cakes",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(submissionData),
        }
      );

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Something went wrong");

      setStatus({
        loading: false,
        error: null,
        success: "Cake added successfully!",
      });
      router.push("/");
    } catch (error) {
      setStatus({ loading: false, error: error.message, success: null });
    }
  };

  return (
    <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 p-4 md:p-8">
      {/* Left Side: Image Preview */}
      <div className="sticky top-8 self-start">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          Image Preview
        </h2>
        <div className="aspect-square bg-gray-100 rounded-lg shadow-md overflow-hidden">
          <img
            src={formData.image || DEFAULT_IMAGE_URL}
            alt="Cake Preview"
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.onerror = null; // prevents looping
              e.target.src = DEFAULT_IMAGE_URL;
            }}
          />
        </div>
      </div>

      {/* Right Side: Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        <h1 className="text-3xl font-bold text-gray-800 border-b pb-4">
          Add a New Cake
        </h1>

        {/* Basic Info */}
        <fieldset className="space-y-4">
          <legend className="text-xl font-semibold text-gray-700">
            Basic Information
          </legend>
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-600"
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
              className="block text-sm font-medium text-gray-600"
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
                className="block text-sm font-medium text-gray-600"
              >
                Category
              </label>
              <select
                id="category"
                name="category"
                value={showOtherCategory ? "other" : formData.category}
                onChange={handleCategoryChange}
                className="mt-1 block w-full border border-gray-300 rounded-xs shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">-- Select a Category --</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
                <option value="other">-- Add New Category --</option>
              </select>
            </div>

            {/* This input field is conditionally rendered */}
            {showOtherCategory && (
              <div>
                <label
                  htmlFor="new-category"
                  className="block text-sm font-medium text-gray-600"
                >
                  New Category Name
                </label>
                <input
                  type="text"
                  name="category" // Name is "category" to update the correct state field
                  id="new-category"
                  value={formData.category}
                  onChange={handleChange} // Uses the generic handler
                  placeholder="Enter new category"
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-xs shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            )}

            <div>
              <label
                htmlFor="image"
                className="block text-sm font-medium text-gray-600"
              >
                Image URL
              </label>
              <input
                type="url"
                name="image"
                id="image"
                value={formData.image}
                onChange={handleChange}
                placeholder="https://example.com/cake.jpg"
                className="mt-1 block w-full border border-gray-300 rounded-xs shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
        </fieldset>

        {/* Pricing and Weights */}
        <fieldset className="space-y-4">
          <legend className="text-xl font-semibold text-gray-700">
            Pricing & Weights
          </legend>
          <div>
            <label
              htmlFor="discount"
              className="block text-sm font-medium text-gray-600"
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
              placeholder="e.g., 10"
              className="mt-1 block w-full md:w-1/2 border border-gray-300 rounded-xs shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div className="space-y-4">
            <h3 className="text-md font-medium text-gray-600">
              Available Weights & Prices
            </h3>
            {availableWeights.map((weight) => (
              <div
                key={weight}
                className="grid grid-cols-1 md:grid-cols-4 items-center gap-4 p-3 bg-gray-50 rounded-xs"
              >
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={`weight-${weight}`}
                    value={weight}
                    checked={formData.weights.includes(weight)}
                    onChange={handleWeightCheckbox}
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <label htmlFor={`weight-${weight}`} className="font-semibold">
                    {weight}
                  </label>
                </div>
                <div className="col-span-3 grid grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor={`op-${weight}`}
                      className="block text-xs font-medium text-gray-500"
                    >
                      Original Price (₹)
                    </label>
                    <input
                      type="number"
                      name="originalPrice"
                      id={`op-${weight}`}
                      value={formData.prices[weight].originalPrice}
                      onChange={(e) => handlePriceChange(e, weight)}
                      disabled={!formData.weights.includes(weight)}
                      min="0"
                      step="any"
                      placeholder="e.g., 500"
                      className="mt-1 block w-full border border-gray-300 rounded-xs shadow-sm p-2 disabled:bg-gray-200"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor={`dp-${weight}`}
                      className="block text-xs font-medium text-gray-500"
                    >
                      Discounted Price (₹)
                    </label>
                    <input
                      type="number"
                      name="discountedPrice"
                      id={`dp-${weight}`}
                      value={formData.prices[weight].discountedPrice}
                      readOnly
                      placeholder="Auto-calculated"
                      className="mt-1 block w-full border border-gray-300 rounded-xs shadow-sm p-2 bg-gray-100 cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </fieldset>

        {/* Submit Button */}
        <div className="pt-5">
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={status.loading}
              className="py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-xs text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300"
            >
              {status.loading ? "Saving..." : "Save Cake"}
            </button>
          </div>
        </div>

        {status.error && (
          <p className="text-red-500 text-sm mt-2 text-center">
            {status.error}
          </p>
        )}
        {status.success && (
          <p className="text-green-500 text-sm mt-2 text-center">
            {status.success}
          </p>
        )}
      </form>
    </div>
  );
};

export default AddCakeForm;
