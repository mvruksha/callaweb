"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const DEFAULT_IMAGE_URL =
  "https://res.cloudinary.com/dsndb5cfm/image/upload/v1757172459/calalogo_bjpshx.png";

const EditCakeForm = ({ cakeId }) => {
  const router = useRouter();
  const [formData, setFormData] = useState(null); // Start with null to indicate loading
  const [status, setStatus] = useState({ loading: false, error: null });

  const availableWeights = ["1/2 Kg", "1 Kg", "2 Kg", "4 Kg"];

  useEffect(() => {
    const fetchCakeData = async () => {
      try {
        const res = await fetch(
          `https://callabackend.vercel.app/api/cakes/${cakeId}`
        );
        if (!res.ok) throw new Error("Could not fetch cake data.");
        const data = await res.json();

        // Ensure all possible weights are present in the prices object for the form
        const prices = {};
        for (const weight of availableWeights) {
          prices[weight] = data.prices[weight] || {
            originalPrice: "",
            discountedPrice: "",
          };
        }

        setFormData({ ...data, prices });
      } catch (error) {
        setStatus({ loading: false, error: error.message });
      }
    };
    if (cakeId) fetchCakeData();
  }, [cakeId]);

  // Auto-calculate discounted prices
  useEffect(() => {
    if (!formData) return;
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
        newPrices[weight].discountedPrice = newPrices[weight].originalPrice
          ? newPrices[weight].originalPrice
          : "";
      }
    }
    setFormData((prev) => ({ ...prev, prices: newPrices }));
  }, [formData?.discount, formData?.prices]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? (value === "" ? "" : value) : value,
    }));
  };

  const handlePriceChange = (e, weight) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      prices: {
        ...prev.prices,
        [weight]: { ...prev.prices[weight], [name]: value === "" ? "" : value },
      },
    }));
  };

  const handleWeightCheckbox = (e) => {
    const { value, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      weights: checked
        ? [...prev.weights, value]
        : prev.weights.filter((w) => w !== value),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, error: null });

    const submissionData = {
      ...formData,
      image: formData.image || DEFAULT_IMAGE_URL,
      discount: parseFloat(formData.discount) || 0,
      prices: Object.keys(formData.prices)
        .filter((w) => formData.weights.includes(w))
        .reduce((obj, key) => {
          const op = parseFloat(formData.prices[key].originalPrice);
          if (op > 0)
            obj[key] = {
              originalPrice: op,
              discountedPrice:
                parseFloat(formData.prices[key].discountedPrice) || op,
            };
          return obj;
        }, {}),
    };

    try {
      const response = await fetch(
        `https://callabackend.vercel.app/api/cakes/${cakeId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(submissionData),
        }
      );
      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Something went wrong");
      }
      alert("Cake updated successfully!");
      router.push("/admin/cakes");
    } catch (error) {
      setStatus({ loading: false, error: error.message });
    }
  };

  if (!formData)
    return <div className="text-center py-10">Loading cake details...</div>;

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white rounded-lg shadow-md">
      <form onSubmit={handleSubmit} className="space-y-8">
        <h1 className="text-3xl font-bold text-gray-800 border-b pb-4">
          Edit Cake
        </h1>
        {/* Form fields are very similar to AddCakeForm, just pre-filled */}
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
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
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
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
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
              <input
                type="text"
                name="category"
                id="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              />
            </div>
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
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
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
              className="mt-1 block w-full md:w-1/2 border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>
          <div className="space-y-4">
            {availableWeights.map((weight) => (
              <div
                key={weight}
                className="grid grid-cols-1 md:grid-cols-4 items-center gap-4 p-3 bg-gray-50 rounded-md"
              >
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={`weight-${weight}`}
                    value={weight}
                    checked={formData.weights.includes(weight)}
                    onChange={handleWeightCheckbox}
                    className="h-4 w-4 text-indigo-600"
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
                      value={formData.prices[weight]?.originalPrice || ""}
                      onChange={(e) => handlePriceChange(e, weight)}
                      disabled={!formData.weights.includes(weight)}
                      className="mt-1 block w-full border p-2 rounded-md disabled:bg-gray-200"
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
                      value={formData.prices[weight]?.discountedPrice || ""}
                      readOnly
                      className="mt-1 block w-full border p-2 rounded-md bg-gray-100"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </fieldset>

        <div className="flex justify-end gap-4 pt-5">
          <button
            type="button"
            onClick={() => router.push("/admin/cakes")}
            className="py-2 px-6 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={status.loading}
            className="py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300"
          >
            {status.loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
        {status.error && (
          <p className="text-red-500 text-sm mt-2 text-center">
            {status.error}
          </p>
        )}
      </form>
    </div>
  );
};

export default EditCakeForm;
