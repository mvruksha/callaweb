"use client";

import React, { useContext, useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { CartContext } from "../../../../contexts/CartContext";
import PhotoUploadBox from "./PhotoUploadBox"; // Make sure this path is correct
import { IoArrowBack } from "react-icons/io5";
import { FaSpinner, FaCheckCircle } from "react-icons/fa";
import { FaTruck } from "react-icons/fa";

// --- CONSTANTS ---
const FLAVOURS = [
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

const SIZES = [
  { label: "Default (No Extra)", value: "default", extra: 0 },
  { label: "A4 Size (+Rs.300)", value: "a4", extra: 300 },
  { label: "A3 Size (+Rs.500)", value: "a3", extra: 500 },
];

const PHOTO_CAKE_CATEGORIES = ["photo print cake"];
const REFERENCE_IMAGE_CATEGORIES = ["fondant cake", "customized cake"];

// --- COMPONENT ---
const CheckoutPage = () => {
  const { cart, itemAmount, clearCart } = useContext(CartContext);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    note: "",
  });

  // Unified state to store options and the final image URL together.
  const [photoCakeDetails, setPhotoCakeDetails] = useState({});

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  // Unified handler for flavour, size, and the uploaded image URL.
  const handleDetailChange = (itemId, field, value) => {
    setPhotoCakeDetails((prev) => ({
      ...prev,
      [itemId]: { ...(prev[itemId] || {}), [field]: value },
    }));
    // Clear related errors when user makes a selection
    if (errors[`details_${itemId}`]) {
      setErrors((prev) => ({ ...prev, [`details_${itemId}`]: null }));
    }
  };

  const finalTotal = useMemo(() => {
    return cart.reduce((acc, item) => {
      const itemCategory = item.category.toLowerCase();
      const isPhotoCake = PHOTO_CAKE_CATEGORIES.includes(itemCategory);
      const details = photoCakeDetails[item._id] || {};
      const basePrice = item.discountedPrice || item.price;
      const extra =
        isPhotoCake && details.size
          ? SIZES.find((s) => s.value === details.size)?.extra || 0
          : 0;
      return acc + (basePrice + extra) * item.amount;
    }, 0);
  }, [cart, photoCakeDetails]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required.";
    if (!formData.email.trim()) newErrors.email = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Email is invalid.";
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required.";
    if (!formData.address.trim()) newErrors.address = "Address is required.";

    for (let item of cart) {
      const itemCategory = item.category.toLowerCase();
      const details = photoCakeDetails[item._id] || {};

      if (PHOTO_CAKE_CATEGORIES.includes(itemCategory)) {
        if (!details.imageUrl || !details.flavour || !details.size) {
          newErrors[
            `details_${item._id}`
          ] = `Please upload an image and select a flavour & size for ${item.title}.`;
        }
      }
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setLoading(true);

    // --- THIS IS THE CORRECTED PART ---
    const orderPayload = {
      customer: formData,
      items: cart.map((item) => ({
        // Manually mapping fields to match the Mongoose schema
        cakeId: item._id, // Map frontend '_id' to backend 'cakeId'
        title: item.title,
        category: item.category,
        image: item.image,
        selectedWeight: item.selectedWeight || "1kg", // Provide a default if undefined
        quantity: item.amount, // Map frontend 'amount' to backend 'quantity'
        price: item.discountedPrice || item.price, // Send the final price per unit
        details: photoCakeDetails[item._id] || {},
      })),
      total: finalTotal,
      itemCount: itemAmount,
      // No need to send 'createdAt', the backend handles it with `timestamps: true`
    };
    // --- END OF CORRECTION ---

    try {
      console.log("📦 Order Payload:", JSON.stringify(orderPayload, null, 2)); // Print payload before sending

      const res = await fetch("https://callabackend.vercel.app/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderPayload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        // Log the detailed error from the server for better debugging
        console.error("Server responded with an error:", errorData);
        throw new Error(errorData.message || "Failed to place order");
      }

      clearCart();
      setOrderPlaced(true);
    } catch (err) {
      console.error("❌ Order placement error:", err);
      setErrors({
        submit: err.message || "Failed to place order. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (orderPlaced) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="bg-white p-12 rounded-sm shadow-xl text-center max-w-lg">
          <FaCheckCircle className="text-green-500 text-6xl mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-slate-800 mb-4">
            Thank You! 🎉
          </h2>
          <p className="text-slate-600 text-lg mb-6">
            Your order has been placed successfully. We'll contact you shortly
            to confirm the details.
          </p>

          {/* Track Order Button */}
          <Link
            href="/trackorder"
            className="inline-flex items-center gap-2 bg-gradient-to-r mt-6 from-pink-500 to-purple-700 
                     hover:from-pink-600 hover:to-purple-800 
                     text-white px-6 py-3 rounded-xs shadow-md 
                     transition transform hover:scale-105 
                     text-[10px] sm:text-sm font-bold"
          >
            <FaTruck className="text-xl" />
            Track Your Order
          </Link>
        </div>
      </div>
    );
  }

  if (!isClient) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <FaSpinner className="animate-spin text-purple-700 text-4xl" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <Link
            href="/cart"
            className="flex items-center gap-2 text-purple-700 hover:text-purple-900 font-semibold transition-colors w-fit"
          >
            <IoArrowBack size={20} />
            <span>Back to Cart</span>
          </Link>
          <h1 className="text-4xl font-extrabold text-slate-800 text-start mt-4">
            Checkout
          </h1>
        </div>

        {cart.length === 0 ? (
          <div className="text-center bg-white p-10 rounded-sm shadow-md">
            <p className="text-slate-500 text-xl">Your cart is empty 🛒</p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12"
          >
            {/* Left Side: Form */}
            <div className="lg:col-span-3 bg-white p-8 rounded-sm shadow-md">
              <h2 className="text-2xl font-bold text-slate-700 mb-6 border-b pb-4">
                Contact Information
              </h2>
              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block mb-1 font-medium text-slate-600">
                      Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={`w-full border rounded-md px-3 py-2 transition ${
                        errors.name ? "border-red-500" : "border-gray-300"
                      } focus:ring-2 focus:ring-purple-500 focus:border-purple-500`}
                    />
                    {errors.name && (
                      <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                    )}
                  </div>
                  <div>
                    <label className="block mb-1 font-medium text-slate-600">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full border rounded-md px-3 py-2 transition ${
                        errors.email ? "border-red-500" : "border-gray-300"
                      } focus:ring-2 focus:ring-purple-500 focus:border-purple-500`}
                    />
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.email}
                      </p>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block mb-1 font-medium text-slate-600">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`w-full border rounded-md px-3 py-2 transition ${
                      errors.phone ? "border-red-500" : "border-gray-300"
                    } focus:ring-2 focus:ring-purple-500 focus:border-purple-500`}
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                  )}
                </div>
                <div>
                  <label className="block mb-1 font-medium text-slate-600">
                    Full Delivery Address *
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className={`w-full border rounded-md px-3 py-2 transition ${
                      errors.address ? "border-red-500" : "border-gray-300"
                    } focus:ring-2 focus:ring-purple-500 focus:border-purple-500`}
                  />
                  {errors.address && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.address}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block mb-1 font-medium text-slate-600">
                    Note / Wishes (on the cake)
                  </label>
                  <textarea
                    name="note"
                    value={formData.note}
                    onChange={handleChange}
                    rows={4}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 transition focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="e.g., Happy Birthday, Priya!"
                  ></textarea>
                </div>
              </div>
            </div>

            {/* Right Side: Order Summary */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white p-8 rounded-sm shadow-md">
                <h2 className="text-2xl font-bold text-slate-700 mb-6 border-b pb-4">
                  Order Summary
                </h2>
                <div className="space-y-6">
                  {cart.map((item) => {
                    const itemCategory = item.category.toLowerCase();
                    const isPhotoCake =
                      PHOTO_CAKE_CATEGORIES.includes(itemCategory);
                    const isReferenceCake =
                      REFERENCE_IMAGE_CATEGORIES.includes(itemCategory);
                    const details = photoCakeDetails[item._id] || {};
                    const basePrice = item.discountedPrice || item.price;
                    const extra =
                      isPhotoCake && details.size
                        ? SIZES.find((s) => s.value === details.size)?.extra ||
                          0
                        : 0;

                    return (
                      <div
                        key={item._id}
                        className="space-y-4 border border-gray-300 p-4 rounded-sm shadow-sm"
                      >
                        <div className="flex items-start gap-4">
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-20 h-20 object-cover rounded-md"
                          />
                          <div className="flex-1">
                            <h3 className="font-semibold text-slate-800">
                              {item.title}
                            </h3>
                            <p className="text-slate-400 text-sm">
                              {item.category}
                            </p>
                            <p className="text-slate-600 font-medium mt-1">
                              {item.selectedWeight || "1kg"} × {item.amount} = ₹
                              {((basePrice + extra) * item.amount).toFixed(2)}
                            </p>
                          </div>
                        </div>

                        {isPhotoCake && (
                          <div className="space-y-4 pt-4 border-t">
                            <PhotoUploadBox
                              required={true}
                              onChange={(url) =>
                                handleDetailChange(item._id, "imageUrl", url)
                              }
                              previewUrl={details.imageUrl}
                            />
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium mb-1 text-slate-600">
                                  Flavour *
                                </label>
                                <select
                                  value={details.flavour || ""}
                                  onChange={(e) =>
                                    handleDetailChange(
                                      item._id,
                                      "flavour",
                                      e.target.value
                                    )
                                  }
                                  className="w-full border-gray-300 rounded-md py-1.5 focus:ring-purple-500 focus:border-purple-500"
                                >
                                  <option value="">Select Flavour</option>
                                  {FLAVOURS.map((flav, i) => (
                                    <option key={i} value={flav}>
                                      {flav}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <div>
                                <label className="block text-sm font-medium mb-1 text-slate-600">
                                  Print Size *
                                </label>
                                <select
                                  value={details.size || ""}
                                  onChange={(e) =>
                                    handleDetailChange(
                                      item._id,
                                      "size",
                                      e.target.value
                                    )
                                  }
                                  className="w-full border-gray-300 rounded-md py-1.5 focus:ring-purple-500 focus:border-purple-500"
                                >
                                  <option value="">Select Size</option>
                                  {SIZES.map((s, i) => (
                                    <option key={i} value={s.value}>
                                      {s.label}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>
                            {errors[`details_${item._id}`] && (
                              <p className="text-red-500 text-sm">
                                {errors[`details_${item._id}`]}
                              </p>
                            )}
                          </div>
                        )}

                        {isReferenceCake && (
                          <div className="space-y-2 pt-4 border-t">
                            <h4 className="text-md font-semibold text-slate-700">
                              Reference Image
                            </h4>
                            <p className="text-sm text-slate-500 mb-2">
                              Have a specific design in mind? Upload an image
                              for our reference. (Optional)
                            </p>
                            <PhotoUploadBox
                              required={false}
                              onChange={(url) =>
                                handleDetailChange(item._id, "imageUrl", url)
                              }
                              previewUrl={details.imageUrl}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-between font-bold text-xl mt-6 border-t border-purple-200 pt-4 text-slate-800">
                  <span>Grand Total:</span>
                  <span>₹{finalTotal.toFixed(2)}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || cart.length === 0}
                className="w-full flex items-center justify-center bg-purple-800 text-white py-3 rounded-sm font-semibold text-lg hover:bg-purple-900 transition-all shadow-lg disabled:bg-slate-400 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin mr-2" />
                    Placing Order...
                  </>
                ) : (
                  "Place Order"
                )}
              </button>
              {errors.submit && (
                <p className="text-red-600 text-center mt-2">{errors.submit}</p>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default CheckoutPage;
